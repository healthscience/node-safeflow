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
import fs from 'fs'
import { setFlagsFromString } from 'v8'

var JSONfileAPI = function (dataAPI) {
  events.EventEmitter.call(this)
  this.liveDataAPI = dataAPI
  // check if any database files?
  /* let dbLocaldir = os.homedir() + '/peerlink/json/'
  let dbList = []
  fs.readdirSync(dbLocaldir).forEach(file => {
    dbList.push(file)
  }) */
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(JSONfileAPI, events.EventEmitter)

/**
*  set file path and read data from file
* @method JSONfileAPI
*
*/
JSONfileAPI.prototype.fileSetup = async function (dapi, device, time) {
  let dbFile = await this.liveDataAPI.DriveFiles.hyperdriveLocalfile('/json/' + dapi.data.name) // ('json/' + dapi)
  return dbFile
}

/**
*  build json data structure
* @method jsonFilebuilder
*
*/
JSONfileAPI.prototype.jsonFilebuilder = async function (dapi, device, time) {
  let fileLocal = await this.fileSetup(dapi)
  let timeColumn = ''
  for (let tr of dapi.data.tablestructure) {
    if (tr.refcontract === 'blind1234555554321') // 'd76d9c3db7f2212335373873805b54dd1f903a06')
    timeColumn = 'blind1234555554321' // tr.column
  }
  // let fileLocation = '/' + dapi.data.apibase + dapi.data.apipath
  // time is in text form need to transform
  // time = 1417392000000
  let apiTime1 = time / 1000
  let apiTime2 = apiTime1 + 86400
  const jsonParser = (timeColumn) =>
  {
   return new Promise((resolve, reject) =>
   {
    if (timeColumn) {
      let dataJSON = []
      fs.readFile(fileLocal, 'utf8', (err, data) => {
        if (err) {
          console.log(`Error reading file from disk: ${err}`)
          reject(err)
        } else {
          // parse JSON string to JSON object
          dataJSON = JSON.parse(data)
          // which data format as coming in,  pure =>  timestamp, data or  blind =>  data  label
          if (dataJSON?.data.length === 0) {
            let filterTime = dataJSON.filter(item => {
              return item[timeColumn] >= apiTime1 && item[timeColumn] <= apiTime2
            })
            resolve(filterTime)
          } else {
            console.log('blind path')
            // reformat blind for SF data format
            let blindFilter = this.blindRestructure(dataJSON)
            resolve(blindFilter)
          }
        }
      })
    }
    else
    {
     reject(Error("It broke"))
    }
   })
  }

  let extractJSON = await jsonParser(timeColumn).then(dataJ =>
  {
    return dataJ
  })
  console.log('JSON from file')
  console.log(extractJSON)
  return extractJSON
}

/**
*  make blind structure into SF time data format
* @method blindRestructure
*
*/
JSONfileAPI.prototype.blindRestructure = function (bData) {
 let sfData = []
 for (let i = 0; i < bData.data.length; i++) {
   sfData.push({'d76d9c3db7f2212335373873805b54dd1f903a06': bData.label[i], 'blind1234555554321': bData.data[i]})
 }
 console.log('data ready for tidy cat flter')
 console.log(sfData)
 return sfData 
}

export default JSONfileAPI
