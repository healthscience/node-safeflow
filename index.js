'use strict'
/**
*  SAFEflow  heart of the data
*
*
* @class safeFlow
* @package    LKN health
* @copyright  Copyright (c) 2018 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import EntitiesManager from './entitiesManager.js'
import CALE from './CALE/cale-utility.js'

const util = require('util')
const events = require('events')

var safeFlow = function () {
  events.EventEmitter.call(this)
  this.defaultStorage = ['http://165.227.244.213:8882'] // know seed peers
  this.settings = {}
  this.liveEManager = {}
  this.liveCALE = {}
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(safeFlow, events.EventEmitter)

/**
* Network Authorisation
* @method networkAuthorisation
*
*/
safeFlow.prototype.networkAuthorisation = function (apiCNRL, auth) {
  auth.namespace = this.defaultStorage[0]
  this.settings = auth
  this.liveEManager = new EntitiesManager(apiCNRL, auth)
  this.liveCALE = new CALE(this.settings)
  return true
}

/**
* Start FLOW
* @method startFlow
*
*/
safeFlow.prototype.startFlow = function (apiCNRL, auth) {
  let startData = this.liveEManager.peerKBLstart()
  return startData
}

/**
* build context for Toolkit
* @method entityGetter
*
*/
safeFlow.prototype.entityGetter = async function (shellID) {
  let dataVue = {}
  dataVue = this.liveEManager.entityDataReturn(shellID)
  return dataVue
}

export default safeFlow
