'use strict'
/**
*  KBL crypto Utility
*
*
* @class KBLcrytoUtility
* @package    KBL Crypto
* @copyright  Copyright (c) 2020 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
const util = require('util')
const events = require('events')
const crypto = require('crypto')
const bs58 = require('bs58')
const hashObject = require('object-hash')

var KBLcryptoUtility = function () {
  events.EventEmitter.call(this)
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(KBLcryptoUtility, events.EventEmitter)

/**
*  make KBID hash
* @method hashKBID
*
*/
KBLcryptoUtility.prototype.hashKBID = async function (kEntry) {
  let hashKBID = ''
  return hashKBID
}

/**
*  create a new entity to hold KBIDs
* @method createKBID
*
*/
KBLcryptoUtility.prototype.entityID = function (addressIN) {
  // hash Object
  let kbundleHash = hashObject(addressIN)
  let tempTokenG = ''
  let salt = crypto.randomBytes(16).toString('base64')
  // let hashs = crypto.createHmac('sha256',salt).update(password).digest('base64')
  let hash = crypto.createHmac('sha256', salt).update(kbundleHash).digest()
  // const bytes = Buffer.from('003c176e659bea0f29a3e9bf7880c112b1b31b4dc826268187', 'hex')
  tempTokenG = bs58.encode(hash)
  // decode
  // const addressde = address
  // const bytes = bs58.decode(addressde)
  // console.log(bytes.toString('base64'))
  return tempTokenG
}

export default KBLcryptoUtility
