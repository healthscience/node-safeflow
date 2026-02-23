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
import { EventEmitter } from 'events'
import fs from 'fs'

class JSONfileAPI extends EventEmitter {
  constructor(dataAPI) {
    super()
    this.liveDataAPI = dataAPI
  }

  /**
  *  set file path and read data from file
  * @method fileSetup
  *
  */
  async fileSetup(dapi, device, time) {
    let dbFile = await this.liveDataAPI.DriveFiles.hyperdriveLocalfile('/json/' + dapi.data.name) // ('json/' + dapi)
    return dbFile
  }

  /**
  *  build json data structure
  * @method jsonFilebuilder
  *
  */
  async jsonFilebuilder(dapi, device, time) {
    let fileLocal = await this.fileSetup(dapi)
    let timeColumn = ''
    for (let tr of dapi.data.tablestructure) {
      if (tr.refcontract === 'blind1234555554321') // 'd76d9c3db7f2212335373873805b54dd1f903a06')
        timeColumn = 'blind1234555554321' // tr.column
    }
    // time is in text form need to transform
    let apiTime1 = time / 1000
    let apiTime2 = apiTime1 + 86400

    const jsonParser = (timeColumn) => {
      return new Promise((resolve, reject) => {
        if (timeColumn) {
          fs.readFile(fileLocal, 'utf8', (err, data) => {
            if (err) {
              console.log(`Error reading file from disk: ${err}`)
              reject(err)
            } else {
              // parse JSON string to JSON object
              let dataJSON = JSON.parse(data)
              // which data format as coming in,  pure =>  timestamp, data or  blind =>  data  label
              if (dataJSON?.data?.length === 0 || !dataJSON.data) {
                let filterTime = dataJSON.filter(item => {
                  return item[timeColumn] >= apiTime1 && item[timeColumn] <= apiTime2
                })
                resolve(filterTime)
              } else {
                // reformat blind for SF data format
                let blindFilter = this.blindRestructure(dataJSON)
                resolve(blindFilter)
              }
            }
          })
        } else {
          reject(new Error("It broke: timeColumn is missing"))
        }
      })
    }

    let extractJSON = await jsonParser(timeColumn)
    return extractJSON
  }

  /**
  *  restructure blind data
  * @method blindRestructure
  *
  */
  blindRestructure(data) {
    // implementation here
    return data
  }
}

export default JSONfileAPI
