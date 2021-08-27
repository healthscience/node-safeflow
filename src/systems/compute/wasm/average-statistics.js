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
import util from 'util'
import events from 'events'

var StatisticsSystem = function (setIN) {
  events.EventEmitter.call(this)
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
StatisticsSystem.prototype.averageStatistics = function (dataArray, datatype) {
  // statistical avg. has the compute been validated? trubit to ZNP, self certified???
  let avgHolder = {}
  let numberEntries = dataArray.length
  // accumulate sum the daily data
  // let sum = dataArray.reduce(add, 0)
  let sum = dataArray.reduce(function (total, currentValue) {
    return total + currentValue[datatype]
  }, 0)
  let averageResult = sum / numberEntries
  let roundAverage = Math.round(averageResult)
  avgHolder.count = numberEntries
  avgHolder.average = roundAverage
  return avgHolder
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
