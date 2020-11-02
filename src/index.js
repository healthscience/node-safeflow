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
  // start error even listener
  this.eventErrorListen()
  this.defaultStorage = 'http://165.227.244.213:8882'
  this.settings = {}
  this.liveEManager = new EntitiesManager()
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(safeFlow, events.EventEmitter)

/**
* listen for error on event triggered
* @method eventErrorListen
*
*/
safeFlow.prototype.eventErrorListen = function (refCont) {
  const logger = console
  this.on('error', (err) => {
    logger.error('Unexpected error on emitter', err)
  })
  // test the emitter
  // this.emit('error', new Error('Whoops!'));
  // Unexpected error on emitter Error: Whoops!
}

/**
* Network Authorisation
* @method networkAuthorisation
*
*/
safeFlow.prototype.networkAuthorisation = function (apiCNRL, auth) {
  // need library to check token or verify key ownership TODO:
  // TEMP testnetwork defaults
  auth.namespace = this.defaultStorage
  this.settings = auth
  let authState = {}
  let verify = false
  // check cloud
  verify = true
  // verify keys
  if (verify === true ) {
    this.liveEManager = new EntitiesManager(apiCNRL, auth)
    // this.flowListen()
    // set listener for ECS data back peer
    this.entityGetter()
    authState.safeflow = true
    authState.type = 'auth'
    authState.auth = true
  }
  return authState
}

/**
* Start FLOW
* @method startFlow
*
*/
safeFlow.prototype.startFlow = async function (refContract) {
  let startData = await this.liveEManager.peerKBLstart(refContract)
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
  this.liveEManager.on('visualFirst', (data) => {
    this.emit('displayEntity', data)
  })
  this.liveEManager.on('visualFirstRange', (data) => {
    this.emit('displayEntityRange', data)
  })
  this.liveEManager.on('visualUpdate', (data) => {
    this.emit('displayUpdateEntity', data)
  })
  this.liveEManager.on('visualUpdateRange', (data) => {
    this.emit('displayUpdateEntityRange', data)
  })
  this.liveEManager.on('storePeerResults', (data) => {
    this.emit('storePeerResults', data)
  })
  this.liveEManager.on('kbledgerEntry', (data) => {
    this.emit('kbledgerEntry', data)
  })
  this.liveEManager.on("error", (error) => {
      console.error(`Gracefully handling our error: ${error}`);
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
