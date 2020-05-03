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
import VisSystem from '../systems/visual/visSystem.js'
const util = require('util')
const events = require('events')

var VisualComponent = function (EID) {
  events.EventEmitter.call(this)
  this.EIDinfo = EID
  this.liveVisSystem = new VisSystem()
  this.visualData = {}
  // this.setVisLive()
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
VisualComponent.prototype.filterVisual = function (contract, resultsData) {
  // which of three types of visualisations?
  console.log('VISULAcomponentIN')
  console.log(contract)
  console.log('results data start')
  console.log(resultsData)
  let status = false
  // pass on vis system to prepare
  this.visualData = this.liveVisSystem.visualControl(contract, resultsData)
  // console.log('visCOMPONENT COMPLETE')
  // console.log(this.visualData)
  return status
}

export default VisualComponent
