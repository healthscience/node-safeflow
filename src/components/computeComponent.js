'use strict'
/**
*  ComputeComponent
*
*
* @class ComputeComponent
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import ComputeSystem from '../systems/compute/computeSystem.js'
import util from 'util'
import events from 'events'

var ComputeComponent = function (setIN) {
  events.EventEmitter.call(this)
  this.computeCNRLlist = []
  this.liveComputeSystem = new ComputeSystem(setIN)
  this.computeStatus = false
  this.compute = {}
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(ComputeComponent, events.EventEmitter)

/**
* Process compute request through the compute system
* @method filterCompute
* @param {object} contract - Compute contract
* @param {object} dataPrint - Data print configuration
* @param {object} data - Input data
* @returns {Promise<object>} Compute result
*/
ComputeComponent.prototype.filterCompute = async function (contract, dataPrint, data) {
  try {
    const computeState = await this.liveComputeSystem.computationSystem(contract, dataPrint, data);
    this.compute = computeState;
    return this.compute;
  } catch (error) {
    console.error('Compute component error:', error);
    return {
      state: false,
      error: error.message,
      timestamp: Date.now()
    };
  }
}

export default ComputeComponent
