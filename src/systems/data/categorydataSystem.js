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
import util from 'util'
import events from 'events'

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
CategoryDataSystem.prototype.categorySorter = function (dataQuery, catInfo,  contract, device, datatype, time, rawData) {
  let catHolder = {}
  if (dataQuery.categorydt.length > 1) {
    for (let cdt of dataQuery.categorydt) {
      catHolder = this.categoriseWorker(dataQuery, catInfo, contract, rawData, time)
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
CategoryDataSystem.prototype.categoriseWorker = function (dataQuery, catInfo, contract, rawData, time) {
  // need match ref to column name (need to think when to switch source ref ID after query TODO think out)
  let keysCat = Object.keys(catInfo)
  let catColumn = []
  for (let dtc of dataQuery.categorydt) {
    for (let catc of keysCat) {
      if (dtc.cnrl === catInfo[catc].column) {
        let catPair = {}
        catPair.column = dtc.column
        catPair.rule = catInfo[catc].rule
        catColumn.push(catPair)
      }
    }
  }
  let catHolder = {}
  const excludeCodes = (e, cItem) => {
    for (let cCode of cItem) {
      let codeP = parseInt(cCode.rule, 10)
      let colP = parseInt(e[cCode.column], 10)
      if (colP === codeP) {
        return true
      }
    }
  }
  const newCatData = rawData.filter(n => excludeCodes(n, catColumn))
  return newCatData
}

export default CategoryDataSystem
