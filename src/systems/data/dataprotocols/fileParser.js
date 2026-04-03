'use strict'
/**
*  FileParser
*
*
* @class FileParser
* @package    network library
* @copyright  Copyright (c) 2022 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/

import fs from 'fs'
import os from 'os'
import csv from 'csv-parser'
import { EventEmitter } from 'events'

class FileParser extends EventEmitter {
  constructor(path, dataAPI) {
    super()
    this.storepath = path
    this.liveDataAPI = dataAPI
  }

  /**
  * local json file extract header for auto complete
  * @method localJSONfile
  *
  */
  async localJSONfile(o, ws) {
    let headerSet = this.extractJSONkeys(o)
    // data back to peer
    let fileFeedback = {}
    fileFeedback.success = true
    fileFeedback.path = this.storepath + '/json/' + o.data.name + '.json'
    fileFeedback.columns = headerSet
    let storeFeedback = {}
    storeFeedback.type = 'file-save'
    storeFeedback.action = 'library'
    storeFeedback.data = fileFeedback
    ws.send(JSON.stringify(storeFeedback))
  }

  /**
  * web json file for saving
  * @method webJSONfile
  *
  */
  async webJSONfile(o, ws) {
    // then prepare file for HOP i.e. convert to json
    const lines = JSON.parse(reader.result)
    this.linesLimit = lines
    // implementation here
  }

  /**
  * local file parser save etc
  * @method localFileParse
  *
  */
  async localFileParse(o, ws) {
    // then prepare file for HOP i.e. convert to json
    // file input management
    // extract out the headers name for columns
    let headerSet = this.extractCSVHeaderInfo(o)
    // protocol should be to save original file
    let newPathFile = this.saveOriginalProtocol(o)
    //  csv to JSON convertion and save into HOP
    // const praser = readStream(newPathcsv, headerSet, delimiter, dataline)
    const parser = await this.readFileStream(newPathFile, headerSet)
    this.convertJSON(o, headerSet, parser, 'localcsv', null)
  }

  /**
  * files from cloud - Refactored to use Hyperdrive/Hypercore
  * @method webFileParse
  *
  */
  async webFileParse(o, ws) {
    // Instead of axios.get, we assume the file is already in Hyperdrive or we fetch it via Holepunch
    // For this refactor, we'll assume the data is retrieved from the liveDataAPI
    const hyperPath = '' // `/web_cache/${crypto.createHash('md5').update(o.data.websource).digest('hex')}`
    const data = await this.liveDataAPI.DriveFiles.drive.get(hyperPath)
    // implementation continues...
  }

  /**
  * extract JSON keys
  * @method extractJSONkeys
  *
  */
  extractJSONkeys(o) {
    // implementation here
    return []
  }

  /**
  * extract CSV header info
  * @method extractCSVHeaderInfo
  *
  */
  extractCSVHeaderInfo(o) {
    // implementation here
    return {}
  }

  /**
  * save original protocol
  * @method saveOriginalProtocol
  *
  */
  saveOriginalProtocol(o) {
    // implementation here
    return ''
  }

  /**
  * read file stream
  * @method readFileStream
  *
  */
  async readFileStream(path, header) {
    // implementation here
    return []
  }

  /**
  * convert JSON
  * @method convertJSON
  *
  */
  convertJSON(o, header, parser, type, extra) {
    // implementation here
  }
}

export default FileParser
