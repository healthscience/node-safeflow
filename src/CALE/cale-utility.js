'use strict'
/**
*  CALE
*
*
* @class CALE
* @package    CALE  AI Utility - ethical review https://docs.google.com/document/d/1JvcsMgHy4nisuz0Tx7n6tNaAYFU6liEhIn-03r8_k_s/edit?usp=sharing
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$  0.01
*/

const util = require('util')
const events = require('events')

var CALE = function (setIN) {
  events.EventEmitter.call(this)
  this.liveDataSystem = {}
  this.caledata = []
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(CALE, events.EventEmitter)

/**
*  select model and create future data
* @method learn
*
*/
CALE.prototype.learn = function (dataSystem, systemBundle, model, timeInfo) {
  this.liveDataSystem = dataSystem
  if (model === 'tomorrow') {
    this.createTomorrow(systemBundle, timeInfo)
  }
}

/**
*  select model and create future data
* @method createTomorrow
*
*/
CALE.prototype.createTomorrow = function (systemBundle, timeInfo) {
  let updateTimeQuery = {}
  systemBundle.time = updateTimeQuery
  // setup WASM model file and start data flow via SAFEflow
  this.liveDataSystem.datatypeQueryMapping(systemBundle, timeInfo)
}

/**
*  select model and create future data
* @method createTomorrow
*
*/
CALE.prototype.importModel = function (model) {
  // the model has to prepare data for the future date.  The ML model will self score its predictions and when resources available learn itself e.g. will it find weekly patterns?
  // call network address for WASM file and hashcheck
  // this.liveCNRL.lookUp(model.cnrl)
}

export default CALE
