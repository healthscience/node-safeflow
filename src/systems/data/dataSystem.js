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
import RestAPI from './dataprotocols/rest/index.js'
import SQLiteAPI from './dataprotocols/sqlite/index.js'
import JSONfileAPI from './dataprotocols/json/index.js'
import CSVfileAPI from './dataprotocols/csv/index.js'
import { EventEmitter } from 'events'

class DataSystem extends EventEmitter {
  constructor(setIN) {
    super()
    this.liveRestStorage = new RestAPI(setIN)
    this.liveSQLiteStorage = new SQLiteAPI(setIN)
    this.liveJSONStorage = new JSONfileAPI(setIN)
    this.liveCSVStorage = new CSVfileAPI(setIN)
    this.devicePairs = []
  }

  /**
  *  mapping datatypes to  API source  // need function to call library to get list of active data contracts contacts??? 
  * @method datatypeQueryMapping
  *
  */
  async datatypeQueryMapping(type, hash, sourceInfo, device, datatype, time, contract) {
    console.log('SF -datasysem -- mappping')
    console.log(type)
    console.log(hash)
    console.log(sourceInfo)
    console.log(device)
    console.log(datatype)
    console.log(time)
    let rawHolder = []
    if (type === 'SAFE') {
      // no api plug in yet
    } else if (type === 'REST') {
      // pass on to either safe API builder, REST API builder or IPSF builder etc.
      rawHolder = await this.liveRestStorage.RESTbuilder(sourceInfo, hash).catch(e => console.log('Error: ', e.message))
    } else if (type === 'SQLITE') {
      // pass on to either safe API builder, REST API builder or IPSF builder etc.
      rawHolder = await this.liveSQLiteStorage.SQLitebuilderPromise(sourceInfo, device.device_mac).catch(e => console.log('Error: ', e.message))
    } else if (type === 'JSON') {
      // pass on to either safe API builder, REST API builder or IPSF builder etc.
      rawHolder = await this.liveJSONStorage.jsonFilebuilder(sourceInfo, device).catch(e => console.log('Error: ', e.message))
    } else if (type === 'DATA-COMPUTE') {
      // temp two different structures comign in blind and nxp need to correct
      let pathFile = sourceInfo.data
      let dataPath = ''
      if (sourceInfo.data.path !== undefined) {
        dataPath = sourceInfo.data.path
      } else {
        dataPath = 'json'
      }
      // temp before smart rest extractor is built
      if (dataPath === '/rest/') {
        rawHolder = await this.liveRestStorage.COMPUTEbuilder(sourceInfo.data, device, time).catch(e => console.log('Error: ', e.message))
      } else if (dataPath === 'csv') {
        // source csv e.g. large file query
        rawHolder = await this.liveCSVStorage.csvTimeFilter(sourceInfo.data, device, datatype, time).catch(e => console.log('Error: ', e.message))
        // this.liveCSVStorage.CSVbuilderPromise(sourceInfo, device, time) // .catch(e => console.log('Error: ', e.message))
      } else if (dataPath === 'sqlite') {
        rawHolder = await this.liveSQLiteStorage.SQLitebuilderPromise(sourceInfo.data, device.device_mac, time)
      } else if (dataPath === 'json') {
        // pass on to either safe API builder, REST API builder or IPSF builder etc.
        rawHolder = await this.liveJSONStorage.jsonFilebuilder(sourceInfo, device, time).catch(e => console.log('Error: ', e.message))
      }
    }
    return rawHolder
  }

  /**
  *  return array of active devices
  * @method getLiveDevices
  *
  */
  async saveSystem(api, data) {
    await this.liveRestStorage.saveResults(api, data)
    return true
  }

  /**
  *  return array of active devices
  * @method getLiveDevices
  *
  */
  getLiveDevices(devicesIN) {
    // implementation here
  }
}

export default DataSystem
