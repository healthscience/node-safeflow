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
const util = require('util')
const events = require('events')
const moment = require('moment')

var DeviceComponent = function (setIN) {
  events.EventEmitter.call(this)
  this.liveDeviceSystem = new DeviceSystem(setIN)
  this.devices = []
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(DeviceComponent, events.EventEmitter)

/**
*  set the datatype asked for
* @method setDevicesLive
*
*/
DeviceComponent.prototype.setDevice = async function (device) {
  let deviceDetail = await this.liveDeviceSystem.storedDevices(device)
  this.devices.push(deviceDetail)
}

export default DeviceComponent
