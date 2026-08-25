import b4a from 'b4a'
import { JsonExtractor } from './dataprotocols/json/jsonExtractor.js'

export class JsonExtractionSystem {
  constructor(holepunch) {
    this.signature = ['SchemaProbeRequest', 'SchemaProbeResult']
    this.drive = holepunch.DriveFiles
  }

  update(ecs) {
    const entities = ecs.getEntitiesWith(this.signature)

    for (let i = 0; i < entities.length; i++) {
      const entityId = entities[i]
      const request = ecs.getComponent(entityId, 'SchemaProbeRequest')
      
      if (request.status === 'pending') {
        request.status = 'processing'

        this.fetchAndExtract(request)
          .then(extracted => {
            const result = ecs.getComponent(entityId, 'SchemaProbeResult')
            if (result) {
              result.fullStructure = extracted.fullStructure
              result.columns = extracted.columns
              result.subColumns = extracted.subColumns
              result.sampleRows = extracted.sampleRows
              result.dataType = extracted.dataType
            }
            request.status = 'complete'
          })
          .catch(e => {
            console.error('JSON Extraction failed during the Story phase', e)
            request.status = 'failed'
          })
      }
    }
  }

  async fetchAndExtract(request) {
    const hyperdrivePath = request.path || request.sourceInfo
    
    // Use the native inspectPath pattern from the working HyperdriveIntrospectionSystem
    const rawData = await this.inspectPath(hyperdrivePath)
   
    const extractor = new JsonExtractor(rawData)
    const targetPath = request.targetPath || 'cues.cueMap'
    const schema = extractor.extractSchema(targetPath)

    return {
      fullStructure: extractor.parsed,
      columns: schema.columns,
      subColumns: schema.subColumns || [],
      sampleRows: schema.sampleRows,
      dataType: schema.type
    }
  }

  async inspectPath(hyperdrivePath) {
    // Pure JS Hyperdrive API integration
    // Replace with your actual local-first buffer or drive read implementation
    let sourceFile = await this.drive.peerDrive.getFile(hyperdrivePath)
    const jsonString = b4a.toString(sourceFile, 'utf-8')

    return jsonString

  }
}