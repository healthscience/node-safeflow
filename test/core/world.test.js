import { describe, it, expect, vi, beforeEach } from 'vitest'
import { World } from '../../src/core/world.js'

describe('World', () => {
  let world

  beforeEach(() => {
    world = new World()
  })

  it('should initialize with empty entities, systems, and a registry', () => {
    expect(world.entities).toBeInstanceOf(Map)
    expect(world.systems).toBeInstanceOf(Array)
    expect(world.registry).toBeDefined()
  })

  it('should add systems', () => {
    const mockSystem = { update: vi.fn() }
    world.addSystem(mockSystem)
    expect(world.systems).toContain(mockSystem)
  })

  it('should update all systems on tick', () => {
    const mockSystem1 = { update: vi.fn() }
    const mockSystem2 = { update: vi.fn() }
    world.addSystem(mockSystem1)
    world.addSystem(mockSystem2)

    const heliStamp = 123456789
    world.tick(heliStamp)

    expect(mockSystem1.update).toHaveBeenCalledWith(world.entities, expect.objectContaining({ heliStamp }))
    expect(mockSystem2.update).toHaveBeenCalledWith(world.entities, expect.objectContaining({ heliStamp }))
  })
})
