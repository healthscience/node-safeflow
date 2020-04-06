'use strict'
/**
*  Time Utilities
*
*
* @class TimeUtilities
* @package    testStorage API
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import { extendMoment } from 'moment-range'
const Moment = require('moment')
const util = require('util')
const events = require('events')
const moment = extendMoment(Moment)

var TimeUtilities = function (setUP) {
  events.EventEmitter.call(this)
  this.liveStarttime = ''
  this.liveLasttime = ''
  this.realtime = ''
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(TimeUtilities, events.EventEmitter)

/**
* convert all the time input to milliseconds
* @method timeConversionUtility
*
*/
TimeUtilities.prototype.timeConversionUtility = function (timeBundle) {
  // pass range to get converted from moment format to miillseconds (stnd for safeflow)
  let timeConversion = {}
  let liveStarttime = 0
  if (timeBundle.startperiod === 'relative') {
    liveStarttime = timeBundle.startperiod
  } else {
    liveStarttime = moment(timeBundle.startperiod).valueOf() / 1000
  }
  let laststarttime = moment(timeBundle.laststartperiod).startOf('day').valueOf() / 1000
  this.realtime = timeBundle.realtime
  let UItimeConvertion = this.updateUItime(timeBundle.timevis, liveStarttime, laststarttime)
  timeConversion.timeseg = timeBundle.timeseg
  timeConversion.timevis = timeBundle.timevis
  let realTimems = moment(timeBundle.realtime).valueOf()
  timeConversion.realtime = Math.round(realTimems / 1000)
  let startConvertion = UItimeConvertion.startperiod // moment(UItimeConvertion.timeperiod).valueOf()
  timeConversion.startperiod = startConvertion // Math.round(startConvertion / 1000)
  return timeConversion
}

/**
* time segmentation for compute
* @method computeTimeSegments
*
*/
TimeUtilities.prototype.computeTimeSegments = function (startTime, tSegs) {
  let timeConversion = 0
  // does a standard time types need converting or range or both?
  for (let ti of tSegs) {
    if (ti === 'SELECT') {
      let rangeMills = this.rangeCovert(ti)
      // console.log(rangeMills)
      timeConversion = rangeMills
    } else {
      let timePeriod = {}
      timePeriod = this.timeSegBuilder(startTime, ti)
      timeConversion = timePeriod
    }
  }
  return timeConversion
}

/**
* take range object and convert moment times to miillseconds
* @method updateUItime
*
*/
TimeUtilities.prototype.updateUItime = function (timeUI, time, lastTime) {
  let timeMills = {}
  // does a standard time types need converting or range or both?
  for (let ti of timeUI) {
    if (ti === 'SELECT') {
      let rangeMills = this.rangeCovert(ti, time, lastTime)
      timeMills.range = rangeMills
    } else {
      let timePeriod = {}
      timePeriod = this.timeConvert(ti, time, lastTime)
      timeMills.startperiod = timePeriod
    }
  }
  return timeMills
}

/**
* Date and Time
* @method timeConvert
*
*/
TimeUtilities.prototype.timeConvert = function (uT, time, lastTime) {
  let convertLasttime = lastTime
  let startTime = time
  let timestamp
  if (uT === 'day') {
    // asking for one 24hr display
    startTime = time
  } else if (uT === 'week') {
    startTime = time
  } else if (uT === 'month') {
    startTime = time
  } else if (uT === 'year') {
    startTime = time
  } else if (uT === '-day') {
    // move back one day in time
    if (startTime === 'relative') {
      let backstartTime = (convertLasttime - 86400)
      startTime = backstartTime
    }
    // startTime = (startTime - 86400000)
  } else if (uT === '+day') {
    // move forward day in time
    if (startTime === 'relative') {
      startTime = (convertLasttime + 86400)
    } else {
      // startTime = (startTime + 86400)
      // console.log(this.realtime)
      let msRealtime = moment(this.realtime).valueOf()
      if (startTime > msRealtime) {
        // pass on to simulated data
        startTime = 'simulateData'
      }
    }
  } else if (uT === '-week') {
    // return start of year timeout
    if (startTime === 'relative') {
      startTime = (convertLasttime - (7 * 86400))
    }
    startTime = startTime * 1
    // startTime = moment().startOf('week')
  } else if (uT === '+week') {
    // return start of year head
    if (startTime === 'relative') {
      startTime = (convertLasttime + (7 * 86400))
    }
    startTime = startTime * 1
    // startTime = moment().startOf('week') + 1
  } else if (uT === '-year') {
    // return start of year timeout
    startTime = moment().startOf('year')
  } else if (uT === '+year') {
    // return start of year head
    startTime = moment().startOf('year') + 1
  } else {
    const startOfMonth = moment.utc().startOf('month')
    //  reset the day to first of month adjust month for segment required
    if (uT === '-month') {
      startTime = startOfMonth
    } else {
      let adSeg = startOfMonth - 1
      startTime = moment(startOfMonth).subtract(adSeg, 'months')
    }
  }
  //  get the micro time for start of time for query
  if (startTime !== 'simulateData') {
    if (startTime !== 'relative') {
      let startQuerytime = moment(startTime).valueOf()
      timestamp = startQuerytime
    } else {
      timestamp = startTime
    }
  } else {
    timestamp = 'simulateData'
  }
  return timestamp
}

