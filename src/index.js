'use strict'
/**
*  SAFEflow  heart of the emulation coherence ledger
*
*  Integrated with the Exo-Assembly Grafting state tracking mechanics.
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
    
    // Coherence Dilation & Pause states for safe exoCue registration
    this.isPulseSuspended = false;
    this.pulseInterval = 16; // Default to standard high-frequency execution (~60fps)
    
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
   * Slows down or pauses the emulation pulse loop to allow safe registration
   * of new Orgo and Gelle pairs without state collisions.
   * @method suspendPulseForIngest
   */
  suspendPulseForIngest(slowOnly = false) {
    this.isPulseSuspended = true;
    // Either keep ticking at 16ms but skip ECS updates, or slow the actual interval
    this.pulseInterval = slowOnly ? 500 : 16; 
    this.emit('sf-pulseDilation', { suspended: true, interval: this.pulseInterval });
  }

  /**
   * Resumes normal high-frequency ~60fps ticking.
   * @method resumePulse
   */
  resumePulse() {
    this.isPulseSuspended = false;
    this.pulseInterval = 16;
    this.emit('sf-pulseDilation', { suspended: false, interval: this.pulseInterval });
  }

  /**
   * Orchestrates the safe registration of a new exoCue pair (Orgo + Gelle)
   * through the simplified coherence suspension step.
   * @method saveAndRegisterExoCue
   */
  saveAndRegisterExoCue(entityId, orgoSpecs, gelleSpecs) {
    // 1. Slow down/pause the heartbeat to prevent race conditions during write
    this.suspendPulseForIngest(true);

    try {
      // 2. Directly update the native entities Map in EntitiesManager (SafeFlow-ECS)
      let entityComponents = this.liveEManager.entities.get(entityId) || {};
      
      if (orgoSpecs) entityComponents.orgo = orgoSpecs;
      if (gelleSpecs) entityComponents.gelle = gelleSpecs;
      
      this.liveEManager.entities.set(entityId, entityComponents);

      // 3. Trigger manual coherence update & pass to resonAgent physics / visualizers
      this.resultCount++;
      this.emit('sf-exoCueRegistered', { entityId, orgo: orgoSpecs, gelle: gelleSpecs });

    } catch (err) {
      console.error("Coherence transaction failed during Orgo/Gelle pair write:", err);
    } finally {
      // 4. Resume normal pulsing cadence
      this.resumePulse();
    }
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
    // Only execute state ticks if we are not locked in suspended writing state
    if (!this.isPulseSuspended) {
      this.liveEManager.tick();
    }

    // 3. Compile the current coherence ledger entry using your native Map (.size)
    const coherentStatePackage = {
      heliStamp: heliStamp,
      entityCount: this.liveEManager.entities.size,
      morphogens: [],
      // Simplified tracking metrics optimized for Orgo-Gelle Coherence
      cueCoherence: 1.0,
      orgoCount: 0,
      gelleCount: 0,
      pulseSuspended: this.isPulseSuspended
    };

    // 4. Stream active states down the wire if entities exist
    if (coherentStatePackage.entityCount > 0) {
      let totalOrgo = 0;
      let totalGelle = 0;

      // High-performance loop over your native entities Map
      for (const [entityId, components] of this.liveEManager.entities) {
        if (components.orgo || components.gelle) {
          const morphogenNode = {
            id: entityId,
            orgo: components.orgo || null,
            gelle: components.gelle || null
          };

          if (components.orgo) totalOrgo++;
          if (components.gelle) totalGelle++;

          coherentStatePackage.morphogens.push(morphogenNode);
        }
      }

      coherentStatePackage.orgoCount = totalOrgo;
      coherentStatePackage.gelleCount = totalGelle;
      
      // Coherence is balanced when Orgo & Gelle exist in stable matched pairs
      const totalCues = totalOrgo + totalGelle;
      coherentStatePackage.cueCoherence = totalCues > 0 
        ? parseFloat((Math.min(totalOrgo, totalGelle) / Math.max(totalOrgo, totalGelle)).toFixed(4))
        : 1.0;
    }

    // 5. Direct egress path to SfRoute -> WebSocket -> Display rendering interface
    this.emit('sf-displayUpdateEntityRange', coherentStatePackage);

    // 6. Maintain the dynamic cadence based on our coherence state
    setTimeout(() => this._pulseLoop(), this.pulseInterval);
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

      // Enhanced ingest processing to handle graft/snap updates from peer nodes
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
    // implementation of systems live mapping can go here
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
    // Entity ingestion and component caching implementation
  }
}

export default SafeFlow