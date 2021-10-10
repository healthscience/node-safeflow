'use strict'
/**
*  DatadeviceSystem
*
*
* @class DatadeviceSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/

import TestStorageAPI from './dataprotocols/teststorage/testStorage.js'
import SQLiteAPI from './dataprotocols/sqlite/index.js'
import util from 'util'
import events from 'events'

var DatadeviceSystem = function (setIN) {
  events.EventEmitter.call(this)
  this.liveTestStorage = new TestStorageAPI(setIN)
  this.liveSQLiteStorage = new SQLiteAPI()
  this.devicePairs = []
  this.dataRaw = []
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(DatadeviceSystem, events.EventEmitter)

/**
*  return array of active devices
* @method getLiveDevices
*
*/
DatadeviceSystem.prototype.getLiveDevices = function (devicesIN) {
  let deviceList = []
  for (let device of devicesIN) {
    if (device.active === true) {
      deviceList.push(device.device_mac)
    }
  }
  return deviceList
}

/**
* get the inital context for data required
* @method storedDevices
*
*/
DatadeviceSystem.prototype.storedDevices = async function (dapi) {
  // MAP api to REST library functions for the API
  console.log('store devices')
  console.log(dapi)
  const localthis = this
  let currentDevices = []
  let result = []
  if (dapi.api === 'sqlite') {
    // sqlite
    if (dapi.apipath === '/sqliteGadgetbridge/') {
      console.log('sqlite Device path')
      // call back function
      function dataSQL (err, rows) {
        let data = []
        if (err) {
          throw err
        }
        rows.forEach((row) => {
          data.push(row)
        })
        // console.log('devices/////////////')
        // console.log(data)
        // localthis.convertStandardKeyNames(data)
        return data
      }
      let beforeConvertKeyNames = await this.liveSQLiteStorage.SQLiteDeviceBuilder(dataSQL)
      let promiseDevice = await this.liveSQLiteStorage.SQLiteDevicePromise()
      currentDevices = this.convertStandardKeyNames(promiseDevice)
    }
  } else {
    result = await this.liveTestStorage.deviceRESTbuilder(dapi)
    if (dapi.apipath === '/computedata/') {
      currentDevices = this.sortLiveDevices(result)
    } else {
      currentDevices = result
    }
  }
  console.log('curent devices')
  console.log(currentDevices)
  return currentDevices
}

/**
* get devices API call
* @method getDevicesAPIcall
*
*/
DatadeviceSystem.prototype.sortLiveDevices = function (result) {
  let devicePairs = []
  // filter over to pair same types of devices and put in newest order and add active to newest of all devices or selected by user as starting device to display
  // extract the device macs per devicename
  let deviceModels = []
  for (let devM of result) {
    deviceModels.push(devM.device_model)
  }
  let unique = deviceModels.filter((v, i, a) => a.indexOf(v) === i)
  // form array of list mac address from each model
  let currentDevices = []
  // let paired = {}
  for (let mod of unique) {
    devicePairs[mod] = []
    let devww = result.filter(devv => devv.device_model === mod)
    // look at time start and keep youngest start date
    let mapd = devww.map(o => parseInt(o.device_validfrom))
    let maxValueOfY = Math.max.apply(this, mapd)
    // match this time to device mac
    for (let perD of devww) {
      // keep record of devices of same type
      devicePairs[mod].push(perD)
      if (parseInt(perD.device_validfrom) === maxValueOfY) {
        let deviceMatch = perD
        currentDevices.push(deviceMatch)
      }
    }
  }
  return currentDevices
}

/**
* convert sql naming to device stanards
* @method convertStandardKeyNames
*
*/
DatadeviceSystem.prototype.convertStandardKeyNames = function (devicesRaw) {
  let devices = []
  for (let device of devicesRaw) {
    let renameKeys = {}
    renameKeys.id = device.IDENTIFIER
    renameKeys.device_name = device.NAME
    renameKeys.device_manufacturer = device.MANUFACTURER
    renameKeys.device_mac = device._id.toString()
    renameKeys.device_type = device.TYPE
    renameKeys.device_model = device.MODEL
    devices.push(renameKeys)
  }
  return devices
}

export default DatadeviceSystem
