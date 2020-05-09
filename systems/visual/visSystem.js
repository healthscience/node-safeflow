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
const util = require('util')
const events = require('events')
// const moment = require('moment')

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
VisSystem.prototype.visualControl = function (contract, rule, dataIN) {
  console.log('vis control')
  let visBundlePrepared = {}
  if (contract.prime.text === 'Chart.js') {
    visBundlePrepared = this.liveChartSystem.chartjsControl(contract, rule, dataIN)
  } else if (contract.prime.text === 'Table') {
  }
  return visBundlePrepared
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
