'use strict'
/**
* SAFEflow heart of the emulation coherence ledger
*
* Integrated with the Exo-Assembly Grafting state tracking mechanics.
*
* @class safeFlow
* @package LKN health
* @copyright Copyright (c) 2023 James Littlejohn
* @license http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version $Id$
*/
import EventEmitter from 'events'
import { ResonanceConduction } from './conduction/resonanceConduction.js'
import StoryReceiver from './orchestration/storyReceiver.js'
import SafeFlowIngestAdapter from './orchestration/ingestAdaptor.js'
import EntitiesManager from './entitiesManager.js'
import { World } from './core/world.js'
import { PulseBridge } from './ingest/pulseBridge.js'

import { JsonExtractionSystem } from './systems/data/JsonExtractorSystem.js'
// ... import other systems


class SafeFlow extends EventEmitter {

  constructor(wiring) {
    super()
    this.wiring = wiring;
    this.resonance = new ResonanceConduction(this.wiring)
    this.storyExpand = {} // new StoryReceiver(this.wiring.library.libManager, this.resonance, this)
    this.adapter = new SafeFlowIngestAdapter(this);

    this.isPulsing = false;
    this.dataAPIlive = wiring.network
    
    // Coherence Dilation & Pause states for safe exoCue registration
    this.isPulseSuspended = false;
    this.pulseInterval = 16; // Default to standard high-frequency execution (~60fps)
    
    // Temporal Mode Management ('LIVE' | 'PLAYBACK' | 'PROJECTION')
    this.temporalMode = 'LIVE';

    // Core Infrastructure Upgrade
    this.world = new World()
    this.pulseBridge = new PulseBridge(this.world)
    // consilience weave
    this.weaver = this.world.weaver

    // start error event listener
    this.eventErrorListen()
    this.liveEManager = {} // new EntitiesManager(this.dataAPIlive)
    this.initializeSafeFlow()
    this.resultCount = 0
  }

  setWiring (wiring) {
    this.wiring = wiring
    // also update
    this.resonance = new ResonanceConduction(this.wiring)
    this.storyExpand = new StoryReceiver(this.wiring.library.libManager, this.resonance, this)
  }

  /**
   * bring entity manager to be
   * @method initializeSafeFlow 
   */
  initializeSafeFlow() {
    this.liveEManager = new EntitiesManager()

    // 2. Add systems to the Orrery prior to the first pulse
    this.liveEManager.addSystem(new JsonExtractionSystem(this.wiring.network))
    // liveEManager.addSystem(new SomeOtherSystem())

  }

  /**
   * 
   * take HOPstory and expands contract refs etc.
   * @ingestStart
  */
  ingestStart (HOPstory) {
    console.log('SF ingest start')
    console.log(HOPstory)
    // expand this
    let fullyExpandedStory = this.storyExpand.handleIncomingStory(HOPstory)
    console.log('fully expanded')
    console.log(fullyExpandedStory)
    // set emulation context
    let activeEmulationContext = ''
    // When HOP finalizes the expanded bundle:
    const entityId = this.adapter.processAndIngest(fullyExpandedStory, activeEmulationContext);

    // Confirm state registration via event listener
    this.on('sf-hopStoryIngested', (data) => {
      console.log(`Entity ${data.entityId} successfully woven into SafeFlow orrery.`);
    });
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
   * Switches execution between Live Heli time, History Playback, and Projections Forward.
   * @method setTemporalMode
   */
  setTemporalMode(mode, options = {}) {
    this.temporalMode = mode;

    switch (mode) {
      case 'LIVE':
        this.resumePulse();
        break;

      case 'PLAYBACK':
        // Dilation lock: pause live ticks to allow fast historical replay
        this.suspendPulseForIngest(true);
        if (options.frames) {
          this.executePlaybackSequence(options.frames);
        }
        break;

      case 'PROJECTION':
        // Dilation lock: pause live ticks for forward speculative ticks
        this.suspendPulseForIngest(true);
        if (options.speculativeCues) {
          this.executeProjectionSequence(options.speculativeCues, options.steps || 10);
        }
        break;
    }

    this.emit('sf-temporalModeChanged', { mode: this.temporalMode });
  }

  /**
   * Replays historical frames synchronously without waiting for real-time intervals.
   * @method executePlaybackSequence
   */
  executePlaybackSequence(frames) {
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];

      // Ingest historical entity components directly into EntitiesManager
      if (frame.entityId && frame.componentName) {
        this.liveEManager.updateComponent(frame.entityId, frame.componentName, frame.data);
      }

      // Synchronously step system state forward
      this.liveEManager.tick();

      // Emit proof milestone if this historical timestamp sealed an evidence block
      if (frame.isProofMilestone) {
        this.emit('sf-proofMilestoneReplayed', {
          heliStamp: frame.heliStamp,
          entityCount: this.liveEManager.entities.size
        });
      }
    }

