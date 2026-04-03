import { describe, it, expect, vi, beforeEach } from 'vitest'
import ComputeSystem from '../../../src/systems/compute/computeSystem.js'
import ResultComponent from '../../../src/components/pipeline/resultComponent.js'

// Mock dependencies
vi.mock('compute-engine', () => {
  return {
    default: {
      checkRegistered: vi.fn(),
      checkLoaded: vi.fn(),
      loadModelFromContract: vi.fn(),
      registerModelLoader: vi.fn(),
      jsLoader: vi.fn(),
      wasmLoader: vi.fn(),
      models: new Map()
    },
    registerModelLoader: vi.fn()
  }
})

vi.mock('../../../src/components/pipeline/resultComponent.js', () => {
  return {
    default: vi.fn().mockImplementation((result, previousHash, hash) => {
      return { result, previousHash, hash, timestamp: Date.now() }
    })
  }
})

describe('ComputeSystem', () => {
  let computeSystem

  beforeEach(() => {
    computeSystem = new ComputeSystem({})
  })

  it('should process entities with TidiedDataComponent and ComputeContractComponent and no ResultComponent', async () => {
    const entity = {
      id: 'entity-1',
      tidiedData: { data: { tidied: 'data' }, hash: 'tidy-hash' },
      computeContract: {
        contract: {
          value: {
            computational: {
              name: 'observation',
              mode: 'javascript',
              hash: 'obs-hash'
            }
          }
        }
      }
    }
    const entities = { 'entity-1': entity }

    await computeSystem.update(entities)

    expect(entity.result).toBeDefined()
    expect(entity.result.result.result).toEqual({ tidied: 'data' })
    expect(entity.result.previousHash).toBe('tidy-hash')
    expect(entity.result.hash).toBeDefined()
  })

  it('should not process entities lacking TidiedDataComponent', async () => {
    const entity = {
      id: 'entity-1',
      computeContract: { contract: {} }
    }
    const entities = { 'entity-1': entity }

    await computeSystem.update(entities)

    // No assertion needed other than no error and no result added
    expect(entity.result).toBeUndefined()
  })

  it('should emit computeCompleted event on success', async () => {
    const entity = {
      id: 'entity-1',
      tidiedData: { data: {}, hash: 'hash' },
      computeContract: {
        contract: {
          value: {
            computational: { name: 'observation' }
          }
        }
      }
    }
    const entities = { 'entity-1': entity }

    const spy = vi.fn()
    computeSystem.on('computeCompleted', spy)

    await computeSystem.update(entities)

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      entityId: 'entity-1',
      hash: expect.any(String)
    }))
  })
})
