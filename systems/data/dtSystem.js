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

// import CNRLmaster from '../../kbl-cnrl/cnrlMaster.js'
import TestStorageAPI from './dataprotocols/teststorage/testStorage.js'
const util = require('util')
const events = require('events')

var DTSystem = function (setIN) {
  events.EventEmitter.call(this)
  // this.liveCNRL = new CNRLmaster(setIN)
  this.liveTestStorage = new TestStorageAPI(setIN)
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
DTSystem.prototype.DTStartMatch = function (devicesIN, lDTs, catDTs) {
  let datatypePerdevice = {}
  // loop over devices and match to API etc
  for (let dliv of devicesIN) {
    let packagingDTs = null // this.liveCNRL.lookupContract(dliv.cnrl)
    // is the data type primary?
    let sourceDTextract = this.mapSourceDTs(lDTs)
    let sourceDTmapAPI = this.datatypeCheckAPI(packagingDTs, sourceDTextract)
    let SpackagingDTs = {}
    let TidyDataLogic = []
    // is this a derived source?
    if (packagingDTs.source !== 'cnrl-primary') {
      // look up source data packaging
      SpackagingDTs = null // this.liveCNRL.lookupContract(packagingDTs.source)
      // tidy data info available?
      if (packagingDTs.tidy === true) {
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
    } else {
      // extract tidy logic info.
      TidyDataLogic = packagingDTs.tidyList
    }
    // map DTs to API rest URL
    let DTmapAPI = this.datatypeCheckAPI(packagingDTs, lDTs)
    // do the same for categories dts
    let categoryMapDTs = this.mapCategoryDataTypes(catDTs, packagingDTs, lDTs, SpackagingDTs)

    let apiHolder = {}
    apiHolder[dliv.device_mac] = {}
    let apiInfo = {}
    apiInfo.apiquery = DTmapAPI
    apiInfo.sourceapiquery = sourceDTmapAPI
    apiInfo.sourceDTs = sourceDTextract
    apiInfo.categorycodes = categoryMapDTs
    apiInfo.datatypes = lDTs
    apiInfo.tidyList = TidyDataLogic
    apiHolder[dliv.device_mac] = apiInfo
    datatypePerdevice = apiHolder
  }
  return datatypePerdevice
}

/**
*  // map category datatypes
* @method mapCategoryDataTypes
*
*/
DTSystem.prototype.mapCategoryDataTypes = function (catDTs, packagingDTs, lDTs, SpackagingDTs) {
  // if null check if category dt, ie derived from two or more dataTypeSensor
  // let catDTmapAPI = []
  let checkDTcategory = []
  let extractCatDT = []
  if (catDTs.length > 0 && catDTs[0].cnrl !== 'none') {
    checkDTcategory = this.categoryCheck(catDTs[0], SpackagingDTs)
    // now check the API query for this dataType
    // todo extract data type ie loop over category matches, same or all different?
    // lookup the dataType
    let catDT = []
    extractCatDT = null // this.liveCNRL.lookupContract(checkDTcategory[0].column)
    catDT.push(extractCatDT.prime)
    // catDTmapAPI = this.datatypeCheckAPI(packagingDTs, catDT)
  } else {
    checkDTcategory = []
  }
  return checkDTcategory
}

/**
*  // map data prime to source data types
* @method datatypeCheckAPI
*
*/
DTSystem.prototype.datatypeCheckAPI = function (packagingDTs, lDTs) {
  console.log(packagingDTs)
  let apiMatch = []
  let apiKeep = {}
  // given datatypes select find match to the query string
  let tableCount = 0
  // match to source API query
  for (let dtt of packagingDTs.tableStructure) {
    // is there table structure embedd in the storageStructure?
    // check to see if table contains sub structure
    let subStructure = this.subStructure(dtt)
    if (subStructure.length > 0) {
      dtt = subStructure
    }
    for (let idt of lDTs) {
      const result = dtt.filter(item => item.cnrl === idt.cnrl)
      if (result.length > 0) {
        let packAPImatch = {}
        packAPImatch.cnrl = result[0].cnrl
        packAPImatch.column = result[0].text
        packAPImatch.api = packagingDTs.apistructure[tableCount]
        packAPImatch.namespace = packagingDTs.namespace
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
*  check for sub table structure
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

/**
*  map data type to souce DT if they exist
* @method mapSourceDTs
*
*/
DTSystem.prototype.mapSourceDTs = function (lDTs) {
  let sourceDTextract = []
  for (let iDT of lDTs) {
    // look up datatype contract to see if derived?
    let dtSourceContract = {'dtsource': {}} // this.liveCNRL.lookupContract(iDT.cnrl)
    if (dtSourceContract.source === 'cnrl-derived') {
      // loop over source DT's
      for (let sDT of dtSourceContract.dtsource) {
        // look up datatype contract
        let dtprime = sDT // this.liveCNRL.lookupContract(sDT)
        dtprime.prime['primary'] = 'derived'
        sourceDTextract.push(dtprime.prime)
      }
    } else {
      iDT['primary'] = 'primary'
      sourceDTextract.push(iDT)
    }
  }
  // need to remove duplicate elements
  sourceDTextract = sourceDTextract.filter((sourceDTextract, index, self) =>
    index === self.findIndex((t) => (
      t.cnrl === sourceDTextract.cnrl
    ))
  )
  return sourceDTextract
}
/**
*  // map data prime to source data types
* @method categoryCheck
*
*/
DTSystem.prototype.categoryCheck = function (cdt, catSource) {
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

/**
* take in two data type arrays and return matching dts
* @method mapDTs
*
*/
DTSystem.prototype.mapDTs = function (dts1, dts2) {
  // matching of two arrays
  let matchArray = []
  matchArray = dts1.filter(({ cnrl: id1 }) => dts2.some(({ cnrl: id2 }) => id2 === id1))
  return matchArray
}

/**
*  // lookup and assess table structure
* @method DTtableStructure
*
*/
DTSystem.prototype.DTtableStructure = function (dAPI) {
  let dtHolder = {}
  let subSourceAPI = {}
  let apiDTs = []
  // given datastore and CNRL science contract map the source API queries to datatypes or source Types
  let indivDT = {}
  let APIcnrl = dAPI // this.liveCNRL.lookupContract(dAPI)
  // loop over table structure and extract out the dataTypes
  for (let dtt of APIcnrl.tableStructure[0]) {
    // lookup source DT contracts and build
    if (dtt.cnrl !== 'datasub') {
      indivDT = dtt.cnrl // this.liveCNRL.lookupContract(dtt.cnrl)
      apiDTs.push(indivDT.prime)
    } else {
      // drill down a table level to access datatypes
      for (let stt of dtt.data) {
        indivDT = stt.cnrl // this.liveCNRL.lookupContract(stt.cnrl)
        apiDTs.push(indivDT.prime)
      }
    }
  }
  // does a sub or source structure contract exist?
  if (APIcnrl.source) {
    subSourceAPI = APIcnrl.source // this.liveCNRL.lookupContract(APIcnrl.source)
  }
  dtHolder.datatypes = apiDTs
  dtHolder.sourcedts = subSourceAPI
  return dtHolder
}

/**
*  // lookup dts from the science side
* @method DTscienceStructure
*
*/
DTSystem.prototype.DTscienceStructure = function (cnrl) {
  let sciDTholder = {}
  let sciSourceDTs = []
  let sciCategoryDTs = []
  let scienceCNRL = cnrl // this.liveCNRL.lookupContract(cnrl)
  // look up datatypes and check to see if they are derive from other datatypes?
  for (let iDT of scienceCNRL.datatypes) {
    let indivDT = iDT.cnrl // this.liveCNRL.lookupContract(iDT.cnrl)
    sciSourceDTs.push(indivDT.prime)
  }
  for (let icDT of scienceCNRL.categories) {
    let indivcDT = icDT.cnrl // this.liveCNRL.lookupContract(icDT.cnrl)
    sciCategoryDTs.push(indivcDT.prime)
  }
  sciDTholder.contract = scienceCNRL
  sciDTholder.datatypes = sciSourceDTs
  sciDTholder.categories = sciCategoryDTs
  return sciDTholder
}

/**
*  // convert datatype API to CNRL contract Text and CNRL ID
* @method convertAPIdatatypeToCNRL
*
*/
DTSystem.prototype.convertAPIdatatypeToCNRL = function (dtapiList) {
  let convertDTcnrl = []
  for (let dta of dtapiList.datatypes) {
    let conDT = dta.cnrl // this.liveCNRL.lookupContract(dta.cnrl)
    let convertDT = this.matchConvert(conDT)
    convertDTcnrl.push(convertDT)
  }
  return convertDTcnrl
}

/**
*  // convert matcher
* @method matchConvert
*
*/
DTSystem.prototype.matchConvert = function (dtC) {
  let matachedDTs = dtC.prime
  return matachedDTs
}

export default DTSystem
