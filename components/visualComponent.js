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
  this.liveVislist = []
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
  console.log('VISULAcomponentIN')
  console.log(visModule)
  console.log(contract)
  console.log(visUUID)
  console.log(device)
  console.log(rule)
  console.log(time)
  console.log(Object.keys(resultsData))
  console.log(dtConvert)
  this.singlemulti = {}
  let status = false
  let visHASH = this.liveCrypto.evidenceProof(visUUID)
  this.visualData[visUUID] = this.liveVisSystem.visualControl(visModule, contract, device, rule, resultsData, dtConvert)
  this.liveVislist.push(visUUID)
  return status
}

/**
*
* @method filterSingleMulti
*
*/
VisualComponent.prototype.filterSingleMulti = function (liveTidayData) {
  // take live list and merge data for one chart
  let multiList = []
  let multiSourceList = []
  for (let lv of this.liveVislist) {
    multiList.push(this.visualData[lv])
    multiSourceList.push()
  }
  let restructData = this.liveVisSystem.singlemultiControl(multiList)
  this.singlemulti = restructData
  return true
}

export default VisualComponent