/**
* build time arrays for computations
* @method timeSegBuilder
*
*/
TimeUtilities.prototype.timeSegBuilder = function (timeStart, sg) {
  let timeEnd = 0
  if (sg === 'day') {
    timeEnd = timeStart
  } else if (sg === 'week') {
    // add 7 days of ms time to start time
    timeEnd = timeStart - (7 * 86400)
  } else if (sg === 'month') {
    // add 30 days of ms time to start time
    timeEnd = timeStart - (30 * 86400)
  } else if (sg === 'year') {
    // add 365 days of ms time to start time
    timeEnd = timeStart - (365 * 86400)
  }
  return timeEnd
}

/**
* take range object and convert moment times to miillseconds
* @method rangeCovert
*
*/
TimeUtilities.prototype.rangeCovert = function (rangeIN) {
  let rangeMS = {}
  let startMinute = moment(rangeIN.startTime).startOf('minute')
  let startMS = moment(startMinute).valueOf()
  let endMinute = moment(rangeIN.endTime).startOf('minute')
  let endMS = moment(endMinute).valueOf()
  rangeMS.startTime = startMS / 1000
  rangeMS.endTime = endMS / 1000
  return rangeMS
}

/**
* Calendar Utilty
* @method calendarUtility
*
*/
TimeUtilities.prototype.calendarUtility = function () {
  // segment the year months days in months
  let startY = moment().startOf('year').valueOf()
  let yearCommence = startY / 1000
  // console.log(yearCommence)
  const monthNo = moment(startY).month()
  const currentmonthNo = monthNo + 1
  // console.log(monthNo)
  let secondsInday = 86400
  let calendarUtil = []
  // let months = 'January, February, March, April, May, June, July, August, September, October, November, December'
  let monthsNumber = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  // need logic for leap years
  let daysInmonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  for (let numM of monthsNumber) {
    if (numM >= monthNo && numM <= currentmonthNo) {
      let longDateformat = yearCommence + (numM * daysInmonth[numM] * secondsInday)
      let dayCount = daysInmonth[numM]
      calendarUtil.push({dayCount, longDateformat})
    }
  }
  // console.log(calendarUtil)
  return calendarUtil
}

