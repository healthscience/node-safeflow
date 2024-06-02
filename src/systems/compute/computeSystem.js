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
  console.log('SF-computesyeam -- start')
  console.log(contract)
  let computeContract = {}
  // two conflict input needs correlct tmep fix
  if (contract.value.info.computational === undefined) {
    console.log('undief1')
    if (contract?.value?.info?.compute[0]?.value?.computational) {
      computeContract = contract.value.info.compute[0].value.computational.hash  
    } else {
      computeContract = contract?.value?.info?.compute[0].key
    }
  } else {
    console.log('undief2')
    computeContract = contract.value.info.compute.key
  }
  console.log('conract pass')
  console.log(computeContract)
  // let computeHash = contract?.value?.info?.compute.value.computational.hash
  // let checkHashComp = this.chechHashSource(computeHash)
  // if true go ahead with compute flow
  let computeStatus = {}
  if (computeContract === 'de55381bcc536926eb814480198f1f44ca14e5a6') {
    // observation compute contract leave data as is
    computeStatus.state = true
    computeStatus.data = data
  } else if (computeContract === '7217c36c086453209ac25b5aeb2e947d5ea1f237') {
    // first check hash of source compute
    computeStatus = this.liveAverage.averageSystemStart(contract, dataPrint, data)
  } else if (computeContract === 'sum') {
    computeStatus = this.liveSum.sumSystemStart(contract, data)
  } else if (computeContract === 'gh-12121212112') {
    computeStatus = this.linearregressionSystem(data, dataPrint)
  } else if (computeContract === 'autoregression') {
    computeStatus = this.autoregressionSystem(contract, data)
  }
  return computeStatus
}

/**
* check hash of source
* @method chechHashSource
*
*/
ComputeSystem.prototype.chechHashSource = function (claimHash) {
  // perform sumcheck or hash compare
  return true
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
