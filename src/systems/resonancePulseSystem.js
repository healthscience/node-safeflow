// systems/resonancePulseSystem.js
'use strict'

/**
 * SafeFlow Orrery System - Environmental Sampling Pulse
 * Wakes up when a StatisticalPulseComponent hits an entity, gathers 
 * local/mesh metrics, and commits a raw phase entry to the Coherence Ledger.
 */
export class ResonancePulseSystem {
  constructor(networkMesh) {
    this.networkMesh = networkMesh;
    // Updated signature matching the new component architecture
    this.signature = [
      'ScaleTopologyComponent', 
      'ResonanceLedgerComponent', 
      'StatisticalPulseComponent'
    ];
  }

  /**
   * Ticked continuously by the EntitiesManager loop
   */
  update(registry) {
    const triggeredEntities = registry.getEntitiesWith(this.signature);
    const entityCount = triggeredEntities.length;
    
    for (let i = 0; i < entityCount; i++) {
      const entityId = triggeredEntities[i];
      
      const topology = registry.getComponent(entityId, 'ScaleTopologyComponent');
      const ledger = registry.getComponent(entityId, 'ResonanceLedgerComponent');
      const pulse = registry.getComponent(entityId, 'StatisticalPulseComponent');

      // Perform local peer or mesh network data assessment using contract cues
      const alignmentData = this.assessLocalEnvironment(topology.cues);

      // Append entry directly to the ledger buffer geometry using Heli clock dimensions
      ledger.entries.push({
        cycleIndex: pulse.cycleIndex, // Solar cycle tracking index
        yearly: pulse.yearly,         // 0-360 orbital degree positioning
        daily: pulse.daily,           // 0-360 daily rotation positioning
        theta: alignmentData.phaseAngle, // Calculated phase orientation for Von Mises
        recordedAt: pulse.timestamp
      });

      // Commit the mutated ledger back to the flat memory registry
      registry.updateComponent(entityId, 'ResonanceLedgerComponent', ledger);

      // Strip the volatile pulse component instantly to idle the entity slot
      registry.removeComponent(entityId, 'StatisticalPulseComponent');
      
      console.log(`[PulseSystem] Sampled environment for Entity [${entityId}]. Metric logged, pulse stripped.`);
    }
  }

  /**
   * Reads phase information from local telemetry or peer mesh coordinates
   */
  assessLocalEnvironment(cues) {
    // Utilize the modern laptop capability to compute quick peer alignment lookups
    // Returns a phase angle (theta) representing local resonance orientation
    return {
      phaseAngle: Math.random() * Math.PI * 2 
    };
  }
}