/**
* Build an array of dates between two time points PER DAY
* @method timeDayArrayBuilder
*
*/
TimeUtilities.prototype.timeDayArrayBuilder = function (liveTime, lastTime) {
  let TimeHolder = {}
  let timeArray = []
  let yearEndmnoth = 11
  const monthNocurrent = moment(liveTime).month()
  const monthNo = moment(lastTime).month()
  let dayIncurrentMonth = moment(liveTime).date()
  // let shortLastTime = lastTime / 1000
  const yearNum = moment(lastTime).year()
  const yearNumcurrent = moment(liveTime).year()
  // dealing with multiple years?
  if (yearNumcurrent > yearNum) {
    // build array in two part, first oldest year
    const firstmonthNo = moment(lastTime).month()
    const firstmonthNocurrent = yearEndmnoth
    // console.log('first month and  for no curret')
    // console.log(firstmonthNo)
    // console.log(firstmonthNocurrent)
    let firstStartMonth = moment(lastTime).startOf('month')
    let firstbaseMills = moment(firstStartMonth).valueOf() + 3600000
    let secondsInday = 86400000
    // let months = 'January, February, March, April, May, June, July, August, September, October, November, December'
    let monthsNumberFirst = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    // need logic for leap years
    let daysInmonthFirst = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let counter = 1
    let longDateformat
    for (let numM of monthsNumberFirst) {
      if (numM >= firstmonthNo && numM <= firstmonthNocurrent) {
        if (counter === 1) {
          longDateformat = firstbaseMills
        } else {
          longDateformat = firstbaseMills + (daysInmonthFirst[numM] * secondsInday)
        }
        firstbaseMills = longDateformat
        let dayCount = daysInmonthFirst[numM]
        timeArray.push({dayCount, longDateformat})
        counter++
      }
    }
    counter = 1
    let SecondbaseMills = firstbaseMills
    for (let numM of monthsNumberFirst) {
      const SecondmonthNocurrent = moment(liveTime).month()
      // console.log(SecondmonthNocurrent)
      if (numM >= 0 && numM <= SecondmonthNocurrent) {
        if (counter === 1) {
          longDateformat = SecondbaseMills + (31 * secondsInday)
        } else {
          longDateformat = SecondbaseMills + (daysInmonthFirst[numM] * secondsInday)
        }
        SecondbaseMills = longDateformat
        let dayCount = daysInmonthFirst[numM]
        timeArray.push({dayCount, longDateformat})
        counter++
      }
    }
  } else {
    let baseStartMonth = moment(lastTime).startOf('month')
    let baseMills = moment(baseStartMonth).valueOf() + 3600000
    let secondsInday = 86400000
    // let months = 'January, February, March, April, May, June, July, August, September, October, November, December'
    let monthsNumber = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    // need logic for leap years
    let daysInmonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let counter = 1
    let longDateformat
    for (let numM of monthsNumber) {
      if (numM >= monthNo) {
        if (numM <= monthNocurrent) {
          if (counter === 1) {
            longDateformat = baseMills
          } else {
            longDateformat = baseMills + (daysInmonth[numM] * secondsInday)
          }
        }
        baseMills = longDateformat
        let dayCount = daysInmonth[numM]
        timeArray.push({dayCount, longDateformat})
        counter++
      }
    }
  }
  TimeHolder.calendar = timeArray
  TimeHolder.uptoDateTime = lastTime
  TimeHolder.currentday = dayIncurrentMonth
  let lastMonthStartTime = timeArray.slice(-1).pop()
  TimeHolder.currentML = lastMonthStartTime.longDateformat
  let calendarList = this.longDataArray(TimeHolder)
  return calendarList
}

/**
* Build an array of dates between two time points PER WEEK
* @method longDataArray
*
*/
TimeUtilities.prototype.longDataArray = function (calInfo) {
  let calendarTimeList = []
  let yearArray = calInfo.calendar
  this.dayCounter = 0
  // loop over all months
  for (let scMonth of yearArray) {
    let daysInmonth = scMonth.dayCount
    let accDaily = 0
    let millsSecDay = 86400000
    this.dayCounter = scMonth.longDateformat
    if (calInfo.currentML === this.dayCounter) {
      // last month, stop at current live days
      while (accDaily < (calInfo.currentday - 2)) {
        this.dayCounter = this.dayCounter + millsSecDay
        accDaily++
        if (this.dayCounter > calInfo.uptoDateTime) {
          calendarTimeList.push(this.dayCounter)
        }
      }
    } else {
      while (accDaily < daysInmonth) {
        this.dayCounter = this.dayCounter + millsSecDay
        accDaily++
        calendarTimeList.push(this.dayCounter)
      }
    }
  }
  return calendarTimeList
}

/**
* Build an array of dates between two time points PER WEEK
* @method timeWeekArrayBuilder
*
*/
TimeUtilities.prototype.timeWeekArrayBuilder = function (liveTime, lastTime) {
  let timeWArray = []
  // set first week
  return timeWArray
}

/**
* prepare HTML display string
* @method timeHTMLBuilder
*
*/
TimeUtilities.prototype.timeHTMLBuilder = function (liveTime) {
  let stringTime = ''
  // prepare monent human readable display
  let buildMilltime = liveTime * 1000
  stringTime = moment(buildMilltime).format('MMMM Do YYYY')
  return stringTime
}

export default TimeUtilities
