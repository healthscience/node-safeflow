import { describe, it, expect, vi, beforeEach } from 'vitest'
import LedgerSystem from '../../../src/systems/pipeline/ledgerSystem.js'

// Mock dependencies
vi.mock('../../../src/kbl-cnrl/kbledger.js', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        kbidEntrysave: vi.fn().mockResolvedValue(true)
      }
    })
  }
})

describe('LedgerSystem', () => {
  let ledgerSystem

  beforeEach(() => {
    ledgerSystem = new LedgerSystem({}, {})
  })

  it('should process entities with ResultComponent and not yet saved to ledger', async () => {
    const entity = {
      id: 'entity-1',
      rawData: { hash: 'raw-hash' },
      tidiedData: { hash: 'tidy-hash' },
      result: {
        hash: 'result-hash',
        result: { data: 'final' },
        timestamp: 123456789,
        savedToLedger: false
      }
    }
    const entities = { 'entity-1': entity }

    await ledgerSystem.update(entities)

    expect(ledgerSystem.ledger.kbidEntrysave).toHaveBeenCalledWith({
      entityId: 'entity-1',
      evidenceChain: {
        rawHash: 'raw-hash',
        tidyHash: 'tidy-hash',
        resultHash: 'result-hash',
        timestamp: 123456789
      },
      result: { data: 'final' }
    })
    expect(entity.result.savedToLedger).toBe(true)
  })

  it('should not process entities already saved to ledger', async () => {
    const entity = {
      id: 'entity-1',
      result: { savedToLedger: true }
    }
    const entities = { 'entity-1': entity }

    await ledgerSystem.update(entities)

    expect(ledgerSystem.ledger.kbidEntrysave).not.toHaveBeenCalled()
  })

  it('should emit ledgerUpdated event on success', async () => {
    const entity = {
      id: 'entity-1',
      result: {
        hash: 'result-hash',
        savedToLedger: false
      }
    }
    const entities = { 'entity-1': entity }

    const spy = vi.fn()
    ledgerSystem.on('ledgerUpdated', spy)

    await ledgerSystem.update(entities)

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      entityId: 'entity-1',
      hash: 'result-hash'
    }))
  })
})
