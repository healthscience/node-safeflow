'use strict'
/**
*  Test CloudStorage
*
*
* @class testStorageAPI
* @package    testStorage API
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
const util = require('util')
const events = require('events')
const axios = require('axios')
const http = require('http')
const csv = require('csv-parser')
const fs = require('fs')
const moment = require('moment')

var TestStorageAPI = function (setUP) {
  events.EventEmitter.call(this)
  this.baseAPI = setUP.namespace
  this.tempPubkey = setUP.publickey
  this.tempToken = setUP.token
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(TestStorageAPI, events.EventEmitter)

/**
*  device REST builder
* @method deviceRESTbuilder
*
*/
TestStorageAPI.prototype.deviceRESTbuilder = async function (dapi) {
  let jsondata = await axios.get(dapi.namespace + dapi.device + this.tempPubkey + '/' + this.tempToken)
  return jsondata.data
}

/**
*  Get device context data from network per publickey
* @method getDeviceData
*
*/
TestStorageAPI.prototype.getDeviceData = async function (api) {
  //  nosql query but headng towards a gRPC listener on stream socket
  let jsondata = await axios.get(api + 'contextdata/' + this.tempPubkey + '/' + this.tempToken)
  return jsondata.data
}

/**
*  Get device context data from network per publickey
* @method getDeviceLuftdatenData
*
*/
TestStorageAPI.prototype.getDeviceLuftdatenData = async function (api) {
  //  nosql query but headng towards a gRPC listener on stream socket
  let jsondata = await axios.get(api + 'luftdatendevice/' + this.tempPubkey + '/' + this.tempToken)
  return jsondata.data
}

/**
*  datatype REST builder
* @method datatypeRESTbuilder
*
*/
TestStorageAPI.prototype.datatypeRESTbuilder = async function (dapi) {
  let jsondata = await axios.get(dapi.namespace + dapi.datatype + this.tempPubkey + '/' + this.tempToken)
  return jsondata.data
}

/**
*  Get dataType Context for each sensor
* @method getContextType
*
*/
TestStorageAPI.prototype.getContextType = async function () {
  //  nosql query but headng towards a gRPC listener on stream socket
  let jsondata = await axios.get(this.baseAPI + '/contexttype/' + this.tempPubkey + '/' + this.tempToken)
  return jsondata.data
}

/**
*  Get Data via Axios
* @method getData
*
*/
TestStorageAPI.prototype.getData = async function (queryTime, deviceID) {
  // device sensor raw form data
  let jsondata = await axios.get(this.baseAPI + '/devicedata/' + this.tempPubkey + '/' + this.tempToken + '/' + queryTime + '/' + deviceID)
  return jsondata.data
}

/**
*  Get first data element for a device
* @method getFirstData
*
*/
TestStorageAPI.prototype.getFirstData = async function (deviceID) {
  // device sensor raw form data
  let jsondata = await axios.get(this.baseAPI + '/devicefirstdata/' + this.tempPubkey + '/' + this.tempToken + '/' + deviceID)
  return jsondata.data
}

/**
*  Get compute Data
* @method getComputeData
*
*/
TestStorageAPI.prototype.getComputeData = async function (queryTime, deviceID) {
  // need source, devices, data for betwween specific time period
  let jsondata = await axios.get(this.baseAPI + '/computedata/' + this.tempPubkey + '/' + this.tempToken + '/' + queryTime + '/' + deviceID)
  return jsondata.data
}

/**
*  Get existing Sum data
* @method getSumData
*
*/
TestStorageAPI.prototype.getSumData = async function (queryTime, deviceID, compType, datatype, timeseg) {
  let jsondata = await axios.get(this.baseAPI + '/sum/' + this.tempPubkey + '/' + this.tempToken + '/' + queryTime + '/' + deviceID + '/' + compType + '/' + datatype + '/' + timeseg)
  return jsondata.data
}

/**
*  Get existing Average data
* @method getAverageData
*
*/
TestStorageAPI.prototype.getAverageData = async function (queryTime, deviceID, compType, datatype, timeseg, category) {
  let jsondata = await axios.get(this.baseAPI + '/average/' + this.tempPubkey + '/' + this.tempToken + '/' + queryTime + '/' + deviceID + '/' + compType + '/' + datatype + '/' + timeseg + '/' + category)
  // console.log(jsondata)
  return jsondata.data
}

