'use strict'
/**
*  EntitiesManager
*
*
* @class EntitiesManager
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import CNRLUtility from './kbl-cnrl/cnrlUtility.js'
import KBLedger from './kbl-cnrl/kbledger.js'
import CryptoUtility from './kbl-cnrl/cryptoUtility.js'
import Entity from './scienceEntities.js'
const util = require('util')
const events = require('events')
const pollingtoevent = require('polling-to-event')

var EntitiesManager = function (apiCNRL, auth) {
  events.EventEmitter.call(this)
  this.auth = auth
  this.liveCNRLUtility = new CNRLUtility(auth)
  this.KBLlive = new KBLedger(apiCNRL, auth)
  this.liveCrypto = new CryptoUtility()
  this.liveSEntities = {}
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(EntitiesManager, events.EventEmitter)

/**
* Read KBL and setup defaults for this peer
* @method peerKBLstart
*
*/
EntitiesManager.prototype.peerKBLstart = async function () {
  // read peer kbledger
  // let entityModule = {}
  let nxpList = await this.liveCNRLUtility.startKBL()
  // should return light data to UI or go ahead and prepare entity for this NXP
  // extract device per NXP so
  return nxpList
}

/**
* Read KBL and setup defaults for this peer
* @method peerKBLPeerstart
*
*/
EntitiesManager.prototype.peerKBLPeerstart = async function () {
  let nxpList = await this.liveCNRLUtility.startPeerNXP()
  // should return light data to UI or go ahead and prepare entity for this NXP
  // extract device per NXP so
  return nxpList
}

/**
* peer input into ECS
* @method PeerInput
*
*/
EntitiesManager.prototype.peerInput = async function (input) {
  console.log(input)
  let entityData = {}
  entityData[input.cnrl] = await this.addHSentity(input)
  return entityData
}

/**
*  create new HS entity
* @method addHSEntity
*
*/
EntitiesManager.prototype.addHSentity = async function (ecsIN) {
  let entitySet = {}
  let moduleState = false
  let shellID = ''
  let modules = []
  if (ecsIN.shellID) {
    console.log('EXXXISRIN ENTITY')
    shellID = ecsIN.shellID
    modules = ecsIN.modules // keep tabs on module in entity? this.liveSEntities[shellID].modulesGet(shellID)
    console.log('entity' + shellID + 'already exists')
    moduleState = true
    // update Reference Contract
    let updateKbid = this.updateRefcontract(modules)
    let entityLivedata = await this.entityDataReady(shellID, updateKbid)
    if (entityLivedata === false) {
      // use existing entity and process a new kbid entry to get vis data
      console.log('existing entity but need new kbid entry')
      this.ECSflow(shellID, ecsIN.modules)
    } else {
      // data is ready tell peer
      this.emit('visualUpdate', this.liveSEntities[shellID])
    }
  } else {
    console.log('NEW---ENTITY')
    shellID = this.liveCrypto.entityID(ecsIN)
    modules = await this.NXPmodules(shellID, ecsIN.modules)
    console.log('entity' + shellID + 'is new')
    // setup entity to hold components per module
    this.liveSEntities[shellID] = new Entity(this.auth)
    this.ECSflow(shellID, modules)
    moduleState = true
  }
  let entityStatus = ''
  if (moduleState === true) {
    entityStatus = shellID
  } else {
    entityStatus = 'failed'
  }
  entitySet.shellID = shellID
  entitySet.modules = modules
  console.log('return context to Peer UI')
  return entitySet
}

/**
*  perform action in modules
* @method ECSflow
*
*/
EntitiesManager.prototype.ECSflow = async function (shellID, modules) {
  // extract types of modules  // if existing should skip all but vis and compute
  console.log('STRT__ECS__FLOW')
  console.log(shellID)
  console.log(modules)
  let moduleState = false
  let deviceInfo = {}
  for (let md of modules) {
    // need matcher - module type to how its processed. Only computes have KBIDS
    if (md.type === 'Device') {
      // hook up to device
      console.log('device')
      deviceInfo = this.extractDevice(md.device.cnrl)
      moduleState = await this.deviceDataflow(shellID, deviceInfo)
    } else if (md.type === 'compute') {
      // feed into ECS -KBID processor
      console.log('compute start')
      // now check this KBID HASH against built CNRL inputs
      moduleState = await this.computeFlow(shellID, md, deviceInfo)
      console.log('after compuet')
      console.log(moduleState)
    } else if (md.type === 'Visualise') {
      // feed into ECS -KBID processor
      console.log('visualise start')
      console.log(md)
      // extract visualisation contract information
      moduleState = await this.visualFlow(shellID, md)
      this.emit('visualUpdate', this.liveSEntities[shellID])
    } else {
      // plain extract info. from CNRL contract
    }
  }
}

