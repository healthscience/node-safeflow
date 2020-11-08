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
import util from 'util'
import events from 'events'

var DatadeviceSystem = function (setIN) {
  events.EventEmitter.call(this)
  this.liveTestStorage = new TestStorageAPI(setIN)
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
  let currentDevices = []
  let result = await this.liveTestStorage.deviceRESTbuilder(dapi)
  if (dapi.apipath === '/computedata/') {
    currentDevices = this.sortLiveDevices(result)
  } else {
    currentDevices = result
  }
  console.log('devices per api')
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

export default DatadeviceSystem
