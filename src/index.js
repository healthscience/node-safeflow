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
    console.log('udpat eo ECS')
    this.dataAPIlive = dataAPI
    // start error even listener
    this.eventErrorListen()
    this.liveEManager = new EntitiesManager(this.dataAPIlive)
    this.resultCount = 0
  }

  /**
  * ask Library for system active
  * @method askSystemStart
  *
  */
  askSystemStart() {
    let startMessage = {
      type: 'safe-flow',
      action: 'library-systems'
    }
    this.emit('start-systems', startMessage)
  }

  /**
  * load in system active in library
  * @method setSystemsStart
  *
  */
  setSystemsStart(systemsLive) {
    // implementation here
  }

  /**
  * listen for error on event triggered
  * @method eventErrorListen
  *
  */
  eventErrorListen(refCont) {
    this.on('error', (err) => {
      console.error('Unexpected error on emitter', err)
    })
  }

  /**
  * Network Authorisation
  * @method networkAuthorisation
  *
  */
  networkAuthorisation(auth) {
    let peerAuth = {
      settings: auth,
      dataAPI: this.dataAPIlive,
      storageAuth: this.defaultStorage
    }
    let authState = {}
    let verify = this.verifyRelease()
    if (verify === true) {
      this.liveEManager = new EntitiesManager(peerAuth)
      this.entityGetter()
      authState.safeflow = true
      authState.type = 'auth-hop'
      authState.auth = true
    }
    return authState
  }

  /**
  * verify release
  * @method verifyRelease
  *
  */
  verifyRelease() {
    return true
  }

  /**
  * entity getter
  * @method entityGetter
  *
  */
  entityGetter() {
    // implementation here
  }
}

export default SafeFlow
