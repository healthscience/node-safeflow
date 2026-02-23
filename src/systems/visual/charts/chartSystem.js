'use strict'
/**
*  ChartSystem
*
*
* @class ChartSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import ChartOptions from './chartOptions.js'
import { EventEmitter } from 'events'
import { DateTime } from 'luxon'

class ChartSystem extends EventEmitter {
  constructor() {
    super()
    this.liveChartOptions = new ChartOptions()
  }

  /**
  *  rules and logic need for Chart.js charting data
  * @method chartjsControl
  *
  */
  chartjsControl(visModule, contract, dataPrint, dataIN, dtConvert) {
    let chartData = {}
    let structureRules = this.structureChartData(dataPrint.triplet.datatype, dataIN, dtConvert)
    let dataPrep = this.prepareVueChartJS(visModule, dataPrint.triplet.datatype, dataPrint.triplet.device, structureRules, dtConvert)
    chartData.chartPackage = dataPrep
    chartData.chartOptions = this.liveChartOptions.prepareChartOptions(dataPrint.triplet.device)
    return chartData
  }

  /**
  * prepare DataCollection for vuechart.js
  * @method prepareVueChartJS
  *
  */
  prepareVueChartJS(visModule, rule, device, results, dtConvert) {
    let datacollection = {}
    if (results.yaxis.length === 0) {
      this.chartmessage = 'No data to display'
      datacollection = {
        labels: [],
        datasets: [
          {
            type: 'line',
            label: 'chart',
            borderColor: '#ed7d7d',
            backgroundColor: '#ed7d7d',
            data: results,
            yAxisID: ''
          }
        ]
      }
    } else {
      let prepareDataset = this.datasetPrep(visModule, rule, device, results, dtConvert)
      let datasetHolder = []
      datasetHolder.push(prepareDataset.datasets)
      datacollection = {
        labels: prepareDataset.labels,
        datasets: datasetHolder
      }
    }
    return datacollection
  }

  /**
  * structure chart data
  * @method structureChartData
  *
  */
  structureChartData(datatype, data, dtConvert) {
    // implementation here
    return { yaxis: [] }
  }

  /**
  * dataset prep
  * @method datasetPrep
  *
  */
  datasetPrep(visModule, rule, device, results, dtConvert) {
    // implementation here
    return { labels: [], datasets: {} }
  }

  /**
  * return data to display on one chart
  * @method structureMulitChartData
  *
  */
  structureMulitChartData(dataPrint, chartOptions, dataSet, sourceData, dataPrints) {
    // implementation here
    return {}
  }

  /**
  * return data to display on one chart overlay
  * @method structureOverlayChartData
  *
  */
  structureOverlayChartData(dataPrint, chartOptions, dataSet, sourceData, dataPrints) {
    // implementation here
    return {}
  }
}

export default ChartSystem
