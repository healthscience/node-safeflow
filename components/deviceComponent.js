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
DeviceComponent.prototype.setDevice = async function (apiD) {
  this.apiData = apiD
  let deviceDetail = await this.liveDeviceSystem.storedDevices(this.apiData)
  this.devices = deviceDetail
}

export default DeviceComponent
