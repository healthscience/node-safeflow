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
import SumSystem from './sumSystem.js'
import AverageSystem from './averageSystem.js'
import RecoveryHeartrate from './wasm/recovery-heartrate.js'
import util from 'util'
import events from 'events'

var ComputeSystem = function (setIN) {
  events.EventEmitter.call(this)
  // ECS loader should plugin these files WIP
  this.liveSum = new SumSystem(setIN)
  this.liveAverage = new AverageSystem(setIN)
  this.liveRecoveryHR = new RecoveryHeartrate(setIN)
  this.lastComputeTime = {}
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(ComputeSystem, events.EventEmitter)

/**
* computation gateway
* @method computationSystem
*
*/
ComputeSystem.prototype.computationSystem = async function (contract, data) {
  // match computation to approprate verified compute need LOADER to add what WASM is being used/required
  let computeStatus = {}
  // console.log('computesystem')
  // console.log(contract)
  // console.log(data)
  if (contract.cid === 'none') {
    computeStatus.state = true
    computeStatus.data = data
  } else if (contract.cid === 'cnrl-2356388732') {
    computeStatus = await this.liveAverage.averageSystemStart(contract, data)
  } else if (contract.cid === 'cnrl-2356388737') {
    computeStatus = await this.liveSum.sumSystemStart(contract, data)
  } else if (contract.cid === 'cnrl-2356388733') {
    computeStatus = await this.recoverySystem(contract, data)
  }
  return computeStatus
}

/**
* does this data ask need updating? Y N
* @method recoverySystem
*
*/
ComputeSystem.prototype.recoverySystem = async function (compInfo, rawIN, deviceList) {
  let statusHolder = {}
  let stateHolder = {}
  if (compInfo.status === false) {
    statusHolder.lastComputeTime = 0
    statusHolder.status = 'update-required'
    stateHolder.timeStart = compInfo.rangeTime.startTime
    stateHolder.lastComputeTime = compInfo.rangeTime.endTime
  } else if (compInfo.status === true) {
    // need to loop over per devices
    let computeTimeRange = compInfo.rangeTime
    // console.log(computeTimeRange)
    for (let dvc of deviceList) {
      let updateStatus = await this.liveRecoveryHR.prepareRecoveryCompute(computeTimeRange, dvc)
      console.log(updateStatus)
    }
  }
  return stateHolder
}

export default ComputeSystem
