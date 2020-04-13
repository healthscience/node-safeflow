'use strict'
/**
*  ScienceEntities
*
*
* @class ScienceEntities
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import DeviceComponent from './components/deviceComponent.js'
import DataComponent from './components/dataComponent.js'
import DatatypeComponent from './components/datatypeComponent.js'
import TimeComponent from './components/timeComponent.js'
import ComputeComponent from './components/computeComponent.js'
import VisualComponent from './components/visualComponent.js'
// import SimComponent from './components/simComponent.js'
const util = require('util')
const events = require('events')

var ScienceEntities = function (dAccess) {
  events.EventEmitter.call(this)
  this.liveDeviceC = new DeviceComponent(dAccess)
  this.liveTimeC = new TimeComponent(dAccess)
  this.liveDatatypeC = new DatatypeComponent(dAccess)
  this.liveDataC = new DataComponent(dAccess)
  this.liveComputeC = new ComputeComponent(dAccess)
  this.liveVisualC = new VisualComponent()
  // this.liveSimC = new SimComponent()
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(ScienceEntities, events.EventEmitter)

export default ScienceEntities
