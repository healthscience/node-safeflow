'use strict'
/**
*  EntitiesManager
*
*
* @class EntitiesManager
* @package    safeFlow
* @copyright  Copyright (c) 2023 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import AutomationManager from './automationManager.js'
import CNRLUtility from './kbl-cnrl/cnrlUtility.js'
import CryptoUtility from './kbl-cnrl/cryptoUtility.js'
import Entity from './scienceEntities.js'
import throttledQueue from 'throttled-queue'
import util from 'util'
import EventEmitter from 'events'
// import pollingtoevent from 'polling-to-event'

class EntitiesManager extends EventEmitter {

  constructor(dataAPI) {
    super()
    console.log('entity manager start')
    // console.log(dataAPI)
    // start error even listener
    this.eventErrorListen()
    this.auth = dataAPI
    this.liveAutomation = new AutomationManager()
    this.liveCNRLUtility = new CNRLUtility(this.auth)
    this.liveCrypto = new CryptoUtility()
    this.liveSEntities = {}
    this.automationReview()
    this.resultListener()
    this.resultcount = 0
    this.computeFlag = false
    this.ecscounter = 0
    this.throttle = throttledQueue(1, 100)
  }

  /**
  * listen for error on event triggered
  * @method eventErrorListen
  *
  */
  eventErrorListen = function (refCont) {
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
  automationReview = function (refCont) {
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
  peerKBLstart = async function (refCont) {
    console.log('SF-EC start')
    // what type of input, naive, new, update --- properly formed?
    let dataSummary = this.peerInput(refCont)
    return dataSummary
  }

  /**
  * peer input into ECS
  * @method PeerInput
  *
  */
  peerInput = async function (input) {
    // validate input data structure e.g. not empty etc.
    console.log('ECS--input+++++++++++++++START++++++++++++++++++')
    console.log(input)
    // console.log(util.inspect(input, {showHidden: false, depth: null}))
    let inputValid = this.validateInput(input)
    if (inputValid === true) {
      console.log('SF-valid true')
      let inputUUID = this.liveCrypto.evidenceProof(input)
      let entityData = {}
      entityData[input.exp.key] = await this.addHSentity(input, inputUUID)
      return entityData
    } else {
      let entitySet = {}
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
  validateInput = function (input) {
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
  * create new HS entity
  * @method addHSEntity
  *
  */
  addHSentity = async function (ecsIN, inputUUID) {
    let entitySet = {}
    let moduleState = false
    let shellID = ''
    let modules = []
    this.computeFlag = false
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
    entitySet.type = 'sf-summary'
    entitySet.shellID = shellID
    entitySet.modules = modules
    return entitySet
  }

  /**
  *  add authorisation / token to access a datastore
  * @method
  *
  */
  addDatastore = function (authDS) {
    // need to set entity with datastore info.
    this.auth = authDS
    // this.liveSEntities[shellID].setDataStore(authDS)
  }

  /**
  *  control the adding of data to the entity
  *  KnowledgeSciptingLanguage(forth/stack)to give gurantees)
  *  perform action in modules
  * @method ECSflow
  *
  */
  ECSflow = async function (shellID, ECSinput, inputUUID, modules) {
    console.log('SF--ECSflow')
    // console.log(ECSinput)
    // console.log(modules)
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
      console.log('update-flow')
      // update device list per peer input
      this.deviceUpdateDataflow(shellID, moduleOrder.compute)
      // update flow state for new input
      flowState = await this.flowPrepare(shellID, ECSinput, inputUUID, moduleOrder)
      // set data science flow inputs
      this.setDataScienceInputs(shellID, inputUUID, ECSinput, moduleOrder, flowState, 'update')
      this.flowMany(shellID, inputUUID, false)
      let State = false
    } else {
      // new ENTITY prepare
      deviceInfo = moduleOrder.data.value.info.data.value
      await this.deviceDataflow(shellID, deviceInfo)
      // 2 Compute - feed into ECS -KBID processor
      flowState = await this.flowPrepare(shellID, ECSinput, inputUUID, moduleOrder)
      // set data science flow inputs
      this.setDataScienceInputs(shellID, inputUUID, ECSinput, moduleOrder, flowState, 'first')
      this.flowMany(shellID, inputUUID, false)
      let resultCheckState = false
    }
  }

  /**
  *
  * @method flowPrepare
  *
  */
  flowPrepare = async function (shellID, ECSinput, inputUUID, modContracts) {
    // console.log('vis contract setting')
    // console.log(util.inspect(modContracts, {showHidden: false, depth: null}))
    // console.log(modContracts.visualise.value.info)
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
  * data science context set per entity
  * @method setDataScienceInputs
  *
  */
  setDataScienceInputs = function (shellID, inputUUID, ecsIN, moduleOrder, flowState, status) {
    let entityInput = {}
    entityInput.input = ecsIN
    entityInput.inputuuid = inputUUID
    entityInput.moduleorder = moduleOrder
    entityInput.flowstate = flowState
    entityInput.waitingdataprint = []
    this.liveSEntities[shellID].datascience = entityInput
    // set the number of visualisations to be prepared?
    this.trackINPUTvisUUIDS(shellID, inputUUID, ecsIN, moduleOrder, flowState, status)
  }

  /**
  * data science context set per entity
  * @method setNewCompuateModule
  *
  */
  setNewCompuateModule = function (shellID, tempComputeMod, dataPrint) {
    this.liveSEntities[shellID].datascience.tempComputeMod = tempComputeMod
    this.liveSEntities[shellID].datascience.waitingdataprint.push(dataPrint)
  }

  /**
  * remove the waiting property
  * @method removeDataSciencewaiting
  *
  */
  removeDataSciencewaiting = function (shellID, dataPrint) {
    let afterClearedWait = []
    for (let dpr of this.liveSEntities[shellID].datascience.waitingdataprint) {
      if (dpr.hash !== dataPrint) {
        afterClearedWait.push(dpr)
      }
    }
    this.liveSEntities[shellID].datascience.waitingdataprint = afterClearedWait
  }

  /**
  * update the compute module link contract 
  * @method updateDataScienceInputs
  *
  */
  updateDataScienceInputs = function (shellID, computeModLink) {
    // is this a single or part of range query?
    console.log('start new compute contract')
    console.log(shellID)
    console.log(computeModLink)
    // console.log(this.liveSEntities[shellID].datascience.inputuuid)
    // console.log(this.liveSEntities[shellID].datascience.dataprint)
    // console.log( this.liveSEntities[shellID].liveVisualC.liveInputlist[this.liveSEntities[shellID].datascience.inputuuid])
    // console.log(this.liveSEntities[shellID].liveVisualC.datasetsOutpattern)
    let rangeActive = this.liveSEntities[shellID].liveVisualC.extractVisExpected(this.liveSEntities[shellID].datascience.inputuuid, this.liveSEntities[shellID].datascience.dataprint.triplet.device)
    console.log('is active range?')
    console.log(rangeActive)
    if (rangeActive.length > 0) {
      console.log('data range in progress')
    } else if (rangeActive.length === 0) {
      console.log('SF-data range complete')
      // restructure object to use value instead of value
      let updateComputNaming = {}
      updateComputNaming.stored = computeModLink.stored
      updateComputNaming.type = computeModLink.type
      updateComputNaming.key = computeModLink.key
      updateComputNaming.value = computeModLink.contract
      let datascienceInputs = this.liveSEntities[shellID].datascience
      datascienceInputs.moduleorder.compute = updateComputNaming
      this.liveSEntities[shellID].datascience = datascienceInputs
      // console.log('AFTERT---compute contrac updated')
      // console.log(this.liveSEntities[shellID].datascience)
      // check if waiting list items dataprint match if yes, return data to HOP
      for (let dpr of this.liveSEntities[shellID].datascience.waitingdataprint ) {
        if (datascienceInputs.dataprint.hash === dpr.hash) {
          if (this.liveSEntities[shellID].liveVisualC.visualData[dpr.hash] !== undefined) {
            let entityOut = {}
            entityOut.context = datascienceInputs
            entityOut.data = this.liveSEntities[shellID].liveVisualC.visualData[dpr.hash]
            entityOut.devices = this.liveSEntities[shellID].liveDeviceC.devices
            // required back instant or update resutls store or both
            console.log('out6')
            this.emit('visualFirstRange', entityOut)
          } else {
            let entityOut = {}
            entityOut.context = datascienceInputs
            // give context of none data
            let visData = {}
            visData.data = 'none'
            visData.context = datascienceInputs.dataprint
            visData.list = this.liveSEntities[shellID].liveDeviceC.devices
            entityOut.data = visData
            entityOut.devices = this.liveSEntities[shellID].liveDeviceC.devices
            console.log('out7')
            this.emit('visualFirstRange', entityOut)
          }
          // remove waiting entry from datascience
          this.removeDataSciencewaiting(shellID, dpr.hash)
        } else {
          console.log('NO data for HOP after update compute wait')
        }
      }
    }
    // entityInput.moduleorder.compute = computeModLink
    // set the number of visualisations to be prepared?
    // this.trackINPUTvisUUIDS(shellID, inputUUID, ecsIN, moduleOrder, flowState, status)
    return true
  }

  /**
  * prepare what visualisations that are expected
  * @method trackINPUTvisUUIDS
  *
  */
  trackINPUTvisUUIDS = function (shellID, inputUUID, ecsIN, moduleOrder, flowState, status) {
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
  trackDataUUIDS = function (shellID, inputUUID, uuid, device, datatype, time, computeFlag, dataPrint) {
    // check if dataPrint linked to compute dataPrint?
    let dataPrintCouple = false
    if (dataPrint !== undefined && computeFlag === true) {
      dataPrintCouple = true
    }
    let tripletData = {}
    tripletData.device = device
    tripletData.timeout = time
    tripletData.datatype = datatype
    let trackDataUUID = {}
    trackDataUUID.shell = shellID
    trackDataUUID.hash = uuid
    if (dataPrintCouple === true) {
      trackDataUUID.couple = dataPrint
    }
    trackDataUUID.triplet = tripletData
    this.liveSEntities[shellID].datauuid[uuid] = trackDataUUID
  }

  /**
  *  loop through the data require per datatype time and device
  * @method flowMany
  *
  */
  flowMany = async function (shellID, inputUUID, computeFlag, dataPrint) {
    let ecsInput = this.liveSEntities[shellID].datascience
    // console.log(ecsInput)
    // look at compute context flag and set datatypes and time as required
    let timeList = []
    if (computeFlag === true) {
      timeList = this.liveSEntities[shellID].liveTimeC.sourceTime
      // clear the list of source times for next time empty
      this.liveSEntities[shellID].liveTimeC.sourceTime = []
    } else {
      timeList = this.liveSEntities[shellID].liveTimeC.timerange
    }
    // is a range of devices, datatype or time ranges and single or multi display?
    if (ecsInput.flowstate.devicerange === true && ecsInput.flowstate.datatyperange === true && ecsInput.flowstate.timerange === true) {
      console.log('SF---flow combos')
      console.log(this.liveSEntities[shellID].liveDeviceC.devices)
      console.log(this.liveSEntities[shellID].liveDatatypeC.datatypesLive)
      console.log(timeList)
      for (let device of this.liveSEntities[shellID].liveDeviceC.devices) {
        // reset expect count (incase something didnt clear)
        if (computeFlag === false) {
          this.liveSEntities[shellID].liveVisualC.clearDeviceCount(device)
        }
        for (let datatype of this.liveSEntities[shellID].liveDatatypeC.datatypesLive) {
          for (let time of timeList) {
            this.throttle(() => {
              // hash the context device, datatype and time
              let datauuid = this.resultsUUIDbuilder(device.device_mac, datatype, time)
              this.trackDataUUIDS(shellID, inputUUID, datauuid, device.device_mac, datatype, time, computeFlag, dataPrint)
              this.entityResultsReady(shellID, ecsInput.input, datauuid, computeFlag)
              // let resultCheckState = false
            })
          }
        }
      }
    } else {
      // console.log('flowMANY-----------no devices or datatype or date')
      // matchup input
      let context = this.liveSEntities[shellID].datascience
      let entityOut = {}
      entityOut.context = context
      entityOut.data = 'none-start'
      entityOut.devices = this.liveSEntities[shellID].liveDeviceC.devices
      console.log('out3')
      this.emit('visualFirstRange', entityOut)
    }
  }

  /**
  *  data results UUIDbuilder
  * @method resultsUUIDbuilder
  *
  */
  resultsUUIDbuilder = function (device, datatype, date) {
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
  entityResultsReady = async function (shellID, ecsIN, rDUUID, computeFlag) {
    let hashMatcher = false
    // check ptop Datastore for existing results query by UUID of data results
    // does the data exist in Memory for this input request?
    let checkDataExist = this.checkForResultsMemory(shellID, rDUUID)
    if (checkDataExist === true && computeFlag === false) {
      let liveContext = this.liveSEntities[shellID].datascience
      // pass to short flow cycle, just return vis data again
      let dataPrint = this.liveSEntities[shellID].datauuid[rDUUID]
      await this.visualFlow(shellID, liveContext.moduleorder.visualise, {}, dataPrint, false)
      let resultExist = true
      return resultExist
    } else {
      let resultExist = this.checkResults(shellID, rDUUID, computeFlag)
      return resultExist
    }
  }

  /**
  *  ask peer to query results store a unique result data key
  * @method checkResults
  *
  */
  checkResults = function (shellID, uuidRData, computeFlag) {
    let dataPrint = {}
    dataPrint.shell = shellID
    dataPrint.resultuuid = uuidRData
    dataPrint.computeflag = computeFlag
    this.emit('resultCheck', dataPrint)
    return true
  }

  /**
  *  listener for existing results
  * @method resultListener
  *
  */
  resultListener = function () {
    this.on('resultsCheckback', async (checkData) => {
      console.log('check data already')
      console.log(checkData)
      let computeFlag = checkData.entity.computeflag
      let liveContext = this.liveSEntities[checkData.entity.shell].datascience
      if (checkData.data === false || checkData.data.length !== 0) {
        // console.log('full-------------')
        await this.subFlowFull(checkData, liveContext, computeFlag)
      } else {
        // console.log('short-------------')
        await this.subFlowShort(checkData, liveContext, computeFlag)
      }
    })
  }

  /**
  *  sub flow of compute and visualisation components data
  * @method subFlowFull
  *
  */
  subFlowFull = async function (entityData, entityContext, computeFlag) {
    console.log('SF--subFlowFull')
    console.log(entityData)
    console.log(entityContext)
    console.log(computeFlag)
    if (this.resultcount >= 0) {
      console.log('result count > 0')
      this.resultcount++
      let rDUUID = entityData.entity.resultuuid
      let dataPrint = this.liveSEntities[entityData.entity.shell].datauuid[rDUUID]
      entityContext.dataprint = dataPrint
      if (this.liveSEntities[entityData.entity.shell].liveDatatypeC.sourceDatatypes.length === 0 && computeFlag === false) {
        console.log('pass1')
        await this.computeFlow(entityData.entity.shell, entityContext.flowstate.updateModContract, dataPrint, '', '')
        // prepare visualisation datasets
        await this.visualFlow(entityData.entity.shell, entityContext.moduleorder.visualise, entityContext.flowstate, dataPrint, false)
      } else {
        console.log('pass2')
        if (this.liveSEntities[entityData.entity.shell].liveDatatypeC.sourceDatatypes.length > 0 && computeFlag === false) {
          let inputUUID = this.liveSEntities[entityData.entity.shell].datascience.inputuuid
          if (computeFlag === false) {
            computeFlag = true
            // this currently is too blunt if range fed in.  Goes and does all source again not just the one that has failed.
            // need to provide context to match compute dataPrint to underlying source dataPrint
            this.liveSEntities[entityData.entity.shell].liveDatatypeC.switchSourceDatatypes()
            // set the time for just this entry
            this.liveSEntities[entityData.entity.shell].liveTimeC.setSourceTime(dataPrint.triplet.timeout)
            // go back to flow and get source so COMPUTE can get source data ie not results data
            this.flowMany(entityData.entity.shell, inputUUID, computeFlag, dataPrint)
          }
        } else if (this.liveSEntities[entityData.entity.shell].liveDatatypeC.sourceDatatypes.length > 0 && computeFlag === true) {
          await this.computeFlow(entityData.entity.shell, entityContext.flowstate.updateModContract, dataPrint, 'datalive', 'savesource')
          if (dataPrint.couple) {
            await this.visualFlow(entityData.entity.shell, entityContext.moduleorder.visualise, entityContext.flowstate, dataPrint.couple, computeFlag)
          } else {
            await this.visualFlow(entityData.entity.shell, entityContext.moduleorder.visualise, entityContext.flowstate, dataPrint, computeFlag)
          }
        } else {
          // still need to inform vis component to clear expected list
          // prepare visualisation datasets
          console.log('clear expected visComp')
          await this.visualFlow(entityData.entity.shell, entityContext.moduleorder.visualise, entityContext.flowstate, dataPrint, false)
          let entityNodata = {}
          entityNodata.context = entityContext
          entityNodata.data = this.liveSEntities[entityData.entity.shell].liveVisualC.visualData[entityData.entity.resultuuid]
          entityNodata.devices = this.liveSEntities[entityData.entity.shell].liveDeviceC.devices
          console.log('out4')
          this.emit('visualFirstRange', entityNodata)
        }
      }
    } else {
      console.log('no results data -------- memory or saved before')
    }
  }

  /**
  *  sub flow of compute and visualisation components data
  * @method subFlowShort
  *
  */
  subFlowShort = async function (entityData, context, computeFlag) {
    console.log('SF--short')
    console.log(entityData)
    // set dataPrint
    let dataPrint = this.liveSEntities[entityData.entity.shell].datauuid[entityData.entity.resultuuid]
    if (computeFlag === false) {
      // datatype table structure needs setting for visualisation
      this.liveSEntities[entityData.entity.shell].liveDatatypeC.datatypeInfoLive = {}
      this.liveSEntities[entityData.entity.shell].liveDatatypeC.datatypeInfoLive.data = {}
      this.liveSEntities[entityData.entity.shell].liveDatatypeC.datatypeInfoLive.data.tablestructure = context.moduleorder.data.value.info.data.value.concept.tablestructure
      // set data in entity component data
      this.liveSEntities[entityData.entity.shell].liveDataC.setFilterResults(entityData.entity.resultuuid, entityData.data.value.tidydata)
      // preprae visualisation datasets
      await this.visualFlow(entityData.entity.shell, context.moduleorder.visualise, context.flowstate, dataPrint, false)
    } else {
      // compute source required
      let rDUUID = entityData.entity.resultuuid
      let dataPrint = this.liveSEntities[entityData.entity.shell].datauuid[rDUUID]
      context.dataprint = dataPrint
      // set expected Count
      let expectedVisData = {}
      expectedVisData[rDUUID] = {}
      expectedVisData[rDUUID][dataPrint.triplet.device] = []
      expectedVisData[rDUUID][dataPrint.triplet.device].push(dataPrint.hash)
      // set data in entity component data
      this.liveSEntities[entityData.entity.shell].liveDataC.setFilterResults(rDUUID, entityData.data.value.tidydata)
      await this.computeFlow(entityData.entity.shell, context.flowstate.updateModContract, dataPrint, 'datalive', 'savesource')
      // need to switch back to original compute
      if (this.liveSEntities[entityData.entity.shell].liveDataC.liveData[entityData.entity.resultuuid]) {
        // prepare visualisation datasets
        if (dataPrint.couple) {
          await this.visualFlow(entityData.entity.shell, context.moduleorder.visualise, context.flowstate, dataPrint.couple, computeFlag)
        } else {
          await this.visualFlow(entityData.entity.shell, context.moduleorder.visualise, context.flowstate, dataPrint, computeFlag)
        }
      } else {
        console.log('SHORT--no data retunred')
      }
    }
  }

  /**
  * control and logic over compute cycle
  * @method computeFlow
  *
  */
  computeFlow = async function (shellID, updateModContract, dataPrint, datastatus, sourceStatus) {
    console.log('SF--computeFlow')
    let modContractUpdate = updateModContract
    // else go through creating new KBID entry
    // set the new updated time settings for the new contract
    modContractUpdate.value.info.controls.date = dataPrint.triplet.timeout
    // ref contract input all complete -
    let engineReturn = await this.computeEngine(shellID, this.liveSEntities[shellID].liveDeviceC.apiData, modContractUpdate, dataPrint, datastatus, sourceStatus)
    // need to save per compute else keep dataPrint as is
    if (datastatus === 'datalive' && sourceStatus === 'savesource') {
      // save data Peer Store
      console.log('save restuls1')
      if (engineReturn === true) {
        this.saveResultsProtocol(shellID, dataPrint.couple.hash)
        this.saveResultsProtocol(shellID, dataPrint.hash)
      } else {
      }
    } else {
      // save data Peer Store
      console.log('save result 2')
      this.saveResultsProtocol(shellID, dataPrint.hash)
    }
    // new version of Ref Contracts of Compute Modules info
    // prepare object to send to peerLink
    let updateModule = {}
    updateModule.type = 'library'
    updateModule.reftype = 'update'
    updateModule.info = modContractUpdate
    // add to list to check before return data to HOP
    this.setNewCompuateModule(shellID, updateModule, dataPrint)
    this.emit('updateModule', updateModule, shellID, dataPrint)
    // send message to PeerLink to make library ledger KBID entry
    // gather proof of evidence chain and hash and send KBLedger store
    /* let hashofProofs = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].evidenceChain)
    let proofChain = {} // hash of all hashes through ECS plus hash of results?
    proofChain.hash = hashofProofs
    proofChain.data = dataPrint.hash
    this.emit('kbledgerEntry', proofChain)
    this.liveSEntities[shellID].evidenceChain = [] */
    return true
  }

  /**
  * prepare proof and make KBledger entry
  * @method prepareKBLedger
  *
  */
  prepareKBLedger = function (uniqueCompute, shellID, dataPrint) {
    // console.log('update compute contract back form saving-------Form ledger and ALRT return of data to HOP')
    // update the datascience holder
    this.updateDataScienceInputs(shellID, uniqueCompute)
    // gather proof of evidence chain and hash and send KBLedger store
    let hashofProofs = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].evidenceChain)
    // need to update 
    let proofChain = {} // hash of all hashes through ECS plus hash of results?
    proofChain.hash = hashofProofs
    // currently dataprint but should make hash of unique compute contract key?
    // proofChain.data = uniqueCompute.key
    proofChain.data = dataPrint.hash
    this.emit('kbledgerEntry', proofChain)
    this.liveSEntities[shellID].evidenceChain = []
    return true
  }

  /**
  * feed data into compute process and prepare new KBID entry
  * @method computeEngine
  *
  */
  computeEngine = async function (shellID, apiInfo, modUpdateContract, dataPrint, datastatus, sourceStatus) {
    let dataCheck = false
    this.liveSEntities[shellID].liveTimeC.setMasterClock(dataPrint.triplet.timeout)
    // proof of evidence
    let evProof = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveTimeC.liveTime)
    this.liveSEntities[shellID].evidenceChain.push(evProof)
    this.liveSEntities[shellID].liveDatatypeC.dataTypeMapping(this.liveSEntities[shellID].liveDeviceC.apiData, apiInfo, dataPrint.triplet.datatype)
    // proof of evidence
    let evProof1 = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDatatypeC.datatypesLive)
    this.liveSEntities[shellID].evidenceChain.push(evProof1)
    // data live in entity or source query required?
    if (datastatus !== 'datalive') {
      await this.liveSEntities[shellID].liveDataC.DataControlFlow(this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive, this.liveSEntities[shellID].liveDeviceC.apiData, modUpdateContract, 'empty', dataPrint)
      // proof of evidence
      let evProof2 = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDataC.dataRaw[dataPrint.hash].length)
      this.liveSEntities[shellID].evidenceChain.push(evProof2)
    } else if (datastatus === 'datalive' && sourceStatus === 'savesource') {
      await this.liveSEntities[shellID].liveDataC.DataControlFlow(this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive, this.liveSEntities[shellID].liveDeviceC.apiData, modUpdateContract, 'empty', dataPrint)
      // proof of evidence
      let evProof2 = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDataC.dataRaw)
      this.liveSEntities[shellID].evidenceChain.push(evProof2)
    } else {
    }
    // check data in component
    if (this.liveSEntities[shellID].liveDataC.liveData[dataPrint.hash] !== undefined) {
      if(this.liveSEntities[shellID].liveDataC.liveData[dataPrint.hash].length === 0 ) {
        dataCheck = false
      } else {
        dataCheck = true
      }
    }
    if (dataCheck === true) {
      this.computeStatus = this.liveSEntities[shellID].liveComputeC.filterCompute(modUpdateContract, dataPrint, this.liveSEntities[shellID].liveDataC.liveData[dataPrint.hash])
      // need to set the compute data per compute dataPrint
      if (datastatus !== 'datalive') {
        console.log('c22')
        let evProof3 =  this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDataC.liveData[dataPrint.hash])
        this.liveSEntities[shellID].evidenceChain.push(evProof3)
      } else {
        console.log('c23')
        let computeDatauuid = dataPrint.couple.hash
        this.liveSEntities[shellID].liveDataC.liveData[computeDatauuid] = this.computeStatus
        // proof of evidence
        let evProof3 = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDataC.liveData[computeDatauuid])
        this.liveSEntities[shellID].evidenceChain.push(evProof3)
        return true
      }
    } else {
      console.log('data check false')
      return false
    }
  }

  /**
  *  visualisation rules to prepare for
  * @method visualFlow
  *
  */
  visualFlow = async function (shellID, visModule, flowState, dataPrint, flag) {
    console.log('SF--visualFlow')
    console.log(visModule)
    let visContract = visModule.value.info.visualise
    if (this.liveSEntities[shellID].liveDataC.liveData[dataPrint.hash] !== undefined && this.liveSEntities[shellID].liveDataC.liveData[dataPrint.hash].length > 0) {
      console.log('vis1')
      // yes data to visualise
      this.liveSEntities[shellID].liveVisualC.filterVisual(visModule, visContract, dataPrint, this.liveSEntities[shellID].liveDataC.liveData[dataPrint.hash], this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive.data.tablestructure, flag)
      // proof of evidence
      let evProof = this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveVisualC.visualData[dataPrint.hash])
      this.liveSEntities[shellID].evidenceChain.push(evProof)
    } else {
      console.log('vis2')
      // no data to process
      this.liveSEntities[shellID].liveVisualC.nodataInfo(dataPrint, visModule)
    }
    return true
  }

  /**
  *  listen for datasets for OUT i.e. complete
  * @method dataoutListener
  *
  */
  dataoutListener = function (shellID) {
    this.liveSEntities[shellID].liveVisualC.on('dataout', (resultUUID) => {
      console.log('yes, data ready for return from SF')
      let context = this.liveSEntities[shellID].datascience
      // has the update Compute Contract arrived?
      if (context.tempComputeMod) {
        console.log('update compuet ID awaiging')
      } else {
        if (this.liveSEntities[shellID].liveVisualC.visualData[resultUUID] !== undefined && this.liveSEntities[shellID].liveVisualC.visualData[resultUUID].data !== 'none') {
          console.log('data ready to return1111')
          let entityOut = {}
          entityOut.context = context
          entityOut.data = this.liveSEntities[shellID].liveVisualC.visualData[resultUUID]
          entityOut.devices = this.liveSEntities[shellID].liveDeviceC.devices
          // required back instant or update resutls store or both
          console.log('out1')
          this.emit('visualFirstRange', entityOut)
        } else {
          this.liveSEntities[shellID].liveVisualC.visualData
          let entityOut = {}
          entityOut.context = context
          // give context of none data
          entityOut.data = this.liveSEntities[shellID].liveVisualC.visualData[resultUUID] // 'none'
          entityOut.devices = this.liveSEntities[shellID].liveDeviceC.devices
          console.log('out2')
          this.emit('visualFirstRange', entityOut)
        }
      }
    })
  }

  /**
  *  empty listner
  * @method emptyListerOUT
  *
  */
  emptyListerOUT = function (shellID) {
    let entityLive = Object.keys(this.liveSEntities)
    // this.liveEManager.
    function outMessage () {
      console.log('listener dataout close')
    }
    for (let et of entityLive) {
      this.liveSEntities[et].liveVisualC.removeAllListeners('dataout', outMessage)
    }
  }

  /**
  *  save Results protocol  temporary for test Network REST storage
  * @method saveResultsProtocol
  *
  */
  saveResultsProtocol = function (shellID, dataID) {
    let localthis = this
    // first save results crypto storage
    // prepare save structure
    if (this.liveSEntities[shellID].liveDataC.liveData[dataID] !== undefined) {
      let saveObject = {}
      // hash and source data ready for visulisation or use
      let dataPair = {}
      dataPair.hash =  this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDataC.liveData[dataID])
      dataPair.tidydata = this.liveSEntities[shellID].liveDataC.liveData[dataID]
      // form the save Object
      saveObject.hash = dataID
      saveObject.data = dataPair
      console.log('saved')
      console.log(saveObject)
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
  visSingleVis = function (shellID) {
    // go and structure for one chart
    this.liveSEntities[shellID].liveVisualC.filterSingleMulti()
  }

  /**
  *  add device component daata
  * @method deviceDataflow
  *
  */
  deviceDataflow = async function (shellID, apiData) {
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
  deviceUpdateDataflow = function (shellID, module) {
    this.liveSEntities[shellID].liveDeviceC.updateDevice(module.value.info.controls.device)
    return true
  }

  /**
  *
  * @method orderModuleFlow
  *
  */
  orderModuleFlow = function (modules) {
    let moduleOrder = {}
    for (let mod of modules) {
      if (mod.value.type === 'data') {
        moduleOrder.data = mod
      } else if (mod.value.type === 'question') {
        moduleOrder.question = mod
      } else if (mod.value.type === 'compute') {
        moduleOrder.compute = mod
      } else if (mod.value.type === 'visualise') {
        moduleOrder.visualise = mod
      }
    }
    return moduleOrder
  }

  /**
  * checkResultUUIDcheck
  * @method checkResultUUIDcheck
  *
  */
  checkResultUUIDcheck = function (uuidData, rData) {
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
  resultIndexExist = function (indexHash, storeHash) {
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
  compareKBIDs = function (mod, kbid) {
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
  removeEntity = function (shellID) {
    return true
  }

  /**
  *  list all live Enties index CIDs
  * @method listEntities
  *
  */
  listEntities = function () {
    return this.liveSEntities
  }

  /**
  *  add component
  * @method addComponent
  *
  */
  addComponent = function (entID) {
  }

  /**
  *  check if entity already has data visual in memory
  * @method checkForResultsMemory
  *
  */
  checkForResultsMemory = function (shellID, hash) {
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
  removeComponent = function (entID) {
  }

  /**
  *  save KBID entry protocol
  * @method saveKBIDProtocol
  *
  */
  saveKBIDProtocol = async function (modContract, saveObject) {
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

}

export default EntitiesManager
