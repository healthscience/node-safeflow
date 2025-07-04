'use strict'
/**
*  DatadeviceSystem
*
*
* @class DatadeviceSystem
* @package    safeFlow
* @copyright  Copyright (c) 2022 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/

import TestStorageAPI from './dataprotocols/rest/index.js'
import SQLiteAPI from './dataprotocols/sqlite/index.js'
import util from 'util'
import events from 'events'
import crypto from 'crypto'

var DatadeviceSystem = function (setIN) {
  events.EventEmitter.call(this)
  this.liveRESTStorage = new TestStorageAPI(setIN)
  this.liveSQLiteStorage = new SQLiteAPI(setIN)
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
* check if device info provide or requires query?
* @method assessDevices
*
*/
DatadeviceSystem.prototype.assessDevices = async function (datapackModule) {
  // check if blind or nxp input
  let dapi = {}
  if (datapackModule?.style !== 'packaging') {
    dapi = datapackModule.info.packaging.value.concept
  } else {
    dapi = datapackModule.info.value.concept
  }
  let deviceDetail = {}
  if (dapi.devicequery !== undefined && dapi.devicequery.length > 0) {
    deviceDetail = await this.storedDevices(dapi)
  } else {
    // manual provide device info.
    deviceDetail = [datapackModule.info.value.concept.device]
  }
  return deviceDetail
}

/**
* get the inital device(s) for data required
* @method storedDevices
*
*/
DatadeviceSystem.prototype.storedDevices = async function (dapi) {
  // MAP devices to reference contract devices info or use query path to retrieve
  const localthis = this
  let currentDevices = []
  let result = []
  if (dapi.path === 'sqlite') {
    let promiseDevice = await this.liveSQLiteStorage.SQLiteDevicePromise(dapi.devicequery, dapi.filename)
    currentDevices = this.convertStandardKeyNames(promiseDevice)
  } else if (dapi.path === 'json') {
    if (dapi.device?.query.length === 0) {
      currentDevices.push(dapi.device)
    } else {
      let tempMAC = crypto
      .createHash('sha256')
      .update(dapi.name, 'utf8')
      .digest('hex')
      let renameKeys = {}
      renameKeys.id = tempMAC
      renameKeys.device_name = 'sensor'
      renameKeys.device_manufacturer = 'unknown'
      renameKeys.device_mac = tempMAC
      renameKeys.device_type = 'hardware'
      renameKeys.device_model = 'version'
      currentDevices.push(renameKeys)
    }
  } else if (dapi.path === 'rest') {
      if (dapi.device?.query.length === 0) {
        currentDevices.push(dapi.device)
      } else {
        result = await this.liveRESTStorage.deviceRESTbuilder(dapi)
        if (dapi.apipath === '/computedata/') {
          currentDevices = this.sortLiveDevices(result)
        } else {
          currentDevices = result
        }
      }
  } else if (dapi.path === 'csv') {
    if (dapi.device?.query.length === 0) {
      currentDevices.push(dapi.device)
    } else {
    }
  } else {
    currentDevices = []
  }
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
