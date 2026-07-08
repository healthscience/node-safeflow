// library/LibraryManager.js
'use strict'

import { getConcentration } from '../math/VonMises.js'

/**
 * The Library (The Story)
 * Holds the deterministic computational blueprints and data-tidy rules.
 */
export class LibraryManager {
  constructor() {
    this.contracts = new Map()
    this.bootstrapBaseContracts()
  }

  bootstrapBaseContracts() {
    // Register the pristine v1 baseline contract
    this.registerContract('besearch_alpha_v1', {
      version: '1.0.0',
      executors: {
        'von_mises_phase_check': (angles) => {
          return getConcentration(angles)
        }
      }
    })
  }

  registerContract(id, contractPayload) {
    this.contracts.set(id, contractPayload)
  }

  getExecutor(contractId, signature) {
    const contract = this.contracts.get(contractId)
    if (!contract) throw new Error(`[Library] Cryptographic breakdown: Contract [${contractId}] not found in static archive.`)
    
    const executor = contract.executors[signature]
    if (!executor) throw new Error(`[Library] Signature mismatch: Execution rule [${signature}] missing.`)
    
    return executor
  }
}