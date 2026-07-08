// systems/cryptographicChainSystem.js
'use strict'

import { createHash } from 'crypto'

/**
 * SafeFlow Orrery System - Cryptographic Chain
 * Seals verified temporal ledger entries into an immutable chain of hashes.
 * Establishes the integrity verification layer for decentralized machine learning.
 */
export class CryptographicChainSystem {
  constructor() {
    // Upgraded signature to align with the twinned Library and pulse spectrum
    this.signature = [
      'LibraryReferenceComponent', 
      'ResonanceLedgerComponent', 
      'CoherencePulseComponent'
    ];
  }

  /**
   * Ticked continuously by the EntitiesManager loop.
   * Runs whenever a solar cycle closure flags an entity with a CoherencePulseComponent.
   */
  update(registry) {
    const targetEntities = registry.getEntitiesWith(this.signature);
    const entityCount = targetEntities.length;

    for (let i = 0; i < entityCount; i++) {
      const entityId = targetEntities[i];
      const reference = registry.getComponent(entityId, 'LibraryReferenceComponent');
      const ledger = registry.getComponent(entityId, 'ResonanceLedgerComponent');
      const pulse = registry.getComponent(entityId, 'CoherencePulseComponent');

      // 1. Isolate entries belonging to the current cycle that lack a block hash
      const openEntries = ledger.entries.filter(e => !e.blockHash);
      if (openEntries.length === 0) {
        // Strip the pulse to idle the system if no work is pending
        registry.removeComponent(entityId, 'CoherencePulseComponent');
        continue;
      }

      // 2. Fetch the previous block hash to secure the unalterable link
      const previousHash = ledger.lastBlockHash || '00000000000000000000000000000000';

      // 3. Serialize the day's local phase metrics using the upgraded Heli coordinate properties
      const dataPayload = JSON.stringify({
        previousHash,
        contractId: reference.contractId,
        cycleIndex: pulse.cycleIndex,
        globalCoherence: ledger.globalCoherence,
        // Synchronized with the updated ResonancePulseSystem schema
        features: openEntries.map(e => ({
          t: e.theta,
          y: e.yearly,
          d: e.daily
        }))
      });

      // 4. Generate the deterministic SHA-256 block hash
      const currentHash = createHash('sha256').update(dataPayload).digest('hex');

      // 5. Immutable lock: Seal the entries and advance the ledger chain state
      const entryCountOpen = openEntries.length;
      for (let j = 0; j < entryCountOpen; j++) {
        openEntries[j].blockHash = currentHash;
      }
      
      ledger.lastBlockHash = currentHash;
      ledger.lastSealedCycle = pulse.cycleIndex;

      // 6. Commit the mutated ledger state back to the memory pool
      registry.updateComponent(entityId, 'ResonanceLedgerComponent', ledger);
      
      // 7. Strip the cryptographic pulse to return the system slot to idle
      registry.removeComponent(entityId, 'CoherencePulseComponent');
      
      console.log(`[ML-Chain] Sealed Ledger Day [${pulse.cycleIndex}] for Contract [${reference.contractId}]. Hash: ${currentHash.substring(0, 8)}...`);
    }
  }
}