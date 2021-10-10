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
ChartSystem.prototype.structureMulitChartData = function (dataPrint, dataSet, sourceData, dataPrints) {
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
          for (let eleTime of dspair.data)
          allLabels.push(eleTime['2d11318841f43034df41de9b38ab5e77b6b01bcf'])
        }
      }
      let uniqueTimeLabel = [...new Set(allLabels)]
      // ensure time integrity
      uniqueTimeLabel.sort((a,b) => a-b)
      let dtcount = 0
      let prepardTSdatasets = []
      for (let dttts of timeseriesDatasetHolder) {
        let datatype = uniqueDT[dtcount]
        dataPrint.triplet.datatype = datatype
        prepardTSdatasets.push(this.structureTimeOverlayDataset(dataPrint, uniqueTimeLabel, dttts, dataPrints))
        dtcount++
      }
      let dataSetList = []
      for (let dsbundle of prepardTSdatasets) {
        dataSetList.push(dsbundle.datasets)
      }
      let newOptions = this.updateChartOptions(timeseriesDatasetHolder[0].datasets, 'time series')
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
    console.log('single day')
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
    let tnum = moment(numDate).valueOf()
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
    let tnum = moment(numDate).valueOf()
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
  let colorsUpdated = []
  let count = 0
  for (let ds of datasetsIN) {
    ds.borderColor = this.colourList(ds.borderColor, count)
    colorsUpdated.push(ds)
    count++
  }
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
ChartSystem.prototype.updateChartOptions = function (dataIN, type) {
  let updateOptions = {}
  for (let dopt of dataIN) {
    updateOptions = dopt.data.chartOptions
  }
  let oldTitle = updateOptions.title.text
  updateOptions.title.text = oldTitle + ' ' + type
  return updateOptions
}

