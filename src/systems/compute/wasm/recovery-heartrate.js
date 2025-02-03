'use strict'
/**
*  RecoveryHeartrate
*
*
* @class RecoveryHeartrate
* @package    compute module
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import TimeUtilities from '../../time/timeUtility.js'
import TestStorageAPI from '../../data/dataprotocols/rest/index.js'
import util from 'util'
import events from 'events'

var RecoveryHeartrate = function (setIN) {
  events.EventEmitter.call(this)
  this.liveTimeUtil = new TimeUtilities()
  this.liveTestStorage = new TestStorageAPI(setIN)
  this.data = []
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(RecoveryHeartrate, events.EventEmitter)

/**
* computation gateway
* @method recoveryHeartSystem
*
*/
RecoveryHeartrate.prototype.recoveryHeartSystem = function () {
  // match computation to approprate verified compute
}

/**
* prepare recovery heartrate analysis
* @method prepareRecoveryCompute
*
*/
RecoveryHeartrate.prototype.prepareRecoveryCompute = async function (range, device) {
  // get current observation data from its entityData
  let liveObservation = this.emit('liveobserve', true)
  // await this.assessPostHRaverage(range, device)
  return true
}

/**
* Assess the average post the slider for 2mins 5mins 10mins.  Feedback on steps
* @method assessPostHRaverage
*
*/
RecoveryHeartrate.prototype.assessPostHRaverage = async function (range, device) {
  let recChunk = []
  let elements = Object.keys(this.data)
  let firstTimeElement = elements[0]
  let deviceLive = Object.keys(this.data[firstTimeElement])
  let batchData = this.data[firstTimeElement][deviceLive[0]]
  // extract the portion of data chunks for recovery analysisStart
  let twoMinutes = 120
  let fiveMinutes = 300
  let tenMinutes = 600
  for (let extract of batchData[0]) {
    // console.log('loop batch')
    // console.log(extract.timestamp)
    if (extract.timestamp > range.startTime && extract.timestamp < range.endTime) {
      recChunk.push(extract)
    }
    // extract 2 mims post
    console.log(twoMinutes)
    // extract 5 mims post
    console.log(fiveMinutes)
    // extract 10 mims post
    console.log(tenMinutes)
  }
  /* let numberEntries = dataArray.length
  // accumulate sum the daily data
  let sum = dataArray.reduce(add, 0)
  function add (a, b) {
    return a + b
  } */
  // let averageResult = sum / numberEntries
  // let roundAverage = Math.round(averageResult)
  // mock results
  let reportDatasave = {}
  reportDatasave.learnSummarySeen = true
  reportDatasave.totalsteps = 3838
  reportDatasave.ridentity = 10987654321
  reportDatasave.heartmax = 153
  reportDatasave.heartmin = 52
  reportDatasave.recovertime = 3.45
  reportDatasave.similarcount = 325
  reportDatasave.recoverchange = '+.02'
  // where to save
  await this.liveTestStorage.saveHRrecoveryData('recovery-heartrate', device, reportDatasave)
  return true
}

export default RecoveryHeartrate
