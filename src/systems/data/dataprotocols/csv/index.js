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
CsvAPI.prototype.CSVbuilder = function (dapi) {

}

/**
*  from SQL query to extract data Promise version
* @method CSVbuilderPromise
*
*/
CsvAPI.prototype.CSVbuilderPromise = function (dapi, device, time) {
  console.log('csv api  part file query?')
  // const res = await new Promise((resolve, reject) => {
     /* this.db.all(sql, [], (err, rows) => {
      if (err)
        reject(err)
        resolve(rows)
    }) */
  res = [1, 2, 3]
  return res
}

/**
*  stream out line by line
* @method readCSVfileStream
*
*/
CsvAPI.prototype.readCSVfileStream = async function (fpath) {
  // limit length until auto route informs the chunk size TODO
  const rs = this.liveDataAPI.drive.createReadStream(fpath, { start: 0, end: 1000 })
    return new Promise((resolve, reject) => {
    let results = []
      rs.on('data', (data) => results.push(data.toString()))
      rs.on('end', () => {
        let makeString = results.toString()
        let csvFormat = makeString.split(/\r?\n/)
        resolve(csvFormat)
        reject('error-csv')
      })
  })
}

export default CsvAPI