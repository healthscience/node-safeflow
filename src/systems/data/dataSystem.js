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
// import SAFEnetwork from './dataprotocols/'
import TestStorageAPI from './dataprotocols/teststorage/testStorage.js'
import LiveSimulatedDataSystem from './simulateddataSystem.js'
import FilterDataSystem from './filterdataSystem.js'

import util from 'util'
import events from 'events'
import moment from 'moment'

var DataSystem = function (setIN) {
  events.EventEmitter.call(this)
  // this.liveSAFEnetwork = new SAFEnetwork(setSAFE)
  this.liveTestStorage = new TestStorageAPI(setIN)
  this.liveFilterData = new FilterDataSystem(setIN)
  this.devicePairs = []
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(DataSystem, events.EventEmitter)

/**
*  mapping datatypes to  API source
* @method datatypeQueryMapping
*
*/
DataSystem.prototype.datatypeQueryMapping = async function (type, hash, sourceInfo, device, datatype, time) {
  let rawHolder = []
  if (type === 'SAFE') {
  } else if (type === 'REST') {
    // pass on to either safe API builder, REST API builder or IPSF builder etc.
    rawHolder = await this.liveTestStorage.RESTbuilder(api, hash).catch(e => console.log('Error: ', e.message))
  } else if (type === 'COMPUTE') {
    let extractURL = {}
    extractURL.namespace = sourceInfo.sourceapiquery.namespace
    extractURL.path = sourceInfo.sourceapiquery.apipath
    // temp before smart rest extractor is built
    if (extractURL.path === '/computedata/') {
      rawHolder = await this.liveTestStorage.COMPUTEbuilder(extractURL, device, time).catch(e => console.log('Error: ', e.message))
    } else if (extractURL.path === '/luftdatenGet/') {
      rawHolder = await this.liveTestStorage.COMPUTEbuilderLuft(extractURL, device, time).catch(e => console.log('Error: ', e.message))
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
  await this.liveTestStorage.saveResults(api, data)
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
