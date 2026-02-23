'use strict'
/**
*  VisSystem
*
*
* @class VisSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import ChartSystem from './charts/chartSystem.js'
import TableSystem from './table/tableSystem.js'
import { EventEmitter } from 'events'

class VisSystem extends EventEmitter {
  constructor() {
    super()
    this.liveChartSystem = new ChartSystem()
    this.liveTableSystem = new TableSystem()
    this.visSystemData = []
  }

  /**
  *
  * @method visualControl
  *
  */
  visualControl(visModule, contract, dataPrint, dataIN, dtConvert) {
    // temp fix two competin structure comimg in blind and nxp
    let visContract = {}
    if (contract?.value?.computational?.name !== undefined) {
      visContract = contract.value.computational.name
    } else {
      visContract = contract[0].value.computational.name
    }
    let visBundlePrepared = {}
    if (visContract === 'chartjs') {
      visBundlePrepared = this.liveChartSystem.chartjsControl(visModule, contract, dataPrint, dataIN, dtConvert)
    } else if (visContract === 'Table') {
      // table implementation
    }
    return visBundlePrepared
  }

  /**
  *
  * @method singlemultiControl
  *
  */
  singlemultiControl(type, chartOptions, dataPrint, inputHash, dataSet, sourceData, dataPrints) {
    let restructureDone = {}
    if (type.format === 'timeseries') {
      restructureDone = this.liveChartSystem.structureMulitChartData(dataPrint, chartOptions, dataSet, sourceData, dataPrints)
    } else if (type.format === 'overlay') {
      restructureDone = this.liveChartSystem.structureOverlayChartData(dataPrint, chartOptions, dataSet, sourceData, dataPrints)
    }
    return restructureDone
  }

  /**
  *
  * @method tableSystem
  *
  */
  tableSystem(bundle, visIN, vData, timeComponent) {
    let tableData
    if (bundle.cid === 'cnrl-2356388731') {
      tableData = this.liveTableSystem.structureTableData(bundle, visIN, vData, timeComponent.timerange)
    }
    return tableData
  }
}

export default VisSystem
