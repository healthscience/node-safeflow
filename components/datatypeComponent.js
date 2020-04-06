'use strict'
/**
*  DatatypeComponent  heart of the data
*
*
* @class dataHolder
* @package    HealthScience.network
* @copyright  Copyright (c) 2018 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import DTsystem from '../systems/data/dtSystem.js'
const util = require('util')
const events = require('events')

var DatatypeComponent = function (setIN) {
  events.EventEmitter.call(this)
  this.liveDTsystem = new DTsystem(setIN)
  this.datatypeInfoLive = []
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(DatatypeComponent, events.EventEmitter)

/**
*  the Type of data
* @method dataType
*
*/
DatatypeComponent.prototype.dataTypeMapping = function (dtBundle) {
  // query CNRL for hash and parse out datatype and packaging info.
  let dataTypeMapped = this.liveDTsystem.DTStartMatch(dtBundle.devices, dtBundle.datatypes, dtBundle.categories)
  this.datatypeInfoLive = dataTypeMapped
  return true
}

export default DatatypeComponent
