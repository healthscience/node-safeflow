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
  // read peer kbledger
  // let entityModule = {}
  let nxpList = await this.KBLlive.startKBL()
  // should return light data to UI or go ahead and prepare entity for this NXP
  // extract device per NXP so
  return nxpList
}

/**
* extract devices info
* @method deviceFlow
*
*/
EntitiesManager.prototype.deviceFlow = async function (nxpList) {
  // what type of input  CNRL NXP  Module or KBID entry???
  console.log('device flow')
  console.log(nxpList)
  let deviceList = []
  for (let dev of nxpList) {
    let device = await this.deviceExtract(dev)
    deviceList.push(device)
  }
  console.log('devices returned')
  console.log(deviceList)
  return deviceList
}

/**
* peer input into ECS
* @method PeerInput
*
*/
EntitiesManager.prototype.peerInput = async function (input) {
  // what type of input  CNRL NXP  Module or KBID entry???
  console.log('input')
  console.log(input)
  let modKbids = {}
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
  console.log('add entity')
  console.log(ecsIN)
  let moduleState = false
  let shellID = this.liveCrypto.entityID(ecsIN)
  if (this.liveSEntities[shellID]) {
    console.log('entity' + shellID + 'already exists')
    this.entityExists()
  } else {
    console.log('entity' + shellID + 'is new')
    // setup entity to hold components per module
    // extract types of modules from keys
    // now filter for type?
    let modules = this.NXPmodules(ecsIN.modules)
    for (let md of modules) {
      // need matcher - module type to how its processed.  Only computes have KBIDS
      if (md.prime.text === 'Compute') {
        // feed into ECS -KBID processor
        let kbidInfo = await this.extractModKBID(md.prime.cnrl)
        moduleState = await this.KBflow(shellID, md, kbidInfo)
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
  console.log('setup entity and components per module')
  console.log(this.liveSEntities)
  return entityStatus
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
* knowledge Bundle Index Module CNRL matches
* @method extractModKBID
*
*/
EntitiesManager.prototype.extractModKBID = async function (cnrl) {
  // read peer kbledger
  let moduleKBIDdata = {}
  let kbidList = await this.KBLlive.kbIndexQuery(cnrl)
  for (let ki of kbidList) {
    moduleKBIDdata[ki] = await this.kbidEntry(ki)
  }
  return moduleKBIDdata
}

/**
* knowledge Bundle Ledger Entry Data extraction
* @method kbidEntry
*
*/
EntitiesManager.prototype.kbidEntry = async function (kbid) {
  // read peer kbledger
  let kbidData = await this.KBLlive.kbidReader(kbid)
  return kbidData
}

/**
*  deal with each KBID entry
* @method KBflow
*
*/
EntitiesManager.prototype.KBflow = async function (shellID, mc, kbidsList) {
  let statusK = false
  // assess type and build components and systems
  if (kbidsList.length > 0) {
    for (let ki of kbidsList) {
      // start workflow for setting up entity to hold components per module
      let kbComponent = new Entity(this.auth)
      kbComponent[ki] = kbComponent
      let kbidComponent = {}
      modComponents[mc] = kbComponent
      this.liveSEntities[shellID] = kbidComponent
      statusK = await this.controlFlow(shellID, mc, ki, mkids[ki])
    }
  }
  return statusK
}

/**
*  control the adding of data to the entity
*  KnowledgeSciptingLanguage(forth/stack)to give gurantees)
* @method controlFlow
*
*/
EntitiesManager.prototype.controlFlow = async function (shellid, mid, kid, kbEntryIN) {
  console.log('CONTROLFLOW0-----begin')
  console.log(kbEntryIN)
  // set the MASTER TIME CLOCK for entity
  this.liveSEntities[shellid][mid][kid].liveTimeC.setMasterClock(kbEntryIN.time.startperiod)
  this.liveSEntities[shellid][mid][kid].liveDatatypeC.dataTypeMapping()
  /* this.liveSEntities[shellid][mid][kid].liveTimeC.timeProfiling()
  await this.liveSEntities[shellid][mid][kid].liveDataC.sourceData(this.liveSEntities[shellid].liveDatatypeC.datatypeInfoLive, this.liveSEntities[shellid].liveTimeC)
  this.emit('computation', 'in-progress')
  await this.liveSEntities[shellid][mid][kid].liveTimeC.startTimeSystem(this.liveSEntities[shellid].liveDatatypeC, this.liveSEntities[shellid][mid][kid].liveDataC.liveData)
  this.computeStatus = await this.liveSEntities[shellid][mid][kid].liveComputeC.filterCompute(this.liveSEntities[shellid].liveTimeC, this.liveSEntities[shellid][mid][kid].liveDatatypeC.datatypeInfoLive)
  this.emit('computation', 'finished')
  if (this.computeStatus === true) {
  // go direct and get raw data direct
    await this.liveSEntities[shellid][mid][kid].liveDataC.directSourceUpdated(this.liveSEntities[shellid].liveDatatypeC.datatypeInfoLive, this.liveSEntities[shellid].liveTimeC)
  }
  this.liveSEntities[shellid][mid][kid].liveVisualC.filterVisual(this.liveSEntities[shellid].liveDatatypeC.datatypeInfoLive, this.liveSEntities[shellid].liveDataC.liveData, this.liveSEntities[shellid][mid][kid].liveTimeC) */
  console.log('CONTROLFLOW9-----FINISHED')
  console.log(this.liveSEntities[shellid])
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
EntitiesManager.prototype.entityDataReturn = async function (shellID) {
  let GroupDataBundle = {}
  let TestDataBundle = {}
  TestDataBundle['cnrl-001234543212'] = {'prime': {'cnrl': 'cnrl-112', 'vistype': 'nxp-plain', 'text': 'Question', 'active': true}, 'grid': [{ 'x': 0, 'y': 0, 'w': 8, 'h': 2, 'i': '1', static: false }], 'data': {'form': ['a', 'b', 'c'], 'content': [1, 2, 3]}, 'message': 'compute-complete'}
  TestDataBundle['cnrl-001234543214'] = {'prime': {'cnrl': 'cnrl-114', 'vistype': 'nxp-visualise', 'text': 'Results', 'active': true}, 'grid': [{ 'x': 0, 'y': 0, 'w': 8, 'h': 20, 'i': '0', static: false }, { 'x': 0, 'y': 0, 'w': 8, 'h': 20, 'i': '1', static: false }], 'data': [{'chartOptions': ['1', '2', '3'], 'chartPackage': [1, 2, 3]}, {'chartOptions': ['4', '5', '6'], 'chartPackage': [4, 5, 6]}], 'message': 'compute-complete'}
  TestDataBundle['cnrl-001234543213'] = {'prime': {'cnrl': 'cnrl-113', 'vistype': 'nxp-plain', 'text': 'Controls', 'active': true}, 'grid': [{ 'x': 0, 'y': 0, 'w': 8, 'h': 2, 'i': '1', static: false }], 'data': {'form': ['a', 'b', 'c'], 'content': [1, 2, 3]}, 'message': 'compute-complete'}
  TestDataBundle['cnrl-001234543215'] = {'prime': {'cnrl': 'cnrl-115', 'vistype': 'nxp-plain', 'text': 'Errors', 'active': true}, 'grid': [{ 'x': 0, 'y': 0, 'w': 8, 'h': 2, 'i': '1', static: false }], 'data': {'form': ['a', 'b', 'c'], 'content': [1, 2, 3]}, 'message': 'compute-complete'}
  TestDataBundle['cnrl-001234543216'] = {'prime': {'cnrl': 'cnrl-116', 'vistype': 'nxp-plain', 'text': 'Lifestyle Medicine', 'active': true}, 'grid': [{ 'x': 0, 'y': 0, 'w': 8, 'h': 2, 'i': '1', static: false }], 'data': {'form': ['a', 'b', 'c'], 'content': [1, 2, 3]}, 'message': 'compute-complete'}
  TestDataBundle['cnrl-001234543217'] = {'prime': {'cnrl': 'cnrl-117', 'vistype': 'nxp-plain', 'text': 'Educate', 'active': true}, 'grid': [{ 'x': 0, 'y': 0, 'w': 8, 'h': 2, 'i': '1', static: false }], 'data': {'form': ['a', 'b', 'c'], 'content': [1, 2, 3]}, 'message': 'compute-complete'}
  TestDataBundle['cnrl-001234543218'] = {'prime': {'cnrl': 'cnrl-1118', 'vistype': 'nxp-plain', 'text': 'Evovle', 'active': true}, 'grid': [{ 'x': 0, 'y': 0, 'w': 8, 'h': 2, 'i': '1', static: false }], 'data': {'form': ['a', 'b', 'c'], 'content': [1, 2, 3]}, 'message': 'compute-complete'}
  TestDataBundle['cnrl-001234543219'] = {'prime': {'cnrl': 'cnrl-119', 'vistype': 'nxp-plain', 'text': 'Communicate', 'active': true}, 'grid': [{ 'x': 0, 'y': 0, 'w': 8, 'h': 2, 'i': '1', static: false }], 'data': {'form': ['a', 'b', 'c'], 'content': [1, 2, 3]}, 'message': 'compute-complete'}
  this.liveSEntities[shellID] = TestDataBundle
  GroupDataBundle = this.liveSEntities[shellID]
  return GroupDataBundle
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
