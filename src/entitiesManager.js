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
  // start error even listener
  this.eventErrorListen()
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
* listen for error on event triggered
* @method eventErrorListen
*
*/
EntitiesManager.prototype.eventErrorListen = function (refCont) {
  const logger = console
  this.on('error', (err) => {
    logger.error('Unexpected error on emitter', err)
  })
  // test the emitter
  // this.emit('error', new Error('Whoops!'));
  // Unexpected error on emitter Error: Whoops!
}

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
  // validate input data structure e.g. not empty etc.
  let inputValid = this.validateInput(input)
  if (inputValid === true) {
    let entityData = {}
    entityData[input.exp.key] = await this.addHSentity(input)
    return entityData
  } else {
    let entitySet = {}
    entitySet.type = 'ecssummary'
    entitySet.shellID = 'error'
    entitySet.modules = []
    return entitySet
  }
}

/**
*  does the input object in SF-ECS compliant structure?
* @method validateInput
*
*/
EntitiesManager.prototype.validateInput = function (input) {
  let validStructure = false
  // is the object empty?
  let inputParts = Object.keys(input)
  if (inputParts.length === 0) {
    validStructure = false
  } else {
    validStructure = true
  }
  return validStructure
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
    modules = ecsIN.update.modules
    moduleState = true
    // use existing entity and process a new kbid entry to get vis data
    this.ECSflow(shellID, ecsIN.update, modules)
    // data is ready tell peer
  } else {
    // need to setup new ECS entity for this network experiment
    shellID = this.liveCrypto.entityID(ecsIN.exp)
    modules = ecsIN.modules // await this.NXPmodules(shellID, ecsIN.modules)
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
    // reset the visualise chart data list
    this.liveSEntities[shellID].liveVisualC.restVisDataList()
    flowState = await this.computePrepare(shellID, moduleOrder.compute)
    if (moduleOrder.visualise.value.info.settings.single === true) {
      // form dataID
      // hash the context device, datatype and time
      let dataID = {}
      dataID.device = this.liveSEntities[shellID].liveDeviceC.activedevice.device_mac
      dataID.datatype = moduleOrder.visualise.value.info.settings.yaxis[0]
      dataID.time = flowState.updateModContract.value.info.controls.date
      let datauuid = this.liveCrypto.evidenceProof(dataID)
      // update library Module Reference Contract but first check if KBID exist ie result prepared and ready to return
      // let entityLivedata = await this.entityDataReady(shellID, ecsIN)
      await this.computeFlow(shellID, flowState.updateModContract, this.liveSEntities[shellID].liveDeviceC.activedevice, this.liveSEntities[shellID].liveDatatypeC.datatypesLive[0], flowState.updateModContract.value.info.controls.date)
      // process updated vis ref contract
      await this.visualFlow(shellID, moduleOrder.visualise, flowState, this.liveSEntities[shellID].liveDeviceC.activedevice, moduleOrder.visualise.value.info.settings.yaxis[0],  flowState.updateModContract.value.info.controls.date, datauuid)
      let entityContext = {}
      entityContext.context = ECSinput
      entityContext.data = this.liveSEntities[shellID].liveVisualC
      this.emit('visualUpdate', entityContext)
      this.liveSEntities[shellID].liveVisualC.liveVislist = {}
    }
    if (flowState.devicerange === true || flowState.datatyperange === true || flowState.timerange === true) {
      for (let device of this.liveSEntities[shellID].liveDeviceC.devices) {
        for (let datatype of this.liveSEntities[shellID].liveDatatypeC.datatypesLive) {
          for (let time of this.liveSEntities[shellID].liveTimeC.timerange) {
            // form dataID
            // hash the context device, datatype and time
            let dataID = {}
            dataID.device = device.device_mac
            dataID.datatype = datatype
            dataID.time = time
            let datauuid = this.liveCrypto.evidenceProof(dataID)
            await this.computeFlow(shellID, flowState.updateModContract, device, datatype, time)
            // visualise - extract visualisation contract information
            await this.visualFlow(shellID, moduleOrder.visualise, flowState, device, datatype, time, datauuid)
            // required back instant or update resutls store or both
            let entityContext = {}
            entityContext.context = ECSinput
            entityContext.data = this.liveSEntities[shellID].liveVisualC
            entityContext.devices = this.liveSEntities[shellID].liveDeviceC.devices
            this.emit('visualUpdateRange', entityContext)
          }
        }
      }
      this.liveSEntities[shellID].liveVisualC.liveVislist = {}
    }
    // if automation == true process list TODO
  } else {
    deviceInfo = moduleOrder.data.value.info.data.value
    let apiData = await this.deviceDataflow(shellID, deviceInfo)
    // 2 Compute - feed into ECS -KBID processor
    flowState = await this.computePrepare(shellID, moduleOrder.compute)
    // form dataID
    // hash the context device, datatype and time
    let dataID = {}
    dataID.device = this.liveSEntities[shellID].liveDeviceC.activedevice.device_mac
    dataID.datatype = this.liveSEntities[shellID].liveDatatypeC.datatypesLive[0]
    dataID.time = flowState.updateModContract.value.info.controls.date
    let datauuid = this.liveCrypto.evidenceProof(dataID)
    // all automtion variales extracted, do first and then start on await list
    // single or loop
    if (moduleOrder.visualise.value.info.settings.single === true) {
      await this.computeFlow(shellID, flowState.updateModContract, this.liveSEntities[shellID].liveDeviceC.activedevice, this.liveSEntities[shellID].liveDatatypeC.datatypesLive[0], flowState.updateModContract.value.info.controls.date)
      // visualise - extract visualisation contract information
      await this.visualFlow(shellID, moduleOrder.visualise, flowState, this.liveSEntities[shellID].liveDeviceC.activedevice, moduleOrder.visualise.value.info.settings.yaxis[0], flowState.updateModContract.value.info.controls.date, datauuid)
      let visDataBack = {}
      visDataBack.context = moduleOrder.visualise
      visDataBack.data = this.liveSEntities[shellID].liveVisualC
      visDataBack.devices = this.liveSEntities[shellID].liveDeviceC.devices
      this.emit('visualFirst', visDataBack)
      this.liveSEntities[shellID].liveVisualC.liveVislist = {}
    }
    // is a range of devices, datatype or time ranges and single or multi display?
    if (flowState.devicerange === true || flowState.datatyperange === true || flowState.timerange === true) {
      if (flowState.datatyperange === true) {
        // remove the first datatype already returned
        // this.liveSEntities[shellID].liveDatatypeC.datatypesLive.shift()
      }
      for (let device of this.liveSEntities[shellID].liveDeviceC.devices) {
        for (let datatype of this.liveSEntities[shellID].liveDatatypeC.datatypesLive) {
          for (let time of this.liveSEntities[shellID].liveTimeC.timerange) {
            // form dataID
            // hash the context device, datatype and time
            let dataID = {}
            dataID.device = device.device_mac
            dataID.datatype = datatype
            dataID.time = time
            let datauuid = this.liveCrypto.evidenceProof(dataID)
            await this.computeFlow(shellID, flowState.updateModContract, device, datatype, time)
            // visualise - extract visualisation contract information
            await this.visualFlow(shellID, moduleOrder.visualise, flowState, device, datatype, time, datauuid)
            // return data bundle
            if (this.liveSEntities[shellID].liveDataC.liveData[datauuid]) {
              let entityContext = {}
              entityContext.context = ECSinput
              entityContext.data = this.liveSEntities[shellID].liveVisualC
              entityContext.devices = this.liveSEntities[shellID].liveDeviceC.devices
              // required back instant or update resutls store or both
              this.emit('visualFirstRange', entityContext)
            } else {
              console.log('no data for this device, datatype, time')
            }
          }
        }
      }
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
  let evProof = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDeviceC.devices)
  this.liveSEntities[shellID].evidenceChain.push(evProof)
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
  let singleStatus = true
  let flowOrder = {}
  // these are old CNRL contract TODO update to Network Library Ref contracts
  let timePeriod = this.liveCNRLUtility.contractCNRL(modContract.value.info.settings.timeperiod)
  let resolution = this.liveCNRLUtility.contractCNRL(modContract.value.info.settings.resolution)
  // set these expand ref contracts
  modContract.value.info.settings.timeperiod = timePeriod
  modContract.value.info.settings.resolution = resolution
  // set the data in time component
  this.liveSEntities[shellID].liveTimeC.setTimeSegments(timePeriod)
  this.liveSEntities[shellID].liveTimeC.setTimeResolution(resolution)
  // any automation required?
  let automation = false // to set TODO
  let autotimeRange = false
  if (automation === true) {
    autotimeRange = true
    // automation time range settings
    this.liveSEntities[shellID].liveTimeC.timeProfiling(modContract.value.info.controls.date, timePeriod.prime.unit)
  }
  let deviceRange = false
  if (this.liveSEntities[shellID].liveDeviceC.devices.length > 0) {
    deviceRange = true
  }
  // first check if peer has set time range?
  if (modContract.value.info.controls.rangedate !== undefined && modContract.value.info.controls.rangedate.length > 0 ) {
    // peer set
    this.liveSEntities[shellID].liveTimeC.setDateRange(modContract.value.info.controls.rangedate)
  } else {
    // set array for single date incase mulitpel data set per request
    let singleRangeTime = []
    singleRangeTime.push(modContract.value.info.controls.date)
    this.liveSEntities[shellID].liveTimeC.setDateRange(singleRangeTime)
  }
  // specific UI range ask for?
  let timeRange = false
  if (this.liveSEntities[shellID].liveTimeC.timerange.length > 0) {
    timeRange = true
  }
  // how many data types, single or multi per this request
  let dtRange = false
  if (modContract.value.info.settings.yaxis.length > 0) {
    dtRange = true
    // set the datatype range
    this.liveSEntities[shellID].liveDatatypeC.setDataTypeLive(modContract.value.info.settings.yaxis)
  }

  flowOrder.single = singleStatus
  flowOrder.auto = autotimeRange
  flowOrder.devicerange = deviceRange
  flowOrder.datatyperange = dtRange
  flowOrder.timerange = timeRange
  flowOrder.updateModContract = modContract
  return flowOrder
}

