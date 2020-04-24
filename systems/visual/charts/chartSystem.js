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
const util = require('util')
const events = require('events')
const moment = require('moment')

var ChartSystem = function () {
  events.EventEmitter.call(this)
  this.liveChartOptions = new ChartOptions()
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(ChartSystem, events.EventEmitter)

/**
*  rules and logic need for Chart.js charting data
* @method chartjsControl
*
*/
ChartSystem.prototype.chartjsControl = function (contract, dataIN) {
  let chartData = {}
  chartData.chartPackage = this.structureChartData(contract.rules, dataIN)
  chartData.chartOptions = this.liveChartOptions.prepareChartOptions()
  /* if (visBundle.cid === 'cnrl-2356388731') {
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
  } */
  return chartData
}

/**
* return the data structure requested
* @method structureChartData
*
*/
ChartSystem.prototype.structureChartData = function (rules, cData) {
  let visCHolder = {}
  // let dataPrep = this.prepareVueChartJS(chartDataH.chart)
  visCHolder = { 'labels': [2, 4], 'datasets': [{ label: 'Wearable', backgroundColor: 'rgb(255, 99, 132)', borderColor: 'rgb(255, 99, 132)', 'data': [1, 2] }] }
  // loop through and build two sperate arrays
  return visCHolder
}

/**
*
* @method yAxisScaleSet
*
*/
ChartSystem.prototype.yAxisScaleSet = function (data) {
  let dataStriped = data.filter(ni => ni > 0)
  // let adataStriped = [1, 3, 2, 33, 3]
  let maxLevel = Math.max(...dataStriped)
  let topScale = maxLevel * 1.5
  return topScale
}

/**
* prepare chart colors
* @method chartColors
*
*/
ChartSystem.prototype.chartColors = function (datatypeItem) {
  let colorHolder = {}
  // LOOP over datatypeList and prepare chart colors
  if (datatypeItem.cnrl === 'cnrl-8856388712') {
    colorHolder.datatype = 'steps'
    colorHolder.backgroundColor = '#203487'
    colorHolder.borderColor = '#050d2d'
  } else if (datatypeItem.cnrl === 'cnrl-8856388711') {
    colorHolder.datatype = 'bpm'
    colorHolder.backgroundColor = '#ed7d7d'
    colorHolder.borderColor = '#ea1212'
  } else if (datatypeItem.cnrl === 'cnrl-3339949442') {
    colorHolder.datatype = 'SDS_P2'
    colorHolder.backgroundColor = '#080e4d'
    colorHolder.borderColor = '#080e4d'
  } else if (datatypeItem.cnrl === 'cnrl-3339949443') {
    colorHolder.datatype = 'SDS_P1'
    colorHolder.backgroundColor = '#ed7d7d'
    colorHolder.borderColor = '#ea1212'
  } else if (datatypeItem.cnrl === 'cnrl-3339949444') {
    colorHolder.datatype = 'temperature'
    colorHolder.backgroundColor = '#ed7d7d'
    colorHolder.borderColor = '#ea1212'
  }
  return colorHolder
}

/**
* prepare DataCollection for vuechart.js
* @method prepareVueChartJS
*
*/
ChartSystem.prototype.prepareVueChartJS = function (results) {
  let datacollection = {}
  this.colorback = ''
  this.colorlineback = ''
  this.colorback2 = ''
  this.colorlineback2 = ''
  this.activityback = ''
  // label ie x axis data for the charts
  let labelchart = []
  // if more than one time data source take the longest
  let labelData = []
  let datachart = []
  for (let rItems of results) {
    let chartItem = {}
    if (rItems.color.datatype === 'bpm' || rItems.color.datatype === 'temperature') {
      chartItem.type = 'line'
      chartItem.borderColor = rItems.color.borderColor
      chartItem.backgroundColor = rItems.color.backgroundColor
    } else {
      chartItem.type = 'bar'
      chartItem.fillColor = rItems.color.borderColor // 'rgba(220, 220, 220, 2)'
      chartItem.borderWidth = 1
      chartItem.borderColor = rItems.color.borderColor
      chartItem.backgroundColor = rItems.color.backgroundColor
    }
    chartItem.label = rItems.color.datatype
    chartItem.fill = false
    let scaling = this.yAxisScaleSet(rItems.data.datasets)
    chartItem.scale = scaling
    chartItem.data = rItems.data.datasets
    chartItem.yAxisID = rItems.color.datatype
    datachart.push(chartItem)
    labelData.push(rItems.data.labels)
  }
  labelchart = this.prepareLabelchart(labelData)
  // check for no data available
  if (results.length === 0) {
    // no data to display
    this.chartmessage = 'No data to display'
    datacollection = {
      labels: [],
      datasets: [
        {
          type: 'line',
          label: 'Beats per Minute',
          borderColor: '#ed7d7d',
          backgroundColor: '#ed7d7d',
          fill: false,
          data: [],
          yAxisID: 'bpm'
        }, {
          type: 'bar',
          label: 'Activity Steps',
          borderColor: '#ea1212',
          borderWidth: 0.5,
          backgroundColor: '#ea1212',
          fill: false,
          data: [],
          yAxisID: 'steps'
        }
      ]
    }
  } else {
    // prepare the Chart OBJECT FOR CHART.JS  Up to 2 line e.g. BMP or Steps or BPM + Steps
    datacollection = {
      labels: labelchart,
      datasets: datachart
    }
  }
  return datacollection
}

/**
* prepare the x axis data array
* @method prepareLabelchart
*
*/
ChartSystem.prototype.prepareLabelchart = function (labelIN) {
  return labelIN[0]
}

/**
* prepare average chart colors
* @method StatschartColors
*
*/
ChartSystem.prototype.StatschartColors = function (datatypeItem) {
  let colorHolder = {}
  // LOOP over datatypeList and prepare chart colors
  if (datatypeItem.cnrl === 'cnrl-8856388724') {
    colorHolder.datatype = 'cnrl-8856388724'
    colorHolder.backgroundColor = '#203487'
    colorHolder.borderColor = '#050d2d'
  } else if (datatypeItem.cnrl === 'cnrl-8856388322') {
    colorHolder.datatype = 'cnrl-8856388322'
    colorHolder.backgroundColor = '#ed7d7d'
    colorHolder.borderColor = '#ea1212'
  } else if (datatypeItem.cnrl === 'cnrl-8856388924') {
    colorHolder.datatype = 'cnrl-8856388924'
    colorHolder.backgroundColor = '#203487'
    colorHolder.borderColor = '#203487'
  } else if (datatypeItem.cnrl === 'cnrl-8856389322') {
    colorHolder.datatype = 'cnrl-8856389322'
    colorHolder.backgroundColor = '#444b57'
    colorHolder.borderColor = '#444b57'
  }
  return colorHolder
}

export default ChartSystem
