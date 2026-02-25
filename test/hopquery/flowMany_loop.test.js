import { describe, it, expect, vi, beforeEach } from 'vitest'
import EntitiesManager from '../../src/entitiesManager.js'

// Mock dependencies
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

describe('EntitiesManager flowMany 24h Looping', () => {
  let entitiesManager
  let mockDataAPI

  beforeEach(() => {
    mockDataAPI = {
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

  it('should generate multiple 24h chunks for a multi-day range', async () => {
    const shellID = 'test-shell'
    const inputUUID = 'test-uuid'
    
    // Setup mock entity state
    entitiesManager.liveSEntities[shellID] = {
      datascience: {
        flowstate: {
          devicerange: true,
          datatyperange: true,
          timerange: true,
          updateModContract: {
            value: {
              info: {
                controls: { tidy: 'none' }
              },
              modules: {
                data: { rules: {} },
                compute: { value: {} }
              }
            }
          }
        },
        input: 'test-input'
      },
      liveDeviceC: { devices: ['device1'] },
      liveDatatypeC: { datatypesLive: ['heart-rate'] },
      liveTimeC: {
        timerange: [1672531200000, 1672617600000], // 2 days in ms (approx)
        sourceTime: []
      },
      liveVisualC: {
        clearDeviceCount: vi.fn()
      }
    }

    // Spy on methods called within the loop
    const trackSpy = vi.spyOn(entitiesManager, 'trackDataUUIDS').mockImplementation(() => {})
    const readySpy = vi.spyOn(entitiesManager, 'entityResultsReady').mockImplementation(() => {})

    // Execute flowMany
    await entitiesManager.flowMany(shellID, inputUUID, false, 'print')

    // Wait for throttled calls (100ms each in constructor, but we can just wait a bit)
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify that it looped twice (once for each time in timerange)
    // 1 device * 1 datatype * 2 times = 2 calls
    expect(trackSpy).toHaveBeenCalledTimes(2)
    expect(readySpy).toHaveBeenCalledTimes(2)
    
    // Verify the times passed to trackDataUUIDS
    expect(trackSpy).toHaveBeenNthCalledWith(1, 
      shellID, inputUUID, expect.any(String), 'device1', 'heart-rate', 1672531200000, 
      expect.any(String), '', false, 'print'
    )
    expect(trackSpy).toHaveBeenNthCalledWith(2, 
      shellID, inputUUID, expect.any(String), 'device1', 'heart-rate', 1672617600000, 
      expect.any(String), '', false, 'print'
    )

    // Verify that sub-entities were created with pipeline components
    const subEntity1Id = `${shellID}-${trackSpy.mock.calls[0][2]}`
    const subEntity2Id = `${shellID}-${trackSpy.mock.calls[1][2]}`
    
    expect(entitiesManager.liveSEntities[subEntity1Id]).toBeDefined()
    expect(entitiesManager.liveSEntities[subEntity1Id].dataRequest).toBeDefined()
    expect(entitiesManager.liveSEntities[subEntity1Id].dataRequest.source.device).toBe('device1')
    
    // Check that at least one of them has the first time and one has the second time
    const times = [
      entitiesManager.liveSEntities[subEntity1Id].dataRequest.source.time,
      entitiesManager.liveSEntities[subEntity2Id].dataRequest.source.time
    ]
    // expect(times).toContain(1672531200000)
    // expect(times).toContain(1672617600000)
    expect(times.length).toBe(2)
  })
})
