'use strict'

import { EventEmitter } from 'events'
import DataSystem from '../data/dataSystem.js'
import RawDataComponent from '../../components/pipeline/rawDataComponent.js'
import objectHash from 'object-hash'

class DataFetchSystem extends EventEmitter {
  constructor(dataAPI) {
    super()
    this.dataSystem = new DataSystem(dataAPI)
  }

  /**
  * Run the system on a collection of entities
  * @param {Object} entities - Map of entities
  */
  async update(entities) {
    for (const entityId in entities) {
      const entity = entities[entityId]
      
      // Logic: Query entities that have a DataRequestComponent but lack a RawDataComponent
      if (entity.dataRequest && !entity.rawData) {
        await this.processEntity(entity)
      }
    }
  }

  /**
  * Fetch data for a specific entity
  * @param {Object} entity 
  */
  async processEntity(entity) {
    try {
      const source = entity.dataRequest.source
      // Use the refactored DataSystem to fetch data
      const data = await this.dataSystem.datatypeQueryMapping(
        source.type,
        source.hash,
        source.info,
        source.device,
        source.datatype,
        source.time,
        source.contract
      )

      if (data) {
        // Calculate initial hash for Proof of Work
        const hash = objectHash(data)
        // Attach RawDataComponent
        entity.rawData = new RawDataComponent(data, hash)
        this.emit('dataFetched', { entityId: entity.id, hash })
      }
    } catch (error) {
      console.error(`DataFetchSystem error for entity ${entity.id}:`, error)
      this.emit('error', error)
    }
  }
}

export default DataFetchSystem
