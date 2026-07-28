// src/components/dataspace/upload/utils/jsonExtractor.js

export class JsonExtractor {
  constructor(rawData) {
    this.raw = rawData
    this.parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData
  }

  /**
   * Safely resolves a dot-notation path against the parsed JSON.
   * Essential for verifying conduction paths during Interplay and harvesting metadata.
   */
  resolvePath(pathString) {
    if (!pathString || !this.parsed) return this.parsed
    const segments = pathString.split('.').filter(Boolean)
    let current = this.parsed

    for (const segment of segments) {
      if (current && typeof current === 'object' && segment in current) {
        current = current[segment]
      } else {
        return null // Path does not exist in this payload
      }
    }
    return current
  }

  /**
   * Discovers structural keys and columns from a resolved target path.
   * Tailored to handle deep hex-key maps like cues.cueMap.
   */
  extractSchema(pathString = '') {
    const target = this.resolvePath(pathString)
    if (!target) return { columns: [], sampleRows: [], type: 'empty' }

    // Case 1: Array of objects (standard sequential payloads)
    if (Array.isArray(target)) {
      const sampleRows = target.slice(0, 10)
      const columnSet = new Set()
      target.slice(0, 50).forEach(row => {
        if (row && typeof row === 'object') {
          Object.keys(row).forEach(k => columnSet.add(k))
        }
      })
      return {
        columns: Array.from(columnSet),
        sampleRows,
        type: 'array'
      }
    }

    // Case 2: Object map (e.g., cues.cueMap with distinct hex keys)
    if (target !== null && typeof target === 'object') {
      const keys = Object.keys(target)
      
      // Package the top-level keys and their nested value objects for the UI
      const sampleRows = keys.slice(0, 10).map(k => ({ 
        key: k, 
        value: target[k] 
      }))
      
      // Look one level deeper to map the internal axes (e.g., c1e7b031..., a085a59d...)
      let subKeys = []
      if (keys.length > 0 && typeof target[keys[0]] === 'object' && target[keys[0]] !== null) {
        subKeys = Object.keys(target[keys[0]])
      }

      return {
        columns: keys,
        subColumns: subKeys,
        sampleRows,
        type: 'object-map'
      }
    }

    // Case 3: Flat primitive fallback
    return { columns: [], sampleRows: [target], type: 'primitive' }
  }
}