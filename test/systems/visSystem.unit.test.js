import { describe, it, expect, vi } from 'vitest'
import VisSystem from '../../src/systems/visual/visSystem.js'

// Mock dependencies
vi.mock('../../src/systems/visual/charts/chartSystem.js', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        chartjsControl: vi.fn(),
        structureMulitChartData: vi.fn(),
        structureOverlayChartData: vi.fn()
      }
    })
  }
})

vi.mock('../../src/systems/visual/table/tableSystem.js', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        structureTableData: vi.fn()
      }
    })
  }
})

describe('VisSystem', () => {
  it('should initialize correctly', () => {
    const visSystem = new VisSystem()
    expect(visSystem).toBeDefined()
    expect(visSystem.liveChartSystem).toBeDefined()
    expect(visSystem.liveTableSystem).toBeDefined()
  })

  it('should call chartjsControl when contract name is chartjs', () => {
    const visSystem = new VisSystem()
    const mockChartControl = vi.spyOn(visSystem.liveChartSystem, 'chartjsControl')
    mockChartControl.mockReturnValue({ chart: 'data' })

    const contract = { value: { computational: { name: 'chartjs' } } }
    const result = visSystem.visualControl({}, contract, {}, {}, {})
    
    expect(mockChartControl).toHaveBeenCalled()
    expect(result).toEqual({ chart: 'data' })
  })

  it('should call structureMulitChartData when format is timeseries', () => {
    const visSystem = new VisSystem()
    const mockStructure = vi.spyOn(visSystem.liveChartSystem, 'structureMulitChartData')
    mockStructure.mockReturnValue({ structured: 'data' })

    const type = { format: 'timeseries' }
    const result = visSystem.singlemultiControl(type, {}, {}, 'hash', [], [], [])
    
    expect(mockStructure).toHaveBeenCalled()
    expect(result).toEqual({ structured: 'data' })
  })
})
