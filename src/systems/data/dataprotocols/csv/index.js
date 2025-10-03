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
import FileParser from '../fileParser.js'

var CsvAPI = function (dataAPI) {
  events.EventEmitter.call(this)
  this.liveDataAPI = dataAPI
  this.parseFiles = new FileParser()
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(CsvAPI, events.EventEmitter)

/**
*  csv time filter
* @method csvTimeFilter
*
*/
CsvAPI.prototype.csvTimeFilter = async function (fpath, device, datatype, time) {
  // get the source csv file and then apply filter, converting time and by device id (if many devices) and datatype
  let sourceData = await this.CSVSetup(fpath.filename) // await this.readCSVfileStream(fpath, device, time)
  // TODO  make call to Code LLM  local open source agent for this.
  // extract header and read fle in csv parser
  let delimInfo = {}
  delimInfo.info = {}
  delimInfo.info.delimiter = ','
  delimInfo.info.dataline = 1
  delimInfo.data = {}
  delimInfo.data.web = sourceData
  delimInfo.data.file = sourceData
  delimInfo.data.info = {}
  delimInfo.data.info.cnumber = 0
  let headerInfo = this.parseFiles.extractCSVHeaderInfo(delimInfo)
  // pass to csv parser
  let sourceCSVparser = await this.parseFiles.readFileStream(sourceData, headerInfo)
  // now filter by devices, datatpe and time
  let dataQuery = this.filterQuery(sourceCSVparser, device, datatype, time)
  return dataQuery
}

/**
*  set file path, read and make sqlite3 connect db
* @method SQLitebuilder
*
*/
CsvAPI.prototype.CSVSetup = async function (dapi) {
  // const stream = this.liveDataAPI.DriveFiles.listFilesFolder('sqlite/')
  let csvFile = await this.liveDataAPI.DriveFiles.CSVhyperdriveLocalfile('csv/' + dapi)
  return csvFile
}

/**
*  stream out line by line
* @method filterQuery
*
*/
CsvAPI.prototype.filterQuery = function (dataF, device, datatype, time) {
  let results = []
  let timeStart = time
  let timeEnd = time + 86400000
  for (let item of dataF) {
    // convert time to unix
    // TODO get AI agent help to assess time structure of source  (mean time simple rules)
    let timeSplit = item['Date'].split(' ')
    let timeItem = ''
    if (timeSplit.length > 0 ) {
      timeItem = timeSplit[0] + 'T' + timeSplit[1] + 'Z'
    } else {
      timeItem = item['Date']
    }
    let dateConvert = this.liveDataAPI.DriveFiles.testDataExtact(timeItem)
    if(dateConvert >= timeStart && dateConvert <=  timeEnd) {
      let resultItem = {}
      resultItem['Date'] = dateConvert
      resultItem[datatype.column] = item[datatype.column]
      results.push(resultItem)
    }
  }
  return results
}

/**
*  stream out line by line
* @method readCSVfileStream
*
*/
CsvAPI.prototype.readCSVfileStream = async function (fpath, device, time) {
  let hyperdrivePath = '/' + fpath.path + '/' + fpath.filename
  /* let stream = await this.liveDataAPI.DriveFiles.listFilesFolder('/')
  for await (const { key, value } of stream) {
      console.log({ key, value })
  }
  */
  // limit length until auto route informs the chunk size TODO
  const rs = await this.liveDataAPI.DriveFiles.drive.createReadStream(hyperdrivePath)
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