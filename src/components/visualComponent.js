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
*
* @method filterVisual
*
*/
VisualComponent.prototype.filterVisual = function (visModule, contract, dataPrint, resultsData, dtConvert) {
  console.log('vis module contract')
  // console.log(util.inspect(visModule, {showHidden: false, depth: null}))
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
  visData.data = this.liveVisSystem.visualControl(visModule, contract, dataPrint.triplet.device, dataPrint.triplet.datatype, resultsData, dtConvert)
  visData.context = dataPrint
  visData.list = this.liveVislist
  // hold the data in the entity component
  this.visualData[dataPrint.hash] = visData
  // if dataset profile complete or just signals, return to peer
  // check against profile
  // device is matched to what input hash?
  let inputHash = Object.keys(this.datasetsOutpattern) // this.datasetsOutpattern[dataPrint.triplet.device]
  // expected vis results
  let deviceDataPrinkCount = this.extractVisExpected(inputHash[0], dataPrint.triplet.device)
  // is there a list to bundle together?
  let completeVisList = []
  if (deviceDataPrinkCount.length > 0) {
    for (let dphash of deviceDataPrinkCount) {
      if (dphash === dataPrint.hash) {
        if (this.deviceCount[dataPrint.triplet.device] === undefined) {
          this.deviceCount[dataPrint.triplet.device] = 0
        }
        this.deviceCount[dataPrint.triplet.device]++
        // yes in list
        completeVisList.push(dataPrint.triplet.device)
      }
    }
  }
  console.log('expected v live')
  console.log(this.deviceCount[dataPrint.triplet.device])
  console.log(deviceDataPrinkCount.length)
  // decide to return or go to next vis data to process
  if (deviceDataPrinkCount.length !== this.deviceCount[dataPrint.triplet.device]) {
    // not yet keep hold of data to batch
    if (this.datasetHolder[inputHash] === undefined) {
      this.datasetHolder[inputHash] = []
    }
    if (this.sourcedataHolder[inputHash] === undefined) {
      this.sourcedataHolder[inputHash] = []
    }
    // add to holder for datasets i.e. multi dataset asked for
    this.datasetHolder[inputHash].push(this.visualData[dataPrint.hash])
    this.sourcedataHolder[inputHash].push(resultsData)
  } else if (deviceDataPrinkCount.length === this.deviceCount[dataPrint.triplet.device] && this.deviceCount[dataPrint.triplet.device] > 1) {
    // add this dataset to list
    console.log('dataset in to hold')
    console.log(this.visualData[dataPrint.hash].data.chartPackage.datasets[0].data.length)
    this.datasetHolder[inputHash].push(this.visualData[dataPrint.hash])
    this.sourcedataHolder[inputHash].push(resultsData)
    // bundle of greater than one length ready for dataSet preparation
    let datasetMulti = this.buildMultiDataset(timeFormat, inputHash, dataPrint)
    // if batch then create resUUID for the batch
    this.emit('dataout', inputHash[0], this.liveInputlist)
    // clear the input tracking this.deviceCount
    this.deviceCount[dataPrint.triplet.device] = []
    this.datasetsOutpattern[inputHash] = []
    this.liveVislist = []
  } else {
    // if batch then create resUUID for the batch
    let resultPrint = dataPrint.hash
    this.emit('dataout', resultPrint, this.liveInputlist)
    // clear the input tracking
    this.deviceCount[dataPrint.triplet.device] = []
    this.datasetsOutpattern[inputHash] = []
    this.liveVislist = []
  }
  return true
}

/**
*
* @method extractVisExpected
*
*/
VisualComponent.prototype.extractVisExpected = function (inputUUID, device) {
  let matchDataList = this.liveInputlist[inputUUID]
  return matchDataList[device]
}

/**
*
* @method nodataInfo
*
*/
VisualComponent.prototype.nodataInfo = function (dataPrint, visModule) {
  console.log('nodata but is part of expected list?')
  if (!this.liveVislist[dataPrint.triplet.device]) {
    this.liveVislist[dataPrint.triplet.device] = []
  }
  this.liveVislist[dataPrint.triplet.device].push(dataPrint.hash)
  let inputHash = Object.keys(this.datasetsOutpattern) // this.datasetsOutpattern[dataPrint.triplet.device]
  // expected vis results
  let deviceDataPrinkCount = this.extractVisExpected(inputHash[0], dataPrint.triplet.device)
  // single or part of expected list
  if (deviceDataPrinkCount.length > 1) {
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
    if (deviceDataPrinkCount.length > 0) {
      for (let dphash of deviceDataPrinkCount) {
        if (dphash === dataPrint.hash) {
          if (this.deviceCount[dataPrint.triplet.device] === undefined) {
            this.deviceCount[dataPrint.triplet.device] = 0
          }
          this.deviceCount[dataPrint.triplet.device]++
          // yes in list
          completeVisList.push(dataPrint.triplet.device)
        }
      }
    }
    console.log('expected v live')
    console.log(this.deviceCount[dataPrint.triplet.device])
    console.log(deviceDataPrinkCount.length)
    // decide to return or go to next vis data to process
    if (deviceDataPrinkCount.length !== this.deviceCount[dataPrint.triplet.device]) {
      // not yet keep hold of data to batch
      if (this.datasetHolder[inputHash] === undefined) {
        this.datasetHolder[inputHash] = []
      }
      // add to holder for datasets i.e. multi dataset asked for
      this.datasetHolder[inputHash].push(this.visualData[dataPrint.hash])
    } else if (deviceDataPrinkCount.length === this.deviceCount[dataPrint.triplet.device] && this.deviceCount[dataPrint.triplet.device] > 1) {
      // add this dataset to list
      console.log('dataset in to hold')
      // console.log(this.visualData[dataPrint.hash].data.chartPackage.datasets[0].data.length)
      // this.datasetHolder[inputHash].push(this.visualData[dataPrint.hash])
      // bundle of greater than one length ready for dataSet preparation
      let datasetMulti = this.buildMultiDataset(timeFormat, inputHash, dataPrint)
      // if batch then create resUUID for the batch
      this.emit('dataout', inputHash[0], this.liveInputlist)
      // clear the input tracking this.deviceCount
      this.deviceCount[dataPrint.triplet.device] = []
      this.datasetsOutpattern[inputHash] = []
      this.liveVislist = []
    } else {
      // if batch then create resUUID for the batch
      let resultPrint = dataPrint.hash
      this.emit('dataout', resultPrint, this.liveInputlist)
      // clear the input tracking
      this.deviceCount[dataPrint.triplet.device] = []
      this.datasetsOutpattern[inputHash] = []
      this.liveVislist = []
    }
  } else {
    // still prepare visual object but flag 'none' data
    let visData = {}
    visData.data = 'none'
    visData.context = dataPrint
    visData.list = this.liveVislist
    // hold the data in the entity component
    this.visualData[dataPrint.hash] = visData
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
VisualComponent.prototype.buildMultiDataset = function (type, inputHash, dataPrint) {
  // take live list and merge data for one chart
  let formatOption = {}
  formatOption.format = type // other mode overlay format
  let accumData = this.liveVisSystem.singlemultiControl(formatOption, dataPrint, inputHash, this.datasetHolder[inputHash], this.sourcedataHolder[inputHash])
  let visData = {}
  visData.data = accumData
  visData.context = dataPrint
  visData.list = this.liveVislist
  this.visualData[inputHash] = visData
  // reset the datasetHolder
  this.datasetHolder[inputHash] = []
  return true
}

export default VisualComponent