/**
*  Get existing air quality data
* @method getAirQualityData
*
*/
TestStorageAPI.prototype.getAirQualityData = async function (luftdatenID, queryTimeStart, queryTimeEnd, namespace) {
  let jsondata = await axios.get(namespace + 'luftdatenGet/' + this.tempPubkey + '/' + this.tempToken + '/' + luftdatenID + '/' + queryTimeStart + '/' + queryTimeEnd)
  return jsondata.data
}

/**
*  Get existing air quality data
* @method getLuftdateDirectCSV
*
*/
TestStorageAPI.prototype.getLuftdateDirectCSV = async function (luftdatenID, queryTimeStart, queryTimeEnd, systemBundle) {
  queryTimeStart = moment((queryTimeStart * 1000)).locale('en-gb').startOf('day').format('L') // '2019-10-14'
  let splitTime = queryTimeStart.split('/')
  let fileTimeStructure = splitTime[2] + '-' + splitTime[1] + '-' + splitTime[0]
  // indoors?
  let csvEnding = ''
  if (systemBundle.devicesFull[0].indoors === false) {
    csvEnding = '.csv'
  } else {
    csvEnding = '_indoor.csv'
  }
  let filename = fileTimeStructure + systemBundle.devicesFull[0].device_name + systemBundle.devicesFull[0].sensor2 + csvEnding // '_bme280_sensor_30105.csv'
  let filename2 = fileTimeStructure + '_sds011_sensor_' + systemBundle.devicesFull[0].sensor1 + csvEnding // '_sds011_sensor_30104.csv'
  // which csv style headers?
  let headerSet
  if (systemBundle.devicesFull[0].device_name === '_bme280_sensor_') {
    headerSet = ['sensor_id', 'sensor_type', 'location', 'lat', 'lon', 'timestamp', 'pressure', 'altitude', 'pressure_sealevel', 'temperature', 'humidity']
  } else {
    headerSet = ['sensor_id', 'sensor_type', 'location', 'lat', 'lon', 'timestamp', 'temperature', 'humidity']
  }
  // now do the parsing work
  http.get('http://archive.luftdaten.info/' + fileTimeStructure + '/' + filename, res => res.pipe(fs.createWriteStream('local.csv')))
  let praser = await readStream()
  function readStream () {
    return new Promise((resolve, reject) => {
      let results = []
      fs.createReadStream('local.csv')
        .pipe(csv({ headers: headerSet, separator: ';', skipLines: 1 }))
        .on('data', (data) => results.push(data))
        .on('end', () => {
          // console.log('end')
          // console.log(results)
          resolve(results)
        })
    })
  }
  http.get('http://archive.luftdaten.info/' + fileTimeStructure + '/' + filename2, res => res.pipe(fs.createWriteStream('local2.csv')))
  let praser2 = await readStream2()
  function readStream2 () {
    return new Promise((resolve, reject) => {
      let results = []
      fs.createReadStream('local2.csv')
        .pipe(csv({ headers: ['sensor_id', 'sensor_type', 'location', 'lat', 'lon', 'timestamp', 'P1', 'durP1', 'ratioP1', 'P2', 'durP2', 'ratioP2'], separator: ';', skipLines: 1 }))
        .on('data', (data) => results.push(data))
        // .on('data', (data) => console.log(data))
        .on('end', () => {
          // console.log('end')
          // console.log(results)
          resolve(results)
        })
    })
  }
  const totalPraser = [...praser, ...praser2]
  // form standard array  data: device_mac: publickey: sensors:  {value: , value_type}
  let dtStructure = []
  for (let pp of totalPraser) {
    let luftdatenObject = {}
    luftdatenObject.timestamp = moment(pp.timestamp).valueOf() / 1000
    luftdatenObject.temperature = pp.temperature
    luftdatenObject.humidity = pp.humidity
    luftdatenObject.airpressure = pp.pressure
    luftdatenObject.SDS_P1 = pp.P1
    luftdatenObject.SDS_P2 = pp.P2
    dtStructure.push(luftdatenObject)
  }
  return dtStructure
}

/**
*  Get start settings
* @method getStartSettings
*
*/
TestStorageAPI.prototype.getStartSettings = async function () {
  let jsondata = await axios.get(this.baseAPI + '/startStatus/' + this.tempPubkey + '/' + this.tempToken + '/')
  // console.log(jsondata)
  return jsondata.data
}

