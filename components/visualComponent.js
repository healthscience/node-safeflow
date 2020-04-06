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
* @method setVisLive
*
*/
VisualComponent.prototype.setVisLive = function (updateEID) {
  this.EIDinfo.time.startperiod = updateEID
}

/**
*
* @method filterVisual
*
*/
VisualComponent.prototype.filterVisual = function (visIN, vData, timeComponent) {
  // which of three types of visualisations?
  let status = false
  let visBundle = {}
  visBundle.cid = this.EIDinfo.cid
  visBundle.devices = this.EIDinfo.devices
  visBundle.datatypes = this.EIDinfo.datatypes
  visBundle.visID = this.EIDinfo.visID
  visBundle.startperiod = timeComponent.livedate.startperiod
  visBundle.time = timeComponent.livedate
  visBundle.timerange = timeComponent.timerange
  for (let vid of this.EIDinfo.visID) {
    // todo need to check if one or many visualisation types required? ONe for now
    if (vid === 'vis-sc-1') {
      this.visualData['vis-sc-1'] = this.liveVisSystem.visSystemChart(visBundle, vData)
      status = true
    }
    if (vid === 'vis-sc-2') {
      this.visualData['vis-sc-2'] = this.liveVisSystem.tableSystem(visBundle, visIN, vData, timeComponent)
      // status = true
    }
    if (visIN.vid === 'vis-sc-3') {
      status = true
      // this.visualData['vis-sc-3'] = this.liveVisSystem.simSystem()
    }
  }
  return status
}

export default VisualComponent
