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
import AutomationManager from './automationManager.js'
import LibComposer from 'refcontractcomposer'
import CNRLUtility from './kbl-cnrl/cnrlUtility.js'
import KBLedger from './kbl-cnrl/kbledger.js'
import CryptoUtility from './kbl-cnrl/cryptoUtility.js'
import Entity from './scienceEntities.js'
import util from 'util'
import events from 'events'
// import pollingtoevent from 'polling-to-event'

var EntitiesManager = function (apiCNRL, auth) {
  events.EventEmitter.call(this)
  this.auth = auth
  this.liveAutomation = new AutomationManager()
  this.liveLibrary = new LibComposer()
  this.liveCNRLUtility = new CNRLUtility(auth)
  // this.KBLlive = new KBLedger(apiCNRL, auth)
  this.liveCrypto = new CryptoUtility()
  this.liveSEntities = {}
  this.automationReview()
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(EntitiesManager, events.EventEmitter)

/**
* assess automation and go ahead with updates
* @method automationReview
*
*/
EntitiesManager.prototype.automationReview = function (refCont) {
  let automationInfo = {}
  let contractList = this.liveAutomation.assessAutomation()
  if (contractList === true) {
    // go ahead and update computation vie ECS and Ledger updates
    automationInfo.data = []
    // setup entities and process compute as per automation rules
    /* for (let autoItem of contractList) {
      this.peerInput(autoItem)
    } */
  } else {
    // no automation require
    automationInfo.data = 'none'
  }
  console.log('automation assessed and complete')
  return automationInfo
}

/**
* Read KBL and setup defaults for this peer
* @method peerKBLstart
*
*/
EntitiesManager.prototype.peerKBLstart = async function (refCont) {
  // read peer kbledger
  let NXPexpanded = refCont // assume incoming NXP is expanded formar, need to check
  let dataSummary = this.peerInput(NXPexpanded)
  return dataSummary
}

/**
* Read KBL and setup defaults for this peer
* @method peerKBLPeerstart
*
*/
EntitiesManager.prototype.peerKBLPeerstart = async function () {
  // let nxpList = await this.liveCNRLUtility.startPeerNXP()
  // should return light data to UI or go ahead and prepare entity for this NXP
  // extract device per NXP so
  return false // nxpList
}

/**
* peer input into ECS
* @method PeerInput
*
*/
EntitiesManager.prototype.peerInput = async function (input) {
  console.log('input nxp ecs')
  console.log(input)
  let entityData = {}
  entityData[input.exp.key] = await this.addHSentity(input)
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
  if (ecsIN.update !== undefined && ecsIN.update.entityUUID) {
    shellID = ecsIN.update.entityUUID
    modules = ecsIN.update.modules // keep tabs on module in entity? this.liveSEntities[shellID].modulesGet(shellID)
    console.log('entity--' + shellID + '--exists')
    moduleState = true
    // update library Module Reference Contract but first check if KBID exist ie result prepared and ready to return
    let entityLivedata = await this.entityDataReady(shellID, ecsIN)
    if (entityLivedata === false) {
      // use existing entity and process a new kbid entry to get vis data
      console.log('existing entity but need new compute & KIBID entry')
      this.ECSflow(shellID, ecsIN.update, modules)
      // data is ready tell peer
    } else {
      this.emit('visualUpdate', this.liveSEntities[shellID])
    }
  } else {
    // need to setup new ECS entity for this network experiment
    shellID = this.liveCrypto.entityID(ecsIN.exp)
    modules = ecsIN.modules // await this.NXPmodules(shellID, ecsIN.modules)
    console.log('ENTITY--' + shellID + '--is new')
    // setup entity to hold components per module
    this.liveSEntities[shellID] = new Entity(this.auth)
    this.ECSflow(shellID, ecsIN.exp, modules)
    moduleState = true
  }
  let entityStatus = ''
  if (moduleState === true) {
    entityStatus = shellID
  } else {
    entityStatus = 'failed'
  }
  entitySet.type = 'ecssummary'
  entitySet.shellID = shellID
  entitySet.modules = modules
  console.log('entity summary new----------')
  // console.log(entitySet)
  // emit an event best?
  return entitySet
}

/**
*  control the adding of data to the entity
*  KnowledgeSciptingLanguage(forth/stack)to give gurantees)
*  perform action in modules
* @method ECSflow
*
*/
EntitiesManager.prototype.ECSflow = async function (shellID, ECSinput, modules) {
  // ALL FLOWS MADE IMMUMATABLE via  FORTH like scripting
  console.log('start ECSflow--------')
  // console.log(shellID)
  // console.log(ECSinput)
  // console.log(modules)
  let automation = true
  // convert modules to array to order flow
  // module has a specific order  question, data, compute, visualise, etc.
  let moduleOrder = this.orderModuleFlow(modules)
  // extract types of modules  // if existing should skip all but vis and compute
  let flowState = {}
  let deviceInfo = {}
  // first assess what first flow and create waiting list (if any)
  let autoCheck = this.liveAutomation.updateAutomation(moduleOrder.compute.value.info)
  if (ECSinput.input === 'refUpdate') {
    console.log('entityUpdateStart-----------')
    // reset time range
    this.liveSEntities[shellID].liveTimeC.restTimerange()
    // reset the visualise chart data list
    this.liveSEntities[shellID].liveVisualC.restVisDataList()
    flowState = await this.computePrepare(shellID, moduleOrder.compute)
    // console.log('UPDARTES--fllowww state prepared')
    // console.log(flowState)
    if (flowState.single === true) {
      // console.log('UPDATE SINGLE start')
      await this.computeFlow(shellID, flowState.updateModContract, this.liveSEntities[shellID].liveDeviceC.activedevice, this.liveSEntities[shellID].liveDatatypeC.datatypesLive[0], flowState.updateModContract.value.info.controls.date)
      // process updated vis ref contract
      await this.visualFlow(shellID, moduleOrder.visualise, flowState, this.liveSEntities[shellID].liveDeviceC.activedevice, moduleOrder.visualise.value.info.settings.yaxis[0],  flowState.updateModContract.value.info.controls.date)
      let entityContext = {}
      entityContext.context = ECSinput
      entityContext.data = this.liveSEntities[shellID]
      this.emit('visualUpdate', entityContext)
      //console.log('update EMIT')
      this.liveSEntities[shellID].liveVisualC.liveVislist = {}
    }
    if (flowState.timerange === true || flowState.datatyperange === true) {
      console.log('UPDATE range list start---------')
      // remove time already processed
      this.liveSEntities[shellID].liveTimeC.removeTime()
      // console.log(this.liveSEntities[shellID].liveDeviceC.devices)
      // console.log(this.liveSEntities[shellID].liveDatatypeC.datatypesLive)
      // console.log(this.liveSEntities[shellID].liveTimeC.timerange)
      // console.log('multiple vis required UPDATE')
      for (let device of this.liveSEntities[shellID].liveDeviceC.devices) {
        // console.log('compute---deivce')
        // console.log(device)
        for (let datatype of this.liveSEntities[shellID].liveDatatypeC.datatypesLive) {
          // console.log('compute---datatype')
          // console.log(datatype)
          for (let time of this.liveSEntities[shellID].liveTimeC.timerange) {
            // console.log('compute---time')
            // console.log(time)
            await this.computeFlow(shellID, flowState.updateModContract, device, datatype, time)
            // visualise - extract visualisation contract information
            await this.visualFlow(shellID, moduleOrder.visualise, flowState, device, datatype, time)
            // required back instant or update resutls store or both
          }
        }
      }
      // single or multi chart?
      if (moduleOrder.visualise.value.info.settings.singlemulti === true) {
        this.visSingleVis(shellID)
      }
      let entityContext = {}
      entityContext.context = ECSinput
      entityContext.data = this.liveSEntities[shellID]
      this.emit('visualUpdateRange', entityContext)
      // console.log('batch EMIT multi')
      this.liveSEntities[shellID].liveVisualC.liveVislist = {}
    }
    // if automation == true process list TODO
  } else {
    console.log('new FLOW')
    // need matcher - module type to how its processed.
    // 1 Data module hook up to device
    deviceInfo = moduleOrder.data.value.info.data.value
    let apiData = await this.deviceDataflow(shellID, deviceInfo)
    // 2 Compute - feed into ECS -KBID processor
    flowState = await this.computePrepare(shellID, moduleOrder.compute)
    console.log('FIRST flowstate prepared')
    console.log(flowState)
    // all automtion variales extracted, do first and then start on await list
    // single or loop
    if (flowState.single === true) {
      console.log('single compute flow')
      await this.computeFlow(shellID, flowState.updateModContract, this.liveSEntities[shellID].liveDeviceC.activedevice, this.liveSEntities[shellID].liveDatatypeC.datatypesLive[0], flowState.updateModContract.value.info.controls.date)
      // visualise - extract visualisation contract information
      await this.visualFlow(shellID, moduleOrder.visualise, flowState, this.liveSEntities[shellID].liveDeviceC.activedevice, moduleOrder.visualise.value.info.settings.yaxis[0], flowState.updateModContract.value.info.controls.date)
      this.emit('visualFirst', this.liveSEntities[shellID])
      // console.log('first EMIT')
      this.liveSEntities[shellID].liveVisualC.liveVislist = {}
    }
    console.log(flowState.timerange)
    console.log(flowState.datatyperange)
    if (flowState.timerange === true || flowState.datatyperange === true) {
      console.log('multiple vis required FIRST')
      if (flowState.datatyperange === true) {
        // remove the first datatype already returned
        this.liveSEntities[shellID].liveDatatypeC.datatypesLive.shift()
      }
      for (let device of this.liveSEntities[shellID].liveDeviceC.devices) {
        // console.log('compute---deivce')
        // console.log(device)
        for (let datatype of this.liveSEntities[shellID].liveDatatypeC.datatypesLive) {
          console.log('compute---datatype')
          console.log(datatype)
          console.log('time range ??????????')
          console.log(this.liveSEntities[shellID].liveTimeC.timerange)
          for (let time of this.liveSEntities[shellID].liveTimeC.timerange) {
            console.log('compute---time')
            console.log(time)
            await this.computeFlow(shellID, flowState.updateModContract, device, datatype, time)
            // visualise - extract visualisation contract information
            await this.visualFlow(shellID, moduleOrder.visualise, flowState, device, datatype, time)
          }
        }
      }
      // single or multi chart?
      if (moduleOrder.visualise.value.info.settings.singlemulti === true) {
        this.visSingleVis(shellID)
      }
      let entityContext = {}
      entityContext.context = ECSinput
      entityContext.data = this.liveSEntities[shellID]
      // required back instant or update resutls store or both
      this.emit('visualFirstRange', entityContext)
      console.log('range first EMIT')
      this.liveSEntities[shellID].liveVisualC.liveVislist = {}
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
  statusD = await this.liveSEntities[shellID].liveDeviceC.setDevice(apiData.concept)
  // proof of evidence
  // this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDeviceC)
  statusD = true
  return statusD
}

/**
*
* @method orderModuleFlow
*
*/
EntitiesManager.prototype.orderModuleFlow = function (modules) {
  let moduleOrder = {}
  for (let mod of modules) {
    if (mod.value.type === 'data') {
      moduleOrder.data = mod
    } else if (mod.value.type === 'compute') {
      moduleOrder.compute = mod
    } else if (mod.value.type === 'visualise') {
      moduleOrder.visualise = mod
    }
  }
  return moduleOrder
}

/**
*
* @method computePrepare
*
*/
EntitiesManager.prototype.computePrepare = async function (shellID, modContract) {
  // console.log('computePrepare START-------------')
  let singleStatus = true
  let flowOrder = {}
  // console.log(shellID)
  // console.log(modContract)
  // console.log(apiData)
  // these are old CNRL contract TODO update to Network Library Ref contracts
  let timePeriod = this.liveCNRLUtility.contractCNRL(modContract.value.info.settings.timeperiod)
  let resolution = this.liveCNRLUtility.contractCNRL(modContract.value.info.settings.resolution)
  // set these expand ref contracts
  modContract.value.info.settings.timeperiod = timePeriod
  modContract.value.info.settings.resolution = resolution
  // set the data in time component
  this.liveSEntities[shellID].liveTimeC.setTimeSegments(timePeriod)
  this.liveSEntities[shellID].liveTimeC.setTimeResolution(resolution)
  // set the input need for compute to flow
  // first check if peer has set range or coming from automation?
  if (modContract.value.info.controls.rangedate !== undefined && modContract.value.info.controls.rangedate.length > 0) {
    // peer set
    this.liveSEntities[shellID].liveTimeC.setDateRange(modContract.value.info.controls.rangedate)
  } else {
    this.liveSEntities[shellID].liveTimeC.timeProfiling(modContract.value.info.controls.date, timePeriod.prime.unit)
  }
  let autotimeRange = false
  // console.log('range set????')
  // console.log(this.liveSEntities[shellID].liveTimeC)
  // look if computes need to be brought up to date or explite range ask for?
  if (this.liveSEntities[shellID].liveTimeC.timerange.length > 0) {
    autotimeRange = true
  }
  // specific UI range ask for?
  let timeRange = false
  if (this.liveSEntities[shellID].liveTimeC.timerange.length > 0) {
    timeRange = true
  }
  let dtRange = false
  if (modContract.value.info.settings.yaxis.length > 0) {
    dtRange = true
    // set the range to one item i.e. the live date
    let liveDate = []
    liveDate.push(modContract.value.info.controls.date)
    this.liveSEntities[shellID].liveTimeC.setDateRange(liveDate)
  }
  this.liveSEntities[shellID].liveDatatypeC.setDataTypeLive(modContract.value.info.settings.yaxis)
  flowOrder.single = singleStatus
  flowOrder.auto = autotimeRange
  flowOrder.timerange = timeRange
  flowOrder.datatyperange = dtRange
  flowOrder.updateModContract = modContract
  return flowOrder
}

/**
* perfom the computation
* @method computeExecute
*
*/
EntitiesManager.prototype.computeFlow = async function (shellID, updateModContract, device, datatype, time) {
  console.log('start ComputeFLow')
  // console.log(shellID)
  // console.log(updateModContract)
  // console.log(device)
  // console.log(datatype)
  // console.log(time)
  let modContractUpdate = updateModContract
  // else go through creating new KBID entry
  // set the new updated time settings for the new contract
  modContractUpdate.value.info.controls.date = time
  // ref contract input all complete -
  let engineReturn = await this.computeEngine(shellID, this.liveSEntities[shellID].liveDeviceC.apiData, modContractUpdate, device, datatype, time)
  // let saveResults = await this.saveResultsProtocol(shellID)
  console.log('results dsaved')
  // console.log(saveResults)
  // new version of Ref Contracts of Compute Modules info
  /* prepare object to send to peerLink
  let updateModule = {}
  updateModule.type = 'library'
  updateModule.reftype = 'module'
  updateModule.control = ''
  updateModule.data = {} */
  // old await this.liveCNRLUtility.saveModule(modContract)
  // DIDO send message to PeerLink to make library ledger KBID entry
  // old let saveKBIDentry = await this.saveKBIDProtocol(modContract, saveResults)
}

/**
* compute engine to prepare new KBID entry
* @method computeEngine
*
*/
EntitiesManager.prototype.computeEngine = async function (shellID, contract, modUpdateContract, device, datatype, time) {
  console.log('startcomputeEEENNGGINE')
  this.liveSEntities[shellID].liveTimeC.setMasterClock(time)
  // proof of evidence
  // this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveTimeC)
  this.liveSEntities[shellID].liveDatatypeC.dataTypeMapping(this.liveSEntities[shellID].liveDeviceC.apiData, contract, device, datatype)
  // proof of evidence
  // this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDatatypeC)
  await this.liveSEntities[shellID].liveDataC.sourceData(this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive, contract, 'empty', device.device_mac, datatype, time)
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
*  save Results protocol  temporary for test Network REST storage
* @method saveResultsProtocol
*
*/
EntitiesManager.prototype.saveResultsProtocol = async function (shellID) {
  // console.log('saveRESULTSProtocol')
  // first save results crypto storage
  let mockAPI = {}
  mockAPI.namespace = 'http://165.227.244.213:8882'
  mockAPI.path = '/inresults/'
  // prepare save structure
  let d = new Date()
  let n = d.getTime()
  let saveObject = {}
  saveObject.timestamp = n
  saveObject.hash = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDataC.liveData)
  saveObject.data = this.liveSEntities[shellID].liveDataC.liveData
  // console.log(saveObject2222)
  let saveResults = await this.liveSEntities[shellID].liveDataC.directSaveResults('REST', mockAPI, saveObject)
  let completeSave = {}
  completeSave.success = saveResults
  completeSave.hash = saveObject.hash
  return completeSave
}

/**
*  visualisation rules to prepare for
* @method visualFlow
*
*/
EntitiesManager.prototype.visualFlow = async function (shellID, visModule, flowContract, device, datatype, time) {
  console.log('VISUALFLOWbegin------------------------')
  console.log(datatype)
  // console.log(visModule)
  // reset the liveVlist list
  let visContract = visModule.value.info.visualise
  // what has been ask for check rules
  // the datatypes for the yaxis (assume charting for now)
  let rules =  datatype // visModule.value.info.settings.yaxis[0]
  console.log('rules')
  console.log(rules)
  // rules = ['937647c8700a04bccd2c524997c015bc07951877']
  // hash the context device, datatype and time
  let dataID = {}
  dataID.device = device.device_mac
  dataID.datatype = rules
  dataID.time = time
  console.log('input for GUUID')
  console.log(dataID)
  let datauuid = this.liveCrypto.evidenceProof(dataID)
  console.log('what guuid prepared')
  console.log(datauuid)
  console.log('data live')
  console.log(Object.keys(this.liveSEntities[shellID].liveDataC.liveData))
  if (this.liveSEntities[shellID].liveDataC.liveData[datauuid]) {
    // yes data to visualise
    this.liveSEntities[shellID].liveVisualC.filterVisual(visModule, visContract, datauuid, device, rules, time,  this.liveSEntities[shellID].liveDataC.liveData[datauuid], this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive.data.tablestructure)
  } else {
    console.log('not data there to visualise')
  }
  // proof of evidence
  // this.liveCrypto.evidenceProof()
  return true
}

/**
*  prepare dataset for single data bundle
* @method visSingleVis
*
*/
EntitiesManager.prototype.visSingleVis = function (shellID) {
  // go and structure for one chart
  this.liveSEntities[shellID].liveVisualC.filterSingleMulti()
}

/**
* if the entity visualisation data already exists
* @method entityDataReady
*
*/
EntitiesManager.prototype.entityDataReady = async function (shellID, ecsIN) {
  let resultExist = false
  let hashMatcher = false
  // check ptop Datastore for existing results  (below old test network cloud)
  // what is the module Compute Ref contract?
  let inputComputeMod = {}
  for (let mod of ecsIN.update.modules) {
    if (mod.value.type === 'compute') {
      inputComputeMod = mod
    }
  }
  // does the data exist in Memory for this input request?
  /* let checkDataExist = this.checkForResultsMemory(shellID, ecsIN.entityUUID)
  if (checkDataExist === true) {
    console.log('vis data in MEMORY')
    // this.emit('visualUpdate', this.liveSEntities[ecsIN.entityUUID])
    resultExist = true
  } else {
    console.log('check datastore ')
    // check datestore for data  use kbid UUID to get source hash and query that hash
    // form hash of inputs KIBs and then query results
    // let kbidInfo = await this.extractKBID(md.cnrl, 1)
    let checkKbid = this.extractKBID('cnrl', 1)
    hashMatcher = this.compareKBIDs({}, {})
    if (hashMatcher === true) {
      // query store for source and emit back to Peer UI
      // look up source reference
      let mockAPI = {}
      mockAPI.namespace = 'http://165.227.244.213:8882'
      mockAPI.path = '/results/'
      let checkResults = await this.liveSEntities[shellID].liveDataC.directResults('REST', mockAPI, checkKbid.result)
      if (checkResults.length > 0) {
        // yes data so get it back to Peer
        console.log('yes, results in datastore')
        // this.emit('visualUpdate', this.liveSEntities[ecsIN.entityUUID])
        resultExist = true
      } else {
        // not results must prepare new
        resultExist = false
        console.log('need new kbid entry to form results')
      }
    } else {
      // entry does not exist. Process new KBID ECSflow
      resultExist = false
    }
  } */
  return false // resultExist
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
* Remove entity
* @method removeEntity
*
*/
EntitiesManager.prototype.removeEntity = function (shellID) {
  return true
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
* @method checkForResultsMemory
*
*/
EntitiesManager.prototype.checkForResultsMemory = function (shellID, hash) {
  //  this only check for last prepareData
  let entityData = this.liveSEntities[shellID].liveVisualC.visualData
  // Need to make this HASH membory identfier TODO
  if (entityData[hash]) {
    return true
  } else {
    return false
  }
}

/**
*  remove component
* @method removeComponent
*
*/
EntitiesManager.prototype.removeComponent = function (entID) {
}

/**
*  save KBID entry protocol
* @method saveKBIDProtocol
*
*/
EntitiesManager.prototype.saveKBIDProtocol = async function (modContract, saveObject) {
  // console.log('saveKBIDProtocol')
  // console.log(modContract)
  // console.log(saveObject)
  // prepare and save KBID entry
  let newKBIDentry = {}
  //newKBIDentry.previous = kbid.kbid
  newKBIDentry.result = saveObject.hash
  // prepare new KBID hash
  let newKBIDhash = this.liveCrypto.hashKBID(modContract, saveObject.hash)
  newKBIDentry.kbid = newKBIDhash
  newKBIDentry.token = ''
  newKBIDentry.dml = ''
  // let kbidEntryPass = await this.KBLlive.kbidEntrysave(newKBIDentry)
  if (kbidEntryPass === true) {
    let d = new Date()
    let n = d.getTime()
    let newIndex = {}
    newIndex.timestamp = n
    newIndex.cnrl = modContract.cnrl
    newIndex.kbid = newKBIDhash
    // let indexKBID = await this.KBLlive.kbidINDEXsave(newIndex)
  }
  return true
}

/**
*  start polling function
* @method startPolling
*
*/
EntitiesManager.prototype.startPolling = function (entID) {
  // var url = "http://localhost/nodebook/polling/node-polling-to-event/example/json/birdList.json";
  const localthis = this
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
