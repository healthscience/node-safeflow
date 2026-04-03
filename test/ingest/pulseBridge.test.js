import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PulseBridge } from '../../src/ingest/pulseBridge.js'
import { World } from '../../src/core/world.js'

describe('PulseBridge', () => {
  let world
  let pulseBridge

  beforeEach(() => {
    world = new World()
    pulseBridge = new PulseBridge(world)
  })

  it('should ingest live data for a registered agent', () => {
    const agentId = 'agent-1'
    const entityId = 'entity-1'
    const pulseData = { heart_rate: 75 }

    // Register agent
    world.registry.register(agentId, entityId)
    // Add entity to world
    const entity = { components: {} }
    world.entities.set(entityId, entity)

    pulseBridge.ingestLive(agentId, pulseData)

    expect(entity.components.Pulse).toBeDefined()
    expect(entity.components.Pulse.heart_rate).toBe(75)
    expect(entity.components.Pulse.lastUpdated).toBeDefined()
  })

  it('should warn and skip ingestion for unregistered agents', () => {
    const agentId = 'unregistered-agent'
    const pulseData = { heart_rate: 75 }
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    pulseBridge.ingestLive(agentId, pulseData)

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Agent ${agentId} not registered.`))
    consoleSpy.mockRestore()
  })

  it('should warn and skip ingestion if entity is not found for agent', () => {
    const agentId = 'agent-1'
    const entityId = 'entity-1'
    const pulseData = { heart_rate: 75 }
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    world.registry.register(agentId, entityId)
    // Not adding entity to world.entities

    pulseBridge.ingestLive(agentId, pulseData)

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Entity ${entityId} not found for agent ${agentId}.`))
    consoleSpy.mockRestore()
  })
})
