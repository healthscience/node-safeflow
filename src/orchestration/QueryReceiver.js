// orchestration/QueryReceiver.js
'use strict'

export class QueryReceiver {
  constructor(libraryManager, resonanceConduction) {
    this.library = libraryManager;
    this.conduction = resonanceConduction;
  }

  /**
   * Translates an incoming HOPquery intent into the twinned framework
   */
  handleIncomingQuery(hopQuery) {
    console.log(`[QueryReceiver] Processing HOPquery for Contract: ${hopQuery.id}`);

    // 1. Ensure the computational blueprint is preserved in the Library (Story)
    if (!this.library.contracts.has(hopQuery.id)) {
      this.library.registerContract(hopQuery.id, {
        version: hopQuery.version || '1.0.0',
        executors: {
          // The deterministic math rules mapped to a clean signature
          'von_mises_phase_check': hopQuery.computeLogic 
        }
      });
    }

    // 2. Conduction maps the volatile tracking footprint into SafeFlow-ECS (Interplay)
    const entityId = this.conduction.establishTrack({
      id: hopQuery.id,
      tempo: hopQuery.tempo,           // e.g., 'daily', 'seasonal'
      scale: hopQuery.scale,           // e.g., 'meso'
      cues: hopQuery.cues,             // e.g., ['/local/telemetry/mesh_0']
      targetDelta: hopQuery.targetDelta
    });

    return entityId;
  }
}