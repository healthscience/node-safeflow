import { ComputeEngine } from 'compute-engine';
import { EventEmitter } from 'events';

class ComputeSystem extends EventEmitter {
  constructor(setIN) {
    super();
    // Initialize compute engine
    this.computeEngine = new ComputeEngine();
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
    if (!this.publicLibrary) {
      console.warn('No public library provided, cannot preload models');
      return;
    }

    // Find all compute models in the public library
    const computeModels = this.publicLibrary.filter(libItem => {
      return libItem.value?.refcontract === 'compute';
    });

    // Load each model
    for (const model of computeModels) {
      try {
        const modelName = model.value.computational.name;
        await this.loadModelFromLibrary(modelName);
        console.log(`Successfully loaded model: ${modelName}`);
      } catch (error) {
        console.error('Failed to preload model:', error);
      }
    }
  }

  async loadModelFromLibrary(contract) {
    console.log('load this compute contract please')
    console.log(modelContract)
    try {
      // Use the updated compute-engine to load the model from the contract
      const model = await computeEngine.loadModelFromContract(contract);

      // Store the loaded model in the system
      this.models[contract.id] = model;

      console.log(`Model ${contract.id} loaded successfully.`);
    } catch (error) {
      console.error(`Error loading model ${contract.id}:`, error);
    }
  }

  /*
  *
  * main entry point to compute system
  * @method computationSystem
  * @param {object} contract
  **/
  async computationSystem(contract, dataPrint, inputData) {
    try {
      // Validate contract
      if (!contract) {
        throw new Error('Invalid compute contract - contract is undefined');
      }

      // Get compute info from contract
      let modelName;
      let modelType;

      // Check for new structure from query builder
      if (contract.compute?.[0]?.value?.computational?.name) {
        modelName = contract.compute[0].value.computational.name;
        // Set model type based on name
        modelType = modelName === 'average' ? 'average' : 'observation';
      } else if (contract.value?.info?.compute?.[0]?.value?.computational?.name) {
        // Old structure
        modelName = contract.value.info.compute[0].value.computational.name;
        modelType = modelName === 'average' ? 'average' : 'observation';
      } else {
        throw new Error('Invalid compute contract - cannot find model name');
      }

      // Load model
      const model = await this.computeEngine.loadModel(modelName);
      if (!model) {
        throw new Error(`Model not found: ${modelName}`);
      }

      // Process data through model
      const result = await model.compute(inputData, {
        controls: contract.controls,
        settings: contract.settings,
        type: modelType // Pass the correct type
      });

      return {
        state: true,
        result: result,
        timestamp: Date.now()
      };
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

/**
 * Base model class
 * @class BaseModel
 * @package safeFlow
 * @subpackage compute
 * @copyright Copyright (c) 2025 James Littlejohn
 * @license http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
 * @version $Id$
 */
class BaseModel {
  constructor(modelData) {
    this.modelData = modelData;
  }

  async compute(data, options) {
    const modelType = options?.type || this.modelData.value.computational.type;
    switch (modelType) {
      case 'average':
        const averageResult = await this.computeAverage(data, options);
        return {
          result: averageResult,
          timestamp: Date.now()
        };
      case 'observation':
        return {
          data: data,
          timestamp: Date.now()
        };
      default:
        throw new Error(`Unsupported model type: ${modelType}`);
    }
  }

  async computeAverage(data, options) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data array');
    }
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
  }
}

export default ComputeSystem;
export { BaseModel };