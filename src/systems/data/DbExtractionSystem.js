// src/systems/DbExtractionSystem.js
import { DbExtractor } from './dataprotocols/dbExtractor.js'

export class DbExtractionSystem {
  constructor() {
    this.signature = ['DataExtractionRequest', 'DataExtractionResult']
  }

  update(ecs) {
    const entities = ecs.getEntitiesWith(this.signature)

    for (let i = 0; i < entities.length; i++) {
      const entityId = entities[i]
      const request = ecs.getComponent(entityId, 'DataExtractionRequest')
      const result = ecs.getComponent(entityId, 'DataExtractionResult')

      if (request.status === 'pending' && ['DUCKDB', 'SQLITE'].includes(request.dataType)) {
        // Handle DuckDB logic using your DbExtractor utility
        // Mark request.status = 'complete' when done
      }
    }
  }
}