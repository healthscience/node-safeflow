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
// import LibComposer from 'refcontractcomposer'
import CNRLUtility from './kbl-cnrl/cnrlUtility.js'
// import KBLedger from './kbl-cnrl/kbledger.js'
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
  // this.liveLibrary = new LibComposer()
  this.liveCNRLUtility = new CNRLUtility(auth)
  // this.KBLlive = new KBLedger(apiCNRL, auth)
  this.liveCrypto = new CryptoUtility()
  this.liveSEntities = {}
  this.automationReview()
  this.resultListener()
  this.resultcount = 0
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
  let NXPexpanded = refCont // assume incoming NXP is expanded format, need to check
  let dataSummary = this.peerInput(NXPexpanded)
  return dataSummary
}

/**
* peer input into ECS
* @method PeerInput
*
*/
EntitiesManager.prototype.peerInput = async function (input) {
  // validate input data structure e.g. not empty etc.
  console.log('ECS--input')
  console.log(input)
  // console.log(util.inspect(input, {showHidden: false, depth: null}))
  let inputValid = this.validateInput(input)
  if (inputValid === true) {
    let inputUUID = this.liveCrypto.evidenceProof(input)
    let entityData = {}
    entityData[input.exp.key] = await this.addHSentity(input, inputUUID)
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
  // is the object empty?  // need some structure checker more sophisiticated
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
EntitiesManager.prototype.addHSentity = async function (ecsIN, inputUUID) {
  let entitySet = {}
  let moduleState = false
  let shellID = ''
  let modules = []
  if (ecsIN.update !== undefined && ecsIN.update.entityUUID) {
    shellID = ecsIN.update.entityUUID
    modules = ecsIN.update.modules
    moduleState = true
    // use existing entity and process a new kbid entry to get vis data
    this.ECSflow(shellID, ecsIN.update, inputUUID, modules)
    // data is ready tell peer
  } else {
    // need to setup new ECS entity for this network experiment
    shellID = this.liveCrypto.entityID(ecsIN.exp)
    modules = ecsIN.modules
    // setup entity to hold components per module
    this.liveSEntities[shellID] = new Entity(this.auth)
    // setup listener for dataset OUT
    this.dataoutListener(shellID)
    this.ECSflow(shellID, ecsIN.exp, inputUUID, modules)
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
EntitiesManager.prototype.ECSflow = async function (shellID, ECSinput, inputUUID, modules) {
  // ALL FLOWS MADE IMMUMATABLE via  FORTH like scripting TODO
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
    // update device list per peer input
    this.deviceUpdateDataflow(shellID, moduleOrder.compute)
    // update flow state for new input
    flowState = await this.computePrepare(shellID, ECSinput, inputUUID, moduleOrder)
    // set data science flow inputs
    this.setDataScienceInputs(shellID, inputUUID, ECSinput, moduleOrder, flowState, 'update')
    this.flowMany(shellID, inputUUID)
    let State = false
  } else {
    // new ENTITY prepare COMPUTE
    deviceInfo = moduleOrder.data.value.info.data.value
    let apiData = await this.deviceDataflow(shellID, deviceInfo)
    // 2 Compute - feed into ECS -KBID processor
    flowState = await this.computePrepare(shellID, ECSinput, inputUUID, moduleOrder)
    // set data science flow inputs
    this.setDataScienceInputs(shellID, inputUUID, ECSinput, moduleOrder, flowState, 'first')
    this.flowMany(shellID, inputUUID)
    let resultCheckState = false
  }
}

/**
* data science context set per entity
* @method setDataScienceInputs
*
*/
EntitiesManager.prototype.setDataScienceInputs = function (shellID, inputUUID, ecsIN, moduleOrder, flowState, status) {
  let entityInput = {}
  entityInput.input = ecsIN
  entityInput.moduleorder = moduleOrder
  entityInput.flowstate = flowState
  this.liveSEntities[shellID].datascience = entityInput
  // set the number of visualisations to be prepared?
  this.trackINPUTvisUUIDS(shellID, inputUUID, ecsIN, moduleOrder, flowState, status)
}

/**
* prepare what visualisations are expected
* @method trackINPUTvisUUIDS
*
*/
EntitiesManager.prototype.trackINPUTvisUUIDS = function (shellID, inputUUID, ecsIN, moduleOrder, flowState, status) {
  let visExpNumber = 0
  visExpNumber = 1 // per device, number of datatype * number of dates
  let expectedVisData = {}
  expectedVisData[inputUUID] = {}
  // if no device list then take default from component
  let deviceList = []
  if (moduleOrder.compute.value.info.controls.device === undefined || moduleOrder.compute.value.info.controls.device[0] === 'future') {
    for (let device of this.liveSEntities[shellID].liveDeviceC.devices) {
      deviceList.push(device.device_mac)
    }
  } else if (status === 'first') {
    for (let device of this.liveSEntities[shellID].liveDeviceC.devices) {
      deviceList.push(device.device_mac)
    }
  } else {
    deviceList = moduleOrder.compute.value.info.controls.device
  }
  for (let dev of deviceList) {
    expectedVisData[inputUUID][dev] = []
    for (let dt of moduleOrder.compute.value.info.settings.yaxis) {
      for (let time of moduleOrder.compute.value.info.controls.rangedate) {
        expectedVisData[inputUUID][dev].push(this.resultsUUIDbuilder(dev, dt, time))
      }
    }
  }
  this.liveSEntities[shellID].liveVisualC.manageVisDatasets(inputUUID, expectedVisData)
}

/**
* keep track of uuid data bundles
* @method trackDataUUIDS
*
*/
EntitiesManager.prototype.trackDataUUIDS = function (shellID, inputUUID, uuid, device, datatype, time) {
  let tripletData = {}
  tripletData.device = device
  tripletData.timeout = time
  tripletData.datatype = datatype
  let trackDataUUID = {}
  trackDataUUID.shell = shellID
  trackDataUUID.hash = uuid
  trackDataUUID.triplet = tripletData
  this.liveSEntities[shellID].datauuid[uuid] = trackDataUUID
}

/**
*  flowMany
* @method flowMany
*
*/
EntitiesManager.prototype.flowMany = async function (shellID, inputUUID) {
  let ecsInput = this.liveSEntities[shellID].datascience
  // is a range of devices, datatype or time ranges and single or multi display?
  if (ecsInput.flowstate.devicerange === true && ecsInput.flowstate.datatyperange === true && ecsInput.flowstate.timerange === true) {
    // console.log('passed logic for loop')
    for (let device of this.liveSEntities[shellID].liveDeviceC.devices) {
      // reset expect count (incase something didnt clear)
      this.liveSEntities[shellID].liveVisualC.clearDeviceCount(device)
      for (let datatype of this.liveSEntities[shellID].liveDatatypeC.datatypesLive) {
        for (let time of this.liveSEntities[shellID].liveTimeC.timerange) {
          /* console.log('loop')
          console.log(device)
          console.log(datatype)
          console.log(time) */
          // form dataID
          // hash the context device, datatype and time
          let datauuid = this.resultsUUIDbuilder(device.device_mac, datatype, time)
          this.trackDataUUIDS(shellID, inputUUID, datauuid, device.device_mac, datatype, time)
          let entityLivedata = this.entityResultsReady(shellID, ecsInput.input, datauuid)
          let resultCheckState = false
        }
      }
    }
  } else {
    console.log('no devices or datatype range or date range')
  }
}

/**
*  data results UUIDbuilder
* @method resultsUUIDbuilder
*
*/
EntitiesManager.prototype.resultsUUIDbuilder = function (device, datatype, date) {
  let resultsUUID = ''
  let dataID = {}
  dataID.device = device
  dataID.datatype = datatype
  dataID.time = date
  resultsUUID = this.liveCrypto.evidenceProof(dataID)
  return resultsUUID
}

/**
* if the entity results ie KBLedger entry exist no need to go to source (unless full ECO flow needed)
* @method entityResultsReady
*
*/
EntitiesManager.prototype.entityResultsReady = async function (shellID, ecsIN, rDUUID) {
  let hashMatcher = false
  // check ptop Datastore for existing results query by UUID of data results
  // does the data exist in Memory for this input request?
  let checkDataExist = this.checkForResultsMemory(shellID, rDUUID)
  if (checkDataExist === true) {
    let liveContext = this.liveSEntities[shellID].datascience
    // pass to short flow cycle, just return vis data again
    let dataPrint = this.liveSEntities[shellID].datauuid[rDUUID]
    await this.visualFlow(shellID, liveContext.moduleorder.visualise, {}, dataPrint)
    let resultExist = true
    return resultExist
  } else {
    let resultExist = this.checkResults(shellID, rDUUID)
    return resultExist
  }
}

/**
*  ask peer to query results store a unique result data key
* @method checkResults
*
*/
EntitiesManager.prototype.checkResults = function (shellID, uuidRData) {
  let dataPrint = {}
  dataPrint.shell = shellID
  dataPrint.resultuuid = uuidRData
  this.emit('resultCheck', dataPrint)
  return true
}

/**
*  listener for existing results
* @method resultListener
*
*/
EntitiesManager.prototype.resultListener = function () {
  this.on('resultsCheckback', async (checkData) => {
    let liveContext = this.liveSEntities[checkData.entity.shell].datascience
    if (checkData.data === false) {
      console.log('FULL')
      await this.subFlowFull(checkData, liveContext)
    } else {
      console.log('SHORT')
      await this.subFlowShort(checkData, liveContext)
    }
  })
}

/**
*  sub flow of compute and visualisation components data
* @method subFlowFull
*
*/
EntitiesManager.prototype.subFlowFull = async function (entity, entityContext) {
  if (this.resultcount >= 0) {
    this.resultcount++
    // rebuild dataPrint structure
    let dataPrint = this.liveSEntities[entity.entity.shell].datauuid[entity.entity.resultuuid]
    entityContext.dataprint = dataPrint
    await this.computeFlow(entity.entity.shell, entityContext.flowstate.updateModContract, dataPrint)
    // prepare visualisation datasets
    await this.visualFlow(entity.entity.shell, entityContext.moduleorder.visualise, entityContext.flowstate, dataPrint)
    // return data bundle
    if (this.liveSEntities[entity.entity.shell].liveDataC.liveData[entity.entity.resultuuid]) {
      let entityOut = {}
      entityOut.context = entityContext
      entityOut.data = this.liveSEntities[entity.entity.shell].liveVisualC.visualData[entity.entity.resultuuid]
      entityOut.devices = this.liveSEntities[entity.entity.shell].liveDeviceC.devices
      // required back instant or update resutls store or both
      // console.log('viack back EMIT--1-EMIT--subflow DATA')
      // this.emit('visualFirstRange', entityOut)
    } else {
      console.log('no data for this device, datatype, time')
      // still need to inform vis component to clear expected list
      // prepare visualisation datasets
      await this.visualFlow(entity.entity.shell, entityContext.moduleorder.visualise, entityContext.flowstate, dataPrint)
      let entityNodata = {}
      entityNodata.context = entityContext
      entityNodata.data = this.liveSEntities[entity.entity.shell].liveVisualC.visualData[entity.entity.resultuuid]
      entityNodata.devices = this.liveSEntities[entity.entity.shell].liveDeviceC.devices
      // console.log('viack back EMIT-2--EMIT--subflow NO data')
      this.emit('visualFirstRange', entityNodata)
    }
  }
}

/**
*  sub flow of compute and visualisation components data
* @method subFlowShort
*
*/
EntitiesManager.prototype.subFlowShort = async function (entity, context) {
  console.log('subFLOWshort start----------')
  // set dataPrint
  let dataPrint = this.liveSEntities[entity.entity.shell].datauuid[entity.entity.resultuuid]
  // datatype table structure needs setting for visualisation
  this.liveSEntities[entity.entity.shell].liveDatatypeC.datatypeInfoLive = {}
  this.liveSEntities[entity.entity.shell].liveDatatypeC.datatypeInfoLive.data = {}
  this.liveSEntities[entity.entity.shell].liveDatatypeC.datatypeInfoLive.data.tablestructure = context.moduleorder.data.value.info.data.value.concept.tablestructure
  // set data in entity component data
  this.liveSEntities[entity.entity.shell].liveDataC.setFilterResults(entity.entity.resultuuid, entity.data.value.tidydata)
  // preprae visualisation datasets
  await this.visualFlow(entity.entity.shell, context.moduleorder.visualise, context.flowstate, dataPrint)
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
*  update the list of devices per peer input
* @method deviceUpdateDataflow
*
*/
EntitiesManager.prototype.deviceUpdateDataflow = function (shellID, module) {
  this.liveSEntities[shellID].liveDeviceC.updateDevice(module.value.info.controls.device)
  return true
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
EntitiesManager.prototype.computePrepare = async function (shellID, ECSinput, inputUUID, modContracts) {
  let singleStatus = modContracts.visualise.value.info.settings.single
  let flowOrder = {}
  // these are old CNRL contract TODO update to Network Library Ref contracts
  let timePeriod = this.liveCNRLUtility.contractCNRL(modContracts.compute.value.info.settings.timeperiod)
  let resolution = this.liveCNRLUtility.contractCNRL(modContracts.compute.value.info.settings.resolution)
  // set these expand ref contracts
  modContracts.compute.value.info.settings.timeperiod = timePeriod
  modContracts.compute.value.info.settings.resolution = resolution
  // set the data in time component
  this.liveSEntities[shellID].liveTimeC.setTimeSegments(timePeriod)
  this.liveSEntities[shellID].liveTimeC.setTimeResolution(resolution)
  // any automation required?
  let automation = false // to set TODO
  let autotimeRange = false
  if (automation === true) {
    autotimeRange = true
    // automation time range settings
    this.liveSEntities[shellID].liveTimeC.timeProfiling(modContracts.compute.value.info.controls.date, timePeriod.prime.unit)
  }
  let deviceRange = false
  if (this.liveSEntities[shellID].liveDeviceC.devices.length > 0) {
    deviceRange = true
  }
  // first check if peer has set time range?
  if (modContracts.compute.value.info.controls.rangedate !== undefined && modContracts.compute.value.info.controls.rangedate.length > 0 ) {
    // peer set
    this.liveSEntities[shellID].liveTimeC.setDateRange(modContracts.compute.value.info.controls.rangedate)
  } else {
    // set array for single date incase mulitple dataset per request
    let singleRangeTime = []
    singleRangeTime.push(modContracts.compute.value.info.controls.date)
    this.liveSEntities[shellID].liveTimeC.setDateRange(singleRangeTime)
  }
  // specific UI range ask for?
  let timeRange = false
  if (this.liveSEntities[shellID].liveTimeC.timerange.length > 0) {
    timeRange = true
  }
  // how many data types, single or multi per this request
  let dtRange = false
  if (modContracts.compute.value.info.settings.yaxis.length > 0) {
    dtRange = true
    // set the datatype range
    this.liveSEntities[shellID].liveDatatypeC.setDataTypeLive(modContracts.compute.value.info.settings.yaxis)
  }
  // summary logic ingredients
  flowOrder.single = singleStatus
  flowOrder.auto = autotimeRange
  flowOrder.devicerange = deviceRange
  flowOrder.datatyperange = dtRange
  flowOrder.timerange = timeRange
  flowOrder.updateModContract = modContracts.compute
  // prepare datasets out profile to be constructued
  let datasetsOutPattern = {}
  let datasetOutUUID = 'hash'
  datasetsOutPattern[inputUUID] = []
  // loop over devices per this input
  for (let dev of this.liveSEntities[shellID].liveDeviceC.devices) {
    datasetsOutPattern[inputUUID].push(dev.device_mac)
  }
  this.liveSEntities[shellID].liveVisualC.datasetsOutpattern = datasetsOutPattern
  return flowOrder
}

/**
* perfom the computation
* @method computeExecute
*
*/
EntitiesManager.prototype.computeFlow = async function (shellID, updateModContract, dataPrint) {
  let modContractUpdate = updateModContract
  // else go through creating new KBID entry
  // set the new updated time settings for the new contract
  modContractUpdate.value.info.controls.date = dataPrint.triplet.timeout
  // ref contract input all complete -
  let engineReturn = await this.computeEngine(shellID, this.liveSEntities[shellID].liveDeviceC.apiData, modContractUpdate, dataPrint.triplet.device, dataPrint.triplet.datatype, dataPrint.triplet.timeout)
  let saveStatus = this.saveResultsProtocol(shellID, dataPrint.hash)
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
  proofChain.data = dataPrint.hash
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
  this.liveSEntities[shellID].liveDatatypeC.dataTypeMapping(this.liveSEntities[shellID].liveDeviceC.apiData, apiInfo, datatype)
  // proof of evidence
  let evProof1 = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDatatypeC.datatypesLive)
  this.liveSEntities[shellID].evidenceChain.push(evProof1)
  // results api and raw source here?
  await this.liveSEntities[shellID].liveDataC.DataControlFlow(this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive, this.liveSEntities[shellID].liveDeviceC.apiData, modUpdateContract, 'empty', device, datatype, time)
  // proof of evidence
  let evProof2 = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDataC.dataRaw)
  this.liveSEntities[shellID].evidenceChain.push(evProof2)
  // this.emit('computation', 'in-progress')
  this.computeStatus = this.liveSEntities[shellID].liveComputeC.filterCompute(modUpdateContract, device.device_mac, datatype, time, this.liveSEntities[shellID].liveDataC.liveData)
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
EntitiesManager.prototype.visualFlow = async function (shellID, visModule, flowState, dataPrint) {
  let visContract = visModule.value.info.visualise
  if (this.liveSEntities[shellID].liveDataC.liveData[dataPrint.hash]) {
    // yes data to visualise
    this.liveSEntities[shellID].liveVisualC.filterVisual(visModule, visContract, dataPrint, this.liveSEntities[shellID].liveDataC.liveData[dataPrint.hash], this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive.data.tablestructure)
    // proof of evidence
    let evProof = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveVisualC.visualData[dataPrint.hash])
    this.liveSEntities[shellID].evidenceChain.push(evProof)
  } else {
    // no data to process
    this.liveSEntities[shellID].liveVisualC.nodataInfo(dataPrint, visModule)
    // need to tell vis component no data to clear expected
    // this.liveSEntities[shellID].liveVisualC.filterVisual(visModule, visContract, dataPrint, 'none', this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive.data.tablestructure)
  }
  return true
}

/**
*  listen for datasets for OUT i.e. complete
* @method dataoutListener
*
*/
EntitiesManager.prototype.dataoutListener = function (shellID) {

  this.liveSEntities[shellID].liveVisualC.on('dataout', (resultUUID, inputContext) => {
    let context = this.liveSEntities[shellID].datascience
    if (this.liveSEntities[shellID].liveDataC.liveData[resultUUID] || this.liveSEntities[shellID].liveVisualC.visualData[resultUUID]) {
      let entityOut = {}
      entityOut.context = context
      entityOut.data = this.liveSEntities[shellID].liveVisualC.visualData[resultUUID]
      entityOut.devices = this.liveSEntities[shellID].liveDeviceC.devices
      // required back instant or update resutls store or both
      // console.log('viack back EMIT-3--EMIT--dataoutlistener bundle')
      this.emit('visualFirstRange', entityOut)
    } else {
      let entityOut = {}
      entityOut.context = context
      entityOut.data = 'none'
      entityOut.devices = this.liveSEntities[shellID].liveDeviceC.devices
      // console.log('viack back EMIT--4-EMIT--dataout NONE')
      this.emit('visualFirstRange', entityOut)
    }
  })
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
  if (this.liveSEntities[shellID].liveDataC.liveData[dataID] !== undefined) {
    let saveObject = {}
    saveObject.hash = dataID
    // hash and source data ready for visulisation or use
    let dataCouple = {}
    dataCouple.hash =  this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDataC.liveData[dataID])
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
* checkResultUUIDcheck
* @method checkResultUUIDcheck
*
*/
EntitiesManager.prototype.checkResultUUIDcheck = function (uuidData, rData) {
  let resultExist = false
  let hashMatcher = this.resultIndexExist(uuidData, rData)
  // hashMatcherKBL = this.compareKBIDs({}, {})
  if (hashMatcher === true) {
    resultExist = true
  } else {
    // entry does not exist. Process new KBID
    resultExist = false
  }
  return resultExist
}

/**
* logic control over kbid need prepared
* @method resultIndexExist
*
*/
EntitiesManager.prototype.resultIndexExist = function (indexHash, storeHash) {
  let resultMatch = false
  if (storeHash !== null) {
    if (indexHash === storeHash.key) {
      resultMatch = true
    }
  } else {
    resultMatch = false
  }
  return resultMatch
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
  // data in entity memory?
  if (entityData[hash]) {
    let memDataCheck = entityData[hash].hasOwnProperty('data')
    if (memDataCheck === true) {
      if (entityData[hash].data !== 'none')  {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
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
