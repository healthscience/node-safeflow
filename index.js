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
import util from 'util'
import events from 'events'

var safeFlow = function () {
  events.EventEmitter.call(this)
  this.defaultStorage = 'http://165.227.244.213:8882'
  this.settings = {}
  this.liveEManager = {}
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
  auth.namespace = this.defaultStorage
  this.settings = auth
  this.liveEManager = new EntitiesManager(apiCNRL, auth)
  this.flowListen()
  this.entityGetter()
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
* Start FLOW
* @method startPeerFlow
*
*/
safeFlow.prototype.startPeerFlow = function (apiCNRL, auth) {
  let startData = this.liveEManager.peerKBLPeerstart()
  return startData
}

/**
* build context for Toolkit
* @method entityGetter
*
*/
safeFlow.prototype.entityGetter = function (shellID) {
  // let dataVue = {}
  // dataVue = this.liveEManager.entityDataReturn(shellID)
  this.liveEManager.on('visualUpdate', (data) => {
    this.emit('displayUpdate', data)
  })
}

/**
* start the ECS flow with a new input
* @method flowListen
*
*/
safeFlow.prototype.flowListen = function () {
  this.liveEManager.on('startflow', (data, data2) => {
    this.liveEManager.entityFlow(data, data2)
  })
}

export default safeFlow
