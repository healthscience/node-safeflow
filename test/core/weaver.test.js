import { describe, it, expect, beforeEach } from 'vitest'
import { World } from '../../src/core/world.js'
import { Weaver } from 'consilience-weave'

describe('Weaver Integration', () => {
  let world
  let weaver

  beforeEach(() => {
    world = new World()
    weaver = new Weaver()
  })

  it('should initialize with no active entities and return no active entities alert', () => {
    const report = weaver.weave(world.entities)
    expect(report.score).toBe(0)
    expect(report.alerts).toContain('No active entities found.')
  })

  it('should detect bifurcation (low coherence) with diverging phase angles', () => {
    // Adding entities with diverging phase angles
    world.entities.set('agent1', { components: { Geometry: { theta: 0 } } })
    world.entities.set('agent2', { components: { Geometry: { theta: Math.PI } } })

    const report = weaver.weave(world.entities)
    // Low coherence should trigger BIFURCATION alert
    expect(report.score).toBeLessThan(0.3)
    expect(report.alerts).toContain('BIFURCATION_DETECTED: High Dissonance across scales.')
  })

  it('should detect resonance peak (high coherence) with aligned phase angles', () => {
    // Adding entities with identical phase angles
    world.entities.set('agent1', { components: { Geometry: { theta: 0.5 } } })
    world.entities.set('agent2', { components: { Geometry: { theta: 0.51 } } })

    const report = weaver.weave(world.entities)
    // High coherence should trigger RESONANCE alert
    expect(report.score).toBeGreaterThan(0.8)
    expect(report.alerts).toContain('RESONANCE_PEAK_DETECTED: High Coherence across the weave.')
  })

  it('should ignore entities without Geometry or theta', () => {
    world.entities.set('agent1', { components: { Geometry: { theta: 0.5 } } })
    world.entities.set('agent2', { components: { SomethingElse: {} } })
    world.entities.set('agent3', { components: { Geometry: {} } })

    const report = weaver.weave(world.entities)
    // Should only count agent1, but weaver.weave needs at least one valid angle.
    // getConcentration with 1 angle should return a high score (1.0)
    expect(report.score).toBeGreaterThan(0.9)
  })
})
