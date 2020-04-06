'use strict'
/**
*  DML  decentralised machine learning
*
*
* @class DMLnetwork
* @package    DML protocol
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
const util = require('util')
const events = require('events')

var DMLnetwork = function () {
  events.EventEmitter.call(this)
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(DMLnetwork, events.EventEmitter)

/**
*  get base time from LKN
* @method connectDML
*
*/
DMLnetwork.prototype.connectDML = function (peerIN) {
}

export default DMLnetwork
