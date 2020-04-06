'use strict'
/**
*  ComputeComponent
*
*
* @class ComputeComponent
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
const ComputeSystem = require('../systems/compute/computeSystem.js')
const util = require('util')
const events = require('events')

var ComputeComponent = function (setIN) {
  events.EventEmitter.call(this)
  this.computeCNRLlist = []
  this.liveComputeSystem = new ComputeSystem(setIN)
  this.computeStatus = false
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(ComputeComponent, events.EventEmitter)

/**
*
* @method filterCompute
*
*/
ComputeComponent.prototype.filterCompute = async function (timeComponent, apiInfo) {
  let computeStatelive = {}
  // var localthis = this
  if (this.EIDinfo.science.wasmfile === 'none' && this.computeStatus === false) {
    // raw data nothing to compute
    computeStatelive.computeState = 'observation'
  } else {
    let systemBundle = {}
    systemBundle.cid = this.EIDinfo.cid
    systemBundle.devices = this.EIDinfo.devices
    systemBundle.time = this.EIDinfo.time
    systemBundle.timeseg = this.EIDinfo.time.timeseg
    systemBundle.scienceAsked = this.EIDinfo.science
    systemBundle.categories = this.EIDinfo.categories
    systemBundle.timeInfo = timeComponent
    systemBundle.apiInfo = apiInfo
    let computeState = await this.liveComputeSystem.computationSystem(systemBundle)
    computeStatelive = computeState
  }
  return computeStatelive
}

module.exports = ComputeComponent
