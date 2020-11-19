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
import util from 'util'
import events from 'events'

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
  // first check if primary data source or derived (if derived dt source will be tidy on compute cycle)
  let tidyBack = []
  tidyBack = this.tidyFilterRemove(source.tidydt, datatype, source.sourceapiquery, dataRaw)
  return tidyBack
}

/**
* Tidy filter remove
* @method tidyFilterRemove
*
*/
TidyDataSystem.prototype.tidyFilterRemove = function (tidyRules, datatype, apiDTinfo, dataRaw) {
  let tidyHolderF = {}
  const manFilter = (e, datatype, rule) => {
    let filterMat = null
    for (var i = 0; i < rule.length; i++) {
      let convertIntCRule = parseInt(rule[i].tidycode, 10)
      if (e[datatype] !== convertIntCRule) {
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
