'use strict'
/**
*  cnrl utiltiy for contract extraction
*
*
* @class CNRLUtility
* @package    CNRLUtility
* @copyright  Copyright (c) 2020 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
const util = require('util')
const events = require('events')
const axios = require('axios')

var CNRLUtility = function (liveCNRL) {
  events.EventEmitter.call(this)
  this.liveCNRL = liveCNRL
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(CNRLUtility, events.EventEmitter)

/**
*  trace to source contract
* @method traceSource
*
*/
CNRLUtility.prototype.traceSource = function (dataSource) {
  console.log('datasource')
  console.log(dataSource)
  let soureInfoDTs = {}
  // are the DataTypes primary or derived?
  let sourceDTextract = this.mapSourceDTs(dataSource.datatypein)
  soureInfoDTs.datatypes = sourceDTextract
  // is the API derived?
  let sourceInfo = this.checkForSourceAPI(dataSource, sourceDTextract)
  soureInfoDTs.tidy = sourceInfo.tidy
  // do the same for categories dts
  let categoryMapDTs = this.mapCategoryDataTypes(dataSource, sourceInfo)
  soureInfoDTs.category = categoryMapDTs
  return soureInfoDTs
}

/**
*  map data type to souce DT if they exist //
* @method mapSourceDTs
*
*/
CNRLUtility.prototype.mapSourceDTs = function (lDTs) {
  let sourceDTextract = []
  for (let iDT of lDTs) {
    // look up datatype contract to see if derived?
    if (iDT.source === 'cnrl-derived') {
      // loop over source DT's
      for (let sDT of iDT.dtsource) {
        // look up datatype contract
        let dtprime = this.liveCNRL.lookupContract(sDT)
        dtprime.prime['primary'] = 'derived'
        sourceDTextract.push(dtprime.prime)
      }
    } else {
      iDT['primary'] = 'primary'
      sourceDTextract.push(iDT)
    }
  }
  // need to remove duplicate elements
  sourceDTextract = sourceDTextract.filter((dtSource, index, self) =>
    index === self.findIndex((t) => (
        t.cnrl === dtSource.cnrl
    ))
  )
  return sourceDTextract
}

/**
*  check if API data has source ie primary origin? Extract tidy info.
* @method checkForSourceAPI
*
*/
CNRLUtility.prototype.checkForSourceAPI = function (dataSource, sourceDTextract) {
  console.log('check for source API')
  let sourceAPI = {}
  if (dataSource.source !== 'cnrl-primary') {
    // look up source data packaging
    sourceAPI.source = this.liveCNRL.lookupContract(dataSource.source)
    sourceAPI.tidy = this.tidyDataReported(sourceAPI.source, sourceDTextract)
  } else {
    // extract tidy logic info.
    sourceAPI.tidy = dataSource.tidyList
  }
  return sourceAPI
}

/**
*  does data need tidying?
* @method tidyDataReported
*
*/
CNRLUtility.prototype.tidyDataReported = function (dataSource, sourceDTextract) {
  // tidy data info available?
  let TidyDataLogic = {}
  if (dataSource.tidy === true) {
    // investiage the source contract
    // does the live DT require any tidying?
    for (let tldt of SpackagingDTs.tidyList) {
      for (let dtl of sourceDTextract) {
        if (dtl.cnrl === tldt.cnrl) {
          TidyDataLogic = SpackagingDTs.tidyList
        } else {
          // TidyDataLogic = []
        }
      }
    }
  }
  return TidyDataLogic
}

/**
*  // map category datatypes //
* @method mapCategoryDataTypes
*
*/
CNRLUtility.prototype.mapCategoryDataTypes = function (source, SpackagingDTs) {
  // if null check if category dt, ie derived from two or more dataTypeSensor
  // let catDTmapAPI = []
  let checkDTcategory = []
  let extractCatDT = []
  if (source.category.length > 0 && source.category.cnrl !== 'none') {
    checkDTcategory = this.categoryCheck(source.category, SpackagingDTs)
    // now check the API query for this dataType
    // todo extract data type ie loop over category matches, same or all different?
    // lookup the dataType
    let catDT = []
    extractCatDT = this.liveCNRL.lookupContract(source.category.column)
    catDT.push(extractCatDT.prime)
    // catDTmapAPI = this.datatypeCheckAPI(packagingDTs, catDT)
  } else {
    checkDTcategory = []
  }
  return checkDTcategory
}

/**
*  // map data prime to source data types //
* @method categoryCheck
*
*/
CNRLUtility.prototype.categoryCheck = function (cdt, catSource) {
  let catMatch = []
  for (let catS of catSource.categorycodes) {
    for (let sc of catS.categories) {
      let scat = sc.cnrl
      let uicat = cdt.cnrl
      // any matches to data type in
      if (scat === uicat) {
        let codeLogic = sc.code
        let catHolderLogic = {}
        catHolderLogic.column = catS.column
        catHolderLogic.code = codeLogic
        catMatch.push(catHolderLogic)
      }
    }
  }
  return catMatch
}

export default CNRLUtility
