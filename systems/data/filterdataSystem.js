'use strict'
/**
*  FilterDataSystem
*
*
* @class FilterDataSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/

import util from 'util'
import events from 'events'

var FilterDataSystem = function (setIN) {
  events.EventEmitter.call(this)
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(FilterDataSystem, events.EventEmitter)

/**
* fiter controller of data types
* @method dtFilterController
*
*/
FilterDataSystem.prototype.dtFilterController = function (source, contract, device, datatype, time, tidyData) {
  let filterColumn = this.filterDataType(source, datatype, tidyData)
  return filterColumn
}

/**
* extract out the data type colum and timestamp
* @method filterDataType
*
*/
FilterDataSystem.prototype.filterDataType = function (source, datatype, tidyData) {
  let singleArray = []
  if (tidyData[0].sensors === undefined || !tidyData[0].sensors) {
    for (let di of tidyData) {
      let dataPair = {}
      let timestamp = di['timestamp']
      dataPair['cnrl-8856388713'] = timestamp
      let valueC = 0
      if (di[datatype] === null) {
        valueC = null
      } else {
        valueC = parseFloat(di[source.sourceapiquery.column])
      }
      dataPair[datatype] = valueC
      singleArray.push(dataPair)
    }
  } else {
    singleArray = this.filterDataTypeSub(source, datatype, tidyData)
  }
  return singleArray
}

/**
* extract out the data type colum and timestamp
* @method filterDataTypeSub
*
*/
FilterDataSystem.prototype.filterDataTypeSub = function (source, datatype, arrayIN) {
  let singleArray = []
  // check if sub data structure
  let subData = this.subStructure(arrayIN)
  if (subData.length > 0) {
    arrayIN = subData
  }
  for (let sing of arrayIN) {
    // console.log(sing)
    let dataPair = {}
    let timestamp = sing['timestamp']
    dataPair['cnrl-8856388713'] = timestamp
    let valueC = 0
    if (sing[datatype] === null) {
      valueC = null
    } else {
      valueC = parseFloat(sing[source.sourceapiquery.column])
    }
    dataPair[datatype] = valueC
    singleArray.push(dataPair)
  }
  return singleArray
}

/**
*  check for sub table structure
* @method subStructure
*
*/
FilterDataSystem.prototype.subStructure = function (dataStructure) {
  let subStructure = []
  for (let tcI of dataStructure) {
    // console.log(tcI)
    if (tcI['sensors']) {
      // console.log('yes sub structure')
      for (let sdata of tcI.sensors) {
        let sdHolder = {}
        sdHolder['timestamp'] = tcI['timestamp']
        sdHolder[sdata.value_type] = sdata.value
        // form timestamp, sensor
        subStructure.push(sdHolder)
      }
    }
  }
  return subStructure
}

export default FilterDataSystem
