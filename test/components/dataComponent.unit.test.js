import { describe, it, expect, vi } from 'vitest'
import DataComponent from '../../src/components/dataComponent.js'

// Mock dependencies
vi.mock('../../src/systems/data/dataSystem.js', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        getLiveDevices: vi.fn().mockReturnValue(['mac1']),
        datatypeQueryMapping: vi.fn().mockResolvedValue([{ val: 1 }])
      }
    })
  }
})

vi.mock('../../src/systems/data/tidydataSystem.js', () => {
  return { default: vi.fn() }
})
vi.mock('../../src/systems/data/filterdataSystem.js', () => {
  return { default: vi.fn() }
})
vi.mock('../../src/systems/data/categorydataSystem.js', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        categorySorter: vi.fn().mockReturnValue([{ val: 1 }])
      }
    })
  }
})

describe('DataComponent', () => {
  it('should initialize correctly', () => {
    const dataComponent = new DataComponent({})
    expect(dataComponent).toBeDefined()
    expect(dataComponent.liveDataSystem).toBeDefined()
  })

  it('should set devices live', async () => {
    const dataComponent = new DataComponent({})
    dataComponent.did = { devices: [] }
    await dataComponent.setDevicesLive()
    expect(dataComponent.deviceList).toEqual(['mac1'])
  })

  it('should handle DataControlFlow', async () => {
    const dataComponent = new DataComponent({})
    const source = { categorydt: { status: 'none' }, tidydt: { status: 'none' } }
    const dataPrint = { hash: 'hash1', triplet: { device: {}, datatype: {}, timeout: 0 } }
    const contract = { value: { info: { controls: { tidy: false } } } }
    
    const result = await dataComponent.DataControlFlow(source, {}, contract, 'hash', dataPrint)
    expect(result).toBe(true)
    expect(dataComponent.dataRaw['hash1']).toBeDefined()
  })
})
