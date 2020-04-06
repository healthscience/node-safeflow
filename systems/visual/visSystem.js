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
import ChartOptions from './charts/chartOptions.js'
import TableSystem from './table/tableSystem.js'
const util = require('util')
const events = require('events')
// const moment = require('moment')

var VisSystem = function () {
  events.EventEmitter.call(this)
  this.liveChartSystem = new ChartSystem()
  this.liveChartOptions = new ChartOptions()
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
VisSystem.prototype.visSystemChart = function (visBundle, dataIN) {
  var localthis = this
  let visIN = 'vis-sc-1'
  let liveTime = visBundle.startperiod
  let structureHolder = {}
  let chartGroupHolder = []
  let chartData = {}
  let chartDataH = {}
  chartDataH.chart = []
  let dataTypeBucket = {}
  chartDataH.options = {}
  chartDataH.prepared = {}
  if (visBundle.cid === 'cnrl-2356388731') {
    for (let dtv of visBundle.datatypes) {
      structureHolder = this.liveChartSystem.structureChartData(dtv, visBundle, dataIN)
      // prepare the colors for the charts
      let chartColorsSet = localthis.liveChartSystem.chartColors(dtv)
      dataTypeBucket.data = structureHolder
      dataTypeBucket.color = chartColorsSet
      chartDataH.chart.push(dataTypeBucket)
      structureHolder = {}
      dataTypeBucket = {}
    }
    // prepare title, y axis text and scaling
    let titleOut = 'Device ' + visBundle.devices[0].device_name
    // package all the info. to pass to vue
    chartData.prepared = this.liveChartSystem.prepareVueChartJS(chartDataH.chart)
    // prepare chart options
    let liveChartOptions = this.liveChartOptions.prepareChartOptions(titleOut, visBundle.datatypes, chartData.prepared.scale)
    // prepared the labels
    let setTimeTools = chartData.prepared.labels
    // update for annotation values needing set
    let chartOptionsSet = this.liveChartOptions.updateChartoptions(setTimeTools, liveChartOptions)
    chartData.options = chartOptionsSet
    chartData.liveActive = this.liveChartOptions
    const chartHolder = {}
    chartHolder[visIN] = {}
    chartHolder[visIN][liveTime] = {}
    chartHolder[visIN][liveTime]['day'] = chartData
    chartGroupHolder.push(chartHolder)
    this.visSystemData = chartGroupHolder
  } else if (visBundle.cid === 'cnrl-2356388732') {
    let liveChartOptions = this.liveChartOptions.AverageChartOptions()
    for (let dtv of visBundle.datatypes) {
      structureHolder = this.liveChartSystem.structureAverageData(dtv, visBundle, dataIN)
      let chartColorsSet = localthis.liveChartSystem.StatschartColors(dtv)
      dataTypeBucket.data = structureHolder
      dataTypeBucket.color = chartColorsSet
      chartDataH.chart.push(dataTypeBucket)
      // now prepare data format for chartjs
      chartData.prepared = this.liveChartSystem.prepareStatsVueChartJS(visBundle.devices, chartDataH)
      let setTimeTools = chartData.prepared.labels
      let chartOptionsSet = this.liveChartOptions.updateChartoptions(setTimeTools, liveChartOptions) // this.liveChartSystem.getterChartOptions()
      chartData.options = chartOptionsSet
      const chartHolder = {}
      chartHolder[visIN] = {}
      chartHolder[visIN][liveTime] = {}
      chartHolder[visIN][liveTime]['day'] = chartData
      chartGroupHolder.push(chartHolder)
      structureHolder = {}
      dataTypeBucket = {}
      this.visSystemData = chartGroupHolder
    }
  } else if (visBundle.cid === 'cnrl-2356388737') {
    // summation of datatypes
    // could be more than one visualisation required,  devices, datatypes, timeseg or computation or event resolutions
    let liveChartOptions = this.liveChartOptions.SumChartOptions()
    for (let dtv of visBundle.datatypes) {
      structureHolder = this.liveChartSystem.structureSumData(dtv, visBundle, dataIN)
      let chartColorsSet = localthis.liveChartSystem.StatschartColors(dtv)
      dataTypeBucket.data = structureHolder
      dataTypeBucket.color = chartColorsSet
      chartDataH.chart.push(dataTypeBucket)
      // now prepare data format for chartjs
      chartData.prepared = this.liveChartSystem.prepareSumVueChartJS(visBundle.devices, chartDataH)
      let setTimeTools = chartData.prepared.labels
      let chartOptionsSet = this.liveChartOptions.updateChartoptions(setTimeTools, liveChartOptions) // this.liveChartSystem.getterChartOptions()
      chartData.options = chartOptionsSet
      const chartHolder = {}
      chartHolder[visIN] = {}
      chartHolder[visIN][liveTime] = {}
      chartHolder[visIN][liveTime]['day'] = chartData
      chartGroupHolder.push(chartHolder)
      structureHolder = {}
      dataTypeBucket = {}
      this.visSystemData = chartGroupHolder
    }
  } else if (visBundle.cid === 'cnrl-2356388733') {
    const chartHolder = {}
    chartHolder[visIN] = {}
    chartHolder[visIN].status = 'report-component'
    this.visSystemData = chartHolder
  }
  return this.visSystemData
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
