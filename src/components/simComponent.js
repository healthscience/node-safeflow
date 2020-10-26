'use strict'
/**
*  SimComponent
*
*
* @class SimComponent
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import events from 'events'

var SimComponent = function () {
  events.EventEmitter.call(this)
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(SimComponent, events.EventEmitter)

/**
*
* @method filterSimulation
*
*/
SimComponent.prototype.filterSimulation = async function (visIN, visData) {
  // build array of visualation modules and match to one asked for
  return 'simulation complete'
  // this.structureChartData()
}

export default SimComponent
