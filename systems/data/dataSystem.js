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

import TestStorageAPI from './dataprotocols/teststorage/testStorage.js'
import LiveSimulatedDataSystem from './simulateddataSystem.js'
import FilterDataSystem from './filterdataSystem.js'

const util = require('util')
const events = require('events')
const moment = require('moment')

var DataSystem = function (setIN) {
  events.EventEmitter.call(this)
  this.liveTestStorage = new TestStorageAPI(setIN)
  this.liveFilterData = new FilterDataSystem(setIN)
  this.devicePairs = []
  this.dataRaw = []
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(DataSystem, events.EventEmitter)

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
*  update times to present of exising Knowledge Bundles saved
* @method updateTimesStart
*
*/
DataSystem.prototype.updateTimesStart = function (kbList) {
  let updateTimeKB = []
  for (let oKB of kbList) {
    let timeUpdate = {}
    timeUpdate = oKB.time
    let nowTime = moment()
    let startDay = moment(nowTime).startOf('day')
    timeUpdate.realtime = nowTime
    timeUpdate.startperiod = startDay
    oKB.time = timeUpdate
    updateTimeKB.push(oKB)
  }
  return updateTimeKB
}

/**
* get DataTypes
* @method getDataTypes
*
*/
DataSystem.prototype.getDataTypes = async function () {
  let dataTypeSensor = []
  await this.liveTestStorage.getContextType().then(function (result) {
    dataTypeSensor = result
  })
  return dataTypeSensor
}

/**
*  return array of active datatypes
* @method getLiveDatatypes
*
*/
DataSystem.prototype.getLiveDatatypes = function (dtIN) {
  let liveDTs = []
  for (let dt of dtIN) {
    if (dt.active === true) {
      liveDTs.push(dt.cnrl)
    }
  }
  return liveDTs
}

/**
*  mapping datatypes to  API source
* @method datatypeQueryMapping
*
*/
DataSystem.prototype.datatypeQueryMapping = async function (systemBundle, time) {
  let rawHolder = {}
  // loop over the each devices API data source info.
  for (let devI of systemBundle.devices) {
    rawHolder[devI] = {}
    // first is the data from the PAST or FUTURE ie simulated?
    if (systemBundle.querytime && systemBundle.querytime.startperiod === 'simulateData') {
      // need whole new system for product future data
      // let dayHolder = {}
      // dayHolder.day = futureData
      // rawHolder[devI][dtItem.cnrl] = dayHolder
    } else {
      for (let dtItem of systemBundle.apiInfo[devI].apiquery) {
        if (dtItem.api === 'computedata/<publickey>/<token>/<queryTime>/<deviceID>/') {
          let sourcerawData = await this.getRawData(devI, time)
          let dayHolder = {}
          dayHolder.day = sourcerawData
          rawHolder[devI][dtItem.cnrl] = dayHolder
        } else if (dtItem.api === 'luftdatenGet/<publickey>/<token>/<queryTime>/<deviceID>/') {
          console.log('air quality data query')
          console.log(dtItem)
          let AirsourcerawData = await this.getAirqualityData(devI, time, dtItem.namespace)
          let filterColumnAQ = this.liveFilterData.filterDataTypeSub(dtItem, AirsourcerawData)
          let dayAQHolder = {}
          dayAQHolder.day = filterColumnAQ
          rawHolder[devI][dtItem.cnrl] = dayAQHolder
        } else if (dtItem.api === '<date>/<fileS1>') {
          // console.log('air quality data query')
          let AirsourcerawData = await this.getLuftdateDirect(devI, time, systemBundle)
          // let filterColumnAQ = this.liveFilterData.filterDataTypeSub(dtItem, AirsourcerawData)
          let dayAQHolder = {}
          dayAQHolder.day = AirsourcerawData
          rawHolder[devI][dtItem.cnrl] = dayAQHolder
        } else if (dtItem.api === 'sum/<publickey>/<token>/<queryTime>/<deviceID>/') {
          // console.log('sum data query')
          let SumsourcerawData = await this.getRawSumData(devI, time, systemBundle)
          rawHolder = SumsourcerawData
        } else if (dtItem.api === 'average/<publickey>/<token>/<queryTime>/<deviceID>/') {
          // console.log('average data query')
          let AvgsourcerawData = await this.getRawAverageData(devI, time, systemBundle)
          rawHolder = AvgsourcerawData
        }
      }
    }
  }
  return rawHolder
}

/**
* get rawData
* @method getRawData
*
*/
DataSystem.prototype.getRawData = async function (device, startTime) {
  let dataBack = await this.liveTestStorage.getComputeData(startTime, device).catch(function (err) {
    console.log(err)
  })
  return dataBack
}

/**
* get airquality data
* @method getAirqualityData
*
*/
DataSystem.prototype.getAirqualityData = async function (device, startTime, namespace) {
  let endTime = startTime + 86400
  let statsData = await this.liveTestStorage.getAirQualityData(device, startTime, endTime, namespace).catch(function (err) {
    console.log(err)
  })
  return statsData
}

/**
* get airquality data direct CSV parse
* @method getLuftdateDirect
*
*/
DataSystem.prototype.getLuftdateDirect = async function (device, startTime, systemBundle) {
  let endTime = startTime + 86400
  let statsData = await this.liveTestStorage.getLuftdateDirectCSV(device, startTime, endTime, systemBundle).catch(function (err) {
    console.log(err)
  })
  return statsData
}

/**
* get raw ie source average data for a data type
* @method getRawSumData
*
*/
DataSystem.prototype.getRawSumData = async function (devI, time, bundleIN) {
  const localthis = this
  // how many sensor ie data sets are being asked for?
  // loop over and return Statistics Data and return to callback
  let averageData = {}
  let averageHolder = {}
  for (let di of bundleIN.devices) {
    // also need to loop for datatype and map to storage API function that matches
    for (let dtl of bundleIN.dtAsked) {
      // loop over datatypes
      for (let tsg of bundleIN.timeseg) {
        // loop over time segments
        let statsData = await localthis.liveTestStorage.getSumData(time, di, bundleIN.scienceAsked.prime.cnrl, dtl.cnrl, tsg).catch(function (err) {
          console.log(err)
        })
        averageHolder = {}
        averageHolder[tsg] = statsData
        averageData[di] = {}
        averageData[di][dtl.cnrl] = {}
        averageData[di][dtl.cnrl] = averageHolder
      }
    }
  }
  return averageData
}

/**
* get raw ie source average data for a data type
* @method getRawAverageData
*
*/
DataSystem.prototype.getRawAverageData = async function (devI, time, avgBundle) {
  const localthis = this
  // how many sensor ie data sets are being asked for?
  // loop over and return Statistics Data and return to callback
  let averageData = {}
  // let averageArray = []
  let averageHolder = {}
  for (let di of avgBundle.devices) {
    // also need to loop for datatype and map to storage API function that matches
    for (let dtl of avgBundle.dtAsked) {
      // loop over datatypes
      for (let tsg of avgBundle.timeseg) {
        // loop over time segments
        let statsData = await localthis.liveTestStorage.getAverageData(time, di, avgBundle.scienceAsked.prime.cnrl, dtl.cnrl, tsg, avgBundle.categories[0].cnrl).catch(function (err) {
          console.log(err)
        })
        averageHolder = {}
        averageHolder[tsg] = statsData
        // averageArray.push(averageHolder)
        averageData[di] = {}
        averageData[di][dtl.cnrl] = []
        averageData[di][dtl.cnrl] = averageHolder
      }
    }
  }
  return averageData
}

/**
* get recovery heart rate data
* @method getHRrecovery
*
*/
DataSystem.prototype.getHRrecovery = async function (bundleIN, dtAsked) {
  const localthis = this
  this.recoverHR = {}
  const deviceLiveFilter = bundleIN.devices
  for (let di of deviceLiveFilter) {
    await localthis.liveTestStorage.getHRrecoveryData(bundleIN.timePeriod, di, dtAsked).then(function (statsData) {
      localthis.recoverHR[di] = statsData
      statsData = []
    }).catch(function (err) {
      console.log(err)
    })
  }
  return this.recoverHR
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
