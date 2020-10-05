'use strict'
/**
*  TimSystem
*
*
* @class TimeSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import pkg from 'moment-range'
const { extendMoment } = pkg
import util from 'util'
import events from 'events'
import Moment from 'moment'
const moment = extendMoment(Moment)

var TimeSystem = function (setIN) {
  events.EventEmitter.call(this)
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(TimeSystem, events.EventEmitter)

/**
*  what is the real time now
* @method setRealtime
*
*/
TimeSystem.prototype.setRealtime = function () {
  let realtimenow = moment().valueOf() // .startOf('day').valueOf()
  return realtimenow
}


/**
*  assess what range of data day / range are required?
* @method sourceTimeRange
*
*/
TimeSystem.prototype.sourceTimeRange = function (startTime, nowTime, tSegment) {
  console.log('sourceTimeRange')
  console.log(startTime)
  console.log(nowTime)
  console.log(tSegment)
  let timeSourceRange = this.momentRangeBuild(startTime, nowTime, tSegment)
  let rangeFormat = this.formatTimeSafeFlow(timeSourceRange)
  return rangeFormat
}

/**
* use moment range to build time array
* @method momentRangeBuild
*
*/
TimeSystem.prototype.momentRangeBuild = function (startTime, endTime, segment) {
  let startMoment = moment(parseInt(startTime)).format()
  let endMoment = moment(endTime).format() // .startOf('day')
  let rangeBuild = moment.range(startMoment, endMoment)
  let sourceTimes = Array.from(rangeBuild.by(segment))
  return sourceTimes
}

/**
*  select data for UI
* @method formatTimeSafeFlow
*
*/
TimeSystem.prototype.formatTimeSafeFlow = function (liveDates) {
  let timeLive = []
  for (let ld of liveDates) {
    let tFormat = moment(ld).valueOf()
    timeLive.push(tFormat)
  }
  return timeLive
}

/**
* order the array by time and select the last time
* @method timeOrderLast
*
*/
TimeSystem.prototype.timeOrderLast = function (dataAIN) {
  let lastTime = ''
  // order array by time
  if (dataAIN !== undefined) {
    lastTime = dataAIN.timestamp
  } else {
    lastTime = 0
  }
  return lastTime
}

/**
* assess the computation required
* @method assessCompute
*
*/
TimeSystem.prototype.assessCompute = async function (systemBundle, lastTime, liveTime, device, timeseg) {
  let computeCheck = {}
  // first time compute? Or not?
  if (lastTime === 0) {
    // console.log('logic 1')
    let updateCompStatus = 'update-required'
    let startTimeFound = await this.sourceDTstartTime(device)
    computeCheck.computestatus = updateCompStatus
    computeCheck.firstdate = startTimeFound
  } else if (lastTime < liveTime) {
    computeCheck.computestatus = 'on-going'
    computeCheck.firstdate = lastTime
  } else {
    computeCheck.computestatus = 'uptodate'
  }
  return computeCheck
}

/**
* assess the computation required
* @method assessOngoing
*
*/
TimeSystem.prototype.assessOngoing = function (lastComputeIN, liveTime) {
  let timeArray = {}
  timeArray = this.updateComputeDateArray(lastComputeIN, liveTime)
  return timeArray
}

/**
* query source datatype for a starting time stamp
* @method sourceDTstartTime
*
*/
TimeSystem.prototype.sourceDTstartTime = async function (devIN) {
  // need to map compute asked for to function that calls API for data
  let timeDevHolder = ''
  // pass over to data system to match function for API query
  // need to update query for source DT rather than the prime ie derived
  let dateDevice = null // await this.liveTestStorage.getFirstData(devIN)
  timeDevHolder = dateDevice[0].timestamp
  return timeDevHolder
}

/**
* what data needs to be tidied to update computation?
* @method updateComputeDateArray
*
*/
TimeSystem.prototype.updateComputeDateArray = function (lastCompTime, liveTime) {
  let computeList = []
  const liveDate = liveTime * 1000
  const lastComputeDate = lastCompTime * 1000
  // use time utiity to form array fo dates require
  computeList = this.liveTimeUtil.timeDayArrayBuilder(liveDate, lastComputeDate)
  return computeList
}

/**
* does this data time ask need updating? Y N
* @method discoverTimeStatus
*
*/
TimeSystem.prototype.discoverTimeStatus = async function (systemBundle, dataIN) {
  let statusHolder = {}
  let lastComputetime = []
  let liveTimeConvert = moment(systemBundle.time.startperiod).valueOf()
  let liveTime = liveTimeConvert / 1000
  // need to discover prime data type (and) source DT's start time is neccessary
  for (let dev of systemBundle.devices) {
    for (let dtl of systemBundle.dtInfo[dev.device_mac].datatypes) {
      let devMac = dev.device_mac
      for (let tsega of systemBundle.time.timeseg) {
        statusHolder[liveTime] = {}
        statusHolder[liveTime][devMac] = {}
        statusHolder[liveTime][devMac][dtl.cnrl] = {}
        // need to select the latest data object from array
        let lastDataItem = dataIN[liveTime][devMac][dtl.cnrl][tsega].slice(-1)[0]
        // need to check if prime data type be computed before?
        if (tsega !== undefined || tsega.length > 0) {
          if (tsega === 'day') {
            lastComputetime = this.timeOrderLast(lastDataItem)
            let catStatus2 = await this.assessCompute(systemBundle, lastComputetime, liveTime, devMac, 'day')
            let computeOngoing = {}
            if (catStatus2.computestatus === 'on-going') {
              // map compute to data source API query
              computeOngoing.lastComputeTime = catStatus2.firstdate
              computeOngoing.status = catStatus2.computestatus
              computeOngoing.timeseg = 'day'
              computeOngoing.computeTime = this.assessOngoing(catStatus2.firstdate, liveTime)
            } else if (catStatus2.computestatus === 'update-required') {
              // just return first time data compute INFO
              computeOngoing.lastComputeTime = catStatus2.firstdate
              computeOngoing.status = catStatus2.computestatus
              computeOngoing.timeseg = 'day'
              computeOngoing.computeTime = this.assessOngoing(catStatus2.firstdate, liveTime)
            } else {
              // nothing to compute
              computeOngoing.status = catStatus2.computestatus
            }
            statusHolder[liveTime][devMac][dtl.cnrl][tsega] = computeOngoing
          }
          if (tsega === 'week') {
            let computeOngoing = {}
            // convert to array of single days and 'add together those data sets
            let catStatus3 = await this.assessCompute(systemBundle, lastComputetime, liveTime, devMac, 'week')
            computeOngoing.lastComputeTime = catStatus3.firstdate
            computeOngoing.status = catStatus3.computestatus
            computeOngoing.timeseg = 'week'
            computeOngoing.computeTime = this.assessOngoing(systemBundle.cid, catStatus3.firstdate, liveTime)
            statusHolder[liveTime][devMac][dtl.cnrl][tsega] = catStatus3
          }
          /* if (tsega === 'month') {
            lastComputetime = tsega.week.slice(-1)
            let catStatus4 = await this.prepareDateArrays(systemBundle, lastComputetime, dev, 'month')
            statusHolder[liveTime][devMac][dtl.cnrl][tsega] = catStatus4
          }
          if (tsega === 'year') {
            lastComputetime = tsega.week.slice(-1)
            let catStatus5 = await this.prepareDateArrays(systemBundle, lastComputetime, dev, 'year')
            statusHolder[liveTime][devMac][dtl.cnrl][tsega] = catStatus5
          } */
        }
      }
    }
  }
  return statusHolder
}

export default TimeSystem
