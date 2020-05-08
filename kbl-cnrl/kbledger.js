'use strict'
/**
*  Knowledge Bundle Ledger
*
*
* @class KBLedger
* @package    KBLedger
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import KBLstorage from './kblStorage.js'

const util = require('util')
const events = require('events')

var KBLedger = function (apiCNRL, setIN) {
  events.EventEmitter.call(this)
  this.liveKBLStorage = new KBLstorage(setIN)
  this.liveAPI = apiCNRL
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(KBLedger, events.EventEmitter)

/**
*  initialise forming of KBL
* @method genesisKBL
*
*/
KBLedger.prototype.genesisKBL = function () {
  let newLedger = 'new'
  return newLedger
}

/**
*
* @method kbIndexQuery
*
*/
KBLedger.prototype.kbIndexQuery = async function (cnrl, n) {
  // latest nxp and ledger entries, CNRL contract look ups
  let indexKBLedger = await this.liveKBLStorage.getKBLindex(cnrl, n)
  return indexKBLedger
}

/**
* reads KBIDS and extracts components
* @method kbidReader
*
*/
KBLedger.prototype.kbidReader = async function (kbid) {
  let kbData = await this.liveKBLStorage.kblEntry(kbid)
  return kbData
}

/**
* save KBID entry
* @method kbidEntrysave
*
*/
KBLedger.prototype.kbidEntrysave = async function (kbidi) {
  let kbData = await this.liveKBLStorage.saveKBID(kbidi)
  return true
}

/**
* save KBID INDEX
* @method kbidINDEXsave
*
*/
KBLedger.prototype.kbidINDEXsave = async function (kbidi) {
  let kbData = await this.liveKBLStorage.saveKBIDindex(kbidi)
  return kbData
}

/**
* save or get start Status data
* @method startSettings
*
*/
KBLedger.prototype.startSettings = async function (flag, bundle) {
  // first time start of device, datatype context for toolkitContext
  // let uuidBundle = this.createKBID(liveBundle)
  let startStatusData = []
  if (flag === 'save') {
    startStatusData = await this.liveDataSystem.saveStartStatus(bundle)
  } else if (flag === 'retreive') {
    startStatusData = await this.liveTestStorage.getStartSettings() // await this.liveDataSystem.getStartStatus()
  } else if (flag === 'remove') {
    startStatusData = await this.liveDataSystem.removeStartStatus(bundle)
  } else if (flag === 'removedash') {
    startStatusData = await this.liveDataSystem.removeStartDash(bundle)
  }
  return startStatusData
}

/**
* mapping of Network Experiments to Kbundles entities save retrieve
* @method experimentKbundles
*
*/
KBLedger.prototype.experimentKbundles = async function (flag, data) {
  // first time start of device, datatype context for toolkitContext
  let startStatusData = []
  if (flag === 'save') {
    startStatusData = await this.liveTestStorage.saveExpKbundles(data)
  } else if (flag === 'retreive') {
    startStatusData = await this.liveTestStorage.getExpKbundles()
  }
  return startStatusData
}

/**
*  last Knowledge Bundles from Ledger
* @method latestKBs
*
*/
KBLedger.prototype.latestKBs = async function () {
  let lastestKBs = await this.liveDataSystem.getExpKbundles()
  return lastestKBs
}

/**
* compute time options
* @method cnrlTimeIndex
*
*/
KBLedger.prototype.cnrlTimeIndex = function (refIN) {
  let timeSegments = this.liveCNRL.timeContracts(refIN)
  return timeSegments
}

/**
* experiment index query
* @method cnrlExperimentIndex
*
*/
KBLedger.prototype.cnrlExperimentIndex = function () {
  let cnrlDetail = []
  let index = this.liveCNRL.indexExperiments()
  for (let ie of index) {
    // lookup contracts
    let cnrlContract = this.liveCNRL.lookupContract(ie)
    cnrlDetail.push(cnrlContract)
  }
  return cnrlDetail
}

/**
* datatype on CNRL network index query
* @method cnrlNetworkDatatypeIndex
*
*/
KBLedger.prototype.cnrlNetworkDatatypeIndex = function () {
  let cnrlDetail = []
  let index = this.liveCNRL.indexDatatypes()
  for (let ie of index) {
    // lookup contracts
    let cnrlContract = this.liveCNRL.lookupContract(ie)
    cnrlDetail.push(cnrlContract)
  }
  return cnrlDetail
}

/**
* computes on CNRL network index query
* @method cnrlNetworkComputeIndex
*
*/
KBLedger.prototype.cnrlNetworkComputeIndex = function () {
  let cnrlDetail = []
  let index = this.liveCNRL.indexCompute()
  for (let ie of index) {
    // lookup contracts
    let cnrlContract = this.liveCNRL.lookupContract(ie)
    cnrlDetail.push(cnrlContract)
  }
  return cnrlDetail
}

/**
* look up device data types and return in CNRL format
* @method cnrlDeviceDTs
*
*/
KBLedger.prototype.cnrlDeviceDTs = function (cid) {
  let cnrlContract = this.liveDTsystem.DTtableStructure(cid)
  // now convert to CNRL speak
  let convertedDTs = this.liveDTsystem.convertAPIdatatypeToCNRL(cnrlContract)
  cnrlContract.datatypes = convertedDTs
  return cnrlContract
}

export default KBLedger
