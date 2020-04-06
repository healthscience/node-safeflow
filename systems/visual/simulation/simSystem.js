'use strict'
/**
*  SimSystem
*
*
* @class SimSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import SimSystem2 from '../systems/simSystem.js'
const util = require('util')
const events = require('events')

var SimSystem = function () {
  events.EventEmitter.call(this)
  this.liveSimSystem = new SimSystem2()
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(SimSystem, events.EventEmitter)

/**
* return the data structure requested
* @method structureData2D
*
*/
SimSystem.prototype.structureData2D = function () {
  return '2d'
}

export default SimSystem
