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
  this.defaultStorage = 'http://165.227.244.213:8882' // for test network only will be removed
  this.liveEManager = new EntitiesManager()
  this.resultCount = 0
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
safeFlow.prototype.networkAuthorisation = function (auth) {
  // need library to check token or verify key ownership TODO:
  // TEMP testnetwork defaults
  let peerAuth = {}
  peerAuth.settings = auth
  peerAuth.namespace = this.defaultStorage
  let authState = {}
  let verify = false
  // check release is compatible and untampered
  verify = this.verifyRelease()
  console.log(verify)
  // verify keys
  if (verify === true ) {
    this.liveEManager = new EntitiesManager(peerAuth)
    // set listener for ECS data back peer
    this.entityGetter()
    authState.safeflow = true
    authState.type = 'auth'
    authState.auth = true
  }
  return authState
}

/**
* datastore authorisation
* @method datastoreAuthorisation
*
*/
safeFlow.prototype.datastoreAuthorisation = function (authDS) {
  // TEMP testnetwork defaults
  authDS.namespace = this.defaultStorage
  let authDatastoreState = {}
  let verify = false
  // check release is compatible and untampered
  verify = this.verifyRelease()
  console.log(verify)
  // verify keys
  if (verify === true ) {
    this.liveEManager.addDatastore(authDS)
    // return datastore info to peer
    authDatastoreState.safeflow = true
    authDatastoreState.type = 'datastore'
    authDatastoreState.auth = true
  }
  return authDatastoreState
}

/**
* check the release of safeFLOW is compatible
* @method verifyRelease
*
*/
safeFlow.prototype.verifyRelease = function (refContract) {
  // TODO  checksum software
  return true
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
* takes in new data from main results store
* @method resultsFlow
*
*/
safeFlow.prototype.resultsFlow = function (results) {
  this.liveEManager.emit('resultsCheckback', results)
  return true
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
    this.resultCount++
    if (this.resultCount < 32) {
      this.emit('displayEntityRange', data)
      // console.log('memoryPrint Start')
      // console.log(process.memoryUsage())
    }
  })
  this.liveEManager.on('visualUpdate', (data) => {
    this.emit('displayUpdateEntity', data)
  })
  this.liveEManager.on('visualUpdateRange', (data) => {
    this.emit('displayUpdateEntityRange', data)
  })
  this.liveEManager.on('updateModule', (data) => {
    this.emit('updateModule', data)
  })
  this.liveEManager.on('storePeerResults', (data) => {
    this.emit('storePeerResults', data)
  })
  this.liveEManager.on('resultCheck', (data) => {
    this.emit('checkPeerResults', data)
  })
  this.liveEManager.on('kbledgerEntry', (data) => {
    this.emit('kbledgerEntry', data)
  })
  this.liveEManager.on("error", (error) => {
      console.error(`Gracefully handling our error: ${error}`);
  })
}

export default safeFlow
