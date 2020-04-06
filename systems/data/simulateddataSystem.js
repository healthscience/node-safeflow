'use strict'
/**
*  SimulatedSimulatedDataSystem
*
*
* @class SimulatedSimulatedDataSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/

import TestStorageAPI from './dataprotocols/teststorage/testStorage.js'
const util = require('util')
const events = require('events')

var SimulatedDataSystem = function (setIN) {
  events.EventEmitter.call(this)
  this.liveTestStorage = new TestStorageAPI(setIN)
  this.simulatedData = []
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(SimulatedDataSystem, events.EventEmitter)

/**
*  which future time period, which assumption about it?
* @method assessFuture
*
*/
SimulatedDataSystem.prototype.assessFuture = function (dataSystem, timeInfo) {
  let futureData = 9 // this.liveCALE.learn('tomorrow', dataSystem, timeInfo)
  return futureData
}

export default SimulatedDataSystem
