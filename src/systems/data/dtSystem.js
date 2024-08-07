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
import util from 'util'
import events from 'events'

var DTSystem = function () {
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
  // use inputs to map to datastore/api/rest etc. table / layout structure
  let sourceDTmap = this.datatypeTableMapper(sourceAPI, datatype)
  let sourceCatmap = this.categoryTableMapper(sourceAPI, contract.category)
  let sourceTidymap = this.tidyTableMapper(sourceAPI)
  let apiInfo = {}
  apiInfo.data = sourceAPI
  apiInfo.sourceapiquery = sourceDTmap
  apiInfo.categorydt = sourceCatmap
  apiInfo.tidydt = sourceTidymap
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
  for (let dtt of sourceAPI.tablestructure) {
    // is there table structure embedd in the storageStructure?
    // check to see if table contains sub structure
    /* let subStructure = this.subStructure(dtt)
    if (subStructure.length > 0) {
      dtt = subStructure
    } */
    if (dtt.refcontract === dt) {
      let packAPImatch = {}
      packAPImatch.cnrl = dtt.refcontract
      packAPImatch.column = dtt.column
      packAPImatch.apipath = sourceAPI.api
      packAPImatch.namespace = sourceAPI.filename
      packAPImatch.tablesqlite = sourceAPI.sqlitetablename
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
  // check if any categories?
  let objectKeys = Object.keys(category)
  if (objectKeys.length !== 0) {
    for (let ct of objectKeys) {
      // map category DT to api table name
      let catDT = this.datatypeTableMapper(sourceAPI, category[ct].column)
      catInfo.push(catDT)
    }
  }
  if (catInfo.length === 0) {
    catInfo = {'status': 'none'}
  }
  return catInfo
}

/**
*  // map data prime to source data types //
* @method tidyTableMapper
*
*/
DTSystem.prototype.tidyTableMapper = function (sourceAPI) {
  let tidyInfo = []
  // check if any tidying required
  let objectKeys = Object.keys(sourceAPI.tidy)
  if (objectKeys.length > 0) {
    for (let ti of objectKeys) {
      tidyInfo.push(sourceAPI.tidy[ti])
    }
  }
  else {
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