/**
* perfom the computation
* @method computeExecute
*
*/
EntitiesManager.prototype.computeFlow = async function (shellID, updateModContract, device, datatype, time) {
  let modContractUpdate = updateModContract
  // else go through creating new KBID entry
  // set the new updated time settings for the new contract
  modContractUpdate.value.info.controls.date = time
  // ref contract input all complete -
  let engineReturn = await this.computeEngine(shellID, this.liveSEntities[shellID].liveDeviceC.apiData, modContractUpdate, device, datatype, time)
  let dataID = {}
  dataID.device = device.device_mac
  dataID.datatype = datatype
  dataID.time = time
  let datauuid = this.liveCrypto.evidenceProof(dataID)
  let saveStatus = this.saveResultsProtocol(shellID, datauuid)
  // new version of Ref Contracts of Compute Modules info TODO
  // prepare object to send to peerLink
  let updateModule = {}
  updateModule.type = 'library'
  updateModule.reftype = 'update'
  updateModule.info = modContractUpdate
  this.emit('updateModule', updateModule)
  // DIDO send message to PeerLink to make library ledger KBID entry
  // gather proof of evidence chain and hash and send KBLedger store
  let hashofProofs = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].evidenceChain)
  let proofChain = {} // hash of all hashes through ECS plus hash of results?
  proofChain.hash = hashofProofs
  proofChain.data = datauuid
  this.emit('kbledgerEntry', proofChain)
  this.liveSEntities[shellID].evidenceChain = []
}

