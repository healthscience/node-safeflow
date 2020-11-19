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
VisualComponent.prototype.filterVisual = function (visModule, contract, visUUID, device, rule, time, resultsData, dtConvert) {
  // which of three types of visualisations?
  this.singlemulti = {}
  let dataID = {}
  dataID.device = device.device_mac
  dataID.datatype = rule
  dataID.time = time
  let status = false
  if (!this.liveVislist[device.device_mac]) {
    this.liveVislist[device.device_mac] = []
  }
  this.liveVislist[device.device_mac].push(visUUID)
  let visHASH = this.liveCrypto.evidenceProof(visUUID)
  let visData = {}
  visData.data = this.liveVisSystem.visualControl(visModule, contract, device, rule, resultsData, dtConvert)
  visData.context = dataID
  this.visualData[visUUID] = visData
  return status
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
