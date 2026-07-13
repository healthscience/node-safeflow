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
    console.log('up SafeFlow-ECS')
    console.log(wiring)
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
    console.log('SF start ticker')
    if (this.isPulsing) return;
    this.isPulsing = true;
    
    console.log('[Orrery] SafeFlow-ECS pulse loop ignited.');
    this._pulseLoop();
  }

  _pulseLoop() {
    if (!this.isPulsing) return;

    // 1. Capture current cosmic/heli time coordinates
    const heliStamp = this.wiring.heliClock?.getCurrentStamp() || Date.now();

    // 2. Run the internal systems over the active entity Map
    // If empty, this loop completes in micro-seconds with zero allocations
    this.liveEManager.updateSystems();

    // 3. Compile the current coherence ledger entry
    const coherentStatePackage = {
      heliStamp: heliStamp,
      entityCount: this.liveEManager.entityMap.size,
      payload: [] 
    };

    // 4. Stream active entity states down the wire if they exist
    if (coherentStatePackage.entityCount > 0) {
      this.liveEManager.entityMap.forEach((components, entityId) => {
        // Extract structural and geometric properties if present
        const orgo = components.get('orgo');
        const gelle = components.get('gelle');
        
        if (orgo || gelle) {
          coherentStatePackage.payload.push({
            id: entityId,
            orgo: orgo || null,
            gelle: gelle || null
          });
        }
      });
    }

    // 5. Direct egress path to SfRoute -> WebSocket -> BentoBoxDS
    this.emit('sf-displayUpdateEntityRange', coherentStatePackage);

    // 6. Bind to the native animation frame or loop interval
    // This provides a continuous background cadence
    setTimeout(() => this._pulseLoop(), 16); // ~60fps baseline cadence
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
