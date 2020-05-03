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

const util = require('util')
const events = require('events')

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
FilterDataSystem.prototype.dtFilterController = function (source, contract, api, device, datatype, time, liveData) {
  console.log('filter controller start')
  console.log(source)
  console.log(contract)
  console.log(api)
  console.log(device)
  console.log(datatype)
  console.log(time)
  console.log(liveData)
  let filterHolder = {}
  let filterType = ''
  filterHolder = {}
  // is the filter on derived source(s)?
  let dtSourceR = []
  if (source.computeflow === true) {
    dtSourceR = api.sourceapiquery
    filterType = 'derived'
  } else {
    dtSourceR = source.datatypes
    filterType = 'primary'
  }
  filterHolder[datatype] = {}
  let sourcerawData = liveData
  let filterColumn = this.filterDataType(filterType, datatype, sourcerawData, time)
  if (filterType === 'primary') {
    filterHolder[datatype] = filterColumn
  } else {
    filterHolder = filterColumn
  }
  return filterHolder
}

/**
* extract out the data type colum and timestamp
* @method filterDataType
*
*/
FilterDataSystem.prototype.filterDataType = function (fTypeIN, sourceDT, arrayIN, time) {
  console.log('filter data type')
  console.log(fTypeIN)
  console.log(sourceDT)
  console.log(arrayIN)
  console.log(time)
  let singleArray = []
  if (fTypeIN !== 'derived') {
    for (let sing of arrayIN) {
      let dataPair = {}
      let timestamp = sing['timestamp']
      dataPair.timestamp = timestamp
      let valueC = 0
      if (sing[sourceDT.column] === null) {
        valueC = null
      } else {
        valueC = parseFloat(sing[sourceDT.column])
      }
      dataPair[sourceDT.column] = valueC
      singleArray.push(dataPair)
    }
  } else {
    // single flat arrays
    for (let sing of arrayIN) {
      let valueD = parseInt(sing[sourceDT.column], 10)
      singleArray.push(valueD)
    }
  }
  return singleArray
}

/**
* extract out the data type colum and timestamp
* @method filterDataTypeSub
*
*/
FilterDataSystem.prototype.filterDataTypeSub = function (sourceDT, arrayIN) {
  let singleArray = []
  // check if sub data structure
  let subData = this.subStructure(arrayIN)
  if (subData.length > 0) {
    arrayIN = subData
  }
  for (let sing of arrayIN) {
    let dataPair = {}
    let timestamp = sing['timestamp']
    dataPair.timestamp = timestamp
    if (sing[sourceDT.column]) {
      dataPair[sourceDT.column] = sing[sourceDT.column]
      singleArray.push(dataPair)
    }
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
