'use strict'
/**
*  SAFEflow  heart of the data
*
*
* @class safeFlow
* @package    LKN health
* @copyright  Copyright (c) 2023 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import EventEmitter from 'events'
import EntitiesManager from './entitiesManager.js'

class SafeFlow extends EventEmitter {

  constructor(dataAPI) {
    super()
    console.log('SafeFlow-ECS begin==future')
    // console.log(dataAPI)
    console.log('bentotemplate-safeflowECS')
    this.dataAPIlive = dataAPI
    // start error even listener
    this.eventErrorListen()
    this.liveEManager = new EntitiesManager(this.dataAPIlive)
    this.resultCount = 0
  }

  /**
  * listen for error on event triggered
  * @method eventErrorListen
  *
  */
  eventErrorListen = function (refCont) {
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
  networkAuthorisation = function (auth) {
  // need library to check token or verify key ownership TODO:
  // TEMP testnetwork defaults
  let peerAuth = {}
  peerAuth.settings = auth
  peerAuth.dataAPI = this.dataAPIlive 
  peerAuth.storageAuth = this.defaultStorage
  let authState = {}
  let verify = false
  // check release is compatible and untampered
  verify = this.verifyRelease()
  // verify keys
  if (verify === true ) {
    this.liveEManager = new EntitiesManager(peerAuth)
    // set listener for ECS data back peer
    this.entityGetter()
    authState.safeflow = true
    authState.type = 'auth-hop'
    authState.auth = true
  }
  return authState
  }

  /**
  * datastore authorisation
  * @method datastoreAuthorisation
  *
  */
  datastoreAuthorisation = function (authDS) {
  // TEMP testnetwork defaults
  authDS.namespace = this.defaultStorage
  let authDatastoreState = {}
  let verify = false
  // check release is compatible and untampered
  verify = this.verifyRelease()
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
  verifyRelease = function (refContract) {
  // TODO  checksum software
  return true
  }
  /**
  * Start FLOW
  * @method startFlow
  *
  */
  startFlow = async function (refContract) {
  let startData = await this.liveEManager.peerKBLstart(refContract)
  return startData
  }

  /**
  * Start FLOW
  * @method startPeerFlow
  *
  */
  startPeerFlow = function (apiCNRL, auth) {
  let startData = this.liveEManager.peerKBLPeerstart()
  return startData
  }

  /**
  * takes in new data from main results store
  * @method resultsFlow
  *
  */
  resultsFlow = function (results) {
  this.liveEManager.emit('resultsCheckback', results)
  return true
  }

  /**
  * build context for Toolkit
  * @method entityGetter
  *
  */
  entityGetter = function (shellID) {
  this.liveEManager.on('visualFirst', (data) => {
    this.emit('sf-displayEntity', data)
  })
  this.liveEManager.on('visualFirstRange', (data) => {
    this.resultCount++
    if (this.resultCount > 0) {
      this.emit('sf-displayEntityRange', data)
      // console.log('memoryPrint Start')
      // console.log(process.memoryUsage())
    }
  })
  this.liveEManager.on('visualUpdate', (data) => {
    this.emit('sf-displayUpdateEntity', data)
  })
  this.liveEManager.on('visualUpdateRange', (data) => {
    this.emit('sf-displayUpdateEntityRange', data)
  })
  this.liveEManager.on('updateModule', (data, shellID, dataPrint) => {
    this.emit('updateModule', data, shellID, dataPrint)
  })
  // update compute modules
  this.on('updatesaved-compute', (updatesaveModule, shellID, dataPrint) => {
    this.liveEManager.prepareKBLedger(updatesaveModule, shellID, dataPrint)
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

  /**
  * clear the vis listener
  * @method emptyListeners
  *
  */
  emptyListeners = function (shellID) {
  // console.log(this.liveEManager)
  /* console.log(Object.keys(this.liveEManager.liveSEntities))
  let entityLive = Object.keys(this.liveEManager.liveSEntities)
  // this.liveEManager.
  function outMessage () {
    console.log('listener dataout close')
  }
  for (let et of entityLive) {
    this.liveEManager.liveSEntities[et].liveVisualC.removeAllListeners('dataout', outMessage)
  } */
  // this.liveEManager.emptyListerOUT('close')
  return true
  }

}

export default SafeFlow
