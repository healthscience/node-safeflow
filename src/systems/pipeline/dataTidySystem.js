'use strict'

import { EventEmitter } from 'events'
import TidyDataSystem from '../data/tidydataSystem.js'
import TidiedDataComponent from '../../components/pipeline/tidiedDataComponent.js'
import objectHash from 'object-hash'

class DataTidySystem extends EventEmitter {
  constructor(setIN) {
    super()
    this.tidySystem = new TidyDataSystem(setIN)
  }

  /**
  * Run the system on a collection of entities
  * @param {Object} entities - Map of entities
  */
  async update(entities) {
    for (const entityId in entities) {
      const entity = entities[entityId]
      
      // Logic: Query entities with RawDataComponent and TidyRulesComponent, but lacking TidiedDataComponent
      if (entity.rawData && entity.tidyRules && !entity.tidiedData) {
        await this.processEntity(entity)
      }
    }
  }

  /**
  * Tidy data for a specific entity
  * @param {Object} entity 
  */
  async processEntity(entity) {
    try {
      const rawData = entity.rawData.data
      const rules = entity.tidyRules.rules
      
      // Use the refactored TidyDataSystem
      const tidiedData = this.tidySystem.tidyRawData(rules.source, rules.datatype, rawData)

      if (tidiedData) {
        // Calculate chained hash for Proof of Work
        const hash = objectHash({ data: tidiedData, previousHash: entity.rawData.hash })
        // Attach TidiedDataComponent
        entity.tidiedData = new TidiedDataComponent(tidiedData, entity.rawData.hash, hash)
        this.emit('dataTidied', { entityId: entity.id, hash })
      }
    } catch (error) {
      console.error(`DataTidySystem error for entity ${entity.id}:`, error)
      this.emit('error', error)
    }
  }
}

export default DataTidySystem
