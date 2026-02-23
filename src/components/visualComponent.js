'use strict'
/**
*  VisualComponent
*
*
* @class VisualComponent
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import CryptoUtility from '../kbl-cnrl/cryptoUtility.js'
import VisSystem from '../systems/visual/visSystem.js'
import { EventEmitter } from 'events'

class VisualComponent extends EventEmitter {
  constructor(EID) {
    super()
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
    this.vCounter = 0
  }

  /**
  *  make list of datasets required per input to ECS
  * @method manageVisDatasets
  *
  */
  manageVisDatasets(inputBatch, expectedVis) {
    this.liveInputlist[inputBatch] = expectedVis[inputBatch]
  }

  /**
  *  clear expected vis list
  * @method clearDeviceCount
  *
  */
  clearDeviceCount(device) {
    this.deviceCount[device.device_mac] = 0
  }

  /**
  *
  * @method filterVisual
  *
  */
  filterVisual(visModule, contract, dataPrint, resultsData, dtConvert, flag) {
    let timeFormat = ''
    let settingsLive = visModule.value.info.settings
    let controlsLive = visModule.value.info.controls
    let deviceID = dataPrint.triplet.device.id
    let timeFormatSet = controlsLive?.hasOwnProperty('timeformat')
    if (timeFormatSet === true) {
      timeFormat = controlsLive.timeformat
    } else {
      // default to timeseries
      timeFormat = 'timeseries'
    }
    // single dataset, many datasets one chart, many datasets many charts?
    // OK, what dataset bundle is required, single, multi datatypes, multi times?
    if (!this.liveVislist[deviceID]) {
      this.liveVislist[deviceID] = []
    }
    // keep tabs on what has be vis processed
    this.liveVislist[deviceID].push(dataPrint.hash)
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
      inputHash = howManyInputUUID[1]
    }
    // expected vis results  source or compute flag?
    let deviceDataPrintCount = this.extractVisExpected(inputHash, dataPrint.hash, deviceID)
    // implementation continues...
  }

  /**
  * extract vis expected
  * @method extractVisExpected
  *
  */
  extractVisExpected(inputHash, dataHash, deviceID) {
    // implementation here
    return 0
  }
}

export default VisualComponent
