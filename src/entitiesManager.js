'use strict'

/**
 * SafeFlow Orrery - Micro ECS Entities Manager
 * Optimized for local-first conduction and zero-allocation continuous emulation.
 */
export class EntitiesManager {
  constructor() {
    // Upgraded to Map for high-performance, zero-allocation iteration
    this.entities = new Map()  
    this.systems = []          
    this.entityCounter = 0
    this.isLooping = false
    this.intervalId = null
  }

  /**
   * Spawns a clean, unique entity slot in the local memory fabric
   * @returns {string} Unique entity identifier
   */
  createEntity() {
    this.entityCounter++
    const entityId = `e_${Date.now()}_${this.entityCounter}`
    this.entities.set(entityId, {})
    return entityId
  }

  /**
   * Wipes an entity and all its attached components completely to free memory
   */
  destroyEntity(entityId) {
    return this.entities.delete(entityId)
  }

  /**
   * Instantly attaches or mutates a component state on an entity
   */
  addComponent(entityId, componentName, dataObject = {}) {
    const entity = this.entities.get(entityId)
    if (!entity) return false
    
    entity[componentName] = dataObject
    return true
  }

  /**
   * Safely updates an existing component's references
   */
  updateComponent(entityId, componentName, dataObject) {
    const entity = this.entities.get(entityId)
    if (entity) {
      entity[componentName] = dataObject
      return true
    }
    return false
  }

  /**
   * Strips a component away, returning the entity slot to an idle state
   */
  removeComponent(entityId, componentName) {
    const entity = this.entities.get(entityId)
    if (entity && entity[componentName] !== undefined) {
      delete entity[componentName]
      return true
    }
    return false
  }

  /**
   * Retrieves a component configuration from an entity slot
   */
  getComponent(entityId, componentName) {
    const entity = this.entities.get(entityId)
    return entity ? entity[componentName] : undefined
  }

  /**
   * High-performance signature query. Fast map iteration to find matching 
   * component combinations without triggering garbage collection arrays.
   * @param {string[]} signature - Array of required components
   */
  getEntitiesWith(signature) {
    const matchingIds = []
    const sigLength = signature.length

    // Native Map iteration avoids the Object.keys() memory allocation penalty
    for (const [entityId, components] of this.entities) {
      let match = true

      for (let j = 0; j < sigLength; j++) {
        if (components[signature[j]] === undefined) {
          match = false
          break
        }
      }

      if (match) {
        matchingIds.push(entityId)
      }
    }

    return matchingIds
  }

  /**
   * Appends a dynamic processing system to the metabolic sequence
   */
  addSystem(systemInstance) {
    this.systems.push(systemInstance)
  }

  /**
   * Starts the autonomous real-time metabolic loop
   * @param {number} msPerTick - Duration of a millisecond tick
   */
  start(msPerTick = 1000) {
    if (this.isLooping) return
    this.isLooping = true
    this.intervalId = setInterval(() => this.tick(), msPerTick)
    console.log(`[SafeFlow] Orrery loop initialized at ${msPerTick}ms intervals.`)
  }

  /**
   * Stops the real-time ticking engine
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.isLooping = false
    }
  }

  /**
   * Executes a synchronous pulse through all active systems.
   * Safe to call externally inside 'while' loops for deep-time catch-up emulation.
   */
  tick() {
    const sysLength = this.systems.length
    for (let i = 0; i < sysLength; i++) {
      this.systems[i].update(this)
    }
  }
}

export default EntitiesManager