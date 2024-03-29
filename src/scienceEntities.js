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
import util from 'util'
import events from 'events'

var ScienceEntities = function (dAccess) {
  events.EventEmitter.call(this)
  this.liveDeviceC = new DeviceComponent(dAccess)
  this.liveTimeC = new TimeComponent()
  this.liveDatatypeC = new DatatypeComponent()
  this.liveDataC = new DataComponent(dAccess)
  this.liveComputeC = new ComputeComponent(dAccess)
  this.liveVisualC = new VisualComponent()
  // this.liveSimC = new SimComponent()
  this.datascience = {}
  this.datauuid = {}
  this.evidenceChain = []
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(ScienceEntities, events.EventEmitter)

/**
*
* @method setDataStore
*/
DeviceComponent.prototype.setDataStore = async function (authDataStore) {
  this.liveDeviceC.setAuthToken(authDataStore)
  this.liveDataC.setAuthToken(authDataStore)
  this.liveComputeC.setAuthToken(authDataStore)
}
export default ScienceEntities
