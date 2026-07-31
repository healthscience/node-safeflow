'use strict'

export class StoryReceiver {
  constructor(libraryManager, resonanceConduction, safeFlowInstance) {
    this.library = libraryManager;
    this.conduction = resonanceConduction;
    this.safeFlow = safeFlowInstance;
  }

  /**
   * Translates an incoming HOPStory or expanded bundle into the twinned framework.
   * Pipeline: Story -> Interplay -> Emulation
   */
  handleIncomingStory(hopStory) {
    console.log(`[StoryReceiver] Processing HOPStory for Contract: ${hopStory}`);
    // console.log('library memory map')
    // console.log(this.library.seedLibrary.libMemory.contracts)
    // 1. Stage 1: Story (expand reference contracts)
    let expandExoCue = this.exoCuePrepare(hopStory.exoCue[0])
    // let sourceData = this.overlayDataPrepare(hopStory.Instrument)
    // let emulation = this.emulationMatch(hopStory.emulation)

    // 2. register    
    /*if (!this.library.contracts.has(hopStory.id)) {
      this.library.registerContract(hopStory.id, {
        version: hopStory.version || '1.0.0',
        executors: {
          'von_mises_phase_check': hopStory.computeLogic 
        }
      });
    }*/

    // 2. Stage 2: Interplay (Conduction Map & Tracking Footprint)
    const trackId = this.conduction.establishTrack({
      id: hopStory.id,
      tempo: hopStory.tempo,           
      scale: hopStory.scale,           
      cues: hopStory.cues,             
      targetDelta: hopStory.targetDelta
    });

    // 3. Stage 3: Emulation (SafeFlow-ECS Ingestion & Pulse Synchronization)
    if (hopStory.bundle && this.safeFlow) {
      // If the Story carries a complete bundle from the Sculpting Lab, ingest directly
      return this.safeFlow.ingestHOPstoryBundle(hopStory.bundle);
    } else if (this.safeFlow) {
      // Otherwise, register the lightweight Story footprint directly into the orrery
      return this.safeFlow.saveAndRegisterExoCue(
        trackId, 
        hopStory.orgoSpecs || null, 
        hopStory.gelleSpecs || null
      );
    }

    return trackId;
  }

  /**
   * 
   * @method exoCuePrepare
  */
  exoCuePrepare (exoKey) {
    let exoCueContract = {}
    // look up library memory map
    let libMemCheck = this.library.seedLibrary.libMemory.get(exoKey)
    console.log('prep exoCue to orgo and gelle')
    console.log(libMemCheck.computational)
    let orgoContract = this.library.seedLibrary.libMemory.get(libMemCheck.computational.organelles.orgo[0])
    console.log('orogoogogo')
    console.log(orgoContract)
    let gelleContract = this.library.seedLibrary.libMemory.get(libMemCheck.computational.organelles.gelle[0])
    exoCueContract.exocue = libMemCheck
    exoCueContract.orgo = orgoContract
    exoCueContract.gelle = gelleContract
    console.log('exo cue orgo gelle extract???')
    console.log(exoCueContract)
    return exoCueContract
  }

  /**
   * 
   * @method overlayDataPrepare
   */
  overlayDataPrepare (sourcePath) {
    let overlayData = this.library.seedLibrary.libMemory.get(sourcePath)
    return overlayData
  }


  /**
   * 
   * @emulationMatch
   *  
  */
  emulationMatch (world) {
    let emulationWorld = {}
    if (world === 'body') {
      emulationWorld = this.emulationWorldBody()
    }
    return emulationWorld
  }

  emulationWorldBody () {
    // 2. EMULATION WORLD & VIEWPORT
    let emulationWorld = {
      targetDomain: 'body',
      viewport: {
        pixelWidth: 800,
        pixelHeight: 1000,
        aspectRatio: 0.8
      },
      coordinateFrame: {
        origin: [0, 0, 0],
        scaleUnit: 'radia',
        scaleValue: 1.0
      }
    }
    return emulationWorld
  }

}

export default StoryReceiver