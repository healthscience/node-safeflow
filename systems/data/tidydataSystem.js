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
TidyDataSystem.prototype.tidyRawData = function (source, contract, bundleIN, device, datatype, time, dataRaw) {
  // first check if primary data source or derived (if derived dt source will be tidy on compute cycle)
  console.log('tidyraw start')
  console.log(source)
  let tidyHolder = {}
  // loop over devices dts and tidy as needed
  tidyHolder = {}
  let tidyBack = []
  let dInfo = []
  if (bundleIN.computeflow !== true) {
      tidyHolder[device] = []
      if (source.primary !== 'derived') {
        dInfo = source.tidyList
        if (dInfo.length !== 0) {
          // loop over per time segment
          for (let ts of device.timeseg) {
            console.log(ts)
            let dtTidy = dInfo
            let rawDataarray = dataRaw[dev]
            let dtMatch = []
            dtMatch = source.datatypes
            tidyBack = this.tidyFilter(dtTidy, dtMatch, 'day', rawDataarray)
            tidyHolder[dev] = tidyBack
          }
        } else {
          tidyHolder = dataRaw
        }
      } else {
        tidyHolder = dataRaw
      }
  } else {
    tidyHolder[dev] = []
    if (source.primary === 'derived') {
      dInfo = device.tidyList
      if (source.length !== 0) {
      // loop over per time segment
        for (let ts of source.timeseg) {
          console.log(ts)
          let dtTidy = dInfo
          let dtMatch = []
          let rawDataarrayc = dataRaw[dev]
          dtMatch = source.sourceDTs
          tidyBack = this.tidyFilterRemove(dtTidy, dtMatch, 'day', rawDataarrayc)
        }
        tidyHolder[dev] = tidyBack
      } else {
        tidyHolder = dataRaw
      }
    }
  }
  return tidyHolder
}

/**
* Tidy filter
* @method tidyFilter
*
*/
TidyDataSystem.prototype.tidyFilter = function (tidyInfo, dtList, ts, dataRaw) {
  // build object structureReturn
  let tidyHolderF = {}
  const manFilter = (e, tItem) => {
    let filterMat = null
    for (var i = 0; i < tItem.codes.length; i++) {
      if (e['heart_rate'] !== tItem.codes[i]) {
        filterMat = true
      } else {
        filterMat = false
      }
    }
    if (filterMat === true) {
      return e
    } else {
      e = {...e, heart_rate: null}
      return e
    }
  }
  for (let dttI of tidyInfo) {
    // loop over rawData until the start date matchtes
    for (let dtI of dtList) {
      // console.log(dtI)
      if (dataRaw[dtI.cnrl]) {
        let tidyDT = dtI.cnrl
        let rItem = dataRaw[dtI.cnrl][ts]
        // console.log(rItem)
        const newfullData = rItem.map(n => manFilter(n, dttI))
        let tsHolder = {}
        tsHolder[ts] = newfullData
        tidyHolderF[tidyDT] = tsHolder
      } else {
        tidyHolderF[dtI.cnrl][ts] = dataRaw[dtI.cnrl]
      }
    }
  }
  return tidyHolderF
}

/**
* Tidy filter remove
* @method tidyFilterRemove
*
*/
TidyDataSystem.prototype.tidyFilterRemove = function (tidyInfo, dtList, ts, dataRaw) {
  // build object structureReturn
  let tidyHolderF = {}
  const manFilter = (e, tItem) => {
    let filterMat = null
    for (var i = 0; i < tItem.codes.length; i++) {
      if (e['heart_rate'] !== tItem.codes[i]) {
        filterMat = true
      } else {
        filterMat = false
      }
    }
    return filterMat
  }
  for (let dttI of tidyInfo) {
    // loop over rawData until the start date matchtes
    for (let dtI of dtList) {
      if (dataRaw[dtI.cnrl]) {
        let tidyDT = dtI.cnrl
        let rItem = dataRaw[dtI.cnrl][ts]
        const newfullData = rItem.filter(n => manFilter(n, dttI))
        let tsHolder = {}
        tsHolder[ts] = newfullData
        tidyHolderF[tidyDT] = tsHolder
      } else {
        tidyHolderF[dtI.cnrl][ts] = dataRaw[dtI.cnrl]
      }
    }
  }
  return tidyHolderF
}

/**
* extract out the data type colum and timestamp
* @method extractDTcolumn
*
*/
TidyDataSystem.prototype.extractDTcolumn = function (sourceDT, arrayIN) {
  let singleArray = []
  let intData = 0
  for (let sing of arrayIN) {
    if (sourceDT.cnrl === 'cnrl-8856388711') {
      intData = parseInt(sing.heart_rate, 10)
      singleArray.push(intData)
    } else if (sourceDT.cnrl === 'cnrl-8856388712') {
      intData = parseInt(sing.steps, 10)
      singleArray.push(intData)
    }
  }
  return singleArray
}

export default TidyDataSystem
