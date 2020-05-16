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
DTSystem.prototype.DTStartMatch = function (sourceAPI, contract, datatype) {
  // console.log('sourceAPI DTmatch')
  // console.log(sourceAPI)
  // console.log(datatype)
  // use inputs to map to datastore/api/rest etc. table / layout structure
  let sourceDTmap = this.datatypeTableMapper(sourceAPI, datatype)
  let sourceCatmap = this.categoryTableMapper(sourceAPI, contract.category)
  let sourceTidymap = this.tidyTableMapper(sourceAPI, contract.tidy)
  let apiInfo = {}
  apiInfo.data = sourceAPI
  apiInfo.sourceapiquery = sourceDTmap
  apiInfo.categorydt = sourceCatmap
  apiInfo.tidydt = sourceTidymap
  // console.log('api DT prepred')
  // console.log(apiInfo)
  return apiInfo
}

/**
*  // map data prime to source data types //
* @method datatypeTableMapper
*
*/
DTSystem.prototype.datatypeTableMapper = function (sourceAPI, dt) {
  let apiMatch = {}
  // given datatypes select find match to the query string
  let tableCount = 0
  // match to source API query
  for (let dtt of sourceAPI.api.tableStructure) {
    // is there table structure embedd in the storageStructure?
    // check to see if table contains sub structure
    let subStructure = this.subStructure(dtt)
    if (subStructure.length > 0) {
      dtt = subStructure
    }
    const result = dtt.filter(item => item.cnrl === dt)
    if (result.length > 0) {
      let packAPImatch = {}
      packAPImatch.cnrl = result[0].cnrl
      packAPImatch.column = result[0].text
      packAPImatch.api = sourceAPI.api.apistructure[tableCount]
      packAPImatch.namespace = sourceAPI.api.namespace
      apiMatch = packAPImatch
    }
  }
  return apiMatch
}

/**
*  // map category to
* @method categoryTableMapper
*
*/
DTSystem.prototype.categoryTableMapper = function (sourceAPI, category) {
  let catInfo = []
  for (let ct of category) {
    // map category DT to api table name
    let catDT = this.datatypeTableMapper(sourceAPI, ct)
    catInfo.push(catDT)
  }
  return catInfo
}

/**
*  // map data prime to source data types //
* @method tidyTableMapper
*
*/
DTSystem.prototype.tidyTableMapper = function (sourceAPI, dt) {
  let tidyInfo = {}
  if (sourceAPI.api.tidy === true) {
    // trace down rules for DT's
    if (sourceAPI.api.source !== 'cnrl-primary') {
      tidyInfo = sourceAPI.primary.tidyList
    } else {
      tidyInfo = sourceAPI.api.tidyList
    }
  } else {
    tidyInfo = {'status': 'none'}
  }
  return tidyInfo
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
