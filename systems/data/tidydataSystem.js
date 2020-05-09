'use strict'
/**
*  TidyTidyDataSystem
*
*
* @class TidyTidyDataSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/

const util = require('util')
const events = require('events')

var TidyDataSystem = function (setIN) {
  events.EventEmitter.call(this)
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(TidyDataSystem, events.EventEmitter)

/**
* Tidy raw data
* @method tidyRawData
*
*/
TidyDataSystem.prototype.tidyRawData = function (source, contract, device, datatype, time, dataRaw) {
  console.log(source)
  // first check if primary data source or derived (if derived dt source will be tidy on compute cycle)
  let tidyBack = []
  tidyBack = this.tidyFilterRemove(source.tidydt[datatype], datatype, source.sourceapiquery, dataRaw)
  return tidyBack
}

/**
* Tidy filter remove
* @method tidyFilterRemove
*
*/
TidyDataSystem.prototype.tidyFilterRemove = function (tidyRules, datatype, apiDTinfo, dataRaw) {
  console.log(tidyRules)
  let tidyHolderF = {}
  const manFilter = (e, datatype, rule) => {
    let filterMat = null
    for (var i = 0; i < rule.codes.length; i++) {
      if (e[datatype] !== rule.codes[i]) {
        filterMat = true
      } else {
        filterMat = false
      }
    }
    return filterMat
  }
  const newfullData = dataRaw.filter(n => manFilter(n, apiDTinfo.column, tidyRules))
  return newfullData
}

export default TidyDataSystem
