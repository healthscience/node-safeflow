'use strict'
/**
*  SAFEflow  heart of the emulation coherence ledger
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

class SafeFlow extends EventEmitter {

  constructor(wiring) {
    super()
    this.wiring = wiring;
    this.isPulsing = false;
    this.dataAPIlive = wiring.network
    
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
   * Main ignition point for the constant Interplay heartbeat.
   * Call this as soon as the core infrastructure layer comes to be.
   */
  startTicker() {
    if (this.isPulsing) return;
    this.isPulsing = true;
    
    this._pulseLoop();
  }

  /**
   * pulse heli in entities
   * @method _pulseLoop
   */
  _pulseLoop() {
    if (!this.isPulsing) return;

    // 1. Capture current cosmic/heli time coordinates
    const heliStamp = this.wiring.heliClock?.getCurrentStamp() || Date.now();

    // 2. Execute the synchronous pulse through all active systems
    // This calls the exact method in your EntitiesManager code
    this.liveEManager.tick();

    // 3. Compile the current coherence ledger entry using your native Map (.size)
    const coherentStatePackage = {
      heliStamp: heliStamp,
      entityCount: this.liveEManager.entities.size,
      morphogens: [] 
    };

    // 4. Stream active states down the wire if entities exist
    if (coherentStatePackage.entityCount > 0) {
      // High-performance loop over your native entities Map
      for (const [entityId, components] of this.liveEManager.entities) {
        if (components.orgo || components.gelle) {
          coherentStatePackage.morphogens.push({
            id: entityId,
            orgo: components.orgo || null,
            gelle: components.gelle || null
          });
        }
      }
    }

    // 5. Direct egress path to SfRoute -> WebSocket -> BentoBoxDS
    this.emit('sf-displayUpdateEntityRange', coherentStatePackage);

    // 6. Maintain the steady baseline cadence
    setTimeout(() => this._pulseLoop(), 16); // ~60fps cadence
  }

  stopTicker() {
    this.isPulsing = false;
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
