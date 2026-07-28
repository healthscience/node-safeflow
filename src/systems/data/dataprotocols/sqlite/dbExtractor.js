// src/components/dataspace/upload/utils/dbExtractor.js

export class DbExtractor {
  constructor(fileBuffer, fileType = 'sqlite') {
    this.buffer = fileBuffer
    this.type = fileType.toLowerCase()
    this.dbInstance = null
    this.isConnected = false
  }

  /**
   * Initializes the appropriate driver connection based on file type.
   */
  async initialize() {
    if (this.isConnected) return true

    try {
      if (['sqlite', 'db'].includes(this.type)) {
        if (typeof window !== 'undefined' && window.initSqlJs) {
          const SQL = await window.initSqlJs()
          this.dbInstance = new SQL.Database(new Uint8Array(this.buffer))
        }
      } else if (this.type === 'duckdb') {
        // DuckDB-Wasm connection handler
        // const worker = new Worker(...)
        // const db = new DuckDB(worker)
        // await db.instantiate(...)
        // this.dbInstance = await db.connect()
      }
      this.isConnected = true
      return true
    } catch (err) {
      console.error('Failed to initialize relational database driver:', err)
      return false
    }
  }

  /**
   * Dynamically discovers all available tables and views in the database.
   */
  async getTables() {
    await this.initialize()
    if (!this.dbInstance) return []

    try {
      let query = "SELECT name FROM sqlite_master WHERE type='table' OR type='view';"
      
      if (this.type === 'duckdb') {
        query = "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = 'main';"
      }

      const result = this.dbInstance.exec(query)
      if (result && result.length > 0) {
        return result[0].values.flat()
      }
      return []
    } catch (err) {
      console.error('Error discovering database tables:', err)
      return []
    }
  }

  /**
   * Dynamically retrieves column definitions for any discovered table.
   */
  async getTableSchema(tableName) {
    await this.initialize()
    if (!this.dbInstance || !tableName) return []

    try {
      let query = `PRAGMA table_info("${tableName}");`
      
      if (this.type === 'duckdb') {
        query = `SELECT column_name AS name, data_type AS type FROM information_schema.columns WHERE table_name = '${tableName}';`
      }

      const result = this.dbInstance.exec(query)
      if (result && result.length > 0) {
        return result[0].values.map(row => ({
          name: row[0],
          type: row[1]
        }))
      }
      return []
    } catch (err) {
      console.error(`Error fetching schema for table ${tableName}:`, err)
      return []
    }
  }

  /**
   * Executes a dynamic query or auto-constructs one targeting the first discovered table.
   */
  async executeQuery(rawQueryString, limit = 50) {
    await this.initialize()

    let query = rawQueryString ? rawQueryString.trim() : ''

    // If no query string is provided, dynamically query the first discovered table
    if (!query) {
      const tables = await this.getTables()
      if (tables.length > 0) {
        query = `SELECT * FROM "${tables[0]}" LIMIT ${limit};`
      } else {
        return { columns: [], rows: [] }
      }
    }

    if (!this.dbInstance) return { columns: [], rows: [] }

    try {
      const stmt = this.dbInstance.exec(query)
      if (stmt && stmt.length > 0) {
        return {
          columns: stmt[0].columns,
          rows: stmt[0].values
        }
      }
      return { columns: [], rows: [] }
    } catch (err) {
      console.error('Dynamic query execution error:', err)
      throw err
    }
  }
}