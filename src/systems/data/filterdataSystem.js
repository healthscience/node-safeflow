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

import { EventEmitter } from 'events'

class FilterDataSystem extends EventEmitter {
  constructor(setIN) {
    super()
  }

  /**
  * fiter controller of data types
  * @method dtFilterController
  *
  */
  dtFilterController(source, contract, device, datatype, time, tidyData) {
    let filterColumn = this.filterDataType(source, datatype, tidyData)
    return filterColumn
  }

  /**
  * extract out the data type colum and timestamp
  * @method filterDataType
  *
  */
  filterDataType(source, datatype, tidyData) {
    let singleArray = []
    if (datatype === 'blind1234555554321') {
      singleArray = tidyData
    } else {
      if (tidyData.length > 0) {
        for (let di of tidyData) {
          let dataPair = {}
          // extract the time column hash pair
          let timecolname = this.extractTimeDatatypePair(source.data.tablestructure)
          let timestamp = di[timecolname]
          dataPair['cf137103b22baa17894b52dca68d079163e57328'] = timestamp
          let valueC = 0
          if (di[datatype] === null) {
            valueC = null
          } else {
            valueC = parseFloat(di[datatype.column])
          }
          dataPair[datatype.refcontract] = valueC
          singleArray.push(dataPair)
        }
      }
    }
    return singleArray
  }

  /**
  * extract the time datatype colum pair
  * @method extractTimeDatatypePair
  *
  */
  extractTimeDatatypePair(datatypePairs) {
    let timeColumn = ''
    for (let dtp of datatypePairs) {
      if (dtp.refcontract === 'cf137103b22baa17894b52dca68d079163e57328') {
        timeColumn = dtp.column
      }
    }
    return timeColumn
  }

  /**
  * extract out the data type colum and timestamp
  * @method filterDataTypeSub
  *
  */
  filterDataTypeSub(source, datatype, arrayIN) {
    let singleArray = []
    // check if sub data structure
    let subData = this.subStructure(arrayIN)
    if (subData.length > 0) {
      arrayIN = subData
    }
    for (let sing of arrayIN) {
      let dataPair = {}
      let timestamp = sing['timestamp']
      dataPair['cnrl-8856388713'] = timestamp
      let valueC = 0
      if (sing[datatype] === null) {
        valueC = null
      } else {
        valueC = sing[datatype]
      }
      dataPair[datatype] = valueC
      singleArray.push(dataPair)
    }
    return singleArray
  }

  /**
  * sub structure
  * @method subStructure
  *
  */
  subStructure(data) {
    // implementation here
    return data
  }
}

export default FilterDataSystem
