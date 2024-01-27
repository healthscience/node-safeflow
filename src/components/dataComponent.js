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
import hashObject from 'object-hash'

var DataComponent = function (setIN) {
  console.log('SF--DComp=================')
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
*
*
*/
DataComponent.prototype.DataControlFlow = async function (source, dataAPI, contract, hash, dataPrint) {
  console.log('SF--DC--dataComp')
  let dataRback = await this.liveDataSystem.datatypeQueryMapping('COMPUTE', '#####', source, dataPrint.triplet.device, dataPrint.triplet.datatype, dataPrint.triplet.timeout, contract)
  console.log(dataRback.length)
  // form unique dataPrint for dataUUID
  let dataID = {}
  dataID.device = dataPrint.triplet.device
  dataID.datatype = dataPrint.triplet.datatype
  dataID.time = dataPrint.triplet.timeout
  let datauuid = hashObject(dataID)
  this.dataRaw[datauuid] = dataRback
  dataRback = []
  let catFlag = false
  // is there data?
  if (this.dataRaw[datauuid].length > 0) {
    console.log('data raw yes')
    // is there a categories filter to apply?
    if (contract.value.info.settings.category[0] !== 'none') {
      this.CategoriseData(source, dataAPI.category, contract, datauuid, dataPrint.triplet.device, dataPrint.triplet.datatype, dataPrint.triplet.timeout)
      catFlag = true
    } else {
      catFlag = false
      this.categoryData[datauuid] = this.dataRaw[datauuid]
    }
    // is there any data tidying required
    if (source.tidydt.status !== 'none') {
      this.TidyDataPrep(source, contract, datauuid, dataPrint.triplet.device, dataPrint.triplet.datatype, dataPrint.triplet.timeout)
    } else {
      if (catFlag === true) {
        // was category data but no tidy
        this.tidyData[datauuid] = this.categoryData[datauuid]
      } else {
        // no category or tidy data
        this.tidyData[datauuid] = this.dataRaw[datauuid]
      }
    }
    let dataMatch = this.FilterDownDT(source, contract, datauuid, dataPrint)
  } else {
    console.log('no data')
    this.dataRaw[datauuid] = []
    this.liveData[datauuid] = []
  }
  return true
}

/**
*
* @method CategoriseData
*
*/
DataComponent.prototype.CategoriseData = function (apiINFO, catInfo, contract, datauuid, device, datatype, time) {
  let catDataG = {}
  catDataG = this.liveCategoryData.categorySorter(apiINFO, catInfo, contract, device, datatype, time, this.dataRaw[datauuid])
  this.categoryData[datauuid] = catDataG
  catDataG = {}
}

/**
*  apply rules in api design
* @method TidyDataPrep
*
*/
DataComponent.prototype.TidyDataPrep = function (source, contract, datauuid, device, datatype, time) {
  let tidyDataG = {}
  let tidyKeys = Object.keys(source.tidydt)
  if (tidyKeys.length > 0) {
    tidyDataG = this.liveTidyData.tidyRawData(source, contract, device, datatype, time, this.categoryData[datauuid])
    this.tidyData[datauuid] = tidyDataG
  } else {
    this.tidyData[datauuid] = this.categoryData[datauuid]
  }
  tidyDataG = {}
  return true
}

/**
*
* @method FilterDownDT
*
*/
DataComponent.prototype.FilterDownDT = function (source, contract, dataUUID, dataPrint) {
  let filterDataG = {}
  filterDataG = this.liveFilterData.dtFilterController(source, contract, dataPrint.triplet.device, dataPrint.triplet.datatype, dataPrint.triplet.timeout, this.tidyData[dataUUID])
  this.liveData[dataUUID] = filterDataG
  filterDataG = {}
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
  resultData = []
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
