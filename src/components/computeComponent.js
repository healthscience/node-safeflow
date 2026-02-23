'use strict'
/**
*  ComputeComponent
*
*
* @class ComputeComponent
* @package    safeFlow
* @copyright  Copyright (c) 2025 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import ComputeSystem from '../systems/compute/computeSystem.js'
import { EventEmitter } from 'events'

class ComputeComponent extends EventEmitter {
  constructor(setIN) {
    super()
    this.computeCNRLlist = []
    this.liveComputeSystem = new ComputeSystem(setIN)
    this.computeStatus = false
    this.compute = {}
  }

  /**
  * Process compute request through the compute system
  * @method filterCompute
  * @param {object} contract - Compute contract
  * @param {object} dataPrint - Data print configuration
  * @param {object} data - Input data
  * @returns {Promise<object>} Compute result
  */
  async filterCompute(contract, dataPrint, data) {
    let nxporBlind = typeof contract.value.info
    let contractLive = {}
    if (nxporBlind === 'object') {
      contractLive = { key: '', value: contract.value.info }
    } else {
      contractLive = contract.value.info.compute[0]
    }
    try {
      const computeState = await this.liveComputeSystem.computationSystem(contractLive, dataPrint, data)
      this.compute = computeState
      return this.compute
    } catch (error) {
      console.error('Compute component error:', error)
      return {
        state: false,
        error: error.message,
        timestamp: Date.now()
      }
    }
  }
}

export default ComputeComponent
