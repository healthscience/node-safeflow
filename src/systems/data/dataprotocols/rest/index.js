'use strict'
/**
*  Test CloudStorage
*
*
* @class testStorageAPI
* @package    testStorage API
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import { EventEmitter } from 'events'
import axios from 'axios'

class TestStorageAPI extends EventEmitter {
  constructor(setUP) {
    super()
    this.baseAPI = setUP // .namespace
    this.tempPubkey = setUP // .publickey
    this.tempToken = setUP // .token
  }

  /**
  *  device REST builder  (TODO this will need to be come more sophisticed e.g. type of rest authoriseation, no. query parameters etc.)
  * @method RESTbuilder
  *
  */
  async RESTbuilder(dapi, queryIN) {
    let jsondata = await axios.get(dapi.namespace + dapi.path + this.tempPubkey + '/' + this.tempToken + '/' + queryIN)
    return jsondata.data[0]
  }

  /**
  *  COMPUTEbuilder  temp until smart URL builder is created
  * @method COMPUTEbuilder
  *
  */
  async COMPUTEbuilder(dapi, device, time) {
    let apitime = time / 1000
    let jsondata = await axios.get(dapi.namespace + dapi.path + this.tempPubkey + '/' + this.tempToken + '/' + apitime + '/' + device)
    return jsondata.data
  }

  /**
  *  COMPUTEbuilder  temp until smart URL builder is created
  * @method COMPUTEbuilderLuft
  *
  */
  async COMPUTEbuilderLuft(dapi, device, time) {
    dapi.path = '/luftdatenGet/'
    let apitime = time / 1000
    let apitime2 = apitime + 86400
    let jsondata = await axios.get(dapi.namespace + dapi.path + this.tempPubkey + '/' + this.tempToken + '/' + device + '/' + apitime + '/' + apitime2)
    return jsondata.data
  }

  /**
  *  device REST builder
  * @method deviceRESTbuilder
  *
  */
  async deviceRESTbuilder(dapi) {
    let jsondata = []
    if (dapi.apipath === '/computedata/') {
      jsondata = await axios.get(dapi.apibase + '/contextdata/' + this.tempPubkey + '/' + this.tempToken)
    } else if (dapi.device.query === '/luftdatendevice/') {
      jsondata = await axios.get(dapi.apibase + '/luftdatendevice/' + this.tempPubkey + '/' + this.tempToken)
    }
    return jsondata.data
  }

  /**
  *  datatype REST builder
  * @method datatypeRESTbuilder
  *
  */
  async datatypeRESTbuilder(dapi) {
    let jsondata = await axios.get(dapi.namespace + dapi.datatype + this.tempPubkey + '/' + this.tempToken)
    return jsondata.data
  }

  /**
  *  Get dataType Context for each sensor
  * @method getContextType
  *
  */
  async getContextType() {
    //  nosql query but headng towards a gRPC listener on stream socket
    let jsondata = await axios.get(this.baseAPI + '/contexttype/' + this.tempPubkey + '/' + this.tempToken)
    return jsondata.data
  }

  /**
  *  save results to datastore
  * @method saveResults
  *
  */
  async saveResults(api, data) {
    let jsondata = await axios.post(api.namespace + api.path + this.tempPubkey + '/' + this.tempToken, data)
    return jsondata.data
  }
}

export default TestStorageAPI
