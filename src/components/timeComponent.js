'use strict'
/**
*  TimeComponent
*
*
* @class TimeComponent
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import TimeUtilities from '../systems/time/timeUtility.js'
import TimeSystem from '../systems/time/timeSystem.js'
import util from 'util'
import events from 'events'
import moment from 'moment'

var TimeComponent = function (setIN) {
  this.liveTimeUtil = new TimeUtilities()
  this.liveTimeSystem = new TimeSystem(setIN)
  this.time = {} // holds all time info. per cnrl module???
  this.livedate = 0
  this.timeseg = {}
  this.resolution = null
  this.liveTime = {}
  this.timerange = []
  this.lastactiveStartTime = 0
  this.history = []
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(TimeComponent, events.EventEmitter)

/**
*  convert UI status to entity master clock
* @method setMasterClock
*
*/

TimeComponent.prototype.setMasterClock = function (startTime) {
  this.livedate = startTime
  return true
}

/**
*  set the live date active in the UI
* @method setStartPeriod
*
*/
TimeComponent.prototype.setStartPeriod = function (startDate) {
  if (startDate !== 'relative') {
    let convertSafeFlowTime = moment(startDate).valueOf()
    this.livedate.startperiod = convertSafeFlowTime // 1000
    this.setTimeList(this.livedate.startperiod)
  } else {
    this.livedate.startperiod = startDate
  }
  return true
}

/**
*  real time
* @method setLastTimeperiod
*
*/
TimeComponent.prototype.setRealtime = function (realtime) {
  this.livedate.realtime = realtime
}

/**
*  set the last time from UI
* @method setLastTimeperiod
*
*/
TimeComponent.prototype.setLastTimeperiod = function (laststarttime) {
  this.livedate.laststartperiod = laststarttime
}

/**
*  keep list of timePeriods that data has been asked for
* @method setTimeArray
*
*/
TimeComponent.prototype.setTimeList = function (liveDate) {
  this.history.push(liveDate.startperiod)
}

/**
*  keep list of timePeriods that data has been asked for
* @method setTimeSegments
*
*/
TimeComponent.prototype.setTimeSegments = function (liveTimeSegs) {
  // console.log('time set set')
  // console.log(liveTimeSegs)
  this.timeseg = liveTimeSegs
}

/**
*  set time resolution (NB resolution could be in any units)
* @method setTimeResolution
*
*/
TimeComponent.prototype.setTimeResolution = function (liveResolution) {
  this.resolution = liveResolution
}

/**
*  reset the vis time segment from navigation
* @method setTimeVis
*
*/
TimeComponent.prototype.setTimeVis = function (liveVis) {
  this.livedate.timevis = liveVis
}

/**
*  setDateRange set by peer
* @method setDateRange
*
*/
TimeComponent.prototype.setDateRange = function (dateRange) {
  this.timerange = dateRange
}

/**
*  remove a time from the list
* @method removeTime
*
*/
TimeComponent.prototype.removeTime = function () {
  // remove time this  this.livedate
  let arr = this.timerange
  let updateList= arr.filter(item => item !== this.livedate)
  this.timerange = updateList
}

/**
*  restTimerange
* @method restTimerange
*
*/
TimeComponent.prototype.restTimerange = function () {
  this.timerange = []
}

/**
*  what time segement is required?
* @method
*
*/
TimeComponent.prototype.timeProfiling = function (timeSet, timePeriod) {
  // console.log('timeprofiling')
  // console.log(timeSet)
  // console.log(timePeriod)
  // set the real timeout
  let realtimeMS = this.liveTimeSystem.setRealtime()
  // assess automation and build time range(s)
  let timeSource = this.liveTimeSystem.sourceTimeRange(timeSet, realtimeMS, timePeriod)
  this.autotimerange = timeSource
  return true
}

/**
*  discover the start end range times for each data type selected
* @method startTimeSystem
*
*/
TimeComponent.prototype.startTimeSystem = async function (dtInfo, dataIN) {
  // need to look at the entity datatype INFO bundle and map times start stop update status
  let systemBundle = {}
  systemBundle.time = this.did.time
  systemBundle.devices = this.did.devices
  systemBundle.dtInfo = dtInfo.datatypeInfoLive
  if (this.did.science.wasmfile === 'none') {
    // raw data nothing to compute
    this.liveTime = 'none'
  } else {
    this.liveTime = await this.liveTimeSystem.discoverTimeStatus(systemBundle, dataIN)
  }
  return true
}

export default TimeComponent
