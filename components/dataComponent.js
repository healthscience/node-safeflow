'use strict'
/**
*  DataComponent
*
*
* @class DataComponent
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import DataSystem from '../systems/data/dataSystem.js'
import TidyDataSystem from '../systems/data/tidydataSystem.js'
import FilterDataSystem from '../systems/data/filterdataSystem.js'
import CategoryDataSystem from '../systems/data/categorydataSystem.js'
const util = require('util')
const events = require('events')
const moment = require('moment')

var DataComponent = function (setIN) {
  events.EventEmitter.call(this)
  this.liveTidyData = new TidyDataSystem(setIN)
  this.liveFilterData = new FilterDataSystem(setIN)
  this.liveCategoryData = new CategoryDataSystem(setIN)
  this.liveDataSystem = new DataSystem(setIN)
  this.liveData = []
  this.tidyData = {}
  this.categoryData = {}
  this.dataRaw = {}
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(DataComponent, events.EventEmitter)

/**
*  set the datatype asked for
* @method setDevicesLive
*
*/
DataComponent.prototype.setDevicesLive = async function () {
  this.deviceList = this.liveDataSystem.getLiveDevices(this.did.devices)
}

/**
*  source data from device sensor
* @method RawData
*
*/
DataComponent.prototype.sourceData = async function (source, contract, apiINFO, hash, device, datatype, time) {
  await this.DataControlFlow(source, contract, apiINFO, device, datatype, time)
  return true
}

/**
*
* @method DataControlFlow
*
*/
DataComponent.prototype.DataControlFlow = async function (source, contract, apiINFO, device, datatype, time) {
  let dataRback = await this.liveDataSystem.datatypeQueryMapping('COMPUTE', apiINFO, '#####', device, time)
  console.log('data back from source')
  console.log(dataRback)
  this.dataRaw[time] = dataRback
  // is there a categories filter to apply?
  this.CategoriseData(apiINFO, device, datatype, time, dataRback)
  // is there any data tidying required
  this.TidyData(source, contract, apiINFO, device, datatype, time)
  this.FilterDownDT(source, contract, apiINFO, device, datatype, time)
  return true
}

/**
*
* @method CategoriseData
*
*/
DataComponent.prototype.CategoriseData = function (apiINFO, device, datatype, time) {
  let catDataG = {}
  // console.log(systemBundle)
  catDataG = this.liveCategoryData.categorySorter(apiINFO, device, datatype, time, this.dataRaw[time])
  this.categoryData[time] = catDataG
}

/**
*
* @method TidyData
*
*/
DataComponent.prototype.TidyData = function (source, contract, apiInfo, device, datatype, time) {
  let tidyDataG = {}
  tidyDataG = this.liveTidyData.tidyRawData(source, contract, apiInfo, device, datatype, time, this.categoryData[time])
  this.tidyData[time] = tidyDataG
  // set liveData based on/if category data asked for
  this.assessDataStatus(time)
  return true
}

/**
*
* @method FilterDownDT
*
*/
DataComponent.prototype.FilterDownDT = function (source, contract, api, device, datatype, time) {
  // console.log('filteDown')
  let tidyDataG = {}
  // console.log(systemBundle)
  if (this.liveData.primary !== 'prime') {
    tidyDataG = this.liveFilterData.dtFilterController(source, contract, api, device, datatype, time, this.liveData[time])
    this.liveData[time] = tidyDataG
  }
  return true
}

/**
*
* @method assessDataStatus
*
*/
DataComponent.prototype.assessDataStatus = function (time) {
  if (this.categoryData[time].length > 0) {
    this.liveData[time] = this.categoryData[time]
  } else {
    this.liveData[time] = this.tidyData[time]
  }
}

/**
*
* @method directResults
*
*/
DataComponent.prototype.directResults = async function (type, api, sourceHash) {
  let resultData = await this.liveDataSystem.datatypeQueryMapping('REST', api, sourceHash)
  this.liveData = resultData
}

/**
*
* @method directSaveResults
*
*/
DataComponent.prototype.directSaveResults = async function (type, api, data) {
  let resultData = await this.liveDataSystem.saveSystem(api, data)
  return true
}

export default DataComponent
