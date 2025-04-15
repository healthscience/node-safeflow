/**
*  ComputeSystem
*
*
* @class ComputeSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import { ComputeEngine } from 'compute-engine'
import { EventEmitter } from 'events'

class ComputeSystem extends EventEmitter {
  constructor(setIN) {
    super()
    
    // Initialize compute engine
    this.computeEngine = new ComputeEngine()
    
    // Track last compute times
    this.lastComputeTime = {}
    
    // Store reference to public library
    this.publicLibrary = setIN?.publicLibrary
    
    // Preload models from public library
    this.preloadModels()
  }

  /**
   * Load compute model from public library
   * @method loadModelFromLibrary
   * @param {string} modelName - Name of the compute model
   * @returns {Promise<object>} Loaded model instance
   */
  async loadModelFromLibrary(modelName) {
    try {
      // Check if model is already loaded
      const existingModel = this.computeEngine.models.get(modelName)
      if (existingModel) {
        return existingModel
      }

      // Find model in public library array
      const modelData = this.publicLibrary?.find(libItem => {
        // Check both by key and by computational name
        return libItem.key === modelName || 
               (libItem.value?.refcontract === 'compute' && 
                libItem.value?.computational?.name === modelName)
      })

      if (!modelData) {
        throw new Error(`Model ${modelName} not found in public library`)
      }

      // Use the model name as identifier
      const modelIdentifier = modelData.value.computational.name

      // Create model instance with proper compute method
      const newModel = new BaseModel(modelData)
      
      // Register model with compute engine using model name
      this.computeEngine.models.set(modelIdentifier, newModel)
      
      // Also cache the model by its key
      if (modelData.key && modelData.key !== modelIdentifier) {
        this.computeEngine.models.set(modelData.key, newModel)
      }
      
      return newModel
    } catch (error) {
      console.error(`Error loading model ${modelName}:`, error)
      throw error
    }
  }

  /**
   * Preload models from public library
   * @method preloadModels
   */
  async preloadModels() {
    if (!this.publicLibrary) {
      console.warn('No public library provided, cannot preload models')
      return
    }

    // Find all compute models in the public library
    const computeModels = this.publicLibrary.filter(libItem => {
      return libItem.value?.refcontract === 'compute'
    })

    // Load each model
    for (const model of computeModels) {
      try {
        const modelName = model.value.computational.name
        await this.loadModelFromLibrary(modelName)
        console.log(`Successfully loaded model: ${modelName}`)
      } catch (error) {
        console.error('Failed to preload model:', error)
      }
    }
  }

  /**
   * Process compute request using compute engine
   * @method computationSystem
   * @param {object} contract - Compute contract
   * @param {object} dataPrint - Data print configuration
   * @param {object} inputData - Input data
   * @returns {Promise<object>} Compute result
   */
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
        type: modelType  // Pass the correct type
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
   * Load compute model dynamically
   * @method loadModel
   * @param {string} modelName - Name of the compute model
   * @returns {Promise<object>} Loaded model instance
   */
  async loadModel(modelName) {
    try {
      return await this.computeEngine.loadModel(modelName)
    } catch (error) {
      console.error(`Error loading compute model ${modelName}:`, error)
      throw error
    }
  }

  /**
   * Get compute status for a contract
   * @method getComputeStatus
   * @param {string} contractId - Contract identifier
   * @returns {object} Compute status
   */
  getComputeStatus(contractId) {
    return {
      lastComputeTime: this.lastComputeTime[contractId],
      hasComputed: !!this.lastComputeTime[contractId]
    }
  }
}

/**
 * Base model class for wrapping library models
 * @class BaseModel
 */
class BaseModel {
  constructor(modelData) {
    this.modelData = modelData
  }

  /**
   * Compute operation
   * @param {any} data - Input data
   * @param {Object} options - Computation options
   * @returns {Promise<any>} Computation result
   */
  async compute(data, options) {
    const modelType = options?.type || this.modelData.value.computational.type
    switch (modelType) {
      case 'average':
        const averageResult = await this.computeAverage(data, options)
        return {
          result: averageResult,
          timestamp: Date.now()
        }
      case 'observation':
        return {
          data: data,
          timestamp: Date.now()
        }
      default:
        throw new Error(`Unsupported model type: ${modelType}`)
    }
  }

  /**
   * Compute average of data
   * @param {number[]} data - Array of numbers
   * @param {Object} options - Computation options
   * @returns {number} Average value
   */
  async computeAverage(data, options) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data array')
    }
    const sum = data.reduce((acc, val) => acc + val, 0)
    return sum / data.length
  }
}

export default ComputeSystem
export { BaseModel }
