import { describe, it, expect, vi, beforeEach } from 'vitest'
import EntitiesManager from '../../src/entitiesManager.js'

// Mock dependencies that interact with external systems
vi.mock('../../src/systems/data/dataprotocols/rest/index.js', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        RESTbuilder: vi.fn().mockResolvedValue([{ Date: '2023-01-01 12:00', heart_rate: 70 }]),
        COMPUTEbuilder: vi.fn().mockResolvedValue([{ Date: '2023-01-01 12:00', heart_rate: 70 }])
      }
    })
  }
})

vi.mock('../../src/kbl-cnrl/kblStorage.js', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        saveKBID: vi.fn().mockResolvedValue(true),
        getKBLindex: vi.fn().mockResolvedValue([])
      }
    })
  }
})

describe('End-to-End HOPquery Pipeline', () => {
  let entitiesManager

  beforeEach(() => {
    const mockDataAPI = {
      DriveFiles: {
        testDataExtact: vi.fn().mockReturnValue(1672574400000),
        hyperdriveLocalfile: vi.fn().mockResolvedValue('/tmp/test.db'),
        drive: {
          get: vi.fn().mockResolvedValue(Buffer.from('{"data":[]}'))
        }
      },
      BeeData: {
        get: vi.fn().mockResolvedValue({ value: [{ Date: '2023-01-01 12:00', heart_rate: 70 }] }),
        put: vi.fn().mockResolvedValue(true),
        createReadStream: vi.fn().mockReturnValue({
          [Symbol.asyncIterator]: async function* () {
            yield { value: { Date: '2023-01-01 12:00', heart_rate: 70 } }
          }
        })
      }
    }
    entitiesManager = new EntitiesManager(mockDataAPI)
  })

  it('should process a full HOPquery cycle through the ECS pipeline', async () => {
    const hopQuery = {
      exp: { key: 'heart-science-experiment', name: 'Heart Study' },
      modules: {
        data: {
          type: 'REST',
          info: { namespace: 'http://api.health', path: '/data/' },
          device: { id: 'peer1-device', device_mac: 'AA:BB:CC' },
          datatype: 'heart-rate',
          time: 1672574400000,
          rules: {
            source: { tidydt: { status: 'none' } },
            datatype: { column: 'heart_rate' }
          }
        },
        compute: {
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

    // 1. Start the pipeline
    const result = await entitiesManager.peerInput(hopQuery)
    expect(result.status).toBe('pipeline_started')
    const entityId = result.shellID
    const entity = entitiesManager.liveSEntities[entityId]

    expect(entity.dataRequest).toBeDefined()
    expect(entity.computeContract).toBeDefined()

    // 2. Manually trigger ticks to advance the pipeline
    
    // Tick 1: DataFetchSystem
    await entitiesManager.tick()
    expect(entity.rawData).toBeDefined()
    expect(entity.rawData.hash).toBeDefined()

    // Tick 2: DataTidySystem
    await entitiesManager.tick()
    expect(entity.tidiedData).toBeDefined()
    expect(entity.tidiedData.previousHash).toBe(entity.rawData.hash)

    // Tick 3: ComputeSystem
    await entitiesManager.tick()
    expect(entity.result).toBeDefined()
    expect(entity.result.previousHash).toBe(entity.tidiedData.hash)

    // Tick 4: LedgerSystem
    await entitiesManager.tick()
    expect(entity.result.savedToLedger).toBe(true)

    // Final Verification of the Evidence Chain
    expect(entity.result.hash).toBeDefined()
    console.log('Pipeline completed successfully with hash chain:', {
      raw: entity.rawData.hash,
      tidy: entity.tidiedData.hash,
      result: entity.result.hash
    })
  })
})
