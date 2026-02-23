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

import TestStorageAPI from './dataprotocols/rest/index.js'
import { EventEmitter } from 'events'

class SimulatedDataSystem extends EventEmitter {
  constructor(setIN) {
    super()
    this.liveTestStorage = new TestStorageAPI(setIN)
    this.simulatedData = []
  }

  /**
  *  which future time period, which assumption about it?
  * @method assessFuture
  *
  */
  assessFuture(dataSystem, timeInfo) {
    let futureData = 9 // this.liveCALE.learn('tomorrow', dataSystem, timeInfo)
    return futureData
  }
}

export default SimulatedDataSystem
