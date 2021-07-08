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
  this.liveVislist = {}
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(VisualComponent, events.EventEmitter)

/**
*
* @method filterVisual
*
*/
VisualComponent.prototype.filterVisual = function (visModule, contract, dataPrint, resultsData, dtConvert) {
  this.singlemulti = {}
  let status = false
  if (!this.liveVislist[dataPrint.triplet.device]) {
    this.liveVislist[dataPrint.triplet.device] = []
  }
  this.liveVislist[dataPrint.triplet.device].push(dataPrint.hash)
  let visHASH = this.liveCrypto.evidenceProof(dataPrint.hash)
  let visData = {}
  visData.data = this.liveVisSystem.visualControl(visModule, contract, dataPrint.triplet.device, dataPrint.triplet.datatype, resultsData, dtConvert)
  visData.context = dataPrint
  visData.list = this.liveVislist
  this.visualData[dataPrint.hash] = visData
  return status
}

/**
*
* @method nodataInfo
*
*/
VisualComponent.prototype.nodataInfo = function (visUUID, device) {
  if (!this.liveVislist[device]) {
    this.liveVislist[device] = []
  }
  this.liveVislist[device].push(visUUID)
  this.visualData[visUUID] = {}
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
*
* @method filterSingleMulti
*
*/
VisualComponent.prototype.filterSingleMulti = function () {
  // take live list and merge data for one chart
  let multiList = []
  let devicesList = Object.keys(this.liveVislist)
  for (let dl of devicesList) {
    for (let lv of this.liveVislist[dl]) {
      multiList.push(this.visualData[lv])
    }
  }
  let restructData = this.liveVisSystem.singlemultiControl(multiList)
  this.singlemultidata = restructData
  return true
}

export default VisualComponent