/**
* compute engine to prepare new KBID entry
* @method computeEngine
*
*/
EntitiesManager.prototype.computeEngine = async function (shellID, apiInfo, modUpdateContract, device, datatype, time) {
  this.liveSEntities[shellID].liveTimeC.setMasterClock(time)
  // proof of evidence
  let evProof = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveTimeC.liveTime)
  this.liveSEntities[shellID].evidenceChain.push(evProof)
  this.liveSEntities[shellID].liveDatatypeC.dataTypeMapping(this.liveSEntities[shellID].liveDeviceC.apiData, apiInfo, device, datatype)
  // proof of evidence
  let evProof1 = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDatatypeC.datatypesLive)
  this.liveSEntities[shellID].evidenceChain.push(evProof1)
  await this.liveSEntities[shellID].liveDataC.sourceData(this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive, this.liveSEntities[shellID].liveDeviceC.apiData, modUpdateContract, 'empty', device.device_mac, datatype, time)
  // proof of evidence
  let evProof2 = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDataC.dataRaw)
  this.liveSEntities[shellID].evidenceChain.push(evProof2)
  // this.emit('computation', 'in-progress')
  this.computeStatus = await this.liveSEntities[shellID].liveComputeC.filterCompute(apiInfo, device.device_mac, datatype, time, this.liveSEntities[shellID].liveDataC.liveData)
  // proof of evidence
  let evProof3 = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDataC.tidyData)
  this.liveSEntities[shellID].evidenceChain.push(evProof3)
  // this.emit('computation', 'finished')
  return true
}

