'use strict'
/**
*  VisualComponent
*
*
* @class ComputeComponent
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import CryptoUtility from '../kbl-cnrl/cryptoUtility.js'
import VisSystem from '../systems/visual/visSystem.js'
import util from 'util'
import events from 'events'

var VisualComponent = function (EID) {
  events.EventEmitter.call(this)
  this.EIDinfo = EID
  this.liveCrypto = new CryptoUtility()
  this.liveVisSystem = new VisSystem()
  this.visualData = {}
  this.liveInputlist = {}
  this.datasetsOutpattern = {}
  this.liveVislist = {}
  this.deviceCount = {}
  this.datasetHolder = {}
  this.dataPrintHolder = {}
  this.sourcedataHolder = {}
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(VisualComponent, events.EventEmitter)

/**
*  make list of datasets required per input to ECS
* @method manageVisDatasets
*
*/
VisualComponent.prototype.manageVisDatasets = function (inputBatch, expectedVis) {
  this.liveInputlist[inputBatch] = expectedVis[inputBatch]
}

/**
*  clear expected vis list
* @method clearDeviceCount
*
*/
VisualComponent.prototype.clearDeviceCount = function (device) {
  this.deviceCount[device.device_mac] = 0
}

/**
*
* @method filterVisual
*
*/
VisualComponent.prototype.filterVisual = function (visModule, contract, dataPrint, resultsData, dtConvert, flag) {
  // console.log(util.inspect(visModule, {showHidden: false, depth: null}))
  // console.log('VISUAL__COMPONENT')
  let timeFormat = ''
  let settingsLive = visModule.value.info.settings
  let timeFormatSet = settingsLive.hasOwnProperty('timeformat')
  if (timeFormatSet === true) {
    timeFormat = settingsLive.timeformat
  } else {
    // default to timeseries
    timeFormat = 'timeseries'
  }
  // single dataset, many datasets one chart, many datasets many charts?
  // OK, what dataset bundle is required, single, multi datatypes, multi times?
  if (!this.liveVislist[dataPrint.triplet.device]) {
    this.liveVislist[dataPrint.triplet.device] = []
  }
  // keep tabs on what has be vis processed
  this.liveVislist[dataPrint.triplet.device].push(dataPrint.hash)
  // prepare the dataset to return
  let visData = {}
  visData.data = this.liveVisSystem.visualControl(visModule, contract, dataPrint, resultsData, dtConvert)
  visData.context = dataPrint
  visData.list = this.liveVislist
  // hold the data in the entity component
  this.visualData[dataPrint.hash] = visData
  // if dataset profile complete or just signals, return to peer
  // check against profile
  // device is matched to what input hash?
  let inputHash = {}
  if (flag !== true) {
    let howManyInputUUID = Object.keys(this.datasetsOutpattern)
    inputHash = howManyInputUUID[0]
  } else {
    let howManyInputUUID = Object.keys(this.liveInputlist)
    inputHash = howManyInputUUID[0]
  }
  // expected vis results  source or compute flag?
  let deviceDataPrintCount = this.extractVisExpected(inputHash, dataPrint.triplet.device)
  // is there a list to bundle together?
  let completeVisList = []
  if (deviceDataPrintCount.length > 0) {
    for (let dphash of deviceDataPrintCount) {
      if (dphash === dataPrint.hash) {
        if (this.deviceCount[dataPrint.triplet.device] === undefined) {
          this.deviceCount[dataPrint.triplet.device] = 0
        } else {
        }
        this.deviceCount[dataPrint.triplet.device]++
        // yes in list
        completeVisList.push(dataPrint.triplet.device)
      } else {
      }
    }
  }
  // console.log('expected v live')
  // console.log(deviceDataPrintCount.length)
  // console.log(this.deviceCount[dataPrint.triplet.device])
  // console.log('memoryPrint Start')
  // console.log(process.memoryUsage())
  // decide to return or go to next vis data to process
  if (deviceDataPrintCount.length !== this.deviceCount[dataPrint.triplet.device]) {
    // console.log('logic 1')
    // not yet keep hold of data to batch
    if (this.datasetHolder[inputHash] === undefined) {
      this.datasetHolder[inputHash] = []
      this.dataPrintHolder[inputHash] = []
    }
    if (this.sourcedataHolder[inputHash] === undefined) {
      this.sourcedataHolder[inputHash] = []
    }
    // add to holder for datasets i.e. multi dataset asked for
    this.datasetHolder[inputHash].push(this.visualData[dataPrint.hash])
    this.dataPrintHolder[inputHash].push(dataPrint)
    this.sourcedataHolder[inputHash].push({ context: dataPrint, data: resultsData })
    // remove item from inputList? (only devices if )
  } else if (deviceDataPrintCount.length === this.deviceCount[dataPrint.triplet.device] && this.deviceCount[dataPrint.triplet.device] > 1) {
    // console.log('logic 2')
    if (this.datasetHolder[inputHash] === undefined) {
      this.datasetHolder[inputHash] = []
      this.dataPrintHolder[inputHash] = []
    }
    if (this.sourcedataHolder[inputHash] === undefined) {
      this.sourcedataHolder[inputHash] = []
    }
    // add this dataset to list
    this.datasetHolder[inputHash].push(this.visualData[dataPrint.hash])
    this.dataPrintHolder[inputHash].push(dataPrint)
    let contextBundle = {}
    contextBundle.context = dataPrint
    contextBundle.data = resultsData
    this.sourcedataHolder[inputHash].push(contextBundle)
    // bundle of greater than one length ready for dataSet preparation
    // need dataPrints if more than one datatype?  Need to check TODO
    let datasetMulti = this.buildMultiDataset(deviceDataPrintCount, timeFormat, inputHash, dataPrint)
    // clear the input tracking this.deviceCount
    this.deviceCount[dataPrint.triplet.device] = 0
    // just remove device element unless none left, delete input hash holder
    // console.log(this.datasetsOutpattern[inputHash])
    this.datasetsOutpattern[inputHash].filter(item => item !== dataPrint.triplet.device)
    if (this.datasetsOutpattern[inputHash].length === 0 ) {
      delete this.datasetsOutpattern[inputHash]
    }
    delete this.liveInputlist[inputHash][dataPrint.triplet.device]
    if (this.liveInputlist[inputHash].length === 0) {
      delete this.liveInputlist[inputHash]
    }
    this.liveVislist = []
    this.emit('dataout', inputHash)
  } else {
    // console.log('logic 3')
    // if batch then create resUUID for the batch
    let resultPrint = dataPrint.hash
    // clear the input tracking
    this.deviceCount[dataPrint.triplet.device] = 0
    // just remove device element unless none left, delete input hash holder
    this.datasetsOutpattern[inputHash].filter(item => item !== dataPrint.triplet.device)
    if (this.datasetsOutpattern[inputHash].length === 0 ) {
      delete this.datasetsOutpattern[inputHash]
    }
    delete this.liveInputlist[inputHash][dataPrint.triplet.device]
    if (this.liveInputlist[inputHash].length === 0) {
      delete this.liveInputlist[inputHash]
    }
    this.liveVislist = []
    this.emit('dataout', resultPrint)
  }
  return true
}

