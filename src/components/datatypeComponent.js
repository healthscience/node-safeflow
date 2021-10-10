'use strict'
/**
*  DatatypeComponent  heart of the data
*
*
* @class dataHolder
* @package    HealthScience.network
* @copyright  Copyright (c) 2021 James Littlejohn
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
  this.sourceDatatypes = []
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
DatatypeComponent.prototype.dataTypeMapping = function (api, contract, datatype) {
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
  this.datatypesLive = []
  for (let dtl of liveDTs) {
    // check if results datatype  inclue hypon
    let hyponDTs = dtl.includes('-')
    if (hyponDTs === false) {
      this.datatypesLive.push(dtl)
    } else {
      // split the dt into parts
      let splitDT = dtl.split('-')
      // for (let sdt of splitDT) {
      this.sourceDatatypes.push(splitDT[0])
      // }
      this.datatypesLive.push(dtl)
    }
  }
  return true
}

/**
*  switch to source data types needing compute
* @method switchSourceDatatypes
*
*/
DatatypeComponent.prototype.switchSourceDatatypes = function () {
  this.sourceDatatypes = [...new Set(this.sourceDatatypes)]
  this.datatypesLive = this.sourceDatatypes
  return true
}

export default DatatypeComponent
