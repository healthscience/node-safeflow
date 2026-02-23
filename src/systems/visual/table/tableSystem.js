'use strict'
/**
*  tableSystem
*
*
* @class TableSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import { EventEmitter } from 'events'
import moment from 'moment'

class TableSystem extends EventEmitter {
  constructor() {
    super()
  }

  /**
  * return the data structure requested
  * @method structureTableData
  *
  */
  structureTableData(visBundle, vIN, data, range) {
    let tableHolder = []
    let tablePrepared = []
    let counter = 0
    let columNumber = 10
    let preparedTableHTML = ''
    for (let dev of visBundle.devices) {
      for (let dtl of visBundle.datatypes) {
        for (let tis of range) {
          if (data[tis] && data[tis][dev.device_mac] && data[tis][dev.device_mac][dtl.cnrl]) {
            for (let dae of data[tis][dev.device_mac][dtl.cnrl]['day']) {
              let lengthStatus = counter % columNumber
              if (lengthStatus === 0) {
                preparedTableHTML += '<tr>'
              }
              preparedTableHTML += '<td>'
              let timeConvert = moment(dae.timestamp * 1000).format('HH:mm')
              let dataP = ''
              if (dae.heart_rate === null || dae.steps === null) {
                dataP = '-'
              } else {
                if (dtl.cnrl === 'cnrl-8856388711') {
                  dataP = dae.heart_rate
                } else if (dtl.cnrl === 'cnrl-8856388712') {
                  dataP = dae.steps
                }
              }
              preparedTableHTML += timeConvert + ' --- ' + '<b>' + dataP + '</b>'
              preparedTableHTML += '</td>'
              if (lengthStatus === 9) {
                preparedTableHTML += '</tr>'
              }
              let rowTable = dae
              tablePrepared.push(rowTable)
              counter++
            }
          }
          tableHolder.push(preparedTableHTML)
          preparedTableHTML = ''
        }
      }
    }
    return tableHolder
  }
}

export default TableSystem