/**
*  add device component daata
* @method deviceDataflow
*
*/
EntitiesManager.prototype.deviceDataflow = async function (shellID, apiData) {
  let statusD = false
  // set the device in module
  statusD = await this.liveSEntities[shellID].liveDeviceC.setDevice(apiData.api)
  // proof of evidence
  // this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDeviceC)
  statusD = true
  return statusD
}

/**
*  control the adding of data to the entity
*  KnowledgeSciptingLanguage(forth/stack)to give gurantees)
* @method computeFlow
*
*/
EntitiesManager.prototype.computeFlow = async function (shellID, modContract, apiData) {
  console.log('COMPUTEFLOW0-----begin')
  let contractChanges = {}
  let updateContract = {}
  let hashMatcher = false
  // look at compute controls and see if time need brought up to date?
  if (modContract.automation === true) {
    // defaults is to bring up to date computations if set tru
    contractChanges = this.automationUpdate(shellID, modContract)
    console.log('new compute-- new verison Refcontract and create new KBID entry')
    this.liveSEntities[shellID].liveTimeC.timerange = [1588114800000]
    modContract.dtcompute = ['cnrl-8856388711', 'cnrl-8856388712']
    // else go through creating new KBID entry
    // range of time, number of devices, number of data types  do all the loop here?
    for (let device of this.liveSEntities[shellID].liveDeviceC.devices) {
      for (let datatype of modContract.dtcompute) {
        for (let time of this.liveSEntities[shellID].liveTimeC.timerange) {
          // set the new updated time settings for the new contract
          modContract.time.timeseg = contractChanges.timeseg
          modContract.time.startperiod = time
          // should this CNRL contract be update and saved for time changes prob. no.
          let engineReturn = await this.computeEngine(shellID, apiData, modContract, device, datatype, time)
          console.log('COMPUTEengine return')
          // first save results crypto storage
          let mockAPI = {}
          mockAPI.namespace = 'http://165.227.244.213:8882'
          mockAPI.path = '/inresults/'
          // prepare save structure
          let saveObject = {}
          saveObject.timestamp = 1
          saveObject.hash = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDataC.liveData)
          saveObject.data = this.liveSEntities[shellID].liveDataC.liveData
          // console.log(saveObject2222)
          let saveResults = await this.liveSEntities[shellID].liveDataC.directSaveResults('REST', mockAPI, saveObject)
          // new version of Ref Contract
          this.liveCNRLUtility.saveModule(modContract)
          // prepare and save KBID entry
          let newKBIDentry = {}
          //newKBIDentry.previous = kbid.kbid
          newKBIDentry.result = saveObject.hash
          // prepare new KBID hash
          let newKBIDhash = this.liveCrypto.hashKBID(modContract, saveObject.hash)
          newKBIDentry.kbid = newKBIDhash
          newKBIDentry.token = ''
          newKBIDentry.dml = ''
          let kbidEntryPass = await this.KBLlive.kbidEntrysave(newKBIDentry)
          if (kbidEntryPass === true) {
            let newIndex = {}
            newIndex.timestamp = 1
            newIndex.cnrl = modContract.cnrl
            newIndex.kbid = newKBIDhash
            let indexKBID = await this.KBLlive.kbidINDEXsave(newIndex)
          }
        }
      }
    }
  }
  console.log('COMPUTEFLOW9-----FINISHED')
  // console.log(this.liveSEntities[shellID])
  return true
}

/**
* compute engine to prepare new KBID entry
* @method computeEngine
*
*/
EntitiesManager.prototype.computeEngine = async function (shellID, apiData, contract, device, datatype, time) {
  console.log('comput engine start')
  this.liveSEntities[shellID].liveTimeC.setMasterClock(contract.time.startperiod)
  // proof of evidence
  // this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveTimeC)
  this.liveSEntities[shellID].liveDatatypeC.dataTypeMapping(apiData, contract, device, datatype)
  // proof of evidence
  // this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDatatypeC)
  await this.liveSEntities[shellID].liveDataC.sourceData(this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive, contract, '####', device.device_mac, datatype, time)
  // proof of evidence
  // this.liveCrypto.evidenceProof()
  // this.emit('computation', 'in-progress')
  this.computeStatus = await this.liveSEntities[shellID].liveComputeC.filterCompute(contract, device.device_mac, datatype, time, this.liveSEntities[shellID].liveDataC.liveData)
  // proof of evidence
  // this.liveCrypto.evidenceProof()
  // this.emit('computation', 'finished')
  return true
}

