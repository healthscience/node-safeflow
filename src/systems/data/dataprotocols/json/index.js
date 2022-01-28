'use strict'
/**
*  JSON local or cloud file interface
*
*
* @class JSONfileAPI
* @package    testStorage API
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import events from 'events'
import os from 'os'
import fs from 'fs'

var JSONfileAPI = function (setUP) {
  events.EventEmitter.call(this)
  // check if any database files?
  let dbLocaldir = os.homedir() + '/peerlink/json/'
  let dbList = []
  fs.readdirSync(dbLocaldir).forEach(file => {
    dbList.push(file)
  })
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(JSONfileAPI, events.EventEmitter)

/**
*  from SQL query to extract data
* @method SQLitebuilder
*
*/
JSONfileAPI.prototype.jsonFilebuilder = async function (dapi, device, time) {
  let timeColumn = ''
  for (let tr of dapi.data.tablestructure) {
    if (tr.refcontract === '2d11318841f43034df41de9b38ab5e77b6b01bcf')
    timeColumn = tr.column
  }
  let fileLocation = '/' + dapi.data.apibase + dapi.data.apipath
  // time is in text form need to transform
  // time = 1417392000000
  let apiTime1 = time / 1000
  let apiTime2 = apiTime1 + 86400
  const jsonParser = (timeColumn) =>
  {
   return new Promise((resolve, reject) =>
   {
    if (timeColumn) {
      let fileJSONdir = os.homedir() + fileLocation
      let dataJSON = []
      fs.readFile(fileJSONdir, 'utf8', (err, data) => {
        if (err) {
          console.log(`Error reading file from disk: ${err}`)
          reject(err)
        } else {
          // parse JSON string to JSON object
          dataJSON = JSON.parse(data)
          let filterTime = dataJSON.filter(item => {
            return item[timeColumn] >= apiTime1 && item[timeColumn] <= apiTime2
          })
          resolve(filterTime)
        }
      })
    }
    else
    {
     reject(Error("It broke"))
    }
   })
  }

  let extractJSON = jsonParser(timeColumn).then(dataJ =>
  {
    return dataJ
  })
  return extractJSON
}

export default JSONfileAPI
