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
import { EventEmitter } from 'events'
import moment from 'moment'

class ChartOptions extends EventEmitter {
  constructor() {
    super()
  }

  /**
  * set ChartOptions chartJS
  * @method prepareChartOptions
  *
  */
  prepareChartOptions(title, scale) {
    let settings = {}
    settings.title = title
    let options = {
      maintainAspectRatio: false,
      responsive: true,
      spanGaps: true,
      legend:
      {
        labels: {
          display: true,
          fontColor: 'black',
          fontSize: 16
        }
      },
      tooltips: {
        mode: 'index',
        intersect: true
      },
      stacked: false,
      title: {
        display: true,
        text: settings.title
      },
      scales: {
        xAxes: [{
          display: true,
          time: {
            format: 'YYYY-MM-DD hh:mm',
            tooltipFormat: 'll HH:mm'
          },
          position: 'bottom',
          ticks: {
            maxRotation: 75,
            reverse: false
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            steps: 10,
            stepValue: 5
          }
        }]
      },
      annotation: {
        events: ['click'],
        annotations: []
      }
    }
    return options
  }
}

export default ChartOptions