/**
*  visualisation rules to prepare for
* @method visualFlow
*
*/
EntitiesManager.prototype.visualFlow = async function (shellID, visModule, flowContract, device, datatype, time, datauuid) {
  // reset the liveVlist list
  let visContract = visModule.value.info.visualise
  // what has been ask for check rules
  // the datatypes for the yaxis (assume charting for now)
  let rules =  datatype
  if (this.liveSEntities[shellID].liveDataC.liveData[datauuid]) {
    // yes data to visualise
    this.liveSEntities[shellID].liveVisualC.filterVisual(visModule, visContract, datauuid, device, rules, time,  this.liveSEntities[shellID].liveDataC.liveData[datauuid], this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive.data.tablestructure)
    // proof of evidence
    let evProof = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveVisualC.visualData[datauuid])
    this.liveSEntities[shellID].evidenceChain.push(evProof)
  } else {
    console.log('not data there to visualise')
  }
  return true
}

/**
*  save Results protocol  temporary for test Network REST storage
* @method saveResultsProtocol
*
*/
EntitiesManager.prototype.saveResultsProtocol = function (shellID, dataID) {
  let localthis = this
  // first save results crypto storage
  // prepare save structure
  let d = new Date()
  let n = d.getTime()
  if (this.liveSEntities[shellID].liveDataC.liveData[dataID] !== undefined) {
    let saveObject = {}
    // saveObject.timestamp = n
    saveObject.hash = dataID
    // hash and source data ready for visulisation or use
    let dataCouple = {}
    dataCouple. hash =  this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDataC.liveData[dataID])
    dataCouple.tidydata = this.liveSEntities[shellID].liveDataC.liveData[dataID]
    saveObject.data = dataCouple
    localthis.emit('storePeerResults', saveObject)
  } else {
    console.log('no data to save')
  }
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
    // check datestore for data  use kbid UUID to get source hash and query that hash to see if results data prepared already?
    // form hash of inputs KIBs and then query results
    // let kbidInfo = await this.extractKBID(md.cnrl, 1)
    let checkKbid = this.extractKBID('cnrl', 1)
    hashMatcher = this.compareKBIDs({}, {})
    if (hashMatcher === true) {
      // query store for source and emit back to Peer UI
      // form message for PeerLink
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
  // prepare and save KBID entry
  let newKBIDentry = {}
  // newKBIDentry.previous = kbid.kbid
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
