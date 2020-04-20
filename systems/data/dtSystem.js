'use strict'
/**
*  DTSystem
*
*
* @class DTSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/

const util = require('util')
const events = require('events')

var DTSystem = function (setIN) {
  events.EventEmitter.call(this)
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(DTSystem, events.EventEmitter)

/**
*  // match datatypes to query API via CNRL packaging contract(s)
* @method DTStartMatch
*
*/
DTSystem.prototype.DTStartMatch = function (devicesIN, dataBundle) {
  console.log('DTSYSTEM match start----')
  console.log(devicesIN)
  console.log(dataBundle)
  let datatypePerdevice = {}
  // loop over devices and match to API etc
  for (let dliv of devicesIN) {
    console.log(dliv)
    let packagingDTs = dataBundle.data
    // use inputs to map to datastore/api/rest etc. table / layout structure
    let sourceDTmapAPI = this.datatypeTableMapper(dataBundle)
    let SpackagingDTs = {}
    let TidyDataLogic = []
    // map DTs to API rest URL
    let DTmapAPI = this.datatypeTableMapper(dataBundle)

    let apiHolder = {}
    apiHolder[dliv.device_mac] = {}
    let apiInfo = {}
    apiInfo.apiquery = DTmapAPI
    apiInfo.sourceapiquery = sourceDTmapAPI
    apiHolder[dliv.device_mac] = apiInfo
    datatypePerdevice = apiHolder
  }
  return datatypePerdevice
}

/**
*  // map data prime to source data types //
* @method datatypeTableMapper
*
*/
DTSystem.prototype.datatypeTableMapper = function (dataBundle) {
  console.log('check against table structure')
  console.log(dataBundle)
  // console.log(lDTs)
  let apiMatch = []
  let apiKeep = {}
  // given datatypes select find match to the query string
  let tableCount = 0
  // match to source API query
  for (let dtt of dataBundle.datatypes.device.tableStructure) {
    // is there table structure embedd in the storageStructure?
    // check to see if table contains sub structure
    let subStructure = this.subStructure(dtt)
    if (subStructure.length > 0) {
      dtt = subStructure
    }
    for (let idt of dataBundle.datatypes.datatypein) {
      const result = dtt.filter(item => item.cnrl === idt.cnrl)
      if (result.length > 0) {
        let packAPImatch = {}
        packAPImatch.cnrl = result[0].cnrl
        packAPImatch.column = result[0].text
        packAPImatch.api = dataBundle.apistructure[tableCount]
        packAPImatch.namespace = dataBundle.namespace
        apiMatch.push(packAPImatch)
        if (apiMatch.length === lDTs.length) {
          apiKeep = apiMatch
          apiMatch = []
        }
      }
    }
    apiMatch = []
    tableCount++
  }
  return apiKeep
}

/**
*  check for sub table structure //
* @method subStructure
*
*/
DTSystem.prototype.subStructure = function (tableStructure) {
  let subStructure = []
  for (let tcI of tableStructure) {
    if (tcI.cnrl === 'datasub') {
      subStructure = tcI.data
    }
  }
  return subStructure
}

export default DTSystem
