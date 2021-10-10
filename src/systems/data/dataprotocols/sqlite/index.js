'use strict'
/**
*  SQLite local file interface
*
*
* @class SQLiteAPI
* @package    testStorage API
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import events from 'events'
import sqlite3 from 'sqlite3'
import os from 'os'

var SQLiteAPI = function (setUP) {
  events.EventEmitter.call(this)
  this.db = new sqlite3.Database(os.homedir() + '/peerlink/sqlite/Gadgetbridge')
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(SQLiteAPI, events.EventEmitter)

/**
*  from SQL query to extract data
* @method SQLitebuilder
*
*/
SQLiteAPI.prototype.SQLitebuilder = function (dapi, device, time) {
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
  // this.db.close()
  return data
}

/**
*  from SQL query to extract data Promise version
* @method SQLitebuilderPromise
*
*/
SQLiteAPI.prototype.SQLitebuilderPromise = async function (dapi, device, time) {
  let apiTime1 = time / 1000
  let apitime2 = apiTime1 + 86400
  const res = await new Promise((resolve, reject) => {
    let sql = 'SELECT * FROM MI_BAND_ACTIVITY_SAMPLE WHERE DEVICE_ID = ' + device + ' AND TIMESTAMP BETWEEN ' + apiTime1 + ' AND ' + apitime2 + ' '
    this.db.all(sql, [], (err, rows) => {
      if (err)
        reject(err)
        resolve(rows)
    })
  })
  return res
}

/**
*  from SQL query to extract data
* @method SQLiteDeviceBuilder
*
*/
SQLiteAPI.prototype.SQLiteDeviceBuilder =  function (callback) {
  let data = []
  let sql = `SELECT * FROM DEVICE`
  this.db.all(sql, [], callback)

  /*  (err, rows) => {
    if (err) {
      throw err
    }
    rows.forEach((row) => {
      data.push(row)
    })
    return data
  }) */
  return true
}
/*
*  from SQL query to extract data with promise
* @method SQLiteDevicePromise
*
*/
SQLiteAPI.prototype.SQLiteDevicePromise = async function () {
  const res = await new Promise((resolve, reject) => {
    let sql = `SELECT * FROM DEVICE`
    this.db.all(sql, [], (err, rows) => {
      if (err)
        reject(err)
        resolve(rows)
    })
  })
  return res
}

export default SQLiteAPI
