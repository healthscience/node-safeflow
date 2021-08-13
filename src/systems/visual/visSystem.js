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
VisSystem.prototype.visualControl = function (visModule, contract, device, rule, dataIN, dtConvert) {
  let visBundlePrepared = {}
  if (contract.value.computational.name === 'Chart.js') {
    visBundlePrepared = this.liveChartSystem.chartjsControl(visModule, contract, device, rule, dataIN, dtConvert)
  } else if (contract.prime.text === 'Table') {
  }
  return visBundlePrepared
}

/**
*
* @method singlemultiControl
*
*/
VisSystem.prototype.singlemultiControl = function (type, dataPrint, inputHash, dataSet, sourceData, dataPrints) {
  let restructureDone = {}
  if (type.format === 'timeseries') {
    restructureDone = this.liveChartSystem.structureMulitChartData(dataSet)
  } else if (type.format = 'overlay') {
    restructureDone = this.liveChartSystem.structureOverlayChartData(dataPrint, dataSet, sourceData, dataPrints)
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
