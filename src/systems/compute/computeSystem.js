'use strict'
/**
*  ComputeSystem
*
*
* @class ComputeSystem
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
// those packages in to be plug in on the fly TODO
import * as ss from 'simple-statistics'
import SumSystem from './sumSystem.js'
import AverageSystem from './averageSystem.js'
import RecoveryHeartrate from './wasm/recovery-heartrate.js'
import util from 'util'
import events from 'events'

var ComputeSystem = function (setIN) {
  events.EventEmitter.call(this)
  // ECS loader should plugin these files WIP
  this.liveSum = new SumSystem(setIN)
  this.liveAverage = new AverageSystem(setIN)
  this.liveRecoveryHR = new RecoveryHeartrate(setIN)
  this.lastComputeTime = {}
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(ComputeSystem, events.EventEmitter)

/**
* dynamically load computation from network TODO
* @method loadComputations
*
*/
ComputeSystem.prototype.loadComputations = function () {
  // query network library for compute contracts
  // then load in computation code ready for use when needed
}

/**
* computation gateway  // need function to call library to get list of active compoute contacts??? TODO
* @method computationSystem
*
*/
ComputeSystem.prototype.computationSystem = function (contract, dataPrint, data) {
  // match computation to approprate verified compute need LOADER to add what WASM is being used/required
  let computeCodehash = contract?.value?.info?.compute[0].value?.computational?.hash
  let computeStatus = {}
  if (computeCodehash === 'a7391efedc445038cf631940a04e08e3125164a7') {
    computeStatus.state = true
    computeStatus.data = data
  } else if (computeCodehash === '7217c36c086453209ac25b5aeb2e947d5ea1f237') {
    computeStatus = this.liveAverage.averageSystemStart(contract, dataPrint, data)
  } else if (computeCodehash === 'sum') {
    computeStatus = this.liveSum.sumSystemStart(contract, data)
  } else if (computeCodehash === 'gh-12121212112') {
    computeStatus = this.linearregressionSystem(data, dataPrint)
  } else if (computeCodehash === 'autoregression') {
    computeStatus = this.autoregressionSystem(contract, data)
  }
  return computeStatus
}

/**
* build data pairs for linear regression
* @method buildDatapairs
*
*/
ComputeSystem.prototype.buildDatapairs = function (data, dataPrint) {
  // strcuture required [[1, 2], [2, 3], [3, 4], [4, 8]
  let pairData = []
  for (let td of data) {
    pairData.push([td['d76d9c3db7f2212335373873805b54dd1f903a06'], td[dataPrint.triplet.datatype]])
  }
  return pairData
}

/**
* build future dataa
* @method buildFuturedata
*
*/
ComputeSystem.prototype.buildFuturedata = function (data, dataPrint, regressionVariables) {
  // single example console.log(ss.linearRegressionLine(regressionVariables)(7)))
  // expand the trend by length of past data or by peer input
  let futureSequence = []
  let inputLength = data.length
  let lastPastx = data[data.length - 1]
  for (let i = 0; i < inputLength; i++) {
    let seqBuilder = parseInt(lastPastx['d76d9c3db7f2212335373873805b54dd1f903a06']) + i
    futureSequence.push(seqBuilder)
  }
  let futureData = []
  for (let fd of futureSequence) {
    let futureValue = ss.linearRegressionLine(regressionVariables)(fd)
    let futureDataPair = {}
    futureDataPair['d76d9c3db7f2212335373873805b54dd1f903a06'] = fd
    futureDataPair[dataPrint.triplet.datatype] = Math.round(futureValue * 10) / 10
    futureData.push(futureDataPair)   
  }
  return futureData
}

/**
* does this data ask need updating? Y N
* @method recoverySystem
*
*/
ComputeSystem.prototype.linearregressionSystem = function (data, dataPrint) {
  let regressionPair = this.buildDatapairs(data, dataPrint)
  let regressionVariables = ss.linearRegression(regressionPair)
  // line pair reprepare
  let regressionLine = this.buildFuturedata(data, dataPrint, regressionVariables)
  return regressionLine
}

/**
* does this data ask need updating? Y N
* @method recoverySystem
*
*/
ComputeSystem.prototype.recoverySystem = async function (compInfo, rawIN, deviceList) {
  let statusHolder = {}
  let stateHolder = {}
  if (compInfo.status === false) {
    statusHolder.lastComputeTime = 0
    statusHolder.status = 'update-required'
    stateHolder.timeStart = compInfo.rangeTime.startTime
    stateHolder.lastComputeTime = compInfo.rangeTime.endTime
  } else if (compInfo.status === true) {
    // need to loop over per devices
    let computeTimeRange = compInfo.rangeTime
    for (let dvc of deviceList) {
      let updateStatus = await this.liveRecoveryHR.prepareRecoveryCompute(computeTimeRange, dvc)
    }
  }
  return stateHolder
}

export default ComputeSystem
