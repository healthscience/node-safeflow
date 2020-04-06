'use strict'
/**
*  IPFS manager
*
*
* @class IPFSmaster
* @package    testStorage API
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
const util = require('util')
const events = require('events')

var IPFSmaster = function () {
  events.EventEmitter.call(this)
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(IPFSmaster, events.EventEmitter)

/**
*  fetch data from Content address
* @method ipfsGetData
*
*/
IPFSmaster.prototype.ipfsGetData = function (addressIN) {
}

export default IPFSmaster
