'use strict'
/**
*  KBL database utility
*
*
* @class KBLdatabaseUtility
* @package    KBL data store
* @copyright  Copyright (c) 2020 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
const util = require('util')
const events = require('events')
const axios = require('axios')

var KBLdatabaseUtility = function (setUP) {
  events.EventEmitter.call(this)
  this.baseAPI = 'http://165.227.244.213:8889'
  this.tempPubkey = setUP.publickey
  this.tempToken = setUP.token
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(KBLdatabaseUtility, events.EventEmitter)

/**
*  peerNXPmodules contract
* @method peerNXPmodules
*
*/
KBLdatabaseUtility.prototype.peerNXPmodules = async function (contractID) {
  let startSettings = await axios.get(this.baseAPI + '/nxpmodules/' + this.tempPubkey + '/' + this.tempToken + '/' + contractID)
  return startSettings.data
}

/**
*  Get NXP index for those peer has joind i.e. genesis index entry
* @method getNXPindex
*
*/
KBLdatabaseUtility.prototype.getNXPindex = async function (status, n) {
  //  nosql query
  let jsondata = await axios.get(this.baseAPI + '/nxpindex/' + this.tempPubkey + '/' + this.tempToken + '/' + status + '/' + n)
  return jsondata.data
}

/**
*  Get indexes of KKBL datastore
* @method getKBLindex
*
*/
KBLdatabaseUtility.prototype.getKBLindex = async function (cnrl, n) {
  //  nosql query
  let jsondata = await axios.get(this.baseAPI + '/kblindex/' + this.tempPubkey + '/' + this.tempToken + '/' + cnrl + '/' + n)
  return jsondata.data
}

/**
*  KBL entry
* @method kblEntry
*
*/
KBLdatabaseUtility.prototype.kblEntry = async function (kbid) {
  let jsondata = await axios.get(this.baseAPI + '/kblentry/' + this.tempPubkey + '/' + this.tempToken + '/' + kbid)
  return jsondata.data
}

/**
*  defaultCNRL contract
* @method defaultCNRL
*
*/
KBLdatabaseUtility.prototype.defautCNRL = async function (contractID) {
  let startSettings = await axios.get(this.baseAPI + '/cnrl/' + this.tempPubkey + '/' + this.tempToken + '/' + contractID)
  return startSettings.data
}

export default KBLdatabaseUtility
