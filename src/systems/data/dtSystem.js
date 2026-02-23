'use strict'
/**
*  DTSystem
*
*
* @class DTSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import { EventEmitter } from 'events'

class DTSystem extends EventEmitter {
  constructor() {
    super()
  }

  /**
  *  // match datatypes to query API via CNRL packaging contract(s)
  * @method DTStartMatch
  *
  */
  DTStartMatch(sourceAPI, contract, datatype) {
    // use inputs to map to datastore/api/rest etc. table / layout structure
    let sourceDTmap = this.datatypeTableMapper(sourceAPI, datatype)
    let sourceCatmap = this.categoryTableMapper(sourceAPI, contract.category)
    let sourceTidymap = this.tidyTableMapper(sourceAPI)
    let apiInfo = {}
    apiInfo.data = sourceAPI
    apiInfo.sourceapiquery = sourceDTmap
    apiInfo.categorydt = sourceCatmap
    apiInfo.tidydt = sourceTidymap
    return apiInfo
  }

  /**
  *  // map data prime to source data types //
  * @method datatypeTableMapper
  *
  */
  datatypeTableMapper(sourceAPI, dt) {
    let apiMatch = {}
    // given datatypes select find match to the query string
    // match to source API query
    for (let dtt of sourceAPI.tablestructure) {
      if (dtt.refcontract === dt) {
        let packAPImatch = {}
        packAPImatch.cnrl = dtt.refcontract
        packAPImatch.column = dtt.column
        packAPImatch.apipath = sourceAPI.api
        packAPImatch.namespace = sourceAPI.filename
        packAPImatch.tablesqlite = sourceAPI.sqlitetablename
        apiMatch = packAPImatch
      }
    }
    return apiMatch
  }

  /**
  *  // map category to
  * @method categoryTableMapper
  *
  */
  categoryTableMapper(sourceAPI, category) {
    let catInfo = []
    // check if any categories?
    let objectKeys = Object.keys(category)
    if (objectKeys.length !== 0) {
      for (let ct of objectKeys) {
        // map category DT to api table name
        let catDT = this.datatypeTableMapper(sourceAPI, category[ct].column)
        catInfo.push(catDT)
      }
    }
    if (catInfo.length === 0) {
      catInfo = { 'status': 'none' }
    }
    return catInfo
  }

  /**
  *  // map data prime to source data types //
  * @method tidyTableMapper
  *
  */
  tidyTableMapper(sourceAPI) {
    // implementation here
    return []
  }
}

export default DTSystem
