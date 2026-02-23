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
import pkg from 'moment-range'
const { extendMoment } = pkg
import Moment from 'moment'
const moment = extendMoment(Moment)
import { EventEmitter } from 'events'

class TimeUtilities extends EventEmitter {
  constructor() {
    super()
    this.liveStarttime = ''
    this.liveLasttime = ''
    this.realtime = ''
  }

  /**
  * time segmentation for compute
  * @method computeTimeSegments
  *
  */
  computeTimeSegments(startTime, tSegs) {
    // implementation here
    return []
  }

  /**
  * Calendar Utilty
  * @method calendarUtility
  *
  */
  calendarUtility() {
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
        calendarUtil.push({ dayCount, longDateformat })
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
  timeDayArrayBuilder(liveTime, lastTime) {
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
      // implementation continues...
    }
    return timeArray
  }
}

export default TimeUtilities
