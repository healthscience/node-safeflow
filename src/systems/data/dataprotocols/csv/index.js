'use strict'
/**
*  csv file interface
*
*
* @class CsvAPI
* @package    csv file data API
* @copyright  Copyright (c) 2024 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import events from 'events'
import sqlite3 from 'sqlite3'
import os from 'os'
import fs from 'fs'

var CsvAPI = function (dataAPI) {
  events.EventEmitter.call(this)
  this.liveDataAPI = dataAPI
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(CsvAPI, events.EventEmitter)

/**
*  set file path, read and make sqlite3 connect db
* @method CSVbuilder
*
*/
CsvAPI.prototype.CSVbuilder = async function (dapi) {

}

/**
*  from SQL query to extract data Promise version
* @method CSVbuilderPromise
*
*/
CsvAPI.prototype.CSVbuilderPromise = async function (dapi, device, time) {
  device = dapi.deviceinfo.column
  console.log('csv api  part file query?')
  console.log(dapi)
  console.log(device)
  console.log(time)
  const res = await new Promise((resolve, reject) => {
     /* this.db.all(sql, [], (err, rows) => {
      if (err)
        reject(err)
        resolve(rows)
    }) */
  })
  return res
}


export default CsvAPI