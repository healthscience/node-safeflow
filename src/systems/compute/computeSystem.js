import ComputeEngine, { registerModelLoader } from 'compute-engine';
import { EventEmitter } from 'events';

class ComputeSystem extends EventEmitter {
  constructor(setIN) {
    super();
    this.models = {}
    // Initialize compute engine
    this.computeEngine = ComputeEngine;
    // Track last compute times
    this.lastComputeTime = {};
    // Store reference to public library
    this.publicLibrary = setIN?.publicLibrary;
    // Preload models from public library
    this.preloadModels();
  }

  /*
  *
  * Preload all compute models from public library
  * @method preloadModels
  * @return {void}
  **/
  async preloadModels() {
    console.log('COM-ENG=====prelaod model')
    console.log(this.publicLibrary)
    if (!this.publicLibrary) {
      console.warn('No public library provided, cannot preload models');
      return;
    }
    // Find all compute models in the public library
    const computeConracts = this.publicLibrary.filter(libItem => {
      return libItem.value?.refcontract === 'compute';
    });
    // Load each model
    for (const contract of computeConracts) {
      try {
        if (contract.value.computational.mode === 'javascript') {
          if (contract.value.computational.name !== 'observation')
          this.computeEngine.registerModelLoader(contract.value.computational.hash, await this.computeEngine.jsLoader(contract));
        } else if (contract.value.computational.mode === 'wasm') {
          registerModelLoader(contract.value.computational.hash, await this.computeEngine.wasmLoader(contract));
        }
        console.log(`Successfully loaded model: ${contract}`);
      } catch (error) {
        console.error('Failed to preload model:', error);
      }
    }
  }

  /*
   * 
   * @param
   * @method loadModelFromComputeEngine
  */
  async loadModelFromComputeEngine(contract) {
    try {
      // Use the updated compute-engine to load the model from the contract
      const model = await this.computeEngine.loadModelFromContract(contract);

      // Store the loaded model in the system
      this.computeEngine.models[contract.value.computational.hash] = model;

      console.log(`Model ${contract.value.computational.hash} loaded successfully.`);
    } catch (error) {
      console.error(`Error loading model ${contract.value.computational.value}:`, error);
    }
  }

  /*
  *
  * main entry point to compute system
  * @method computationSystem
  * @param {object} contract
  **/
  async computationSystem(contract, dataPrint, inputData) {
    console.log('SF contract in system')
    console.log(contract)
    try {
      // Validate contract
      if (!contract) {
        throw new Error('Invalid compute contract - contract is undefined');
      }
      // Get compute info from contract
      let modelName = contract.value.computational.name
      let computeMode = contract.value.computational.mode;

      // options here, first time new or returning, ie is registered, already loaded? speical case observation just return data as it
      if (modelName === 'observation') {
           return {
          state: true,
          result: inputData,
          timestamp: Date.now()
        };
      } else {
        let result = {}
        // model registered or loaded? Check
        let checkRegistered = this.computeEngine.checkRegistered(contract)
        if (checkRegistered === true) {
          // is model already loaded?
          let checkLoaded = this.computeEngine.checkLoaded(contract)
          if (checkLoaded === true) {
            // perform the compute
            if (contract.value.computational.mode === 'javascript') {
              result = await this.computeEngine.models[contract.value.computational.hash].compute(inputData);
            } else if (contract.value.computational.mode === 'wasm') {
              // Process data through model
              result = await this.computeEngine.models[contract.value.computational.hash].compute(inputData, { useWasm: true });
              result.state = true
            }

            return result
          } else {
            // load the model and then compute
            let result = {}
            // check if js wasm or python
            if (contract.value.computational.mode === 'javascript') {
              result = null
            } else if (contract.value.computational.mode === 'wasm') {
              let model =  await this.loadModelFromComputeEngine(contract);
              // Process data through model
              result = await model.compute(inputData, { useWasm: true });
            }

            return {
              state: true,
              result: result,
              timestamp: Date.now()
            };
          }
        } else {
          // need to register the contracts compute code
          if (contract.value.computational.mode === 'javascript') {
            this.computeEngine.registerModelLoader(contract.value.computational.hash, await this.computeEngine.jsLoader(contract));
            // Load the model from the contract
            const model = await this.computeEngine.loadModelFromContract(contract);
            const result = await model.compute(inputData);
            result.state = true
            return result
          } else if (contract.value.computational.mode === 'wasm') {
            registerModelLoader(contract.value.computational.hash, await this.computeEngine.wasmLoader(contract));
            // Load the model from the contract
            const model = await this.computeEngine.loadModelFromContract(contract);
            let wasmDataFormat = this.wasmArrayStructure(inputData)
            const result = await model.compute(wasmDataFormat.data, { useWasm: true });
            result.state = true
            let sfResult = this.convertSFDataStructure(wasmDataFormat.datatypes, result)
            console.log('converteeteteed')
            console.log(sfResult)
            return sfResult
          }
        }
      }

    } catch (error) {
      console.error('Compute error:', error);
      return {
        state: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * wasm require number only
   * @method wasmArrayStructure
   * @returns 
  */
  wasmArrayStructure(data) {
    let wasmArray = []
    for (let item of data) {
      let dataKeys = Object.keys(item)
      let numberF = parseInt(item[dataKeys[1]])
      wasmArray.push(numberF)
    }
    let wasmHolder = {}
    wasmHolder.datatypes = data[0]
    wasmHolder.data = wasmArray
    return wasmHolder
  }

  /**
   * return wasm data structure to SF
   * @method convertSFDataStructure
   * @returns 
  */
  convertSFDataStructure(datatypes, data) {
    // is data.result already an array?
    let dataLength = data.result instanceof Array
    let convertData = {}
    let sfArray = []
    if (dataLength === true) {
      for (let item of data) {
        sfArray.push({})
      }
    } else {
      let singleR = data.result
      let dataKeys = Object.keys(datatypes)
      datatypes[dataKeys[1]] = singleR
      data.result = [ datatypes ]
      convertData = data
      
    }
    return convertData
  }



  /**
   * new model to register in compute-engine
   * @method registerModel
   * @returns 
  */
  async registerModel(contract) {
    if (contract.value.computational.mode === 'javascript') {
      if (contract.value.computational.name !== 'observation')
      registerModelLoader(contract.value.computational.hash, await this.computeEngine.jsLoader(contract));
    } else if (contract.value.computational.mode === 'wasm') {
      registerModelLoader(contract.value.computational.hash, await this.computeEngine.wasmLoader(contract));
    }
    return true
  }

  /**
   * load model via compute engine
   * @method loadModel
   * @returns 
  */
  async loadModel(modelName) {
    try {
      return await this.computeEngine.loadModel(modelName);
    } catch (error) {
      console.error(`Error loading compute model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * get compute status
   * @method getComputeStatus
   * @returns 
  */
  getComputeStatus(contractId) {
    return {
      lastComputeTime: this.lastComputeTime[contractId],
      hasComputed: !!this.lastComputeTime[contractId]
    };
  }
}

export default ComputeSystem;
