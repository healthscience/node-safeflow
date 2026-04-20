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
import { World } from './core/world.js'
import { PulseBridge } from './ingest/pulseBridge.js'
import { Weaver } from 'consilience-weave'

class SafeFlow extends EventEmitter {

  constructor(dataAPI) {
    super()
    console.log('udpat eo ECS')
    this.dataAPIlive = dataAPI
    
    // Core Infrastructure Upgrade
    this.world = new World()
    this.pulseBridge = new PulseBridge(this.world)
    // consilience weave
    this.weaver = this.world.weaver

    // start error even listener
    this.eventErrorListen()
    this.liveEManager = new EntitiesManager(this.dataAPIlive)
    this.resultCount = 0
  }

  /**
   * Set up WebSocket and attach ingest handler
   * @method setWebsocket
   */
  setWebsocket(ws) {
    this.dataAPIlive.setWebsocket(ws)
    
    ws.on('message', (msg) => {
      let message
      try {
        message = JSON.parse(msg.utf8Data || msg)
      } catch (err) {
        return
      }

      if (message.agentId && message.data) {
        this.pulseBridge.ingestLive(message.agentId, message.data)
        this.world.tick(message.heliStamp)
      }
    })
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
