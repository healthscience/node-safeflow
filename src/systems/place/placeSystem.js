'use strict'
/**
*  place location in space spectrum
*
*
* @class PlaceSystem
* @package    Update place settings cordinates position location etc.
* @copyright  Copyright (c) 2015 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import events from 'events'

var PlaceSystem = function () {
  events.EventEmitter.call(this)
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(PlaceSystem, events.EventEmitter)

/**
*  find where move to
* @method updatePlace
*
*/
PlaceSystem.prototype.updatePlace = function () {
  // cues space
  // planet earth coords
  // other
}

export default PlaceSystem