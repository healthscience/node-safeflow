'use strict'
/**
*  CategoryDataSystem
*
*
* @class CategoryDataSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/

import CNRLmaster from '../../kbl-cnrl/cnrlMaster.js'
const util = require('util')
const events = require('events')

var CategoryDataSystem = function (setIN) {
  events.EventEmitter.call(this)
  this.liveCNRL = new CNRLmaster()
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(CategoryDataSystem, events.EventEmitter)

/**
* lookup categorisation rules and apply
* @method categorySorter
*
*/
CategoryDataSystem.prototype.categorySorter = function (dataQuery, device, datatype, time, rawData) {
  console.log('categorySORTER')
  // console.log(dataQuery)
  // console.log(device)
  // console.log(time)
  // console.log(rawData)
  let catHolder = {}
  if (dataQuery.categorydt.length > 1) {
    for (let cdt of dataQuery.categorydt) {
      catHolder = this.categoriseWorker(dataQuery, rawData, time)
    }
  } else {
    catHolder = rawData
  }
  return catHolder
}

/**
*
* @method categoriseWorker
*
*/
CategoryDataSystem.prototype.categoriseWorker = function (dataQuery, rawData, time) {
  let catHolder = {}
  const excludeCodes = (e, tItem, column) => {
    for (let fCode of tItem) {
      let codeP = parseInt(fCode.code, 10)
      let colP = parseInt(e[column], 10)
      if (colP === codeP) {
        return true
      }
    }
  }
  let catData = []
  for (let dev of dataQuery.devices) {
    catHolder[dev] = []
    if (dataQuery.apiInfo[dev].categorycodes.length !== 0) {
      let catColumnQueryName = this.extractColumnName(dataQuery.apiInfo[dev].categorycodes)
      // is it for primary or derive data types?
      for (let dti of dataQuery.apiInfo[dev].sourceapiquery) {
        for (let ts of dataQuery.timeseg) {
          console.log(ts)
          let catTempHold = {}
          catTempHold[ts] = catData
          catHolder[dev][dti.cnrl] = catTempHold
        }
      }
    } else {
      catHolder = rawData
    }
  }
  return catHolder
}

/**
* give back name of cat code name
* @method extractColumnName
*
*/
CategoryDataSystem.prototype.extractColumnName = function (cCodes) {
  let columnName = ''
  columnName = this.liveCNRL.lookupContract(cCodes[0].column)
  return columnName.prime.text
}

export default CategoryDataSystem
