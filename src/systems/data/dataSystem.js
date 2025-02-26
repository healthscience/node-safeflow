'use strict'
/**
*  DataSystem
*
*
* @class DataSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import RestAPI from './dataprotocols/rest/index.js'
import SQLiteAPI from './dataprotocols/sqlite/index.js'
import JSONfileAPI from './dataprotocols/json/index.js'
import CSVfileAPI from './dataprotocols/csv/index.js'
import LiveSimulatedDataSystem from './simulateddataSystem.js'
import util from 'util'
import events from 'events'

var DataSystem = function (setIN) {
  events.EventEmitter.call(this)
  this.liveRestStorage = new RestAPI(setIN)
  this.liveSQLiteStorage = new SQLiteAPI(setIN)
  this.liveJSONStorage = new JSONfileAPI(setIN)
  this.liveCSVStorage = new CSVfileAPI(setIN)
  this.devicePairs = []
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(DataSystem, events.EventEmitter)

/**
*  mapping datatypes to  API source  // need function to call library to get list of active data contracts contacts??? 
* @method datatypeQueryMapping
*
*/
DataSystem.prototype.datatypeQueryMapping = async function (type, hash, sourceInfo, device, datatype, time, contract) {
  let rawHolder = []
  if (type === 'SAFE') {
    // no api plug in yet
  } else if (type === 'REST') {
    // pass on to either safe API builder, REST API builder or IPSF builder etc.
    rawHolder = await this.liveRestStorage.RESTbuilder(api, hash).catch(e => console.log('Error: ', e.message))
  } else if (type === 'SQLITE') {
    // pass on to either safe API builder, REST API builder or IPSF builder etc.
    rawHolder = await this.liveSQLiteStorage.SQLitebuilderPromise(sourceInfo, device).catch(e => console.log('Error: ', e.message))
  } else if (type === 'JSON') {
    // pass on to either safe API builder, REST API builder or IPSF builder etc.
    rawHolder = await this.liveJSONStorage.jsonFilebuilder(sourceInfo, device).catch(e => console.log('Error: ', e.message))
  } else if (type === 'COMPUTE') {
    // console.log('yes compute')
    // console.log(sourceInfo)
    // temp two different structures comign in blind and nxp need to correct
    let pathFile = sourceInfo.data
    let dataPath = ''
    if (sourceInfo.data.path !== undefined) {
      dataPath = sourceInfo.data.path
    } else {
      dataPath = 'json'
    }
    console.log(dataPath)
    // temp before smart rest extractor is built
    if (dataPath === '/rest/') {
      rawHolder = await this.liveRestStorage.COMPUTEbuilder(sourceInfo.data, device, time).catch(e => console.log('Error: ', e.message))
    } else if (dataPath === 'csv') {
      // source csv e.g. large file query
      console.log('compute csv builder')
      rawHolder =  await this.liveCSVStorage.readCSVfileStream(pathFile, sourceInfo.data, device, time).catch(e => console.log('Error: ', e.message)) // this.liveCSVStorage.CSVbuilderPromise(sourceInfo, device, time) // .catch(e => console.log('Error: ', e.message))
    } else if (dataPath === 'sqlite') { 
      rawHolder = await this.liveSQLiteStorage.SQLitebuilderPromise(sourceInfo.data, device, time)
    } else if (dataPath === 'json') {
      // pass on to either safe API builder, REST API builder or IPSF builder etc.
      rawHolder = await this.liveJSONStorage.jsonFilebuilder(sourceInfo, device, time).catch(e => console.log('Error: ', e.message))
    }
  }
  return rawHolder
}

/**
*  return array of active devices
* @method getLiveDevices
*
*/
DataSystem.prototype.saveSystem = async function (api, data) {
  await this.liveRestStorage.saveResults(api, data)
  return true
}

/**
*  return array of active devices
* @method getLiveDevices
*
*/
DataSystem.prototype.getLiveDevices = function (devicesIN) {
  let deviceList = []
  for (let device of devicesIN) {
    if (device.active === true) {
      deviceList.push(device.device_mac)
    }
  }
  return deviceList
}

/**
* context Device Pairing
* @method deviceUtility
*
*/
DataSystem.prototype.deviceUtility = function (device) {
  // loop over device to find mac matchtes
  let localthis = this
  let deviceMatchpairs = []
  let deviceVs = Object.keys(this.devicePairs)
  for (let actDev of deviceVs) {
    let vDevicelist = localthis.devicePairs[actDev]
    for (let dInv of vDevicelist) {
      if (dInv.device_mac === device) {
        deviceMatchpairs.push(localthis.devicePairs[actDev])
      }
    }
  }
  let deviceMacslist = []
  for (let devOb of deviceMatchpairs[0]) {
    deviceMacslist.push(devOb.device_mac)
  }
  return deviceMacslist
}

export default DataSystem
