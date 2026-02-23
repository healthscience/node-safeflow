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
import { EventEmitter } from 'events'
import moment from 'moment'

class TimeComponent extends EventEmitter {
  constructor() {
    super()
    this.liveTimeUtil = new TimeUtilities()
    this.liveTimeSystem = new TimeSystem()
    this.time = {} // holds all time info. per cnrl module???
    this.livedate = 0
    this.timeseg = {}
    this.resolution = null
    this.liveTime = {}
    this.timerange = []
    this.lastactiveStartTime = 0
    this.history = []
    this.sourceTime = []
  }

  /**
  *  convert UI status to entity master clock
  * @method setMasterClock
  *
  */
  setMasterClock(startTime) {
    this.livedate = startTime
    return true
  }

  /**
  *  set the live date active in the UI
  * @method setStartPeriod
  *
  */
  setStartPeriod(startDate) {
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
  * @method setRealtime
  *
  */
  setRealtime(realtime) {
    this.livedate.realtime = realtime
  }

  /**
  *  set the last time from UI
  * @method setLastTimeperiod
  *
  */
  setLastTimeperiod(laststarttime) {
    this.livedate.laststartperiod = laststarttime
  }

  /**
  *  keep list of timePeriods that data has been asked for
  * @method setTimeList
  *
  */
  setTimeList(liveDate) {
    this.history.push(liveDate.startperiod)
  }

  /**
  * keep list of timePeriods that data has been asked for
  * @method setSourceTime
  *
  */
  setSourceTime(sourcetime) {
    this.sourceTime.push(sourcetime)
  }
}

export default TimeComponent
