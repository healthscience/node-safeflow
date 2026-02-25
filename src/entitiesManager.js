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
import { EventEmitter } from 'events'

// New Pipeline Systems
import DataFetchSystem from './systems/pipeline/dataFetchSystem.js'
import DataTidySystem from './systems/pipeline/dataTidySystem.js'
import ComputeSystem from './systems/compute/computeSystem.js'
import LedgerSystem from './systems/pipeline/ledgerSystem.js'

// New Pipeline Components
import DataRequestComponent from './components/pipeline/dataRequestComponent.js'
import TidyRulesComponent from './components/pipeline/tidyRulesComponent.js'
import ComputeContractComponent from './components/pipeline/computeContractComponent.js'

class EntitiesManager extends EventEmitter {
  constructor(dataAPI) {
    super()
    console.log('entity manerage live')
    // start error even listener
    this.eventErrorListen()
    this.auth = dataAPI
    this.liveAutomation = new AutomationManager()
    this.liveCNRLUtility = new CNRLUtility(this.auth)
    this.liveCrypto = new CryptoUtility()
    this.liveSEntities = {}
    
    // Initialize Pipeline Systems
    this.dataFetchSystem = new DataFetchSystem(this.auth)
    this.dataTidySystem = new DataTidySystem(this.auth)
    this.computeSystem = new ComputeSystem(this.auth)
    this.ledgerSystem = new LedgerSystem(this.auth, this.auth)

    this.automationReview()
    this.resultListener()
    this.resultcount = 0
    this.computeFlag = false
    this.futurePrint = {}
    this.ecscounter = 0
    this.throttle = throttledQueue(1, 100)

    // Start the ECS main loop
    this.startLoop()
  }

  /**
  * Main ECS Loop (Tick)
  */
  async startLoop() {
    setInterval(async () => {
      await this.tick()
    }, 1000) // Run every second
  }

  async tick() {
    // Run all systems in order
    await this.dataFetchSystem.update(this.liveSEntities)
    await this.dataTidySystem.update(this.liveSEntities)
    await this.computeSystem.update(this.liveSEntities)
    await this.ledgerSystem.update(this.liveSEntities)
  }

  /**
  * listen for error on event triggered
  * @method eventErrorListen
  *
  */
  eventErrorListen(refCont) {
    const logger = console
    this.on('error', (err) => {
      logger.error('Unexpected error on emitter', err)
    })
  }

  /**
  * assess automation and go ahead with updates
  * @method automationReview
  *
  */
  automationReview(refCont) {
    let automationInfo = {}
    let contractList = this.liveAutomation.assessAutomation()
    if (contractList === true) {
      automationInfo.data = []
    } else {
      automationInfo.data = 'none'
    }
    return automationInfo
  }

  /**
  * Read KBL and setup defaults for this peer
  * @method peerKBLstart
  *
  */
  async peerKBLstart(refCont) {
    let dataSummary = this.peerInput(refCont)
    return dataSummary
  }

  /**
  * peer input into ECS - Simplified for Pure ECS
  * @method peerInput
  *
  */
  async peerInput(input) {
    let inputValid = this.validateInput(input)
    if (inputValid === true) {
      const shellID = this.liveCrypto.entityID(input.exp)
      const entity = new Entity(this.auth)
      entity.id = shellID
      
      // Attach initial components to start the pipeline
      entity.dataRequest = new DataRequestComponent(input.modules.data)
      entity.tidyRules = new TidyRulesComponent(input.modules.data.rules)
      entity.computeContract = new ComputeContractComponent(input.modules.compute)
      
      this.liveSEntities[shellID] = entity
      
      return { shellID, status: 'pipeline_started' }
    }
    return { shellID: 'error', status: 'invalid_input' }
  }

