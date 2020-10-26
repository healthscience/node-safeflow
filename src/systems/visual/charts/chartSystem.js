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
import util from 'util'
import events from 'events'
import moment from 'moment'

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
ChartSystem.prototype.chartjsControl = function (visModule, contract, device, rule, dataIN, dtConvert) {
  let chartData = {}
  let structureRules = this.structureChartData(rule, dataIN, dtConvert)
  let dataPrep = this.prepareVueChartJS(visModule, rule, device.device_mac, structureRules, dtConvert)
  chartData.chartPackage = dataPrep
  chartData.chartOptions = this.liveChartOptions.prepareChartOptions(device.device_name)
  return chartData
}


/**
* return the data structure requested
* @method structureChartData
*
*/
ChartSystem.prototype.structureChartData = function (rule, cData, dtConvert) {
  let dataPrep = {}
  let splitDatax = cData.map(n => (n['d6432e905c50764b93b5e685c182b23ff5352a07'] * 1000))
  let splitDatay = cData.map(n => n[rule])
  dataPrep.xaxis = splitDatax
  dataPrep.yaxis = splitDatay
  // console.log('chart data prep over')
  // console.log(dataPrep)
  return dataPrep
}

/**
* convert RefContract CNRL to text
* @method convertCNRLtoText
*
*/
ChartSystem.prototype.convertCNRLtoText = function (cnrl, dtConvert) {
  let textdt = ''
  for (let dtc of dtConvert) {
    if (dtc.refcontract === cnrl) {
      textdt = dtc.column
    }
  }
  return textdt
}

/**
* prepare DataCollection for vuechart.js
* @method prepareVueChartJS
*
*/
ChartSystem.prototype.prepareVueChartJS = function (visModule, rule, device, results, dtConvert) {
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
* return data to display on one chart
* @method structureMulitChartData
*
*/
ChartSystem.prototype.structureMulitChartData = function (multiList) {
  let singleMulti = {}
  let aggDatasets = []
  let aggLabels = []
  for (let ci of multiList) {
    let setColourUpdate = this.setColourDataset(ci.chartPackage.data.chartPackage.datasets[0])
    aggDatasets.push(setColourUpdate)
    aggLabels.push(ci.chartPackage.data.datasets)
  }
  // let normaliseLabels = this.normaliseLabels(aggLabels)
  singleMulti.chartOptions = multiList[0].data.chartOptions
  singleMulti.chartPackage = multiList[0].data.chartPackage
  singleMulti.chartPackage.datasets = aggDatasets
  return singleMulti
}

/**
*  allocate new color to each dataset
* @method setColourDataset
*
*/
ChartSystem.prototype.setColourDataset = function (dataSet) {
  let colourUpdated = dataSet
  let newColour = this.colourList()
  colourUpdated.borderColor = newColour
  colourUpdated.fillColor = newColour
  return colourUpdated
}

/**
*  list of chart colours
* @method colourList
*
*/
ChartSystem.prototype.colourList = function () {
  let colourRGB = ['rgb(255, 99, 132)', 'rgb(181, 212, 234)', 'rgb(45, 119, 175 )','rgb(90, 45, 175)', 'rgb(41, 20, 80)', 'rgb(46, 143, 22)', 'rgb(21, 81, 7)', 'rgb(153, 18, 186)']
  let max = 6
  let min = 0
  let colorNumber = Math.floor(Math.random() * (max - min + 1)) + min
  let selectColour = colourRGB[colorNumber]
  return selectColour
}

/**
*  prepar x axis multi chart same units
* @method normaliseLabels
*
*/
ChartSystem.prototype.normaliseLabels = function (labelList) {
  let normaliseList = []
  for (let ll of labelList) {
  }
  return normaliseList
}

/**
* prepare the y axis data array
* @method datasetPrep
*
*/
ChartSystem.prototype.datasetPrep = function (visModule, rule, device, results, dtConvert) {
  // label ie x axis data for the charts
  let labelchart = []
  // if more than one time data source take the longest
  let labelData = []
  let datachart = []
  let chartItem = {}
  if (visModule.charttype === 'line') {
    // chartItem.type = rules.prime.text
    // chartItem.borderColor = rules.color.borderColor
    // chartItem.backgroundColor = rules.color.backgroundColor
  } else {
    chartItem.type = 'line'
    chartItem.fillColor = 'rgb(255, 99, 132)' // rules.color.borderColor // 'rgba(220, 220, 220, 2)'
    chartItem.borderWidth = 0
    chartItem.borderColor = 'rgb(255, 99, 132)' // rules.color.borderColor
    chartItem.backgroundColor = '' // 'rgb(255, 99, 132)' //rules.color.backgroundColor
  }
  // chartItem.label = this.convertCNRLtoText(rule, dtConvert)
  chartItem.fill = false
  let scaling = 1 // this.yAxisScaleSet(rules.datatype)
  // chartItem.scale = scaling
  chartItem.data = results.yaxis
  // chartItem.yAxisID = 'y-axis-0' // rules.color.datatype
  labelData = results.xaxis
  labelchart = this.prepareLabelchart(labelData)
  chartItem.label = this.convertCNRLtoText(rule, dtConvert) + ' ' + labelchart[0]
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
