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
AverageSystem.prototype.averageSystemStart = function (contract, dataPrint, data) {
  console.log('start prepare ===========avg compute')
  // console.log(dataPrint)
  // console.log(data[0])
  let saveJSON = []
  if (data.length > 0) {
    let saveReady = this.avgliveStatistics.averageStatistics(data, dataPrint.triplet.datatype)
    let batchSize = data.length
    // simple key(hash time datatype): value
    // key(hash datatype): value
    // time in seconds not milliseconds
    let saveTime = dataPrint.couple.triplet.timeout / 1000
    let formData = {}
    formData['d76d9c3db7f2212335373873805b54dd1f903a06'] = saveTime
    formData[dataPrint.couple.triplet.datatype] = saveReady.average
    saveJSON.push(formData)
  } else {
    console.log('AVG--system-no data presented to compute')
    saveJSON = {}
  }
  return saveJSON
}

export default AverageSystem
