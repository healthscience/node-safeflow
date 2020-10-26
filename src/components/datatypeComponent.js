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
import util from 'util'
import events from 'events'

var DatatypeComponent = function (setIN) {
  events.EventEmitter.call(this)
  this.liveDTsystem = new DTsystem(setIN)
  this.datatypeInfoLive = []
  this.datatypesLive = []
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
DatatypeComponent.prototype.dataTypeMapping = function (api, contract, device, datatype) {
  // query CNRL for hash and parse out datatype and packaging info.
  let dataTypeMapped = this.liveDTsystem.DTStartMatch(api, contract, datatype)
  this.datatypeInfoLive = dataTypeMapped
  return true
}

/**
*  the current data types ask for by the peer
* @method setDataTypeLive
*
*/
DatatypeComponent.prototype.setDataTypeLive = function (liveDTs) {
  this.datatypesLive = liveDTs
  return true
}

export default DatatypeComponent
