'use strict'
/**
*  Computational Network Reference layer
*
*
* @class CNRLmaster
* @package    testStorage API
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import { EventEmitter } from 'events'

class CNRLmaster extends EventEmitter {
  constructor(apiSettings) {
    super()
  }

  /**
  * Index of datatypes
  * @method indexDatatypes
  *
  */
  indexDatatypes() {
    // index datatype live in network by cnrl // id
    let indexDTlive = ['cnrl-8856388711', 'cnrl-8856388712', 'cnrl-8856388713', 'cnrl-8856388723', 'cnrl-8856388727', 'cnrl-8356388727', 'cnrl-8326388727', 'cnrl-8326328727', 'cnrl-3356388722', 'cnrl-3356388733', 'cnrl-8856388724', 'cnrl-8856388322', 'cnrl-8856388924', 'cnrl-8856389322', 'cnrl-8856388725']
    return indexDTlive
  }

  /**
  * Index of science computations
  * @method indexCompute
  *
  */
  indexCompute() {
    // index datatype live in network by cnrl // id
    let indexComputelive = ['cnrl-2356388731', 'cnrl-2356388737', 'cnrl-2356388732', 'cnrl-2356383848']
    return indexComputelive
  }

  /**
  * Index of experiments
  * @method indexExperiments
  *
  */
  indexExperiments() {
    // index datatype live in network by cnrl // id
    let indexExperimentslive = []
    indexExperimentslive.push('cnrl-848388553323', 'cnrl-888388992224', 'cnrl-888388443324', 'cnrl-888355992223', 'cnrl-88735d99d228', 'cnrl-888388233324', 'cnrl-888388232224', 'cnrl-848388554344', 'cnrl-848388553329', 'cnrl-888355992224')
    return indexExperimentslive
  }

  /**
  * Sensor to Datatype Mapping as per CNRL contracts
  * @method sensorMappingDatatype
  *
  */
  sensorMappingDatatype(sensorTypes) {
    // get detail on spec for data source
    let dataFilter = []
    for (let sen of sensorTypes) {
      if (sen.device_sensorid === 'lightLED') {
        dataFilter.push({ 'text': 'bpm', 'active': 'true' })
      } else if (sen.device_sensorid === 'accelerometer') {
        dataFilter.push({ 'text': 'steps', 'active': 'true' })
      }
    }
    return dataFilter
  }

  /**
  *  get contract info.
  * @method lookupContract
  *
  */
  lookupContract(refIN) {
    let dataCNRLbundle = {
      type: '',
      livingpaper: '',
      prime: {},
      history: {},
      resolution: {},
      source: [],
      input: [],
      tidy: false,
      tidyList: [],
      apistructure: [],
      tableStructure: [],
      categorycodes: [],
      dtsource: [],
      categories: [],
      wasmhash: '',
      wasmfile: '',
      apisave: ''
    }
    // implementation continues...
    return dataCNRLbundle
  }
}

export default CNRLmaster
