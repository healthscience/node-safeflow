// systems/emulationWeaveSystem.js
'use strict'

/**
 * SafeFlow Orrery System - Emulation Weave
 * Contains ZERO static math. Resolves data science executions entirely
 * by fetching reference targets from the twinned Library archive.
 */
export class EmulationWeaveSystem {
  constructor(emitter, library) {
    this.emitter = emitter
    this.library = library // The Twin Archive reference
    this.signature = [
      'LibraryReferenceComponent', 
      'ResonanceLedgerComponent', 
      'WeavePulseComponent'
    ]
  }

  update(registry) {
    const targets = registry.getEntitiesWith(this.signature)
    const targetCount = targets.length

    for (let i = 0; i < targetCount; i++) {
      const entityId = targets[i]
      const reference = registry.getComponent(entityId, 'LibraryReferenceComponent')
      const ledger = registry.getComponent(entityId, 'ResonanceLedgerComponent')
      const pulse = registry.getComponent(entityId, 'WeavePulseComponent')
      
      if (!ledger.entries || ledger.entries.length === 0) {
        registry.removeComponent(entityId, 'WeavePulseComponent')
        continue
      }

      // 1. Isolate the historical phase angles from the ledger component memory
      const angles = ledger.entries.map(entry => entry.theta).filter(t => t !== undefined)

      try {
        // 2. Twin Resolution: Resolve the compute script dynamically from the Library
        const runCompute = this.library.getExecutor(reference.contractId, reference.computeSignature)
        
        // 3. Emulation Execution: Calculate circular stats without caching logic in the loop
        const globalCoherence = runCompute(angles)
        
        ledger.globalCoherence = globalCoherence
        ledger.alerts = []

        // 4. Evaluate structural metrics
        if (globalCoherence < 0.3) {
          ledger.alerts.push("BIFURCATION_DETECTED: High Dissonance across scales.")
        } else if (globalCoherence > 0.8) {
          ledger.alerts.push("RESONANCE_PEAK_DETECTED: High Coherence across the weave.")
        }

        registry.updateComponent(entityId, 'ResonanceLedgerComponent', ledger)

        if (ledger.alerts.length > 0) {
          this.emitter.emit('attunement-alert', {
            entityId,
            contractId: reference.contractId,
            score: globalCoherence,
            cycleIndex: pulse.cycleIndex,
            alerts: ledger.alerts
          })
        }
      } catch (error) {
        console.error(`[Weave Engine failure on Entity ${entityId}]:`, error.message)
      } finally {
        // 5. Strip the volatile pulse instantly
        registry.removeComponent(entityId, 'WeavePulseComponent')
      }
    }
  }
}