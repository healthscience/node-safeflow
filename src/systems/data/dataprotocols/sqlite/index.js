'use strict'
/**
*  SQLite local file interface via Hyperdrive
*
*
* @class SQLiteAPI
* @package    safeFlow
* @copyright  Copyright (c) 2022 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import { EventEmitter } from 'events'
import sqlite3 from 'sqlite3'

class SQLiteAPI extends EventEmitter {
  constructor(dataAPI) {
    super()
    this.liveDataAPI = dataAPI
    this.db = null
  }

  /**
  *  set file path, read and make sqlite3 connect db
  * @method SQLiteSetup
  *
  */
  async SQLiteSetup(dapi) {
    // Use Hyperdrive to get the local file path
    let dbFile = await this.liveDataAPI.DriveFiles.hyperdriveLocalfile('sqlite/' + dapi)
    this.db = new sqlite3.Database(dbFile)
  }

  /**
  *  from SQL query to extract data Promise version
  * @method SQLitebuilderPromise
  *
  */
  async SQLitebuilderPromise(dapi, device, time) {
    let table = dapi.sqlitetablename
    let deviceCol = dapi.sourcedevicecol.name
    let timeCol = 'TIMESTAMP'
    await this.SQLiteSetup(dapi.filename)
    let apiTime1 = Math.round(time / 1000)
    let apiTime2 = apiTime1 + 86400
    const res = await new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM ' + table + ' WHERE ' + deviceCol + ' == ' + device + ' AND ' + timeCol + ' BETWEEN ' + apiTime1 + ' AND ' + apiTime2
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
    return res
  }

  /*
  *  from SQL query to extract data with promise
  * @method SQLiteDevicePromise
  *
  */
  async SQLiteDevicePromise(table, filename) {
    await this.SQLiteSetup(filename)
    const res = await new Promise((resolve, reject) => {
      let sql = `SELECT * FROM ` + table
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
    return res
  }

  /**
  *  from SQL query to extract data
  * @method SQLitebuilder
  *
  */
  SQLitebuilder(dapi, device, time) {
    let data = []
    let sql = `SELECT * FROM MI_BAND_ACTIVITY_SAMPLE WHERE DEVICE_ID = 3 AND TIMESTAMP BETWEEN 1627677840 AND 1627678380`
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        throw err
      }
      rows.forEach((row) => {
        data.push(row)
      })
    })
  }
}

export default SQLiteAPI
