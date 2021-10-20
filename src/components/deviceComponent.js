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
import moment from 'moment'

var DeviceComponent = function (setIN) {
  events.EventEmitter.call(this)
  this.liveDeviceSystem = new DeviceSystem(setIN)
  this.apiData = {}
  this.alldevices = []
  this.devices = []
  this.activedevice = ''
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
DeviceComponent.prototype.setDevice = async function (apiD) {
  console.log('device setup first')
  console.log(apiD)
  this.apiData = apiD
  let deviceDetail = await this.liveDeviceSystem.storedDevices(this.apiData)
  this.alldevices = deviceDetail
  this.devices = deviceDetail
  this.activedevice = this.devices[0]
}

/**
*  update the device list per peer input
* @method updateDevice
*
*/
DeviceComponent.prototype.updateDevice = function (devices) {
  console.log('devices update')
  console.log(devices)
  let updateDevices = []
  for (let dev of this.alldevices) {
    // match and keep those on new list
    if (dev.device_mac === devices[0]) {
      updateDevices.push(dev)
    }
  }
  this.devices = updateDevices
  this.activedevice = devices[0]
}

export default DeviceComponent
