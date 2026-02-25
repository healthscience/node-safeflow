'use strict'
/**
*  Holepunch Storage API
*
*
* @class TestStorageAPI
* @package    safeFlow
* @copyright  Copyright (c) 2024 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import { EventEmitter } from 'events'

class TestStorageAPI extends EventEmitter {
  constructor(dataAPI) {
    super()
    this.liveDataAPI = dataAPI
  }

  /**
  *  device builder using Hyperbee/Hypercore
  * @method RESTbuilder
  *
  */
  async RESTbuilder(dapi, queryIN) {
    // Use Hyperbee to get data
    const node = await this.liveDataAPI.BeeData.get(queryIN)
    return node ? node.value : null
  }

  /**
  *  COMPUTEbuilder using Hyperbee
  * @method COMPUTEbuilder
  *
  */
  async COMPUTEbuilder(dapi, device, time) {
    let apitime = time / 1000
    const key = `${device}/${apitime}`
    const node = await this.liveDataAPI.BeeData.get(key)
    return node ? node.value : []
  }

  /**
  *  COMPUTEbuilderLuft using Hyperbee
  * @method COMPUTEbuilderLuft
  *
  */
  async COMPUTEbuilderLuft(dapi, device, time) {
    let apitime = time / 1000
    let apitime2 = apitime + 86400
    // Range query in Hyperbee
    const results = []
    for await (const node of this.liveDataAPI.BeeData.createReadStream({
      gte: `${device}/${apitime}`,
      lte: `${device}/${apitime2}`
    })) {
      results.push(node.value)
    }
    return results
  }

  /**
  *  device builder
  * @method deviceRESTbuilder
  *
  */
  async deviceRESTbuilder(dapi) {
    const results = []
    const prefix = dapi.apipath === '/computedata/' ? 'contextdata/' : 'luftdatendevice/'
    for await (const node of this.liveDataAPI.BeeData.createReadStream({
      gte: prefix,
      lte: prefix + '\xff'
    })) {
      results.push(node.value)
    }
    return results
  }

  /**
  *  datatype builder
  * @method datatypeRESTbuilder
  *
  */
  async datatypeRESTbuilder(dapi) {
    const key = `datatype/${dapi.datatype}`
    const node = await this.liveDataAPI.BeeData.get(key)
    return node ? node.value : []
  }

  /**
  *  Get dataType Context for each sensor
  * @method getContextType
  *
  */
  async getContextType() {
    const key = 'contexttype'
    const node = await this.liveDataAPI.BeeData.get(key)
    return node ? node.value : []
  }

  /**
  *  save results to Hyperbee
  * @method saveResults
  *
  */
  async saveResults(api, data) {
    const key = `results/${Date.now()}`
    await this.liveDataAPI.BeeData.put(key, data)
    return { success: true, key }
  }
}

export default TestStorageAPI