  /**
  *  does the input object in SF-ECS compliant structure?
  * @method validateInput
  *
  */
  validateInput(input) {
    let validStructure = false
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
  * @method addHSentity
  *
  */
  async addHSentity(ecsIN, inputUUID) {
    let entitySet = {}
    let moduleState = false
    let shellID = ''
    let modules = []
    this.computeFlag = false
    if (ecsIN.update !== undefined && ecsIN.update.entityUUID) {
      shellID = ecsIN.update.entityUUID
      modules = ecsIN.update.modules
      moduleState = true
      this.ECSflow(shellID, ecsIN.update, inputUUID, modules)
    } else {
      shellID = this.liveCrypto.entityID(ecsIN.exp)
      modules = ecsIN.modules
      this.liveSEntities[shellID] = new Entity(this.auth)
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
  * @method addDatastore
  *
  */
  addDatastore(authDS) {
    this.auth = authDS
  }

  /**
  *  control the adding of data to the entity
  * @method ECSflow
  *
  */
  async ECSflow(shellID, ECSinput, inputUUID, modules) {
    let moduleOrder = this.orderModuleFlow(modules)
    let flowState = {}
    let deviceInfo = {}
    if (ECSinput.input === 'refUpdate') {
      this.deviceUpdateDataflow(shellID, moduleOrder.compute)
      flowState = await this.flowPrepare(shellID, ECSinput, inputUUID, moduleOrder)
      this.setDataScienceInputs(shellID, inputUUID, ECSinput, moduleOrder, flowState, 'update')
      this.flowMany(shellID, inputUUID, false)
    } else if (ECSinput.input === 'future') {
      this.deviceUpdateDataflow(shellID, moduleOrder.compute)
      flowState = await this.flowPrepare(shellID, ECSinput, inputUUID, moduleOrder)
      this.setDataScienceInputs(shellID, inputUUID, ECSinput, moduleOrder, flowState, 'future')
      this.flowMany(shellID, inputUUID, true)
    } else {
      let deviceMod = {}
      deviceMod.packaging = moduleOrder.data.value
      deviceMod.compute = moduleOrder.compute.value
      deviceInfo = deviceMod
      await this.deviceDataflow(shellID, deviceInfo)
      flowState = await this.flowPrepare(shellID, ECSinput, inputUUID, moduleOrder)
      this.setDataScienceInputs(shellID, inputUUID, ECSinput, moduleOrder, flowState, 'first')
      this.flowMany(shellID, inputUUID, false)
    }
  }

  /**
  *  loop through the data required per datatype time and device
  *  Refactored to act as an ECS Scheduler: generates individual entities for each dataPrint
  * @method flowMany
  *
  */
  async flowMany(shellID, inputUUID, computeFlag, dataPrint) {
    let ecsInput = this.liveSEntities[shellID].datascience
    let timeList = []
    if (computeFlag === true) {
      timeList = this.liveSEntities[shellID].liveTimeC.timerange
      this.liveSEntities[shellID].liveTimeC.sourceTime = []
    } else {
      timeList = this.liveSEntities[shellID].liveTimeC.timerange
    }
    if (ecsInput.flowstate.devicerange === true && ecsInput.flowstate.datatyperange === true && ecsInput.flowstate.timerange === true) {
      for (let i = 0; i < this.liveSEntities[shellID].liveDeviceC.devices.length; i++) {
        const currentDevice = this.liveSEntities[shellID].liveDeviceC.devices[i]
        if (computeFlag === false) {
          this.liveSEntities[shellID].liveVisualC.clearDeviceCount(currentDevice)
        }
        for (let j = 0; j < this.liveSEntities[shellID].liveDatatypeC.datatypesLive.length; j++) {
          const currentDatatype = this.liveSEntities[shellID].liveDatatypeC.datatypesLive[j]
          for (let k = 0; k < timeList.length; k++) {
            const currentTime = timeList[k]
            const d = currentDevice
            const dt = currentDatatype
            const t = currentTime
            this.throttle(() => {
              let tidy = ecsInput.flowstate.updateModContract.value.info.controls.tidy
              let category = ''
              let dataPrintHash = this.resultsUUIDbuilder(d, dt, t, tidy, category)
              
              // Create a new sub-entity for this specific dataPrint chunk
              const subEntityId = `${shellID}-${dataPrintHash}`
              this.liveSEntities[subEntityId] = new Entity(subEntityId)
              
              // Attach Pipeline Components to the sub-entity
              this.liveSEntities[subEntityId].dataRequest = new DataRequestComponent({
                device: d,
                datatype: dt,
                time: t,
                tidy,
                category,
                inputUUID,
                parentShellID: shellID
              })
              
              this.liveSEntities[subEntityId].tidyRules = new TidyRulesComponent(
                ecsInput.flowstate.updateModContract.value.modules.data.rules
              )
              
              this.liveSEntities[subEntityId].computeContract = new ComputeContractComponent(
                ecsInput.flowstate.updateModContract.value.modules.compute
              )

              // Legacy tracking for backward compatibility during transition
              this.trackDataUUIDS(shellID, inputUUID, dataPrintHash, d, dt, t, tidy, category, computeFlag, dataPrint)
              this.entityResultsReady(shellID, ecsInput.input, dataPrintHash, computeFlag)
            })
          }
        }
      }
    } else {
      let context = this.liveSEntities[shellID].datascience
      let entityOut = {}
      entityOut.context = context
      entityOut.data = 'none-start'
      entityOut.devices = this.liveSEntities[shellID].liveDeviceC.devices
      this.emit('visualFirstRange', entityOut)
    }
  }

  /**
  * if entity results ie KBLedger entry exist no need to go to source
  * @method entityResultsReady
  *
  */
  async entityResultsReady(shellID, ecsIN, hash, computeFlag) {
    let checkDataExist = this.checkForResultsMemory(shellID, hash)
    let liveContext = this.liveSEntities[shellID].datascience
    if (checkDataExist.vis === true && computeFlag === false) {
      let dataPrint = this.liveSEntities[shellID].datauuid[hash]
      await this.visualFlow(shellID, liveContext.moduleorder.visualise, {}, dataPrint, false)
      return true
    } else if (checkDataExist.data === true && computeFlag === true) {
      let checkData = {
        entity: {
          shell: shellID,
          resultuuid: hash,
          computeflag: false
        },
        data: this.liveSEntities[shellID].liveDataC[hash]
      }
      await this.subFlowShort(checkData, liveContext, computeFlag)
      return true
    } else {
      let resultExist = this.checkResults(shellID, hash, computeFlag)
      return resultExist
    }
  }

  /**
  *  ask peer to query results store a unique result data key
  * @method checkResults
  *
  */
  checkResults(shellID, uuidRData, computeFlag) {
    let resultsPrint = {
      shell: shellID,
      resultuuid: uuidRData,
      computeflag: computeFlag
    }
    this.emit('resultCheck', resultsPrint)
    return true
  }

  /**
  *  listener for existing results
  * @method resultListener
  *
  */
  resultListener() {
    this.on('resultsCheckback', async (checkData) => {
      let computeFlag = checkData.entity.computeflag
      let liveContext = this.liveSEntities[checkData.entity.shell].datascience
      if (checkData.data === false || checkData.data.length === 0) {
        await this.subFlowFull(checkData, liveContext, computeFlag)
      } else {
        await this.subFlowShort(checkData, liveContext, computeFlag)
      }
    })
  }

  /**
  *  sub flow of compute and visualisation components data
  * @method subFlowFull
  *
  */
  async subFlowFull(entityData, entityContext, computeFlag) {
    if (this.resultcount >= 0) {
      this.resultcount++
      let rDUUID = entityData.entity.resultuuid
      let dataPrint = this.liveSEntities[entityData.entity.shell].datauuid[rDUUID]
      entityContext.dataprint = dataPrint
      if (this.liveSEntities[entityData.entity.shell].liveDatatypeC.sourceDatatypes.length === 0 && computeFlag === false) {
        await this.computeFlow(entityData.entity.shell, entityContext.flowstate.updateModContract, dataPrint, '', '')
        await this.visualFlow(entityData.entity.shell, entityContext.moduleorder.visualise, entityContext.flowstate, dataPrint, false)
      } else {
        if (this.liveSEntities[entityData.entity.shell].liveDatatypeC.sourceDatatypes.length > 0 && computeFlag === false) {
          let inputUUID = this.liveSEntities[entityData.entity.shell].datascience.inputuuid
          if (computeFlag === false) {
            computeFlag = true
            this.liveSEntities[entityData.entity.shell].liveDatatypeC.switchSourceDatatypes()
            this.liveSEntities[entityData.entity.shell].liveTimeC.setSourceTime(dataPrint.triplet.timeout)
            this.flowMany(entityData.entity.shell, inputUUID, computeFlag, dataPrint)
          }
        } else if (computeFlag === true) {
          await this.computeFlow(entityData.entity.shell, entityContext.flowstate.updateModContract, dataPrint, 'futurelive', 'savesource')
          let futureDataprint = this.liveSEntities[entityData.entity.shell].datauuid[this.futurePrint]
          await this.visualFlow(entityData.entity.shell, entityContext.moduleorder.visualise, entityContext.flowstate, futureDataprint.couple, false)
        } else if (this.liveSEntities[entityData.entity.shell].liveDatatypeC.sourceDatatypes.length > 0 && computeFlag === true) {
          await this.computeFlow(entityData.entity.shell, entityContext.flowstate.updateModContract, dataPrint, 'datalive', 'savesource')
          if (dataPrint.couple) {
            await this.visualFlow(entityData.entity.shell, entityContext.moduleorder.visualise, entityContext.flowstate, dataPrint.couple, computeFlag)
          } else {
            await this.visualFlow(entityData.entity.shell, entityContext.moduleorder.visualise, entityContext.flowstate, dataPrint, computeFlag)
          }
        } else {
          await this.visualFlow(entityData.entity.shell, entityContext.moduleorder.visualise, entityContext.flowstate, dataPrint, false)
          let entityNodata = {
            context: entityContext,
            data: this.liveSEntities[entityData.entity.shell].liveVisualC.visualData[entityData.entity.resultuuid],
            devices: this.liveSEntities[entityData.entity.shell].liveDeviceC.devices
          }
          this.emit('visualFirstRange', entityNodata)
        }
      }
    }
  }

  /**
  *  sub flow of compute and visualisation components data
  * @method subFlowShort
  *
  */
  async subFlowShort(entityData, context, computeFlag) {
    let dataPrint = this.liveSEntities[entityData.entity.shell].datauuid[entityData.entity.resultuuid]
    if (computeFlag === false) {
      this.liveSEntities[entityData.entity.shell].liveDatatypeC.datatypeInfoLive = {
        data: {
          tablestructure: context.moduleorder.data.value.info.value.concept.tablestructure
        }
      }
      this.liveSEntities[entityData.entity.shell].liveDataC.setFilterResults(entityData.entity.resultuuid, entityData.data.value.tidydata)
      await this.visualFlow(entityData.entity.shell, context.moduleorder.visualise, context.flowstate, dataPrint, false)
    } else {
      let rDUUID = entityData.entity.resultuuid
      let dataPrint = this.liveSEntities[entityData.entity.shell].datauuid[rDUUID]
      context.dataprint = dataPrint
      this.liveSEntities[entityData.entity.shell].liveDataC.setFilterResults(rDUUID, entityData.data)
      await this.computeFlow(entityData.entity.shell, context.flowstate.updateModContract, dataPrint, 'futurelive', 'savesource', rDUUID)
      if (this.liveSEntities[entityData.entity.shell].liveDataC.liveData[entityData.entity.resultuuid]) {
        if (computeFlag == true) {
          let futureDataprint = this.liveSEntities[entityData.entity.shell].datauuid[this.futurePrint]
          await this.visualFlow(entityData.entity.shell, context.moduleorder.visualise, context.flowstate, futureDataprint, computeFlag)
        } else {
          await this.visualFlow(entityData.entity.shell, context.moduleorder.visualise, context.flowstate, dataPrint, computeFlag)
        }
      }
    }
  }

  /**
  * control and logic over compute cycle
  * @method computeFlow
  *
  */
  async computeFlow(shellID, updateModContract, dataPrint, datastatus, sourceStatus, rDUUID) {
    let modContractUpdate = updateModContract
    modContractUpdate.value.info.controls.date = dataPrint.triplet.timeout
    let engineReturn = await this.computeEngine(shellID, this.liveSEntities[shellID].liveDeviceC.apiData, modContractUpdate, dataPrint, datastatus, sourceStatus, rDUUID)
    if (datastatus === 'datalive' && sourceStatus === 'savesource') {
      if (engineReturn === true) {
        this.saveResultsProtocol(shellID, dataPrint.couple.hash)
        this.saveResultsProtocol(shellID, dataPrint.hash)
      }
    } else if (datastatus === 'futurelive' && sourceStatus === 'savesource') {
      let futureDataprint = this.liveSEntities[shellID].datauuid[this.futurePrint]
      this.saveResultsProtocol(shellID, futureDataprint.hash)
    } else {
      this.saveResultsProtocol(shellID, dataPrint.hash)
    }
    let updateModule = {
      type: 'library',
      reftype: 'update',
      info: modContractUpdate
    }
    if (datastatus !== 'futurelive') {
      this.setNewCompuateModule(shellID, updateModule, dataPrint)
    } else {
      let futureDataprint = this.liveSEntities[shellID].datauuid[this.futurePrint]
      this.setNewCompuateModule(shellID, updateModule, futureDataprint)
    }
    this.emit('updateModule', updateModule, shellID, dataPrint)
  }

  // Placeholder methods for those not yet refactored or defined in the snippet
  orderModuleFlow(modules) { return {} }
  deviceUpdateDataflow(shellID, compute) {}
  flowPrepare(shellID, input, uuid, order) { return {} }
  setDataScienceInputs(shellID, uuid, input, order, state, type) {}
  resultsUUIDbuilder(device, datatype, time, tidy, category) { return '' }
  trackDataUUIDS(shellID, uuid, hash, device, datatype, time, tidy, category, flag, print) {}
  dataoutListener(shellID) {}
  checkForResultsMemory(shellID, hash) { return { vis: false, data: false } }
  visualFlow(shellID, vis, state, print, flag) {}
  saveResultsProtocol(shellID, hash) {}
  setNewCompuateModule(shellID, module, print) {}
  computeEngine(shellID, api, contract, print, status, source, uuid) { return true }
  deviceDataflow(shellID, info) {}
}

export default EntitiesManager
