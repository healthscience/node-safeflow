'use strict'
/**
*  averageSystem
*
*
* @class averageSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import TimeUtilities from '../time/timeUtility.js'
import TestStorageAPI from '../data/dataprotocols/teststorage/testStorage.js'
import AvgStatisticsSystem from './wasm/average-statistics.js'
import DataSystem from '../data/dataSystem.js'
import TidyDataSystem from '../data/tidydataSystem.js'
import FilterDataSystem from '../data/filterdataSystem.js'
import CategoryDataSystem from '../data/categorydataSystem.js'

const util = require('util')
const events = require('events')
const moment = require('moment')

var AverageSystem = function (setIN) {
  events.EventEmitter.call(this)
  this.liveTimeUtil = new TimeUtilities()
  this.liveTestStorage = new TestStorageAPI(setIN)
  this.avgliveStatistics = new AvgStatisticsSystem(setIN)
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
util.inherits(AverageSystem, events.EventEmitter)

/**
* verify the computation file
* @method verifyComputeWASM
*
*/
AverageSystem.prototype.verifyComputeWASM = function (wasmFile) {
  // check the hash verifes to hash aggred in CNRL contract
}

/**
*  average compute system assess inputs and control compute
* @method averageSystem
*
*/
AverageSystem.prototype.averageSystemStart = async function (systemBundle) {
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
AverageSystem.prototype.computeControlFlow = async function (contract, device, datatype, time) {
  let cFlowStatus = {}
  cFlowStatus = await this.updateComputeControl(contract, device, datatype, time)
  return cFlowStatus
}

/**
* @method updateComputeControl
*
*/
AverageSystem.prototype.updateComputeControl = async function (contract, device, datatype, time) {
  let computeStatus = {}
  let dtCompute = contract.cnrl
  computeStatus = await this.prepareAvgCompute(contract, device, datatype, time)
  return computeStatus
}

/**
*  prepare dates for average compute
* @method prepareAvgCompute
*
*/
AverageSystem.prototype.prepareAvgCompute = async function (contract, device, datatype, time) {
  // let dataBatch = await this.liveTestStorage.getComputeData(queryTime, device)
  let formHolder = {}
  formHolder[queryTime] = {}
  formHolder[queryTime][device] = {}
  formHolder[queryTime][device][datatype.cnrl] = {}
  formHolder[queryTime][device][datatype.cnrl][ts] = dataBatch
  if (dataBatch.length > 0) {
    systemBundle.computeflow = true
    let singleArray = this.liveCategoryData.categorySorter(systemBundle, formHolder[queryTime], queryTime)
    let tidyData = this.liveTidyData.tidyRawData(systemBundle, singleArray, queryTime)
    let filterDTs = this.liveFilterData.dtFilterController(systemBundle, tidyData, queryTime)
    // let flatArray = this.liveDataSystem.flatFilter()
    let saveReady = this.avgliveStatistics.averageStatistics(filterDTs)
    let batchSize = dataBatch.length
    // prepare JSON object for POST
    let saveJSON = {}
    saveJSON.publickey = ''
    saveJSON.timestamp = queryTime
    saveJSON.compref = systemBundle.scienceAsked.prime.cnrl
    saveJSON.datatype = systemBundle.apiInfo[device].datatypes[0].cnrl
    saveJSON.value = saveReady.average
    saveJSON.device_mac = device
    saveJSON.clean = saveReady.count
    saveJSON.tidy = batchSize - saveReady.count
    saveJSON.size = batchSize
    saveJSON.timeseg = ts
    saveJSON.category = systemBundle.categories[0].cnrl
    // this.liveTestStorage.saveaverageData(saveJSON)
  }
  return true
}

export default AverageSystem