/**
*
* @method extractVisExpected
*
*/
VisualComponent.prototype.extractVisExpected = function (inputUUID, device) {
  // console.log('visCOMP--expected extract')
  // console.log(inputUUID)
  // console.log(device)
  // console.log(this.liveInputlist)
  // check any inputlist available?
  let inputIndex = Object.keys(this.liveInputlist)
  let matchDataList = []
  let dataPlusmatch = []
  if (inputIndex.length > 0) {
    matchDataList = this.liveInputlist[inputUUID]
    let matchDindex = Object.keys(matchDataList)
    if (matchDindex.length > 0 && matchDataList[device] !== undefined) {
      dataPlusmatch = matchDataList[device]
    } else {
      console.log('VISCOMP--no data for this device')
    }
  } else {
    console.log('VISCOMP--no INDEX for this device')
  }
  return dataPlusmatch
}

/**
*
* @method nodataInfo
*
*/
VisualComponent.prototype.nodataInfo = function (dataPrint, visModule) {
  console.log('visCOMPONENT---no data')
  if (!this.liveVislist[dataPrint.triplet.device]) {
    this.liveVislist[dataPrint.triplet.device] = []
  }
  this.liveVislist[dataPrint.triplet.device].push(dataPrint.hash)
  let inputHash = Object.keys(this.datasetsOutpattern) // this.datasetsOutpattern[dataPrint.triplet.device]
  // expected vis results
  let deviceDataPrintCount = this.extractVisExpected(inputHash[0], dataPrint.triplet.device)
  // single or part of expected list
  if (deviceDataPrintCount.length > 1) {
    // part of existign list
    let timeFormat = ''
    let settingsLive = visModule.value.info.settings
    let timeFormatSet = settingsLive.hasOwnProperty('timeformat')
    if (timeFormatSet === true) {
      timeFormat = settingsLive.timeformat
    } else {
      // default to timeseries
      timeFormat = 'timeseries'
    }
    // is there a list to bundle together?
    let completeVisList = []
    if (deviceDataPrintCount.length > 0) {
      for (let dphash of deviceDataPrintCount) {
        if (dphash === dataPrint.hash) {
          if (this.deviceCount[dataPrint.triplet.device] === undefined) {
            // this.deviceCount[dataPrint.triplet.device] = 0
          }
          this.deviceCount[dataPrint.triplet.device]++
          // yes in list
          completeVisList.push(dataPrint.triplet.device)
        }
      }
    }
    // console.log('NODATA--expected v live')
    // console.log(this.deviceCount[dataPrint.triplet.device])
    // console.log(deviceDataPrintCount.length)
    // decide to return or go to next vis data to process
    if (deviceDataPrintCount.length !== this.deviceCount[dataPrint.triplet.device]) {
      // not yet keep hold of data to batch
      // console.log('NO--logic 1')
      if (this.datasetHolder[inputHash] === undefined) {
        this.datasetHolder[inputHash] = []
        this.dataPrintHolder[inputHash] = []
      }
      // add to holder for datasets i.e. multi dataset asked for
      this.datasetHolder[inputHash].push(this.visualData[dataPrint.hash])
      this.dataPrintHolder[inputHash].push(dataPrint)
    } else if (deviceDataPrintCount.length === this.deviceCount[dataPrint.triplet.device] && this.deviceCount[dataPrint.triplet.device] > 1) {
      // bundle of greater than one length ready for dataSet preparation
      // console.log('NO--logic 2')
      let datasetMulti = this.buildMultiDataset(deviceDataPrintCount, timeFormat, inputHash, dataPrint)
      // if batch then create resUUID for the batch
      this.deviceCount[dataPrint.triplet.device] = 0
      // just remove device element unless none left, delete input hash holder
      this.datasetsOutpattern[inputHash].filter(item => item !== dataPrint.triplet.device)
      if (this.datasetsOutpattern[inputHash].length === 0 ) {
        delete this.datasetsOutpattern[inputHash]
      }
      delete this.liveInputlist[inputHash][dataPrint.triplet.device]
      if (this.liveInputlist[inputHash].length === 0) {
        delete this.liveInputlist[inputHash]
      }
      this.liveVislist = []
      this.emit('dataout', inputHash[0])
    } else {
      // console.log('NO--logic 3')
      // if batch then create resUUID for the batch
      let resultPrint = dataPrint.hash
      // clear the input tracking
      this.deviceCount[dataPrint.triplet.device] = 0
      this.liveVislist = []
      // just remove device element unless none left, delete input hash holder
      this.datasetsOutpattern[inputHash].filter(item => item !== dataPrint.triplet.device)
      if (this.datasetsOutpattern[inputHash].length === 0 ) {
        delete this.datasetsOutpattern[inputHash]
      }
      delete this.liveInputlist[inputHash][dataPrint.triplet.device]
      if (this.liveInputlist[inputHash].length === 0) {
        delete this.liveInputlist[inputHash]
      }
      this.emit('dataout', resultPrint)
    }
  } else {
    // still prepare visual object but flag 'none' data
    // console.log('NOvis--- none bypass logic')
    let visData = {}
    visData.data = 'none'
    visData.context = dataPrint
    visData.list = this.liveVislist
    // hold the data in the entity component
    this.visualData[dataPrint.hash] = visData
    this.emit('dataout', 'empty')
  }
}

