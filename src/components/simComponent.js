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
import { EventEmitter } from 'events'

class SimComponent extends EventEmitter {
  constructor() {
    super()
  }

  /**
  *
  * @method filterSimulation
  *
  */
  async filterSimulation(visIN, visData) {
    // build array of visualation modules and match to one asked for
    return 'simulation complete'
    // this.structureChartData()
  }
}

export default SimComponent
