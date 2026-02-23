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
// import SimSystem2 from '../systems/simSystem.js' // This path looks suspicious in original code
import { EventEmitter } from 'events'

class SimSystem extends EventEmitter {
  constructor() {
    super()
    // this.liveSimSystem = new SimSystem2()
  }

  /**
  * return the data structure requested
  * @method structureData2D
  *
  */
  structureData2D() {
    return '2d'
  }
}

export default SimSystem
