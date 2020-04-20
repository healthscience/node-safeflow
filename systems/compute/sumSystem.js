'use strict'
/**
*  sumSystem
*
*
* @class sumSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import TestStorageAPI from '../data/dataprotocols/teststorage/testStorage.js'
import StatisticsSystem from './wasm/sum-statistics.js'
import DataSystem from '../data/dataSystem.js'
import TidyDataSystem from '../data/tidydataSystem.js'
import FilterDataSystem from '../data/filterdataSystem.js'
import CategoryDataSystem from '../data/categorydataSystem.js'

const util = require('util')
const events = require('events')
const moment = require('moment')

var SumSystem = function (setIN) {
  events.EventEmitter.call(this)
  this.liveTestStorage = new TestStorageAPI(setIN)
  this.liveSumStatistics = new StatisticsSystem(setIN)
  this.liveDataSystem = new DataSystem(setIN)
  this.liveTidyData = new TidyDataSystem(setIN)
  this.liveFilterData = new FilterDataSystem(setIN)
  this.liveCategoryData = new CategoryDataSystem(setIN)
  this.lastComputeTime = {}
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(SumSystem, events.EventEmitter)

/**
* verify the computation file
* @method verifyComputeWASM
*
*/
SumSystem.prototype.verifyComputeWASM = function (wasmFile) {
  // check the hash verifes to hash aggred in CNRL contract
}

/**
*  average compute system assess inputs and control compute
* @method sumSystem
*
*/
SumSystem.prototype.sumSystemStart = async function (systemBundle) {
  let updateStatus = {}
  let devList = this.liveDataSystem.getLiveDevices(systemBundle.devices)
  systemBundle.devices = devList
  updateStatus = await this.computeControlFlow(systemBundle)
  return updateStatus
}

/**
* @method computeControlFlow
*
*/
SumSystem.prototype.computeControlFlow = async function (systemBundle) {
  let liveTimeConvert = moment(systemBundle.time.startperiod).valueOf()
  let liveTime = liveTimeConvert / 1000
  let cFlowStatus = {}
  let timeState = {}
  for (let dvc of systemBundle.devices) {
    // need to loop for datatype and time seg // datatype or source Datatypes that use to compute dt asked for?
    for (let dtl of systemBundle.apiInfo[dvc].apiquery) {
      // check status of compute?  uptodate, needs updating or first time compute?
      for (let ts of systemBundle.time.timeseg) {
        timeState = systemBundle.timeInfo.liveTime[liveTime][dvc][dtl.cnrl][ts]
      }
    }
  }
  // now loop over the source datatypes for this compute
  for (let dvc of systemBundle.devices) {
    // need to loop for datatype and time seg // datatype or source Datatypes that use to compute dt asked for?
    for (let dtl of systemBundle.apiInfo[dvc].sourceapiquery) {
      // check status of compute?  uptodate, needs updating or first time compute?
      for (let ts of systemBundle.time.timeseg) {
        // timeState = systemBundle.timeInfo[systemBundle.startperiod][dvc][dtl.cnrl][ts]
        cFlowStatus = await this.updateComputeControl(timeState, dvc, dtl, ts, systemBundle)
      }
    }
  }
  return cFlowStatus
}

/**
* @method updateComputeControl
*
*/
SumSystem.prototype.updateComputeControl = async function (timeBundle, dvc, dtl, ts, systemBundle) {
  let liveTime = systemBundle.timeInfo.livedate.startperiod
  let computeStatus = {}
  if (timeBundle.status === 'update-required' || timeBundle.status === 'on-going') {
    let dtCompute = systemBundle.apiInfo[dvc].datatypes[0].cnrl
    computeStatus = await this.prepareSumCompute(systemBundle.timeInfo.liveTime[liveTime][dvc][dtCompute][ts].computeTime, dvc, dtl, ts, systemBundle)
  } else {
    computeStatus = true
  }
  return computeStatus
}

/**
*  prepare dates for average compute
* @method prepareSumCompute
*
*/
SumSystem.prototype.prepareSumCompute = async function (computeTimes, device, datatype, ts, systemBundle) {
  // computeTimes = [1535846400000, 1535932800000, 1536019200000]
  // computeTimes = []
  // let lastItem = computeTimes.slice(-1)[0]
  // computeTimes.push(1535846400000)
  for (let qt of computeTimes) {
    let queryTime = qt / 1000
    // The datatype asked should be MAPPED to storage API via source Datatypes that make up e.g. average-bpm
    let dataBatch = await this.liveTestStorage.getComputeData(queryTime, device)
    // console.log(dataBatch)
    systemBundle.startperiod = queryTime
    let formHolder = {}
    formHolder[queryTime] = {}
    formHolder[queryTime][device] = {}
    formHolder[queryTime][device][datatype.cnrl] = {}
    formHolder[queryTime][device][datatype.cnrl][ts] = dataBatch
    // [systemBundle.startperiod][devI][dtItem.cnrl][ts]
    if (dataBatch.length > 0) {
      systemBundle.computeflow = true
      let singleArray = this.liveCategoryData.categorySorter(systemBundle, formHolder[queryTime], queryTime)
      let tidyData = this.liveTidyData.tidyRawData(systemBundle, singleArray, queryTime)
      let filterDTs = this.liveFilterData.dtFilterController(systemBundle, tidyData, queryTime)
      // let flatArray = this.liveDataSystem.flatFilter()
      // need to check for categories TODO
      let saveReady = this.liveSumStatistics.sumStatistics(filterDTs)
      let batchSize = dataBatch.length
      let saveJSON = {}
      saveJSON.publickey = ''
      saveJSON.timestamp = queryTime
      saveJSON.compref = systemBundle.scienceAsked.prime.cnrl
      saveJSON.datatype = systemBundle.apiInfo[device].datatypes[0].cnrl
      saveJSON.value = saveReady.sum
      saveJSON.device_mac = device
      saveJSON.clean = saveReady.count
      saveJSON.tidy = batchSize - saveReady.count
      saveJSON.size = batchSize
      saveJSON.timeseg = ts
      saveJSON.category = systemBundle.categories[0].cnrl
      this.liveTestStorage.savesumData(saveJSON)
    }
  }
  return true
}

export default SumSystem
