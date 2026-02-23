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
import { EventEmitter } from 'events'
import PlaceSystem from '../systems/place/placeSystem.js'

class PlaceComponent extends EventEmitter {
  constructor() {
    super()
    console.log('welcome place')
    this.livePlacesystem = new PlaceSystem()
  }

  /**
  *  Cues place / space
  * @method cuesSpace
  *
  */
  cuesSpace() {
    // implementation here
  }
}

export default PlaceComponent
