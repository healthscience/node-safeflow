'use strict'
/**
*  averageSystem
*
*
* @class averageSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import TimeUtilities from '../time/timeUtility.js'
import AvgStatisticsSystem from './wasm/average-statistics.js'
import util from 'util'
import events from 'events'
import moment from 'moment'

var AverageSystem = function (setIN) {
  events.EventEmitter.call(this)
  this.liveTimeUtil = new TimeUtilities()
  this.avgliveStatistics = new AvgStatisticsSystem(setIN)
  this.lastComputeTime = {}
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(AverageSystem, events.EventEmitter)

/**
* verify the computation file
* @method verifyComputeWASM
*
*/
AverageSystem.prototype.verifyComputeWASM = function (wasmFile) {
  // check the hash verifes to hash aggred in CNRL contract
}

/**
*  average compute system assess inputs and control compute
* @method averageSystem
*
*/
AverageSystem.prototype.averageSystemStart = function (contract, device, datatype, time, data) {
  // console.log('start prepare avg compute')
  // console.log(contract)
  // console.log(data)
  if (data.length > 0) {
    let saveReady = this.avgliveStatistics.averageStatistics(data)
    let batchSize = data.length
    // prepare JSON object for POST
    let saveJSON = {}
    saveJSON.publickey = ''
    saveJSON.timestamp = time
    saveJSON.compref = contract
    saveJSON.datatype = datatype
    saveJSON.value = saveReady.average
    saveJSON.device_mac = device
    saveJSON.clean = saveReady.count
    saveJSON.tidy = batchSize - saveReady.count
    saveJSON.size = batchSize
    saveJSON.timeseg = 'day'
    saveJSON.category = contract
    // console.log('save average bundle')
    // console.log(saveJSON)
    // this.liveTestStorage.saveaverageData(saveJSON)
  }
  return true
}

export default AverageSystem
