'use strict'

import { EventEmitter } from 'events'
import KBLedger from '../../kbl-cnrl/kbledger.js'

class LedgerSystem extends EventEmitter {
  constructor(apiCNRL, setIN) {
    super()
    this.ledger = new KBLedger(apiCNRL, setIN)
  }

  /**
  * Run the system on a collection of entities
  * @param {Object} entities - Map of entities
  */
  async update(entities) {
    for (const entityId in entities) {
      const entity = entities[entityId]
      
      // Logic: Query entities that have a ResultComponent but haven't been saved to the ledger yet
      if (entity.result && !entity.result.savedToLedger) {
        await this.processEntity(entity)
      }
    }
  }

  /**
  * Save evidence chain for a specific entity
  * @param {Object} entity 
  */
  async processEntity(entity) {
    try {
      // Extract the full hash chain (Proof of Work)
      const evidenceChain = {
        rawHash: entity.rawData?.hash,
        tidyHash: entity.tidiedData?.hash,
        resultHash: entity.result.hash,
        timestamp: entity.result.timestamp
      }

      // Save to Coherence Ledger
      await this.ledger.kbidEntrysave({
        entityId: entity.id,
        evidenceChain,
        result: entity.result.result
      })

      entity.result.savedToLedger = true
      this.emit('ledgerUpdated', { entityId: entity.id, hash: entity.result.hash })
    } catch (error) {
      console.error(`LedgerSystem error for entity ${entity.id}:`, error)
      this.emit('error', error)
    }
  }
}

export default LedgerSystem
