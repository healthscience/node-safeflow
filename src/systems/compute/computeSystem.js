'use strict'
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
import util from 'util'
import events from 'events'

var ComputeSystem = function (setIN) {
  events.EventEmitter.call(this)
  
  // Initialize compute engine
  this.computeEngine = new ComputeEngine()
  
  // Track last compute times
  this.lastComputeTime = {}
}

util.inherits(ComputeSystem, events.EventEmitter)

/**
 * Process compute request using compute engine
 * @method computeSystem
 * @param {object} contract - Compute contract
 * @param {object} dataPrint - Data print configuration
 * @param {object} data - Input data
 * @returns {Promise<object>} Compute result
 */
ComputeSystem.prototype.computationSystem = async function (contract, dataPrint, data) {
  try {
    // Validate contract
    if (!contract || !contract.modelName) {
      throw new Error('Invalid compute contract - missing modelName')
    }

    // Load and compute using the model
    const result = await this.computeEngine.compute(contract.modelName, data, {
      dataPrint,
      contract
    })

    // Update last compute time
    this.lastComputeTime[contract.id] = Date.now()

    return {
      state: true,
      result,
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('Compute error:', error)
    return {
      state: false,
      error: error.message,
      timestamp: Date.now()
    }
  }
}

/**
 * Load compute model dynamically
 * @method loadModel
 * @param {string} modelName - Name of the compute model
 * @returns {Promise<object>} Loaded model instance
 */
ComputeSystem.prototype.loadModel = async function (modelName) {
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
ComputeSystem.prototype.getComputeStatus = function (contractId) {
  return {
    lastComputeTime: this.lastComputeTime[contractId],
    hasComputed: !!this.lastComputeTime[contractId]
  }
}

export default ComputeSystem
