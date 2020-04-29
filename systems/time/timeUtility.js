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
* time segmentation for compute
* @method computeTimeSegments
*
*/
TimeUtilities.prototype.computeTimeSegments = function (startTime, tSegs) {
  console.log('compute time seg UTILITY')
  console.log(startTime)
  console.log(tSegs)
  //
  //
  return timeConversion
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

export default TimeUtilities
