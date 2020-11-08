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
import util from 'util'
import events from 'events'
import axios from 'axios'
import http from'http'
import csv from 'csv-parser'
import fs from'fs'
import moment from 'moment'

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
*  device REST builder  (TODO this will need to be come more sophisticed e.g. type of rest authoriseation, no. query parameters etc.)
* @method RESTbuilder
*
*/
TestStorageAPI.prototype.RESTbuilder = async function (dapi, queryIN) {
  console.log('rest builder info')
  let jsondata = await axios.get(dapi.namespace + dapi.path + this.tempPubkey + '/' + this.tempToken + '/' + queryIN)
  return jsondata.data[0]
}

/**
*  COMPUTEbuilder  temp until smart URL builder is created
* @method COMPUTEbuilder
*
*/
TestStorageAPI.prototype.COMPUTEbuilder = async function (dapi, device, time) {
  let apitime = time / 1000
  let jsondata = await axios.get(dapi.namespace + dapi.path + this.tempPubkey + '/' + this.tempToken + '/' + apitime + '/' + device)
  return jsondata.data
}

/**
*  COMPUTEbuilder  temp until smart URL builder is created
* @method COMPUTEbuilderLuft
*
*/
TestStorageAPI.prototype.COMPUTEbuilderLuft = async function (dapi, device, time) {
  let apitime = time / 1000
  let apitime2 = apitime + 86400
  let jsondata = await axios.get(dapi.namespace + dapi.path + this.tempPubkey + '/' + this.tempToken + '/' + device + '/' + apitime + '/' + apitime2)
  return jsondata.data
}

/**
*  device REST builder
* @method deviceRESTbuilder
*
*/
TestStorageAPI.prototype.deviceRESTbuilder = async function (dapi) {
  console.log('device builder')
  let jsondata = []
  if (dapi.apipath === '/computedata/' ) {
   jsondata = await axios.get(dapi.apibase + '/contextdata/' + this.tempPubkey + '/' + this.tempToken)
  } else if (dapi.apipath === '/luftdatenGet/') {
   jsondata = await axios.get(dapi.apibase + '/luftdatendevice/' + this.tempPubkey + '/' + this.tempToken)
  }
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
*  save results data
* @method saveResults
*
*/
TestStorageAPI.prototype.saveResults = async function (api, data) {
  await axios.post(api.namespace + api.path + this.tempPubkey + '/' + this.tempToken, data)
    .then(function (response) {
      // console.log(response)
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
      // console.log(response)
    })
}

export default TestStorageAPI
