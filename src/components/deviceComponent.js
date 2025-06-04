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

  this.apiData = apiDeviceInfo.info.value.concept
  // assess if blind or nxp and device info provide are db query provided?
  let assessDevice = await this.liveDeviceSystem.assessDevices(apiDeviceInfo)
  this.alldevices = assessDevice
  this.devices = assessDevice
  this.activedevice = assessDevice[0]
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
