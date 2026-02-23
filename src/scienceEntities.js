'use strict'
/**
*  ScienceEntities
*
*
* @class ScienceEntities
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import DeviceComponent from './components/deviceComponent.js'
import DataComponent from './components/dataComponent.js'
import DatatypeComponent from './components/datatypeComponent.js'
import TimeComponent from './components/timeComponent.js'
import ComputeComponent from './components/computeComponent.js'
import VisualComponent from './components/visualComponent.js'
import PlaceComponent from './components/placeComponent.js'
import { EventEmitter } from 'events'

class ScienceEntities extends EventEmitter {
  constructor(dAccess) {
    super()
    this.liveDeviceC = new DeviceComponent(dAccess)
    this.liveTimeC = new TimeComponent()
    this.liveDatatypeC = new DatatypeComponent()
    this.liveDataC = new DataComponent(dAccess)
    this.liveComputeC = new ComputeComponent(dAccess)
    this.liveVisualC = new VisualComponent()
    this.livePlaceC = new PlaceComponent()
    this.datascience = {}
    this.datauuid = {}
    this.evidenceChain = []
  }

  /**
  *
  * @method setDataStore
  */
  async setDataStore(authDataStore) {
    this.liveDeviceC.setAuthToken(authDataStore)
    this.liveDataC.setAuthToken(authDataStore)
    this.liveComputeC.setAuthToken(authDataStore)
  }
}

export default ScienceEntities
