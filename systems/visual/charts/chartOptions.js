'use strict'
/**
*  ChartOptions
*
*
* @class ChartOptions
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
const util = require('util')
const events = require('events')
const moment = require('moment')

var ChartOptions = function () {
  events.EventEmitter.call(this)
  this.options = {}
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(ChartOptions, events.EventEmitter)

/**
* set ChartOptions chartJS
* @method prepareChartOptions
*
*/
ChartOptions.prototype.prepareChartOptions = function (title, datatypes, scale) {
  var localthis = this
  // let yAxisOptions = this.prepareYoptions(datatypes, scale)
  /* let options = {
    responsive: true,
    spanGaps: true,
    tooltips: {
      mode: 'index',
      intersect: true
    },
    stacked: false,
    title: {
      display: true,
      text: title
    },
    scales: {
      xAxes: [{
        display: true,
        barPercentage: 0.1,
        type: 'time',
        time: {
          format: 'YYYY-MM-DD hh:mm',
          // round: 'day'
          tooltipFormat: 'll HH:mm'
        },
        position: 'bottom',
        ticks: {
          maxRotation: 75,
          reverse: true
        }
      }],
      yAxes: yAxisOptions
    },
    annotation: {
      events: ['click'],
      annotations: [{
        drawTime: 'afterDatasetsDraw',
        type: 'line',
        mode: 'horizontal',
        scaleID: 'bpm',
        value: 0,
        borderColor: 'cyan',
        borderWidth: 6,
        label: {
          enabled: true,
          content: 'average daily heart rate'
        },
        draggable: true,
        onClick: function (e) {
        }
      },
      {
        drawTime: 'afterDatasetsDraw',
        type: 'line',
        mode: 'horizontal',
        scaleID: 'bpm',
        value: 0,
        borderColor: 'pink',
        borderWidth: 6,
        label: {
          enabled: true,
          content: 'average resting heart rate'
        },
        draggable: true,
        onClick: function (e) {
        }
      },
      {
        id: 'time',
        scaleID: 'x-axis-0',
        type: 'line',
        mode: 'vertical',
        value: 0,
        borderColor: 'blue',
        borderWidth: 12,
        label: {
          enabled: true,
          content: 'start point'
        },
        draggable: true,
        onClick: function (e) {
          localthis.analysisStart = options.value
        },
        onDrag: function (event) {
          localthis.analysisStart = event.subject.config.value
        }
      },
      {
        id: 'time2',
        scaleID: 'x-axis-0',
        type: 'line',
        mode: 'vertical',
        value: 0,
        borderColor: '#7A33FF',
        borderWidth: 12,
        label: {
          enabled: true,
          content: 'end point'
        },
        draggable: true,
        onClick: function (et) {
          localthis.analysisEnd = options.value
        },
        onDrag: function (eventt) {
          localthis.analysisEnd = eventt.subject.config.value
        }
      }]
    }
  } */
  let options = {}
  return options
}

/**
* prepare the y axis options
* @method prepareYoptions
*
*/
ChartOptions.prototype.prepareYoptions = function (datatypes, scale) {
  // prepare y axis dependent up how many datatypes plot
  let yAxisPrep = []
  let leftorrigh = ''
  let idAxis = ''
  let counter = 0
  for (let dti of datatypes) {
    if (counter === 0) {
      leftorrigh = 'left'
      idAxis = dti.text // 'temperature' // 'bpm'
    } else {
      leftorrigh = 'right'
      idAxis = dti.text // 'SDS_P1' // 'steps'
    }
    counter++
    let yItem = {
      type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
      display: true,
      position: leftorrigh,
      id: idAxis,
      ticks: {
        beginAtZero: true,
        steps: 10,
        stepValue: 5,
        max: scale
      },
      scaleLabel: {
        display: true,
        labelString: dti.text
      }
    }
    yAxisPrep.push(yItem)
  }
  return yAxisPrep
}

/**
* return the data Statistics structure requested
* @method updateChartoptions
*
*/
ChartOptions.prototype.updateChartoptions = function (labelchart, options) {
  var startChartDate = moment(labelchart[0])
  this.liveTime = startChartDate
  let setstartTime = this.newDate(startChartDate) // moment('12/21/2018', 'MM-DD-YYYY')
  let setstartTime2 = this.newDateEnd(startChartDate) // moment('12/21/2018', 'MM-DD-YYYY')
  options.annotation.annotations[2].value = setstartTime
  options.annotation.annotations[3].value = setstartTime2
  return options
}

/**
* update the vertical start line
* @method newDate
*
*/
ChartOptions.prototype.newDate = function (selectDay) {
  var startTime = moment.utc(selectDay).startOf('day')
  const time = moment.duration('2:0:00')
  startTime.add(time)
  return startTime
}

/**
* ser vertical end time line
* @method newDateEnd
*
*/
ChartOptions.prototype.newDateEnd = function (endTimeIN) {
  var nowTime2 = moment(endTimeIN)
  var startTime2 = moment.utc(nowTime2).startOf('day')
  var time2 = moment.duration('4:0:00')
  startTime2.add(time2)
  return startTime2
}

export default ChartOptions