    // Automatically return to LIVE mode unless explicitly kept in PLAYBACK
    this.setTemporalMode('LIVE');
  }

  /**
   * Runs forward speculative projections using hypothetical exoCues.
   * @method executeProjectionSequence
   */
  executeProjectionSequence(speculativeCues, steps) {
    for (let step = 0; step < steps; step++) {
      const cue = speculativeCues[step] || {};
      
      // Inject projection cues into PulseBridge
      if (cue.agentId && cue.data) {
        this.pulseBridge.ingestLive(cue.agentId, cue.data);
      }

      // Step state forward in deep-time
      this.liveEManager.tick();
    }

    this.emit('sf-projectionCompleted', { stepsExecuted: steps });
    this.setTemporalMode('LIVE');
  }

  /**
   * Slows down or pauses the emulation pulse loop to allow safe registration
   * of new Orgo and Gelle pairs without state collisions.
   * @method suspendPulseForIngest
   */
  suspendPulseForIngest(slowOnly = false) {
    this.isPulseSuspended = true;
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
   * Ingests a complete HOPstory bundle from the Sculpting Lab process
   * and maps it directly into the SafeFlow-ECS Orrery.
   * @method ingestHOPstoryBundle
   */
  ingestHOPstoryBundle(bundle) {
    if (!bundle || !bundle.components) {
      console.error("Invalid HOPstory bundle provided.");
      return null;
    }

    // 1. Pause live ticker briefly during state grafting to prevent collisions
    this.suspendPulseForIngest(true);

    try {
      // 2. Spawn a clean entity slot in the Orrery
      const entityId = this.liveEManager.createEntity();
      const comps = bundle.components;

      // 3. Bind components individually (late binding via ECS)
      if (comps.lifestrapStory) {
        this.liveEManager.addComponent(entityId, 'lifestrapStory', comps.lifestrapStory);
      }
      if (comps.lensGlue) {
        this.liveEManager.addComponent(entityId, 'lensGlue', comps.lensGlue);
      }
      if (comps.exoCues) {
        // Use your existing Orgo/Gelle registration mechanics
        const torso = comps.exoCues.torso || {};
        this.saveAndRegisterExoCue(entityId, torso.orgoSpecs, torso.gelleSpecs);
      }
      if (comps.data) {
        this.liveEManager.addComponent(entityId, 'Data', comps.data);
      }

      this.emit('sf-hopStoryIngested', { entityId, storyId: bundle.storyId });
      return entityId;

    } catch (err) {
      console.error("Failed to ingest HOPstory bundle into SafeFlow-ECS:", err);
      return null;
    } finally {
      // 4. Resume normal pulsing cadence
      this.resumePulse();
    }
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
    // Only execute state ticks if we are not locked in suspended writing state and in LIVE mode
    if (!this.isPulseSuspended && this.temporalMode === 'LIVE') {
      this.liveEManager.tick();
    }

    // 3. Compile the current coherence ledger entry using your native Map (.size)
    const coherentStatePackage = {
      heliStamp: heliStamp,
      temporalMode: this.temporalMode,
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

      // Live Ingest Processing
      if (message.agentId && message.data) {
        this.pulseBridge.ingestLive(message.agentId, message.data)
        this.world.tick(message.heliStamp)
      }

      // Temporal Mode Switching Command
      if (message.type === 'sf-modeSwitch') {
        this.setTemporalMode(message.mode, message.payload || {});
      }
    })
  }

  /**
  * ask Library for system active
  * @method askSystemStart
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
  */
  setSystemsStart(systemsLive) {
    // implementation of systems live mapping can go here
  }

  /**
  * listen for error on event triggered
  * @method eventErrorListen
  */
  eventErrorListen(refCont) {
    this.on('error', (err) => {
      console.error('Unexpected error on emitter', err)
    })
  }

  /**
  * Network Authorisation
  * @method networkAuthorisation
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
  */
  verifyRelease() {
    return true
  }

  /**
  * entity getter
  * @method entityGetter
  */
  entityGetter() {
    // Entity ingestion and component caching implementation
  }
}

export default SafeFlow