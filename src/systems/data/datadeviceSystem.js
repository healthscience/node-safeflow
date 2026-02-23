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
import { EventEmitter } from 'events'
import crypto from 'crypto'

class DatadeviceSystem extends EventEmitter {
  constructor(setIN) {
    super()
    this.liveRESTStorage = new TestStorageAPI(setIN)
    this.liveSQLiteStorage = new SQLiteAPI(setIN)
    this.devicePairs = []
    this.dataRaw = []
  }

  /**
  *  return array of active devices
  * @method getLiveDevices
  *
  */
  getLiveDevices(devicesIN) {
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
  async assessDevices(datapackModule) {
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
  async storedDevices(dapi) {
    // MAP devices to reference contract devices info or use query path to retrieve
    let currentDevices = []
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
    }
    return currentDevices
  }

  /**
  * convert standard key names
  * @method convertStandardKeyNames
  *
  */
  convertStandardKeyNames(data) {
    // implementation here
    return data
  }
}

export default DatadeviceSystem