/**
*
* @method restVisDataList
*
*/
VisualComponent.prototype.restVisDataList = function () {
  this.visualData = {}
}

/**
* build multi dataset for charting
* @method buildMultiDataset
*
*/
VisualComponent.prototype.buildMultiDataset = function (dataList, type, inputHash, dataPrint) {
  // take live list and merge data for one chart
  // extract the dataPrints and check if data for not?
  let dataPerDevice = []
  for (let dataH of this.datasetHolder[inputHash]) {
    for (let rhash of dataList)
      if (dataH !== undefined && dataH.context.hash === rhash) {
        dataPerDevice.push(dataH)
      }
  }
  if (dataPerDevice.length > 0) {
    let formatOption = {}
    formatOption.format = type // other mode overlay format
    let accumData = this.liveVisSystem.singlemultiControl(formatOption, dataPrint, inputHash, dataPerDevice, this.sourcedataHolder[inputHash], this.dataPrintHolder[inputHash])
    let visData = {}
    visData.data = accumData
    visData.context = dataPrint
    visData.list = this.liveVislist
    this.visualData[inputHash] = visData
    // reset the datasetHolder
    this.datasetHolder[inputHash] = []
    this.dataPrintHolder[inputHash] = []
  } else {
    // console.log('no data for this deivce group')
    let visData = {}
    visData.data = 'none'
    visData.context = dataPrint
    visData.list = this.liveVislist
    this.visualData[inputHash] = visData
    // reset the datasetHolder
    this.datasetHolder[inputHash] = []
    this.dataPrintHolder[inputHash] = []
  }
  return true
}

export default VisualComponent