/**
*  Insert start status settings
* @method saveStartSettings
*
*/
TestStorageAPI.prototype.saveStartSettings = async function (jsonIN) {
  // console.log(jsonIN)
  jsonIN.publickey = this.tempPubkey
  await axios.post(this.baseAPI + '/startStatusSave/' + this.tempPubkey + '/' + this.tempToken + '/' + jsonIN.device_mac, jsonIN)
    .then(function (response) {
      console.log(response)
    })
}

/**
*  Remove start bundle
* @method removeStartSettings
*
*/
TestStorageAPI.prototype.removeStartSettings = async function (removeID) {
  let jsonIN = {}
  jsonIN.publickey = this.tempPubkey
  jsonIN.kbid = removeID
  await axios.post(this.baseAPI + '/startStatusRemove/' + this.tempPubkey + '/' + this.tempToken, jsonIN)
    .then(function (response) {
      // console.log(response)
    })
}

/**
*  Remove start dashboard
* @method removeStartDashboardSettings
*
*/
TestStorageAPI.prototype.removeStartDashboardSettings = async function (removeID) {
  let jsonIN = {}
  jsonIN.publickey = this.tempPubkey
  jsonIN.kbid = removeID
  await axios.post(this.baseAPI + '/startDashboardRemove/' + this.tempPubkey + '/' + this.tempToken, jsonIN)
    .then(function (response) {
      console.log(response)
    })
}

/**
*  Get start settings
* @method getExpKbundles
*
*/
TestStorageAPI.prototype.getExpKbundles = async function () {
  let jsondata = await axios.get(this.baseAPI + '/experimentKBundles/' + this.tempPubkey + '/' + this.tempToken + '/')
  // console.log(jsondata)
  return jsondata.data
}

/**
*  Insert start status settings
* @method saveExpKbundles
*
*/
TestStorageAPI.prototype.saveExpKbundles = async function (jsonIN) {
  console.log(jsonIN)
  jsonIN.publickey = this.tempPubkey
  let saveStatus = await axios.post(this.baseAPI + '/experimentKBundlesSave/' + this.tempPubkey + '/' + this.tempToken + '/' + jsonIN.device_mac, jsonIN)
  return saveStatus.data[0]
}

/**
*  Insert data to peer dataStore via Axios
* @method saveaverageData
*
*/
TestStorageAPI.prototype.saveaverageData = async function (jsonIN) {
  jsonIN.publickey = this.tempPubkey
  let response = await axios.post(this.baseAPI + '/averageSave/' + this.tempPubkey + '/' + this.tempToken + '/' + jsonIN.device_mac, jsonIN)
  console.log(response)
}

/**
*  Insert data SUM data
* @method savesumData
*
*/
TestStorageAPI.prototype.savesumData = async function (jsonIN) {
  jsonIN.publickey = this.tempPubkey
  await axios.post(this.baseAPI + '/sumSave/' + this.tempPubkey + '/' + this.tempToken + '/' + jsonIN.device_mac, jsonIN)
    .then(function (response) {
      // console.log(response)
    })
}

/**
*  Get existing HR recovery data
* @method getHRrecoveryData
*
*/
TestStorageAPI.prototype.getHRrecoveryData = async function (queryTime, deviceID) {
  let jsondata = await axios.get(this.baseAPI + '/recoveryHRdata/' + this.tempPubkey + '/' + this.tempToken + '/' + queryTime + '/' + deviceID + '/')
  return jsondata.data
}

/**
*  Insert data to peer dataStore via Axios
* @method saveHRrecoveryData
*
*/
TestStorageAPI.prototype.saveHRrecoveryData = async function (dataType, device, HRrecoveryIN) {
  HRrecoveryIN.publickey = this.tempPubkey
  HRrecoveryIN.device_mac = device
  HRrecoveryIN.datatype = dataType
  // prepare JSON object for POST
  let saveJSON = {}
  saveJSON = HRrecoveryIN
  await axios.post(this.baseAPI + '/recoverySave/' + this.tempPubkey + '/' + this.tempToken + '/' + device, saveJSON)
    .then(function (response) {
      console.log(response)
    })
}

/**
*  make one-off first time api call
* @method firstToken
*
*/
TestStorageAPI.prototype.firstToken = async function (pubkeyIN, callBackF) {
  // prepare JSON object for POST
  let saveJSON = {}
  saveJSON.publickey = pubkeyIN
  await axios.post(this.baseAPI + '/firsttoken/', pubkeyIN)
    .then(function (response) {
      callBackF(response.data)
    })
}

export default TestStorageAPI
