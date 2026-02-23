import { describe, it, expect } from 'vitest'
import TimeSystem from '../../src/systems/time/timeSystem.js'

describe('TimeSystem', () => {
  it('should initialize correctly', () => {
    const timeSystem = new TimeSystem()
    expect(timeSystem).toBeDefined()
  })

  it('should return a numeric timestamp for setRealtime', () => {
    const timeSystem = new TimeSystem()
    const now = timeSystem.setRealtime()
    expect(typeof now).toBe('number')
    expect(now).toBeGreaterThan(0)
  })

  it('should build a time range correctly', () => {
    const timeSystem = new TimeSystem()
    const startTime = 1600000000000 // Some fixed timestamp
    const endTime = startTime + (86400000 * 2) // 2 days later
    const segment = 86400000 // 1 day in ms

    const range = timeSystem.sourceTimeRange(startTime, endTime, segment)
    expect(range).toHaveLength(3) // start, start+1, start+2
    expect(range[0]).toBe(startTime)
    expect(range[2]).toBe(endTime)
  })

  it('should return last timestamp from data object', () => {
    const timeSystem = new TimeSystem()
    const data = { timestamp: 12345 }
    expect(timeSystem.timeOrderLast(data)).toBe(12345)
    expect(timeSystem.timeOrderLast(undefined)).toBe(0)
  })
})
