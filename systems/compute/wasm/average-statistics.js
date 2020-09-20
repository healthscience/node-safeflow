'use strict'
/**
*  StatisticsSystem
*
*
* @class StatisticsSystem
* @package    compute module
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import TestStorageAPI from '../../data/dataprotocols/teststorage/testStorage.js'
import util from 'util'
import events from 'events'

var StatisticsSystem = function (setIN) {
  events.EventEmitter.call(this)
  this.liveTestStorage = new TestStorageAPI(setIN)
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(StatisticsSystem, events.EventEmitter)

/**
* computation gateway
* @method statisticsSystem
*
*/
StatisticsSystem.prototype.statisticsSystem = function () {
  // match computation to approprate verified compute
}

/**
* statical average
* @method averageStatistics
*
*/
StatisticsSystem.prototype.averageStatistics = function (dataArray) {
  // statistical avg. smart contract/crypt ID ref & verfied wasm/network/trubit assume done
  let AvgHolder = {}
  let numberEntries = dataArray.length
  // accumulate sum the daily data
  let sum = dataArray.reduce(add, 0)
  function add (a, b) {
    return a + b
  }
  let averageResult = sum / numberEntries
  let roundAverage = Math.round(averageResult)
  AvgHolder.count = numberEntries
  AvgHolder.average = roundAverage
  return AvgHolder
}

/**
* statical Monthly average
* @method averageMonthlyStatistics
*
*/
StatisticsSystem.prototype.averageMonthlyStatistics = function () {
  console.log('start MONTH average')
}

/**
* statical current history daily average
* @method averageCurrentDailyStatistics
*
*/
StatisticsSystem.prototype.averageCurrentDailyStatistics = async function (startDate, device, compType, datatype, timeseg, category) {
  let dataBatch = await this.liveTestStorage.getAverageData(startDate, device, compType, datatype, timeseg, category)
  let numberEntries = dataBatch.length
  // form single arrays
  let singleAvgArray = []
  for (let sav of dataBatch) {
    singleAvgArray.push(sav.value)
  }
  // accumulate sum the daily data
  let sum = singleAvgArray.reduce(add, 0)
  function add (a, b) {
    return a + b
  }
  let averageResult = sum / numberEntries
  let roundAverage = Math.round(averageResult)
  // where to save
  return roundAverage
}

/**
* data error analysis
* @method dataErrorAnalysis
*
*/
StatisticsSystem.prototype.dataErrorAnalysis = function (dataDay) {
  //  given the dataType, expected data entries v actual data recorded from device sensor
  let dataExpectedBPM = 24 * 60
  let actutalDataBMP = dataDay.length
  let dataErrorDifference = dataExpectedBPM - actutalDataBMP

  return dataErrorDifference
}

export default StatisticsSystem
