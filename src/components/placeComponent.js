'use strict'
/**
*  PlaceComponent
*
*
* @class PlaceComponent
* @package    safeFlow
* @copyright  Copyright (c) 2025 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import events from 'events'
import PlaceSystem from '../systems/place/placeSystem.js'

var PlaceComponent = function () {
  console.log('welcome place')
    this.livePlacesystem = new PlaceSystem()
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(PlaceComponent, events.EventEmitter)

/**
*  Cues place / space
* @method cuesSpace
*
*/
PlaceComponent.prototype.cuesSpace = function () {
  
}

export default PlaceComponent