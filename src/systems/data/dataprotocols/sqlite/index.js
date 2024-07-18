'use strict'
/**
*  SQLite local file interface
*
*
* @class SQLiteAPI
* @package    testStorage API
* @copyright  Copyright (c) 2022 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import events from 'events'
import sqlite3 from 'sqlite3'
import os from 'os'
import fs from 'fs'

var SQLiteAPI = function (dataAPI) {
  events.EventEmitter.call(this)
  this.liveDataAPI = dataAPI
  // console.log('SF--SQLITE--Dsys====================')
  // this.liveDataAPI.DriveFiles.listFilesFolder('')
  // this.liveDataAPI.DriveFiles.hyperdriveLocalfile('sqlite/Gadgetbridge')
  // check if any database files?
  /* let dbSQLitedir = os.homedir() + '/peerlink/sqlite/'
  let dbList = []
  fs.readdirSync(dbSQLitedir).forEach(file => {
    dbList.push(file)
  })
  if (dbList.length > 0) {
    this.db = new sqlite3.Database(os.homedir() + '/peerlink/sqlite/Gadgetbridge')
  } */
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(SQLiteAPI, events.EventEmitter)

/**
*  set file path, read and make sqlite3 connect db
* @method SQLitebuilder
*
*/
SQLiteAPI.prototype.SQLiteSetup = async function (dapi) {
  // const stream = this.liveDataAPI.DriveFiles.listFilesFolder('sqlite/')
  let dbFile = await this.liveDataAPI.DriveFiles.hyperdriveLocalfile('sqlite/' + dapi)
  this.db = new sqlite3.Database(dbFile)
}

/**
*  from SQL query to extract data Promise version
* @method SQLitebuilderPromise
*
*/
SQLiteAPI.prototype.SQLitebuilderPromise = async function (dapi, device, time) {
  // first setup the db MI_BAND_ACTIVITY_SAMPLE
  device = dapi.deviceinfo.column
  let deviceCol = dapi.deviceinfo.table // 'DEVICE_ID'
  let table = 'MI_BAND_ACTIVITY_SAMPLE'
  let timeCol = 'TIMESTAMP'
  await this.SQLiteSetup(dapi.filename)
  let apiTime1 = Math.round(time / 1000)
  let apiTime2 = apiTime1 + 86400
  const res = await new Promise((resolve, reject) => {
     let sql = 'SELECT * FROM ' + table + ' WHERE ' + deviceCol + ' == ' + device + ' AND ' +  timeCol + ' BETWEEN ' + apiTime1 + ' AND ' + apiTime2
    this.db.all(sql, [], (err, rows) => {
      if (err)
        reject(err)
        resolve(rows)
    })
  })
  return res
}

/*
*  from SQL query to extract data with promise
* @method SQLiteDevicePromise
*
*/
SQLiteAPI.prototype.SQLiteDevicePromise = async function (table, filename) {
  // need to connect to the db requested
  // first setup the db
  await this.SQLiteSetup(filename)
  const res = await new Promise((resolve, reject) => {
    let sql = `SELECT * FROM ` + table
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

export default SQLiteAPI