/**
*  visualisation rules to prepare for
* @method visualFlow
*
*/
EntitiesManager.prototype.visualFlow = async function (shellID, visModule) {
  console.log('VISUALFLOW-----begin')
  let visContract = this.liveCNRLUtility.contractCNRL(visModule.visualise)
  // what has been ask for check rules
  let rules =  ['cnrl-8856388711', 'cnrl-8856388712']
  // this.liveSEntities[shellID].liveDeviceC.devices
  let tempDevices = ['D3:CE:05:E9:38:74', 'C4:87:DB:73:19:E2']
  for (let device of tempDevices) {
    for (let rule of rules) {
      // console.log(this.liveSEntities[shellID].liveDataC.liveData[rule.yaxis])
      // hash the context device, datatype and time
      let dataID = {}
      dataID.device = device
      dataID.datatype = rule
      dataID.time = 1588114800000 // time
      let datauuid = this.liveCrypto.evidenceProof(dataID)
      this.liveSEntities[shellID].liveVisualC.filterVisual(visContract, rule, this.liveSEntities[shellID].liveDataC.liveData[datauuid])
      // proof of evidence
      // this.liveCrypto.evidenceProof()
      // this.emit('visualUpdate', this.liveSEntities[shellID])
    }
  }
  return true
}

/**
// *  if the entity visualisation data already exists
* @method entityDataReady
*
*/
EntitiesManager.prototype.entityDataReady = async function (shellID) {
  let resultExist = false
  let hashmatcher = false
  // does the data exist for this visualisation request?
  let checkDataExist = this.checkForResultsData(shellID, 'hash')
  if (checkDataExist === true) {
    console.log('vis data in MEMORY')
    resultExist = true
  } else {
    // check datestore for data  use kbid UUID to get source hash and query that hash
    // form hash of inputs KIBs and then query results
    // let kbidInfo = await this.extractKBID(md.cnrl, 1)
    let checkKbid = this.extractKBID('hash', 1)
    hashMatcher = this.compareKBIDs(modContract, kbid)
    if (hashMatcher === true) {

    } else {
      // uses the current KBID entry
      hashMatcher = this.compareKBIDs(modContract, kbid)
    }
    // look up source reference
    let mockAPI = {}
    mockAPI.namespace = 'http://165.227.244.213:8882'
    mockAPI.path = '/results/'
    let checkResults = await this.liveSEntities[shellID].liveDataC.directResults('REST', mockAPI, checkKbid.result)
    if (checkResults.length > 0) {
      // yes data so get it back to Peer
      console.log('yes, results in datastore')
      resultExist = true
    } else {
      // not results must prepare new
      resultExist = false
      console.log('need new kbid entry to form results')
    }
  }
  return resultExist
}

/**
*  return data from an entity
* @method entityDataReturn
*
*/
EntitiesManager.prototype.entityDataReturn = function (entityDID) {
  // need to poll / made responsive to new updates
  // this.emit('displayUpdate', this.liveSEntities[entityDID].visualData)
  return this.liveSEntities[entityDID]
}

/**
* update module Reference contracts
* @method updateRefcontract
*
*/
EntitiesManager.prototype.updateRefcontract = function (changes, contract) {
  console.log('update ref contract time???')
  console.log(changes)
  console.log(contract)
  let modifiedContract = {}
  return modifiedContract
}

/**
* automated time updates
* @method automationUpdate
*
*/
EntitiesManager.prototype.automationUpdate = function (shellID, contract) {
  // look up time seg contract
  let localContract = contract
  let extractContract = {}
  let timeSeg =  this.liveCNRLUtility.contractCNRL(contract.time.timeseg[0])
  localContract.time.timeseg = timeSeg
  extractContract.timeseg = timeSeg
  let addTimerange = this.liveSEntities[shellID].liveTimeC.timeProfiling(localContract.time)
  // update contract time
  extractContract.range = addTimerange
  return extractContract
}

