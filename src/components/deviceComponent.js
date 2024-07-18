'use strict'
/**
*  DeviceComponent
*
*
* @class DeviceComponent
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import DeviceSystem from '../systems/data/datadeviceSystem.js'
import util from 'util'
import events from 'events'

var DeviceComponent = function (setIN) {
  events.EventEmitter.call(this)
  this.liveDeviceSystem = new DeviceSystem(setIN)
  this.apiData = {}
  this.alldevices = []
  this.devices = []
  this.activedevice = ''
  this.deviceTable = ''
  this.deviceColID = ''
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(DeviceComponent, events.EventEmitter)

/**
*  set authorisation for datastore
* @method setAuthToken
*
*/
DeviceComponent.prototype.setAuthToken = async function (authDS) {
  console.log('auth datastore')
}

/**
*  set the datatype asked for
* @method setDevice
*
*/
DeviceComponent.prototype.setDevice = async function (apiDeviceInfo, computeInfo) {
  // is the data coming from blind or NXP?
  if (apiDeviceInfo.info.value.concept.device.device_name.length > 0) {
    this.apiData = apiDeviceInfo.info.value.concept
    let deviceDetail = apiDeviceInfo.info.value.concept.device // old if source api, go look up.  await this.liveDeviceSystem.storedDevices(this.apiData)
    this.alldevices = [apiDeviceInfo.info.value.concept.device]
    this.devices = [deviceDetail]
    this.activedevice = this.devices
  } else {
    // data table  device column
    this.deviceColID = computeInfo.info.settings.devices[0][apiDeviceInfo.info.value.concept.deviceColumnID]
    this.deviceTable = apiDeviceInfo.info.value.concept.sourcedevicecol.name
    this.apiData = apiDeviceInfo.info.value.concept
    this.apiData['deviceinfo'] = { table: this.deviceTable, column: this.deviceColID }
    let deviceDetail = computeInfo.info.settings.devices // old if source api, go look up.  await this.liveDeviceSystem.storedDevices(this.apiData)
    this.alldevices = computeInfo.info.settings.devices
    this.devices = deviceDetail
    this.activedevice = this.devices
  }
}

/**
*  update the device list per peer input
* @method updateDevice
*
*/
DeviceComponent.prototype.updateDevice = function (devices) {
  let updateDevices = []
  for (let dev of this.alldevices) {
    // match and keep those on new list
    if (dev.device_mac !== undefined) {
      // standardised device manual entry
      if (dev.device_mac === devices[0]) {
        updateDevices.push(dev)
        this.devices = updateDevices
        this.activedevice = devices
      }
    } else {
      // custom
      let devObj = devices // JSON.parse(devices)
      if (dev['IDENTIFIER'] === devObj['IDENTIFIER']) {
        // this.devices updateDevices
        this.activedevice = []
        dev.device_mac = dev.IDENTIFIER
        this.activedevice.push(dev)
        this.devices = this.activedevice
      }
    }
  }
  return true
}

export default DeviceComponent
