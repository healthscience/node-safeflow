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
import KBLedger from './kbl-cnrl/kbledger.js'
import CryptoUtility from './kbl-cnrl/cryptoUtility.js'
import Entity from './scienceEntities.js'
const util = require('util')
const events = require('events')

var EntitiesManager = function (apiCNRL, auth) {
  events.EventEmitter.call(this)
  this.auth = auth
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
  console.log('peer setart')
  // read peer kbledger
  // let entityModule = {}
  let nxpList = await this.KBLlive.startKBL()
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
  let nxpList = await this.KBLlive.startPeerKBL()
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
  // what type of input  CNRL NXP  Module or KBID entry???
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
  console.log('input to ECS')
  console.log(ecsIN)
  let moduleState = false
  let modules = {}
  let shellID = this.liveCrypto.entityID(ecsIN)
  if (this.liveSEntities[shellID]) {
    console.log('entity' + shellID + 'already exists')
    this.entityExists()
  } else {
    console.log('entity' + shellID + 'is new')
    // setup entity to hold components per module
    this.liveSEntities[shellID] = new Entity(this.auth)
    // extract types of modules from keys
    // now filter for type?
    modules = this.NXPmodules(ecsIN.modules)
    for (let md of modules) {
      // need matcher - module type to how its processed. Only computes have KBIDS
      if (md.prime.text === 'Device') {
        // hook up to device
        let deviceInfo = this.extractDevice(md.device.cnrl)
        moduleState = await this.deviceDataflow(shellID, deviceInfo)
        console.log('Device MOD comlete')
      } else if (md.prime.text === 'Compute') {
        // feed into ECS -KBID processor
        console.log('compute start')
        console.log(md)
        let kbidInfo = await this.extractKBID(md.prime.cnrl, 1)
        // now check this KBID HASH against built CNRL inputs
        moduleState = await this.controlFlow(shellID, md, kbidInfo)
        /* let kbLength = Object.keys(kbidInfo)
        if (kbLength.length > 0) {
          for (let ki of kbLength) {
            // start workflow for setting up entity components to hold data for this module
            moduleState = await this.controlFlow(shellID, md, kbidInfo[ki])
          }
        } */
      } else {
        // plain extract info. from CNRL contract
      }
    }
  }
  let entityStatus = ''
  if (moduleState === true) {
    entityStatus = shellID
  } else {
    entityStatus = 'failed'
  }
  let entityHolder = {}
  entityHolder.status = entityStatus
  entityHolder.modules = modules
  return entityHolder
}

