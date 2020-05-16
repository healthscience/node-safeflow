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
VisualComponent.prototype.filterVisual = function (contract, rule, resultsData) {
  // which of three types of visualisations?
  console.log('VISULAcomponentIN')
  let status = false
  // pass on vis system to prepare
  this.visualData[rule] = this.liveVisSystem.visualControl(contract, rule, resultsData)
  return status
}

export default VisualComponent
