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
import { DateTime } from 'luxon'

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
ChartSystem.prototype.chartjsControl = function (visModule, contract, dataPrint, dataIN, dtConvert) {
  let chartData = {}
  let structureRules = this.structureChartData(dataPrint.triplet.datatype, dataIN, dtConvert)
  let dataPrep = this.prepareVueChartJS(visModule, dataPrint.triplet.datatype, dataPrint.triplet.device, structureRules, dtConvert)
  chartData.chartPackage = dataPrep
  chartData.chartOptions = this.liveChartOptions.prepareChartOptions(dataPrint.triplet.device)
  structureRules = {}
  dataPrep = {}
  return chartData
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
          // fill: true,
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
    console.log('dataset muilt------------')
    console.log(prepareDataset)
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
ChartSystem.prototype.structureMulitChartData = function (dataPrint, chartOptions, dataSet, sourceData, dataPrints) {
  console.log('structure mulit data start----------')
  let singleMulti = {}
  // need to analysis datatype numbers and time to decide if overlay of seperate datatypes over time is needed?
  let extractContext = []
  for (let dps of dataPrints) {
    extractContext.push(dps.triplet)
  }
  let extractDT = []
  for (let dt of dataPrints) {
    extractDT.push(dt.triplet.datatype)
  }
  let uniqueDT = [...new Set(extractDT)]
  let timeLogicLength = true
  let dtLogicLength = true
  // pull together logics and build dataset for visualisation
  if (timeLogicLength === true) {
    if (dtLogicLength === true) {
      let timeseriesDatasetHolder = []
      let timeseriesLabelHolder = []
      let timeseriesHolder = []
      // release dataset for each time period and then aggregate to gether to return
      for (let dti of uniqueDT) {
        let dtDataset = this.extractDTDataset(dti, dataSet, sourceData)
        timeseriesDatasetHolder.push(dtDataset)
      }
      // aggregate and prepare all the label data
      let allLabels = []
      for (let labext of timeseriesDatasetHolder) {
        for (let dspair of labext.sourceData) {
          for (let eleTime of dspair.data) {
            allLabels.push(eleTime['cf137103b22baa17894b52dca68d079163e57328'])
          }
        }
      }
      let uniqueTimeLabel = [...new Set(allLabels)]
      // ensure time integrity
      uniqueTimeLabel.sort((a,b) => a-b)
      let dtcount = 0
      let prepardTSdatasets = []
      console.log('input items aggrated')
      console.log(timeseriesDatasetHolder)
      console.log(util.inspect(timeseriesDatasetHolder, {showHidden: false, depth: null}))
      for (let dttts of timeseriesDatasetHolder) {
        let datatype = uniqueDT[dtcount]
        dataPrint.triplet.datatype = datatype
        prepardTSdatasets.push(this.structureTimeSeriesDataset(dataPrint, uniqueTimeLabel, dttts, dataPrints))
        dtcount++
      }
      let dataSetList = []
      for (let dsbundle of prepardTSdatasets) {
        dataSetList.push(dsbundle.datasets)
      }
      let newOptions = this.updateChartOptions(chartOptions, 'time series')
      singleMulti.chartOptions = newOptions
      singleMulti.chartPackage = {}
      singleMulti.chartPackage.labels = prepardTSdatasets[0].labels
      singleMulti.chartPackage.datasets = this.prepareColourTSList(dataSetList)
      timeseriesDatasetHolder = []
      prepardTSdatasets = []
    } else {
      console.log('single time and datatype')
    }
  } else {
    if (dtLogicLength === true) {
      console.log('single data but many data types')
    } else {
      console.log('single time and single datatype')
    }
  }
  sourceData = []
  return singleMulti
}

/**
*
* @method extract the dataset for this time
*
*/
ChartSystem.prototype.extractTimeDataset = function (timeR, dataSet) {
  let datasetHolder = []
  for (let ds of dataSet) {
    if (ds.context.triplet.timeout === timeR) {
      datasetHolder.push(ds)
    }
  }
  return datasetHolder
}

/**
* datatype per time period of datasets
* @method extractDTDataset
*
*/
ChartSystem.prototype.extractDTDataset = function (dtR, dataSet, sourceData) {
  let dataHolder = {}
  let datasetHolder = []
  let sourceHolder = []
  for (let ds of dataSet) {
    let dataSource = {}
    if (ds.context.triplet.datatype === dtR) {
      datasetHolder.push(ds)
    }
  }
  // match source data
  for (let ds of sourceData) {
    let dataSource = {}
    if (ds.context.triplet.datatype === dtR) {
      sourceHolder.push(ds)
    }
  }
  dataHolder.datasets = datasetHolder
  dataHolder.sourceData = sourceHolder
  datasetHolder = []
  sourceHolder = []
  return dataHolder
}

/**
*
* @method prepareTimeseriesLabels
*
*/
ChartSystem.prototype.prepareTimeseriesLabels = function (existingLabel, labelsIN) {
  let uniqueXaxis = []
  for (let lab of labelsIN) {
    let flatten = [...lab, ...uniqueXaxis]
    uniqueXaxis = flatten
  }
  let timeNumber = []
  for (let tm of uniqueXaxis) {
    let numDate = new Date(tm)
    let tnum = DateTime.fromJSDate(numDate).toMillis()
    timeNumber.push(tnum)
  }
  // sort order
  timeNumber.sort((a,b) => a-b)
  // format for time language
  let newSortedTime = []
  newSortedTime = this.prepareLabelchart(timeNumber)
  //  merge the two data sets and keep uniques
  let meragePrevious = [...existingLabel, ...newSortedTime]
  let newUniqueLabel = [...new Set(meragePrevious)]
  return newUniqueLabel
}

/**
* array of timer order past to present
* @method prepareLabelList
*
*/
ChartSystem.prototype.prepareLabelList = function (labelsIN) {
  let uniqueLabel = [...new Set(labelsIN)]
  let timeNumber = []
  for (let tm of uniqueLabel) {
    let numDate = new Date(tm)
    let tnum = DateTime.fromJSDate(numDate).toMillis()
    timeNumber.push(tnum)
  }
  // sort order
  timeNumber.sort((a,b) => a-b)
  // format for time language
  let newSortedTime = []
  newSortedTime = this.prepareLabelchart(timeNumber)
  timeNumber = []
  return newSortedTime
}

/**
*
* @method prepareColourTSList
*
*/
ChartSystem.prototype.prepareColourTSList = function (datasetsIN) {
  console.log('prepare data setcolors TS')
  console.log(datasetsIN)
  let colorsUpdated = []
  let count = 0
  for (let ds of datasetsIN) {
    let colorNew = this.colourList(ds.borderColor, count)
    ds.borderColor = colorNew
    ds.backgroundColor = colorNew
    colorsUpdated.push(ds)
    count++
  }
  console.log('color over  structure updated++++++')
  console.log(colorsUpdated)
  return colorsUpdated
}
/**
*  merge list of datasets
* @method prepareDatasetData
*
*/
ChartSystem.prototype.prepareDatasetData = function (dataSetsIN) {
  let newDataset = []
  let datasetStructure = dataSetsIN[0][0]
  let updateDatasetList = []
  for (let nds of dataSetsIN) {
    for (let dse of nds[0].data)
      updateDatasetList.push(dse)
  }
  let flattenDataList = updateDatasetList
  datasetStructure.data = flattenDataList
  newDataset.push(datasetStructure)
  flattenDataList = []
  return newDataset
}

/**
*  update title and legends and other options for muilt data set
* @method updateChartOptions
*
*/
ChartSystem.prototype.updateChartOptions = function (chartOptions, type) {
  let updateOptions = chartOptions
  let oldTitle = chartOptions.title.text
  updateOptions.title.text = oldTitle + ' ' + type
  return updateOptions
}

/**
* pairs of datatype per same time period
* @method structureTimeSeriesDataset
*
*/
ChartSystem.prototype.structureTimeSeriesDataset = function (dataPrint, timeLabels, dataSets, dataPrints) {
  let aggDatasource = []
  let newDataset = []
  let newLabelds = []
  // build new x-axis dataset i.e. timeseries order
  for (let cda of dataSets.sourceData) {
    aggDatasource.push(cda.data)
    newLabelds.push(cda.context.triplet.datatype)
  }
  console.log('keep tracke of label per dataset it datatype')
  console.log(newLabelds)
  let mergeSource = []
  mergeSource = aggDatasource.flat()
  // package pairs
  newDataset = this.prepareTimeseriesDatasetData(dataPrint, timeLabels, dataSets.datasets, newLabelds, mergeSource)
  // time converted to text
  let updateTimeList = this.prepareLabelchartTS(timeLabels)
  let dataPairs = {}
  dataPairs.labels = updateTimeList
  dataPairs.datasets = newDataset
  updateTimeList = []
  aggDatasource = []
  newDataset = []
  return dataPairs
}

/**
*  time series pairing of time and datasets into vis arrays
* @method prepareTimeseriesDatasetData
*
*/
ChartSystem.prototype.prepareTimeseriesDatasetData = function (dataPrint, timeLabels, aggDatasets, newLabelds, sourceDataIN) {
  console.log('chartsys===prepTS datasetses')
  console.log(sourceDataIN)
  console.log('aggDdadadaddada')
  console.log(aggDatasets)
  let newDataset = {}
  let datasetStructure = {} // aggDatasets[0].data.chartPackage.datasets[0]
  let normalisedTSMatch = this.timestampMatcherTS(dataPrint, timeLabels, sourceDataIN)
  // now pad out for x axis ie time labels
  datasetStructure.data = normalisedTSMatch
  datasetStructure.label = newLabelds[0].column
  newDataset = datasetStructure
  normalisedTSMatch = []
  return newDataset
}

/**
*  timestamp padding to unify array data with nulls
* @method timestampMatcherTS
*
*/
ChartSystem.prototype.timestampMatcherTS = function (dataPrint, timeLabels, dataIN) {
  // pad out each exising dataset y
  // check if dataset of right length if not padd the dataset
  let matchList = []
  let count = 0
  // check per existing datasets
  for (let timePoint of timeLabels) {
    let matchLogic = dataIN.find(elem => elem['cf137103b22baa17894b52dca68d079163e57328'] === timePoint)
    if (matchLogic) {
      matchList.push(matchLogic[dataPrint.triplet.datatype.refcontract]) //.triplet.datatype])
    } else {
      matchList.push(null)
    }
    count++
  }
  return matchList
}

/**
* return the data structure requested
* @method structureOverlayChartData
*
*/
ChartSystem.prototype.structureOverlayChartData = function (dataPrint, chartOptions, dataSets, sourceData, dataPrints) {
  let overlayDataset = {}
  let aggDatasets = []
  let aggLabels = []
  // build new x-axis dataset i.e. overlay nominal period
  for (let cda of dataSets) {
    let segData = []
    let segTime = []
    for (let datItem of cda.data) {
      segData.push(datItem[cda.context.triplet.datatype.refcontract])
      segTime.push(datItem['cf137103b22baa17894b52dca68d079163e57328'])
    }
    aggLabels.push(segTime)
    aggDatasets.push(segData)
  }
  // add to y-axis list of datasets
  let newOLlabels = this.prepareOverlayLabels(aggLabels)
  let newDataset = this.prepareOverlayDatasetData(dataPrint, newOLlabels, aggDatasets, sourceData, dataPrints)
  // update chartOptions ie. title, legends, scale if needed etc.
  let newOptions = this.updateChartOptions(chartOptions, 'overlay')
  overlayDataset.chartOptions = newOptions
  overlayDataset.chartPackage = {}
  overlayDataset.chartPackage.labels = newOLlabels
  overlayDataset.chartPackage.datasets = newDataset
  aggDatasets = []
  aggLabels = []
  return overlayDataset
}

/**
* normalise time to 24hrs by time in text format
* @method prepareOverlayLabels
*
*/
ChartSystem.prototype.prepareOverlayLabels = function (labelsIN) {
  let numberTimeHolder = labelsIN // []
  /*for (let label of labelsIN) {
    let numtime = this.textDatetoNumberFormat(label)
    numberTimeHolder.push(numtime)
  }*/
  let normaliseLabel = []
  let baseLabel = []
  for (let lab of numberTimeHolder) {
    if (normaliseLabel.length === 0) {
      baseLabel = lab
    } else {
      baseLabel = normaliseLabel
    }
    let mergeBack = this.mergeLabelData(baseLabel, lab)
    normaliseLabel = mergeBack
  }
  numberTimeHolder = []
  // normalise to timeperiod for overlay
  return normaliseLabel
}

/**
*  build dataset with samle length
* @method prepareOverlayDatasetData
*
*/
ChartSystem.prototype.prepareOverlayDatasetData = function (dataPrint, labels, dataSetsIN, sourceData, dataPrints) {
  let normalisedMatch = []
  let newDatasets = []
  for (let dsl of sourceData) {
    // loop over dataPrints, could be different datatypes asked for
    for (let dtl of dataPrints) {
      // if the datatype matches dataset allow matching
      if (dtl.triplet.datatype === dsl.context.triplet.datatype && dtl.triplet.timeout === dsl.context.triplet.timeout) {
        normalisedMatch = this.timestampMatcher(dtl, labels, dsl.data)
        newDatasets.push(normalisedMatch)
      }
    }
  }
  // now prepare chart object bundle
  let newChartDataset = []
  let newDataSet = []
  let countDS = 0
  for (let dsc of dataSetsIN) {
    let chartBundle = {}
    chartBundle.data = newDatasets[countDS] // need to match to right dataset
     // chartBundle.fillColor = this.colourList(chartBundle.fillColor)
     // chartBundle.fill = true
     chartBundle.borderWidth = 1
     chartBundle.backgroundColor = this.colourList(chartBundle.borderColor, countDS)
     chartBundle.borderColor = this.colourList(chartBundle.borderColor, countDS)
     chartBundle.label = dataPrints[0].triplet.datatype.column + this.colourList(chartBundle.borderColor, countDS)
    newChartDataset.push(chartBundle)
    countDS++
  }
  normalisedMatch = []
  newDatasets = []
  return newChartDataset
}

/**
* return the data structure requested
* @method structureChartData
*
*/
ChartSystem.prototype.structureChartData = function (rule, cData) {
  // temp logic while standards put in place to be replaced
  // double check if data is not alread in right format
  let sampleStructure = cData[0]
  let structureCheck = false
  if (cData.length > 0 ) {
    if (sampleStructure['cf137103b22baa17894b52dca68d079163e57328']) {
      structureCheck = true
    }
  }

  let dataPrep = {}
  if (structureCheck === false) {
    if (rule === 'blind1234555554321') {
      let splitDatax = cData.map(n => (n['d76d9c3db7f2212335373873805b54dd1f903a06']))
      let splitDatay = cData.map(n => n[rule])
      dataPrep.xaxis = splitDatax
      dataPrep.yaxis = splitDatay
    } else {
      let splitDatax = cData.map(n => (n['cf137103b22baa17894b52dca68d079163e57328'] * 1000))
      let splitDatay = cData.map(n => n[rule.refcontract])
      dataPrep.xaxis = splitDatax
      dataPrep.yaxis = splitDatay
    }
  } else {
    let splitDatax = cData.map(n => (n['cf137103b22baa17894b52dca68d079163e57328']))
    let splitDatay = cData.map(n => n[rule.refcontract])
    dataPrep.xaxis = splitDatax
    dataPrep.yaxis = splitDatay
  }
  return dataPrep
}

/**
*  take in two data set labels ie xaxis time series and return one
* @method mergeLabelData
*
*/
ChartSystem.prototype.mergeLabelData = function (baseLabel, newLabel) {
  // Convert all labels to a common format (HH:mm:ss.SSS)
  const convertToTimeFormat = (label) => {
    if (typeof label === 'number') {
      let makeMills = label * 1000
      return DateTime.fromMillis(makeMills).toFormat('HH:mm:ss.SSS')
    }
    return label
  }
  // Merge the two label arrays
  let flatten = [...baseLabel.map(convertToTimeFormat), ...newLabel.map(convertToTimeFormat)]
  // Remove duplicates by filtering out elements that are not the first occurrence in the array
  let uniqueXaxis = flatten.filter((v, i, a) => a.indexOf(v) === i)

  const millisecondsSinceMidnight = (time) => {
    let convertMills = DateTime.fromFormat(time, 'HH:mm:ss.SSS')
    let hours = convertMills.hour
    let minutes = convertMills.minute
    let seconds = convertMills.second
    let milliseconds = convertMills.millisecond
    return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds
  }

  let decTimeList = [];
  uniqueXaxis.forEach(time => decTimeList.push({ time: time, number: millisecondsSinceMidnight(time) }))
  // Sort the time labels based on the numerical values (milliseconds since midnight)
  let sortTimeMinsDay = decTimeList.sort((a, b) => a.number - b.number)
  // Convert the sorted numerical values back to their original time format
  let textTimeSorted = []
  for (let ts of sortTimeMinsDay) {
    textTimeSorted.push(ts.time)
  }

  return textTimeSorted;

}

/**
*  timestamp padding to unify array data with nulls
* @method timestampMatcher
*
*/
ChartSystem.prototype.timestampMatcher = function (dataPrint, mergedLabel, dataIN) {
  // pad out each exising dataset y
  // check if dataset of right length if not padd the dataset
  let matchList = []
  let dataTimeText = dataIN // this.textDatetoNumberFormatDataset(dataIN)
  let count = 0
  // check per existing datasets
  for (let tsi of mergedLabel) {
    // let include = dataTimeText.includes(tsi)
    let include = dataIN.some(item => {
      let itemTime = DateTime.fromMillis(item['cf137103b22baa17894b52dca68d079163e57328'] * 1000).toFormat('HH:mm:ss.SSS');  // item['cf137103b22baa17894b52dca68d079163e57328']
      if (itemTime === tsi) {
        return true
      }
    })
    if (include === true) {
      matchList.push(dataIN[count][dataPrint.triplet.datatype.refcontract])
      count++
    } else {
      matchList.push(null)
    }
  }
  return matchList
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
ChartSystem.prototype.colourList = function (colorIN, position) {
  // let colourRGB = ['rgb(255, 99, 132)', 'rgb(37, 56, 70)', 'rgb(45, 119, 175)', 'rgb(0, 100, 0)', 'rgb(41, 20, 80)', 'rgb(46, 143, 22)', 'rgb(38,15,187)', 'rgb(255, 20, 147)']
  let baseColours = ['rgb(211, 4, 4)', 'rgb(13, 28, 104)', 'rgb(255, 0, 0)', 'rgb(255, 20, 147)', 'rgb(255, 140, 0)', 'rgb(255, 215, 0)', 'rgb(0, 128, 0)', 'rgb(0, 0, 255)', 'rgb(128, 0, 128)', 'rgb(128, 128, 128)', 'rgb(0, 0, 0)']
  let passedCheck = ''
  if (position === 0) {
    passedCheck = baseColours[0]
  } else if (position === 1) {
    passedCheck = baseColours[1]
  } else {
    let max = 9
    let min = 0
    let colorNumber = Math.floor(Math.random() * (max - min + 1)) + min
    let selectColour = baseColours[colorNumber]
    // check color has not been used before
    if (selectColour !== colorIN) {
      passedCheck = selectColour
    } else {
      // select another color
      let colorNumber = Math.floor(Math.random() * (max - min + 1)) + min
      let selectColour = baseColours[colorNumber]
      passedCheck = selectColour
    }
  }
  /* let r = 10
  let g = 80
  let b = 200
  const rgb = (r, g, b) => `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`
  let rcolor = rgb(r, g, b) */
  return passedCheck
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
  let chartItem = {}
  if (visModule.charttype === 'line') {
    // chartItem.type = rules.prime.text
    // chartItem.borderColor = rules.color.borderColor
    // chartItem.backgroundColor = rules.color.backgroundColor
  } else {
    // chartItem.type = 'line'
    chartItem.fillColor = this.chartColors(rule)
    chartItem.borderWidth = 1
    chartItem.borderColor = this.chartColors(rule)
    chartItem.backgroundColor = this.chartColors(rule)
    console.log('label name for set')
    console.log(rule)
    chartItem.label = rule.column
  }
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
* convert time text to number
* @method textDatetoNumberFormat
*
*/
ChartSystem.prototype.textDatetoNumberFormat = function (labelIN) {
  let timePrep = []
  for (let li of labelIN) {
    let numDate = new Date(li)
    let timeFormat = DateTime.fromJSDate(numDate).toMillis()
    timePrep.push(timeFormat)
  }
  return timePrep
}

/**
* convert time text to number
* @method textDatetoNumberFormat
*
*/
ChartSystem.prototype.textDatetoNumberFormatDataset = function (labelIN) {
  let timePrep = []
  for (let li of labelIN) {
    let fullTime = li['cf137103b22baa17894b52dca68d079163e57328'] * 1000
    let numDate = new Date(fullTime)
    let timeFormat = DateTime.fromJSDate(numDate).toFormat('HH:mm') // .format('YYYY-MM-DD hh:mm')
    timePrep.push(timeFormat)
  }
  return timePrep
}

/**
* convert time text to number
* @method textDatetoNumberFormat
*
*/
ChartSystem.prototype.textDatetoNumberFormatDatasetTS = function (labelIN) {
  let timePrep = []
  for (let li of labelIN) {
    let fullTime = li['cf137103b22baa17894b52dca68d079163e57328'] * 1000
    // let numDate = new Date(fullTime)
    //let timeFormat = DateTime(numDate).valueOf() // format('YYYY-MM-DD HH:mm').valueOf()  // .format('YYYY-MM-DD hh:mm')
    timePrep.push(fullTime)
  }
  return timePrep
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
    let timeFormat = DateTime.fromMillis(li) // .toDate()  // .format('YYYY-MM-DD hh:mm')
    let tsimp = timeFormat.toFormat('dd LLL yyyy')
    timePrep.push(tsimp)
  }
  return timePrep
}

/**
* prepare the x axis data array time series
* @method prepareLabelchartTS
*
*/
ChartSystem.prototype.prepareLabelchartTS = function (labelIN) {
  let timePrep = []
  let count = 1
  for (let li of labelIN) {
    let unixtime = li * 1
    let timeFormat = DateTime.fromMillis(unixtime)
    let tsimp = timeFormat.toISO()  // toFormat('MM-DD kk:mm')
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
  let colorMatch = ''
  // LOOP over datatypeList and prepare chart colors
  if (datatypeItem.refcontract === '44ddfcb4788641e1ac8ddad4f665dcd8a8e85248') {
    colorMatch = '#203487'
    // colorHolder.borderColor = '#050d2d'
  } else if (datatypeItem.refcontract === 'ac945e4343965392c719b15746b6f8a97cd88caf') {
    colorMatch = '#ed7d7d'
    // colorHolder.borderColor = '#ea1212'
  } else if (datatypeItem.refcontract === 'cnrl-3339949442') {
  } else if (datatypeItem.refcontract === 'cnrl-3339949443') {
  } else if (datatypeItem.refcontract === 'cnrl-3339949444') {
  }
  return colorMatch
}

export default ChartSystem
