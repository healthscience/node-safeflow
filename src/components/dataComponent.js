'use strict'
/**
*  DataComponent
*
*
* @class DataComponent
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import DataSystem from '../systems/data/dataSystem.js'
import TidyDataSystem from '../systems/data/tidydataSystem.js'
import FilterDataSystem from '../systems/data/filterdataSystem.js'
import CategoryDataSystem from '../systems/data/categorydataSystem.js'
import { EventEmitter } from 'events'

class DataComponent extends EventEmitter {
  constructor(setIN) {
    super()
    this.liveTidyData = new TidyDataSystem(setIN)
    this.liveFilterData = new FilterDataSystem(setIN)
    this.liveCategoryData = new CategoryDataSystem(setIN)
    this.liveDataSystem = new DataSystem(setIN)
    this.liveData = {}
    this.tidyData = {}
    this.categoryData = {}
    this.dataRaw = {}
  }

  /**
  *  set the datatype asked for
  * @method setDevicesLive
  *
  */
  async setDevicesLive() {
    this.deviceList = this.liveDataSystem.getLiveDevices(this.did.devices)
  }

  /**
  *  get the source data to compute on
  *  @method DataControlFlow
  */
  async DataControlFlow(source, dataAPI, contract, hash, dataPrint) {
    console.log('SF-COMP DATA--')
    let dataRback = await this.liveDataSystem.datatypeQueryMapping('DATA-COMPUTE', '#####', source, dataPrint.triplet.device, dataPrint.triplet.datatype, dataPrint.triplet.timeout, contract)
    console.log('DC--data back')
    console.log(dataRback.length)
    let datauuid = dataPrint.hash // hashObject(dataID)
    this.dataRaw[datauuid] = dataRback
    dataRback = []
    let catFlag = false
    // is there data?
    if (this.dataRaw[datauuid].length > 0) {
      // is there a categories filter to apply?
      if (source.categorydt.status !== 'none') {
        this.CategoriseData(source, dataAPI.category, contract, datauuid, dataPrint.triplet.device, dataPrint.triplet.datatype, dataPrint.triplet.timeout)
        catFlag = true
      } else {
        catFlag = false
        this.categoryData[datauuid] = this.dataRaw[datauuid]
      }
      // is there any data tidying required
      if (source.tidydt.status !== 'none' && contract.value.info.controls?.tidy === true) {
        this.TidyDataPrep(source, contract, datauuid, dataPrint.triplet.device, dataPrint.triplet.datatype, dataPrint.triplet.timeout)
      } else {
        if (catFlag === true) {
          // was category data but no tidy
          this.tidyData[datauuid] = this.categoryData[datauuid]
        } else {
          // no category or tidy data
          this.tidyData[datauuid] = this.dataRaw[datauuid]
        }
      }
      // form SF compute standard ie. dt hash for structuer
      this.FilterDownDT(source, contract, datauuid, dataPrint)
    } else {
      this.dataRaw[datauuid] = []
      this.liveData[datauuid] = []
    }
    return true
  }

  /**
  *
  * @method CategoriseData
  *
  */
  CategoriseData(apiINFO, catInfo, contract, datauuid, device, datatype, time) {
    let catDataG = {}
    catDataG = this.liveCategoryData.categorySorter(apiINFO, catInfo, contract, device, datatype, time, this.dataRaw[datauuid])
    this.categoryData[datauuid] = catDataG
    catDataG = {}
  }

  /**
  * Tidy data prep
  * @method TidyDataPrep
  *
  */
  TidyDataPrep(source, contract, datauuid, device, datatype, time) {
    // implementation here
  }

  /**
  * Filter down DT
  * @method FilterDownDT
  *
  */
  FilterDownDT(source, contract, datauuid, dataPrint) {
    // implementation here
  }

  /**
  * Set filter results
  * @method setFilterResults
  *
  */
  setFilterResults(uuid, data) {
    this.liveData[uuid] = data
  }
}

export default DataComponent
