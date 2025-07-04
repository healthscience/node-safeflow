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
import util from 'util'
import events from 'events'
// import moment from 'moment'

var VisSystem = function () {
  events.EventEmitter.call(this)
  this.liveChartSystem = new ChartSystem()
  this.liveTableSystem = new TableSystem()
  this.visSystemData = []
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(VisSystem, events.EventEmitter)

/**
*
* @method chartSystem
*
*/
VisSystem.prototype.visualControl = function (visModule, contract, dataPrint, dataIN, dtConvert) {
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
  }
  return visBundlePrepared
}

/**
*
* @method singlemultiControl
*
*/
VisSystem.prototype.singlemultiControl = function (type, chartOptions, dataPrint, inputHash, dataSet, sourceData, dataPrints) {
  let restructureDone = {}
  if (type.format === 'timeseries') {
    restructureDone = this.liveChartSystem.structureMulitChartData(dataPrint, chartOptions, dataSet, sourceData, dataPrints)
  } else if (type.format = 'overlay') {
    restructureDone = this.liveChartSystem.structureOverlayChartData(dataPrint, chartOptions, dataSet, sourceData, dataPrints)
  }
  return restructureDone
}

/**
*
* @method tableSystem
*
*/
VisSystem.prototype.tableSystem = function (bundle, visIN, vData, timeComponent) {
  let tableData
  if (bundle.cid === 'cnrl-2356388731') {
    tableData = this.liveTableSystem.structureTableData(bundle, visIN, vData, timeComponent.timerange)
  }
  return tableData
}

export default VisSystem
