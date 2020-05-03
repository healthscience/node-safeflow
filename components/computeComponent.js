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
const util = require('util')
const events = require('events')

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
*
* @method filterCompute
*
*/
ComputeComponent.prototype.filterCompute = async function (contract, device, datatype, time, data) {
  console.log('computeCOMPONENT')
  console.log(contract)
  console.log(device)
  console.log(datatype)
  console.log(time)
  console.log(data)
  let computeState = await this.liveComputeSystem.computationSystem(contract, data)
  this.compute[contract.compute] = computeState
  return this.compute
}

export default ComputeComponent
