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
*  device REST builder  (TODO this will need to be come more sophisticed e.g. type of rest authoriseation, no. query parameters etc.)
* @method RESTbuilder
*
*/
TestStorageAPI.prototype.RESTbuilder = async function (dapi) {
  let jsondata = await axios.get(dapi.namespace + dapi.device + this.tempPubkey + '/' + this.tempToken)
  return jsondata.data
}

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

export default TestStorageAPI
