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
  let structureRules = this.structureChartData(contract.rules, dataIN.data['cnrl-t1'])
  let dataPrep = this.prepareVueChartJS(contract, structureRules)
  chartData.chartPackage = dataPrep
  // dataPrep = { 'labels': [2, 4], 'datasets': [{ label: 'Wearable', backgroundColor: 'rgb(255, 99, 132)', borderColor: 'rgb(255, 99, 132)', 'data': [1, 2] }] }
  chartData.chartOptions = this.liveChartOptions.prepareChartOptions()
  return chartData
}

/**
* return the data structure requested
* @method structureChartData
*
*/
ChartSystem.prototype.structureChartData = function (rules, cData) {
  let dataPrep = {}
  // console.log('chart data strcture rules')
  // console.log(rules)
  // console.log(cData)
  let splitDatax = cData.map(n => n[rules.xaxis])
  let splitDatay = cData.map(n => n[rules.yaxis])
  dataPrep.xaxis = splitDatax
  dataPrep.yaxis = splitDatay
  return dataPrep
}

/**
* prepare DataCollection for vuechart.js
* @method prepareVueChartJS
*
*/
ChartSystem.prototype.prepareVueChartJS = function (rules, results) {
  let datacollection = {}
  // check for no data available
  if (results.yaxis.length === 0) {
    // no data to display
    this.chartmessage = 'No data to display'
    datacollection = {
      labels: [],
      datasets: [
        {
          type: 'line',
          label: 'chart',
          borderColor: '#ed7d7d',
          backgroundColor: '#ed7d7d',
          fill: false,
          data: results,
          yAxisID: ''
        }
          /* , {
          type: 'bar',
          label: 'Activity Steps',
          borderColor: '#ea1212',
          borderWidth: 0.5,
          backgroundColor: '#ea1212',
          fill: false,
          data: [],
          yAxisID: 'steps'
        } */
      ]
    }
  } else {
    // prepare the Chart OBJECT FOR CHART.JS  Up to 2 line e.g. BMP or Steps or BPM + Steps
    let prepareDataset = this.datasetPrep(rules, results)
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
* prepare the y axis data array
* @method datasetPrep
*
*/
ChartSystem.prototype.datasetPrep = function (rules, results) {
  // label ie x axis data for the charts
  let labelchart = []
  // if more than one time data source take the longest
  let labelData = []
  let datachart = []
  let chartItem = {}
  if (rules.prime.text === 'line') {
    // chartItem.type = rules.prime.text
    // chartItem.borderColor = rules.color.borderColor
    // chartItem.backgroundColor = rules.color.backgroundColor
  } else {
    chartItem.type = 'bar'
    chartItem.fillColor = 'rgb(255, 99, 132)' // rules.color.borderColor // 'rgba(220, 220, 220, 2)'
    chartItem.borderWidth = 2
    chartItem.borderColor = 'rgb(255, 99, 132)' // rules.color.borderColor
    chartItem.backgroundColor = 'rgb(255, 99, 132)' //rules.color.backgroundColor
  }
  chartItem.label = 'device' // rules.datatype
  chartItem.fill = true
  let scaling = 1 // this.yAxisScaleSet(rules.datatype)
  // chartItem.scale = scaling
  chartItem.data = results.yaxis
  // chartItem.yAxisID = 'y-axis-0' // rules.color.datatype
  labelData = results.xaxis
  labelchart = this.prepareLabelchart(labelData)
  let dataHolder = {}
  dataHolder.labels = labelchart
  dataHolder.datasets = chartItem
  return dataHolder
}
/**
* prepare the x axis data array
* @method prepareLabelchart
*
*/
ChartSystem.prototype.prepareLabelchart = function (labelIN) {
  let timePrep = []
  let count = 1
  for (let li of labelIN) {
    let timeFormat = moment(li).toDate()  // .format('YYYY-MM-DD hh:mm')
    let tsimp = moment(timeFormat).format('llll')
    timePrep.push(tsimp)
  }
  return timePrep
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
