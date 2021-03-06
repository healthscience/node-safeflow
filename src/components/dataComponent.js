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
import util from 'util'
import events from 'events'
import moment from 'moment'
import hashObject from 'object-hash'

var DataComponent = function (setIN) {
  events.EventEmitter.call(this)
  this.liveTidyData = new TidyDataSystem(setIN)
  this.liveFilterData = new FilterDataSystem(setIN)
  this.liveCategoryData = new CategoryDataSystem(setIN)
  this.liveDataSystem = new DataSystem(setIN)
  this.liveData = {}
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
DataComponent.prototype.sourceData = async function (source, dataAPI, contract, hash, device, datatype, time) {
  await this.DataControlFlow(source, dataAPI, contract, hash, device, datatype, time)
  return true
}

/**
*
* @method DataControlFlow
*
*/
DataComponent.prototype.DataControlFlow = async function (source, dataAPI, contract, hash, device, datatype, time) {
  let dataRback = await this.liveDataSystem.datatypeQueryMapping('COMPUTE', '#####', source, device, datatype, time)
  console.log('databackRAW------------')
  console.log(dataRback.length)
  this.dataRaw[time] = dataRback

  let catFlag = false
  // is there data?
  if (dataRback.length > 0) {
    // is there a categories filter to apply?
    if (contract.value.info.settings.category !== 'none') {
      this.CategoriseData(source, dataAPI.category, contract, device, datatype, time)
      catFlag = true
    } else {
      catFlag = false
      this.categoryData[time] = dataRback
    }
    // is there any data tidying required
    if (source.tidydt.status !== 'none') {
      this.TidyData(source, contract, device, datatype, time)
    } else {
      if (catFlag === true) {
        // was category data but no tidy
        this.tidyData[time] = this.categoryData[time]
      } else {
        // no category or tidy data
        this.tidyData[time] = dataRback
      }
    }
    let dataMatch = this.FilterDownDT(source, contract, device, datatype, time)
  }
  return true
}

/**
*
* @method CategoriseData
*
*/
DataComponent.prototype.CategoriseData = function (apiINFO, catInfo, contract, device, datatype, time) {
  let catDataG = {}
  catDataG = this.liveCategoryData.categorySorter(apiINFO, catInfo, contract, device, datatype, time, this.dataRaw[time])
  this.categoryData[time] = catDataG
}

/**
*
* @method TidyData
*
*/
DataComponent.prototype.TidyData = function (source, contract, device, datatype, time) {
  let tidyDataG = {}
  let tidyKeys = Object.keys(source.tidydt)
  if (tidyKeys.length > 0) {
    tidyDataG = this.liveTidyData.tidyRawData(source, contract, device, datatype, time, this.categoryData[time])
    this.tidyData[time] = tidyDataG
  } else {
    this.tidyData[time] = this.categoryData[time]
  }
  return true
}

/**
*
* @method FilterDownDT
*
*/
DataComponent.prototype.FilterDownDT = function (source, contract, device, datatype, time) {
  let tidyDataG = {}
  tidyDataG = this.liveFilterData.dtFilterController(source, contract, device, datatype, time, this.tidyData[time])
  // hash the context device, datatype and time
  let dataID = {}
  dataID.device = device
  dataID.datatype = datatype
  dataID.time = time
  let datauuid = hashObject(dataID)
  this.liveData[datauuid] = tidyDataG
  return true
}

/**
*
* @method setFilterResults
*
*/
DataComponent.prototype.setFilterResults = function (duuid, resultData) {
  this.liveData[duuid] = resultData
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