/**
* logic control over kbid need prepared
* @method compareKBIDs
*
*/
EntitiesManager.prototype.compareKBIDs = function (mod, kbid) {
  let newKBID = this.liveCrypto.hashKBID(mod, kbid.result)
  let hashMatcher = this.liveCrypto.compareHashes(kbid.kbid, newKBID)
  // If the result HASH then just look at Visulisation inputs and send the data back.
  return hashMatcher
}

/**
* modules per NXP cnrl
* @method NXPmodules
*
*/
EntitiesManager.prototype.NXPmodules = async function (exist, mList) {
  // if module contract not read, read peer's kbledger
  let nxpList = []
  nxpList = await this.liveCNRLUtility.modulesCNRL(mList)
  return nxpList
}

/**
* Extract the device information
* @method extractDevice
*
*/
EntitiesManager.prototype.extractDevice = function (cnrl) {
  let deviceBundle = {}
  let deviceAPI = this.liveCNRLUtility.contractCNRL(cnrl)
  let sourceAPI = {}
  // check to see if it has a source api e.g  mobile storage first?
  if(deviceAPI.source !== 'cnrl-primary') {
    sourceAPI = this.liveCNRLUtility.contractCNRL(deviceAPI.source)
  }
  deviceBundle.api = deviceAPI
  deviceBundle.primary = sourceAPI
  return deviceBundle
}

/**
* knowledge Bundle Index Module CNRL matches
* @method extractKBID
*
*/
EntitiesManager.prototype.extractKBID = async function (cnrl, n) {
  let KBIDdata = {}
  let kbidList = await this.KBLlive.kbIndexQuery(cnrl, n)
  if (kbidList.length > 0) {
    for (let ki of kbidList) {
      KBIDdata = await this.kbidEntry(ki.kbid)
    }
  } else {
    KBIDdata = kbidList
  }
  return KBIDdata
}

/**
* knowledge Bundle Ledger Entry Data extraction
* @method kbidEntry
*
*/
EntitiesManager.prototype.kbidEntry = async function (kbid) {
  // read peer kbledger
  let kbidData = await this.KBLlive.kbidReader(kbid)
  return kbidData[0]
}

/**
*  list all live Enties index CIDs
* @method listEntities
*
*/
EntitiesManager.prototype.listEntities = function () {
  return this.liveSEntities
}

/**
*  add component
* @method addComponent
*
*/
EntitiesManager.prototype.addComponent = function (entID) {
}

/**
*  extract the lastest ie most uptodate data in entity
* @method latestData
*
*/
EntitiesManager.prototype.latestData = function (dataIn) {
  let lastArray = dataIn.slice(-1)
  return lastArray
}

/**
*  check if entity already has data visual in memory
* @method checkForResultsData
*
*/
EntitiesManager.prototype.checkForResultsData = function (shellID, hash) {
  //  this only check for last prepareData
  let entityData = this.liveSEntities[shellID].liveVisualC.visualData
  if (entityData[hash]) {
    return true
  } else {
    return false
  }
}

/**
* build context for Toolkit
* @method deviceExtract
*
*/
EntitiesManager.prototype.deviceExtract = async function (flag, device) {
  // first time start of device, datatype context for toolkitContext
  let apiData = {}
  if (flag === 'device') {
    apiData = await this.livedeviceSystem.storedDevices(device)
    // merg arrays
    // let flatd = [].concat(...devicesList)
    // apiData = flatd // await this.livedeviceSystem.systemDevice(dapi
  } else if (flag === 'dataType') {
    apiData[device.device_mac] = this.cnrlDeviceDTs(device.cnrl)
  }
  return apiData
}

/**
*  remove component
* @method removeComponent
*
*/
EntitiesManager.prototype.removeComponent = function (entID) {

}

/**
*  start polling function
* @method startPolling
*
*/
EntitiesManager.prototype.startPolling = function (entID) {
  // var url = "http://localhost/nodebook/polling/node-polling-to-event/example/json/birdList.json";
  const localthis = this
  console.log(this.liveSEntities)
  let emitter = pollingtoevent(function(done) {
    let data = 'james' // localthis.liveSEntities[entID].liveVisualC
    let err = 'no data'
    done(err, data)
  }, {
    longpolling: true
  })

  emitter.on("longpoll", function(data) {
    console.log("longpoll emitted at %s, with data %j", Date.now(), data)
  })

  emitter.on("error", function(err) {
    console.log("Emitter errored: %s. with", err)
  })
}

export default EntitiesManager
