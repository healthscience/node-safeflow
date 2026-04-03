import { describe, it, expect, vi, beforeEach } from 'vitest'
import DataFetchSystem from '../../../src/systems/pipeline/dataFetchSystem.js'
import DataRequestComponent from '../../../src/components/pipeline/dataRequestComponent.js'

// Mock dependencies
vi.mock('../../../src/systems/data/dataSystem.js', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        datatypeQueryMapping: vi.fn()
      }
    })
  }
})

vi.mock('../../../src/components/pipeline/rawDataComponent.js', () => {
  return {
    default: vi.fn().mockImplementation((data, hash) => {
      return { data, hash }
    })
  }
})

describe('DataFetchSystem', () => {
  let dataFetchSystem
  let mockDataAPI

  beforeEach(() => {
    mockDataAPI = {}
    dataFetchSystem = new DataFetchSystem(mockDataAPI)
  })

  it('should process entities with DataRequestComponent and no RawDataComponent', async () => {
    const entity = {
      id: 'entity-1',
      dataRequest: {
        source: {
          type: 'REST',
          hash: 'source-hash',
          info: 'source-info',
          device: 'device',
          datatype: 'datatype',
          time: 123456789,
          contract: 'contract'
        }
      }
    }
    const entities = { 'entity-1': entity }

    dataFetchSystem.dataSystem.datatypeQueryMapping.mockResolvedValue({ heart_rate: 70 })

    await dataFetchSystem.update(entities)

    expect(dataFetchSystem.dataSystem.datatypeQueryMapping).toHaveBeenCalledWith(
      'REST',
      'source-hash',
      'source-info',
      'device',
      'datatype',
      123456789,
      'contract'
    )
    expect(entity.rawData).toBeDefined()
    expect(entity.rawData.data).toEqual({ heart_rate: 70 })
    expect(entity.rawData.hash).toBeDefined()
  })

  it('should not process entities already having RawDataComponent', async () => {
    const entity = {
      id: 'entity-1',
      dataRequest: {},
      rawData: { hash: 'existing-hash' }
    }
    const entities = { 'entity-1': entity }

    await dataFetchSystem.update(entities)

    expect(dataFetchSystem.dataSystem.datatypeQueryMapping).not.toHaveBeenCalled()
  })

  it('should not process entities without DataRequestComponent', async () => {
    const entity = {
      id: 'entity-1'
    }
    const entities = { 'entity-1': entity }

    await dataFetchSystem.update(entities)

    expect(dataFetchSystem.dataSystem.datatypeQueryMapping).not.toHaveBeenCalled()
  })

  it('should emit dataFetched event on success', async () => {
    const entity = {
      id: 'entity-1',
      dataRequest: { source: {} }
    }
    const entities = { 'entity-1': entity }
    dataFetchSystem.dataSystem.datatypeQueryMapping.mockResolvedValue({ some: 'data' })

    const spy = vi.fn()
    dataFetchSystem.on('dataFetched', spy)

    await dataFetchSystem.update(entities)

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      entityId: 'entity-1',
      hash: expect.any(String)
    }))
  })
})