/**
* pairs of datatype per same time period
* @method structureTimeOverlayDataset
*
*/
ChartSystem.prototype.structureTimeOverlayDataset = function (dataPrint, timeLabels, dataSets, dataPrints) {
  let aggDatasource = []
  let newDataset = []
  // build new x-axis dataset i.e. timeseries order
  for (let cda of dataSets.sourceData) {
    aggDatasource.push(cda.data)
  }
  let mergeSource = []
  mergeSource = aggDatasource.flat()
  // package pairs
  newDataset = this.prepareTimeseriesDatasetData(dataPrint, timeLabels, dataSets.datasets, mergeSource)
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
ChartSystem.prototype.prepareTimeseriesDatasetData = function (dataPrint, timeLabels, aggDatasets, sourceDataIN) {
  let newDataset = {}
  let datasetStructure = aggDatasets[0].data.chartPackage.datasets[0]
  let normalisedTSMatch = this.timestampMatcherTS(dataPrint, timeLabels, sourceDataIN)
  // now pad out for x axis ie time labels
  datasetStructure.data = normalisedTSMatch
  newDataset = datasetStructure
  normalisedTSMatch = []
  return newDataset
}

/**
* return the data structure requested
* @method structureOverlayChartData
*
*/
ChartSystem.prototype.structureOverlayChartData = function (dataPrint, dataSets, sourceData, dataPrints) {
  let overlayDataset = {}
  let aggDatasets = []
  let aggLabels = []
  // build new x-axis dataset i.e. timeseries order
  for (let cda of dataSets) {
    aggLabels.push(cda.data.chartPackage.labels)
    aggDatasets.push(cda.data.chartPackage.datasets)
  }
  // add to y-axis list of datasets
  let newOLlabels = this.prepareOverlayLabels(aggLabels)
  let newDataset = this.prepareOverlayDatasetData(dataPrint, newOLlabels, aggDatasets, sourceData, dataPrints)
  // update chartOptions ie. title, legends, scale if needed etc.
  let newOptions = this.updateChartOptions(dataSets, 'overlay')
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
  let numberTimeHolder = []
  for (let label of labelsIN) {
    let numtime = this.textDatetoNumberFormat(label)
    numberTimeHolder.push(numtime)
  }
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
    let chartBundle = dsc[0]
    chartBundle.data = newDatasets[countDS] // need to match to right dataset
    // chartBundle.fillColor = this.colourList(chartBundle.fillColor)
     chartBundle.borderColor = this.colourList(chartBundle.borderColor, countDS)
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
ChartSystem.prototype.structureChartData = function (rule, cData, dtConvert) {
  let dataPrep = {}
  let splitDatax = cData.map(n => (n['2d11318841f43034df41de9b38ab5e77b6b01bcf'] * 1000))
  let splitDatay = cData.map(n => n[rule])
  dataPrep.xaxis = splitDatax
  dataPrep.yaxis = splitDatay
  return dataPrep
}

/**
*  take in two data set labels ie xaxis time series and return one
* @method mergeLabelData
*
*/
ChartSystem.prototype.mergeLabelData = function (baseLabel, newLabel) {
  //  is the time ie xaxis for one or more time periods?
  // based on whether new data set is long or shorter re do existing as neccessary
  let uniqueXaxis = []
  let flatten = [...baseLabel, ...newLabel]
  uniqueXaxis = flatten.filter((v, i, a) => a.indexOf(v) === i)
  const minuteConverter = time => {
    const [h, m] = time.split(':')
    return (+h + (+m/60)).toFixed(2)
  }
  let decTimeList = []
  uniqueXaxis.forEach(time => decTimeList.push({ time: time, number: minuteConverter(time) }))
  // sort date in order of day
  let sortTimeMinsDay = decTimeList.sort((a,b) => a.number-b.number)
  let textTimeSorted = []
  for (let ts of sortTimeMinsDay) {
    textTimeSorted.push(ts.time)
  }
  uniqueXaxis = []
  flatten = []
  textTimeSorted = []
  return textTimeSorted
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
  let dataTimeText = this.textDatetoNumberFormatDataset(dataIN)
  let count = 0
  // check per existing datasets
  for (let tsi of mergedLabel) {
    let include = dataTimeText.includes(tsi)
    if (include === true) {
      matchList.push(dataIN[count][dataPrint.triplet.datatype])
      count++
    } else {
      matchList.push(null)
    }
  }
  return matchList
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
    let matchLogic = dataIN.find(elem => elem['2d11318841f43034df41de9b38ab5e77b6b01bcf'] === timePoint)
    if (matchLogic) {
      matchList.push(matchLogic[dataPrint.triplet.datatype])
    } else {
      matchList.push(null)
    }
    count++
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
*  take in two data set labels ie xaxis time series and return one
* @method mergeLabelData
*
*/
ChartSystem.prototype.mergeLabelDataOLD = function (longLabel, liveData, newData) {
  let uniqueXaxis = []
  // for (let visDat of liveData.chartPackage.datase) {
  let flatten = [...longLabel.chartPackage.labels, ...newData.chartPackage.labels]
  uniqueXaxis.push(flatten.filter((v, i, a) => a.indexOf(v) === i))
  // }
  return uniqueXaxis
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
* convert time text to number
* @method textDatetoNumberFormat
*
*/
ChartSystem.prototype.textDatetoNumberFormat = function (labelIN) {
  let timePrep = []
  for (let li of labelIN) {
    let numDate = new Date(li)
    let timeFormat = moment(numDate).format('HH:mm').valueOf()  // .format('YYYY-MM-DD hh:mm')
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
    let fullTime = li['2d11318841f43034df41de9b38ab5e77b6b01bcf'] * 1000
    let numDate = new Date(fullTime)
    let timeFormat = moment(numDate).format('HH:mm').valueOf()  // .format('YYYY-MM-DD hh:mm')
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
    let fullTime = li['2d11318841f43034df41de9b38ab5e77b6b01bcf'] * 1000
    // let numDate = new Date(fullTime)
    //let timeFormat = moment(numDate).valueOf() // format('YYYY-MM-DD HH:mm').valueOf()  // .format('YYYY-MM-DD hh:mm')
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
    let timeFormat = moment(li).toDate()  // .format('YYYY-MM-DD hh:mm')
    let tsimp = moment(timeFormat).format('llll')
    timePrep.push(tsimp)
  }
  return timePrep
}

/**
* prepare the x axis data array
* @method prepareLabelchart
*
*/
ChartSystem.prototype.prepareLabelchartTS = function (labelIN) {
  let timePrep = []
  let count = 1
  for (let li of labelIN) {
    let unixtime = li * 1000
    let timeFormat = moment(unixtime).toDate()  // .format('YYYY-MM-DD hh:mm')
    let tsimp = moment(timeFormat).format('MM-DD kk:mm')
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

export default ChartSystem