/**
*  add device component daata
* @method deviceDataflow
*
*/
EntitiesManager.prototype.deviceDataflow = async function (shellID, device) {
  let statusD = false
  // set the device in module
  statusD = await this.liveSEntities[shellID].liveDeviceC.setDevice(device)
  // proof of evidence
  // this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDeviceC)
  statusD = true
  return statusD
}
/**
*  control the adding of data to the entity
*  KnowledgeSciptingLanguage(forth/stack)to give gurantees)
* @method controlFlow
*
*/
EntitiesManager.prototype.controlFlow = async function (shellID, mod, kbid) {
  console.log('CONTROLFLOW0-----begin')
  console.log(mod)
  console.log(kbid)
  let inputKBID = this.liveCrypto.hashKBID(mod, kbid.result)
  console.log('tow hases')
  console.log(kbid.kbid)
  console.log(inputKBID)
  let hashMatcher = this.liveCrypto.compareHashes(kbid.kbid, inputKBID)
  // If the result HASH then just look at Visulisation inputs and send the data back.
  if (hashMatcher === true) {
    console.log('results already prepared')
    // get data from API
    await this.liveSEntities[shellID].liveDataC.directSourceResults()
  } else {
    console.log('new data to process')
    // else go through creating a new KBID
    // WHAT INSTRUCTIONS FROM COMPUTE AUTOMATION?
    // set the MASTER TIME CLOCK for entity
    this.liveSEntities[shellID].liveTimeC.setMasterClock(kbid.time.startperiod)
    // proof of evidence
    // this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveTimeC)
    this.liveSEntities[shellID].liveDatatypeC.dataTypeMapping(this.liveSEntities[shellID].liveDeviceC.devices, kbid.data)
    // proof of evidence
    // this.liveCrypto.evidenceProof(this.liveSEntities[shellID].liveDatatypeC)
    this.liveSEntities[shellID].liveTimeC.timeProfiling(kbid.time)
    // proof of evidence
    // this.liveCrypto.evidenceProof()
    await this.liveSEntities[shellID].liveDataC.sourceData(this.liveSEntities[shellID].liveDeviceC.devices, this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive, this.liveSEntities[shellID].liveTimeC)
    // proof of evidence
    // this.liveCrypto.evidenceProof()
    this.emit('computation', 'in-progress')
    await this.liveSEntities[shellID].liveTimeC.startTimeSystem(this.liveSEntities[shellID].liveDatatypeC, this.liveSEntities[shellID].liveDataC.liveData)
    // proof of evidence
    // this.liveCrypto.evidenceProof()
    this.computeStatus = await this.liveSEntities[shellID].liveComputeC.filterCompute(this.liveSEntities[shellID].liveTimeC, this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive)
    // proof of evidence
    // this.liveCrypto.evidenceProof()
    this.emit('computation', 'finished')
    if (this.computeStatus === true) {
    // go direct and get raw data direct
      await this.liveSEntities[shellID].liveDataC.directSourceResults(this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive, this.liveSEntities[shellID].liveTimeC)
      // proof of evidence
      // this.liveCrypto.evidenceProof()
    }
  }
  this.liveSEntities[shellID].liveVisualC.filterVisual(this.liveSEntities[shellID].liveDatatypeC.datatypeInfoLive, this.liveSEntities[shellID].liveDataC.liveData, this.liveSEntities[shellID].liveTimeC)
  // proof of evidence
  // this.liveCrypto.evidenceProof()
  console.log('CONTROLFLOW9-----FINISHED')
  // console.log(this.liveSEntities[shellID])
  return true
}

/**
*  if the entity already exists
* @method entityExists
*
*/
EntitiesManager.prototype.entityExists = function (shellid, dataIn) {
  // does the data exist for this visualisation and time?
  let checkDataExist = this.checkForVisualData(shellid, dataIn)
  if (checkDataExist === true) {
    console.log('data already ready')
    this.liveSEntities[shellid].liveTimeC.setStartPeriod(dataIn.startperiod)
    this.liveSEntities[shellid].liveTimeC.setRealtime(dataIn.realtime)
    this.liveSEntities[shellid].liveTimeC.setLastTimeperiod(dataIn.laststartperiod)
    this.liveSEntities[shellid].liveTimeC.setTimeList(dataIn.startperiod)
    this.liveSEntities[shellid].liveTimeC.setTimeSegments(dataIn.timeseg)
    this.liveSEntities[shellid].liveTimeC.setTimeVis(dataIn.timevis)
    this.liveSEntities[shellid].liveDataC.setDatatypesLive(dataIn.datatypes)
    this.liveSEntities[shellid].liveDataC.setCategories(dataIn.categories)
  }
  return true
}

/**
*  return data from an entity
* @method entityDataReturn
*
*/
EntitiesManager.prototype.entityDataReturn = async function (entityID) {
  return this.liveSEntities[entityID]
}

/**
* modules per NXP cnrl
* @method NXPmodules
*
*/
EntitiesManager.prototype.NXPmodules = function (mList) {
  // read peer kbledger
  // let entityModule = {}
  let nxpList = this.KBLlive.modulesCNRL(mList)
  return nxpList
}

/**
* Extract the device information
* @method extractDevice
*
*/
EntitiesManager.prototype.extractDevice = function (cnrl) {
  let deviceBundle = this.KBLlive.contractCNRL(cnrl)
  return deviceBundle
}
/**
* knowledge Bundle Index Module CNRL matches
* @method extractKBID
*
*/
EntitiesManager.prototype.extractKBID = async function (cnrl, n) {
  // read peer kbledger
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
*  check if entity already has data raw tidy visual
* @method checkForVisualData
*
*/
EntitiesManager.prototype.checkForVisualData = function (cid, timePeriod, visStyle) {
  //  this only check for last prepareData, need VisualComponent to use push(obj
  let entityData = this.liveSEntities[cid].liveVisualC.visualData
  if (!entityData[visStyle]) {
    return false
  } else if (entityData[visStyle][timePeriod]) {
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

export default EntitiesManager
