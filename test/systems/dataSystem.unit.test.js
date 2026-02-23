import { describe, it, expect, vi } from 'vitest'
import DataSystem from '../../src/systems/data/dataSystem.js'

// Mock the dependencies
vi.mock('../../src/systems/data/dataprotocols/rest/index.js', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        RESTbuilder: vi.fn(),
        COMPUTEbuilder: vi.fn(),
        saveResults: vi.fn()
      }
    })
  }
})

vi.mock('../../src/systems/data/dataprotocols/sqlite/index.js', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        SQLitebuilderPromise: vi.fn()
      }
    })
  }
})

vi.mock('../../src/systems/data/dataprotocols/json/index.js', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        jsonFilebuilder: vi.fn()
      }
    })
  }
})

vi.mock('../../src/systems/data/dataprotocols/csv/index.js', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        csvTimeFilter: vi.fn()
      }
    })
  }
})

describe('DataSystem', () => {
  it('should initialize correctly', () => {
    const dataSystem = new DataSystem({})
    expect(dataSystem).toBeDefined()
    expect(dataSystem.liveRestStorage).toBeDefined()
    expect(dataSystem.liveSQLiteStorage).toBeDefined()
    expect(dataSystem.liveJSONStorage).toBeDefined()
    expect(dataSystem.liveCSVStorage).toBeDefined()
  })

  it('should call RESTbuilder when type is REST', async () => {
    const dataSystem = new DataSystem({})
    const mockRestBuilder = vi.spyOn(dataSystem.liveRestStorage, 'RESTbuilder')
    mockRestBuilder.mockResolvedValue(['rest-data'])

    const result = await dataSystem.datatypeQueryMapping('REST', 'hash', 'sourceInfo', {}, {}, {}, {})
    expect(mockRestBuilder).toHaveBeenCalledWith('sourceInfo', 'hash')
    expect(result).toEqual(['rest-data'])
  })

  it('should call SQLitebuilderPromise when type is SQLITE', async () => {
    const dataSystem = new DataSystem({})
    const mockSQLiteBuilder = vi.spyOn(dataSystem.liveSQLiteStorage, 'SQLitebuilderPromise')
    mockSQLiteBuilder.mockResolvedValue(['sqlite-data'])

    const result = await dataSystem.datatypeQueryMapping('SQLITE', 'hash', 'sourceInfo', { device_mac: 'mac' }, {}, {}, {})
    expect(mockSQLiteBuilder).toHaveBeenCalledWith('sourceInfo', 'mac')
    expect(result).toEqual(['sqlite-data'])
  })

  it('should call saveResults when saveSystem is called', async () => {
    const dataSystem = new DataSystem({})
    const mockSaveResults = vi.spyOn(dataSystem.liveRestStorage, 'saveResults')
    mockSaveResults.mockResolvedValue(true)

    const result = await dataSystem.saveSystem('api', 'data')
    expect(mockSaveResults).toHaveBeenCalledWith('api', 'data')
    expect(result).toBe(true)
  })
})
