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
import CNRLmaster from './cnrlMaster.js'
import KBLstorage from './kblStorage.js'

const util = require('util')
const events = require('events')

var KBLedger = function (apiCNRL, setIN) {
  events.EventEmitter.call(this)
  this.liveKBLStorage = new KBLstorage(setIN)
  this.liveCNRL = new CNRLmaster(setIN, this.liveKBLStorage)
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
* get the latest KBL state
* @method startKBL
*
*/
KBLedger.prototype.startKBL = async function () {
  // latest nxp and ledger entries, CNRL contract look ups
  let kbIndex = []
  let NXPlist = []
  let startLedger = await this.liveKBLStorage.getKBLindex('c')
  // loop over and filter out CNRL contract  (TODO expand based on signed and KBID address ie. crytop verification)
  for (let kb of startLedger) {
    let cnrlType = this.liveCNRL.lookupContract(kb.cnrl)
    let kBundle = {}
    kBundle.kbid = kb
    kBundle.cnrl = cnrlType
    kbIndex.push(kBundle)
  }
  // filter for NXP and Kbid entry
  for (let ki of kbIndex) {
    if (ki.cnrl.type === 'experiment') {
      NXPlist.push(ki.cnrl)
    }
  }
  return NXPlist
}

/**
*
* @method kbIndexQuery
*
*/
KBLedger.prototype.kbIndexQuery = async function (cnrl) {
  // latest nxp and ledger entries, CNRL contract look ups
  let KBIDlist = []
  let indexLedger = await this.liveKBLStorage.getKBLindex(cnrl)
  // filter for index for CNRL entry
  for (let ki of indexLedger) {
    if (ki.cnrl && ki.cnrl === cnrl) {
      KBIDlist.push(ki.kbid)
    }
  }
  return KBIDlist
}

/**
* get modules per NXP cnrl
* @method modulesCNRL
*
*/
KBLedger.prototype.modulesCNRL = async function (mList) {
  // modules for NXP cnrl contract
  let moduleList = []
  // look up module cnrls
  for (let km of mList) {
    let cnrlModule = this.liveCNRL.lookupContract(km)
    moduleList.push(cnrlModule)
  }
  return moduleList
}

/**
* reads KBIDS and extracts components
* @method kbidReader
*
*/
KBLedger.prototype.kbidReader = async function (kbid) {
  let expandCNRLrefs = {}
  let kbData = await this.liveKBLStorage.kblEntry(kbid)
  // expandout CNRL references yes
  // go through and extract cnrl contracts
  let cnrlTypes = Object.keys(kbData[0])
  for (let ct of cnrlTypes) {
    // fixed path structure of parsing ledger entry
    if (ct === 'data') {
      let dataCNRLrefs = {}
      let dataIndex = Object.keys(kbData[0][ct])
      for (let de of dataIndex) {
        dataCNRLrefs[de] = this.liveCNRL.lookupContract(kbData[0][ct][de])
      }
      expandCNRLrefs[ct] = dataCNRLrefs
    } else if (ct === 'time') {
      let timeCNRLrefs = {}
      for (let ti of kbData[0][ct].timeseg) {
        timeCNRLrefs[ti] = this.liveCNRL.lookupContract(ti)
      }
      let timeBundle = {}
      timeBundle.startperiod = kbData[0][ct].startperiod
      timeBundle.realtime = kbData[0][ct].realtime
      timeBundle.timeseg = timeCNRLrefs
      expandCNRLrefs[ct] = timeBundle
    } else if (ct === 'compute') {
      expandCNRLrefs[ct] = this.liveCNRL.lookupContract(kbData[0][ct].cnrl)
    } else if (ct === 'visualise') {
      let visCNRLrefs = {}
      let visIndex = Object.keys(kbData[0][ct])
      for (let ve of visIndex) {
        for (let ii of kbData[0][ct][ve]) {
          visCNRLrefs[ve] = this.liveCNRL.lookupContract(ii)
        }
      }
      expandCNRLrefs[ct] = visCNRLrefs
    }
  }
  return expandCNRLrefs
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
*  list of Experiment Live in Ledger
* @method liveNetworkExperimentLedger
*
*/
KBLedger.prototype.liveNetworkExperimentLedger = function () {
  let liveExperList = 0 // ['cnrl-848388553323', 'cnrl-888355992223', 'cnrl-888355992224', 'cnrl-888388992224', 'cnrl-888388232224', 'cnrl-888388233324', 'cnrl-888388443324']
  // await this.liveDataSystem.getExpKbundles()
  return liveExperList
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
*  extract MODLUES from ledger NXP
* @method extractComputations
*
*/
KBLedger.prototype.extractComputations = function () {
  let livecomputeList = ['cnrl-2356388731', 'cnrl-2356388737', 'cnrl-2356388732', 'cnrl-2356383848']
  return livecomputeList
}

/**
* call the CNRL on startup to get live science in network
* @method cnrlLivingKnowledge
*
*/
KBLedger.prototype.cnrlLivingKnowledge = function (refIN) {
  let startSemantics = this.liveCNRL.livingKnowledge(refIN)
  return startSemantics
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
