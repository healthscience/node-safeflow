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
import Moment from 'moment'
import pkg from 'moment-range'
const { extendMoment } = pkg
const moment = extendMoment(Moment)
import { EventEmitter } from 'events'

class TimeSystem extends EventEmitter {
  constructor() {
    super()
  }

  /**
  *  what is the real time now
  * @method setRealtime
  *
  */
  setRealtime() {
    let realtimenow = moment().valueOf() // .startOf('day').valueOf()
    return realtimenow
  }

  /**
  *  assess what range of data day / range are required?
  * @method sourceTimeRange
  *
  */
  sourceTimeRange(startTime, nowTime, tSegment) {
    let timeSourceRange = this.momentRangeBuild(startTime, nowTime, tSegment)
    let rangeFormat = this.formatTimeSafeFlow(timeSourceRange)
    return rangeFormat
  }

  /**
  * use moment range to build time array
  * @method momentRangeBuild
  *
  */
  momentRangeBuild(startTime, endTime, segment) {
    // convert segment to moment text input
    let segText = ''
    if (segment === 86400000) {
      segText = 'days'
    }
    let startMoment = moment(parseInt(startTime)).format()
    let endMoment = moment(endTime).format()
    let rangeBuild = moment.range(startMoment, endMoment)
    let sourceTimes = Array.from(rangeBuild.by(segText))
    return sourceTimes
  }

  /**
  *  select data for UI
  * @method formatTimeSafeFlow
  *
  */
  formatTimeSafeFlow(liveDates) {
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
  timeOrderLast(dataAIN) {
    let lastTime = ''
    // order array by time
    if (dataAIN !== undefined) {
      lastTime = dataAIN.timestamp
    } else {
      lastTime = 0
    }
    return lastTime
  }
}

export default TimeSystem
