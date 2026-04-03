import { describe, it, expect, vi, beforeEach } from 'vitest'
import DataTidySystem from '../../../src/systems/pipeline/dataTidySystem.js'
import TidiedDataComponent from '../../../src/components/pipeline/tidiedDataComponent.js'

// Mock dependencies
vi.mock('../../../src/systems/data/tidydataSystem.js', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        tidyRawData: vi.fn()
      }
    })
  }
})

vi.mock('../../../src/components/pipeline/tidiedDataComponent.js', () => {
  return {
    default: vi.fn().mockImplementation((data, previousHash, hash) => {
      return { data, previousHash, hash }
    })
  }
})

describe('DataTidySystem', () => {
  let dataTidySystem

  beforeEach(() => {
    dataTidySystem = new DataTidySystem({})
  })

  it('should process entities with RawDataComponent and TidyRulesComponent and no TidiedDataComponent', async () => {
    const entity = {
      id: 'entity-1',
      rawData: { data: { raw: 'data' }, hash: 'raw-hash' },
      tidyRules: {
        rules: {
          source: 'source-rules',
          datatype: 'datatype-rules'
        }
      }
    }
    const entities = { 'entity-1': entity }

    dataTidySystem.tidySystem.tidyRawData.mockReturnValue({ tidied: 'data' })

    await dataTidySystem.update(entities)

    expect(dataTidySystem.tidySystem.tidyRawData).toHaveBeenCalledWith(
      'source-rules',
      'datatype-rules',
      { raw: 'data' }
    )
    expect(entity.tidiedData).toBeDefined()
    expect(entity.tidiedData.data).toEqual({ tidied: 'data' })
    expect(entity.tidiedData.previousHash).toBe('raw-hash')
    expect(entity.tidiedData.hash).toBeDefined()
  })

  it('should not process entities lacking RawDataComponent', async () => {
    const entity = {
      id: 'entity-1',
      tidyRules: { rules: {} }
    }
    const entities = { 'entity-1': entity }

    await dataTidySystem.update(entities)

    expect(dataTidySystem.tidySystem.tidyRawData).not.toHaveBeenCalled()
  })

  it('should not process entities lacking TidyRulesComponent', async () => {
    const entity = {
      id: 'entity-1',
      rawData: { data: {}, hash: 'hash' }
    }
    const entities = { 'entity-1': entity }

    await dataTidySystem.update(entities)

    expect(dataTidySystem.tidySystem.tidyRawData).not.toHaveBeenCalled()
  })

  it('should emit dataTidied event on success', async () => {
    const entity = {
      id: 'entity-1',
      rawData: { data: {}, hash: 'hash' },
      tidyRules: { rules: {} }
    }
    const entities = { 'entity-1': entity }
    dataTidySystem.tidySystem.tidyRawData.mockReturnValue({ some: 'tidied' })

    const spy = vi.fn()
    dataTidySystem.on('dataTidied', spy)

    await dataTidySystem.update(entities)

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      entityId: 'entity-1',
      hash: expect.any(String)
    }))
  })
})
