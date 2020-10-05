'use strict'
/**
*  AutomationManager - update computes, library and ledgers
*
*
* @class AutomationManager
* @package    safeFlow
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import events from 'events'
// import pollingtoevent from 'polling-to-event'

var AutomationManager = function (apiCNRL, auth) {
  events.EventEmitter.call(this)
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(AutomationManager, events.EventEmitter)

/**
* Read KBL and setup defaults for this peer
* @method peerKBLstart
*
*/
AutomationManager.prototype.assessAutomation = function () {
  // look up list of save experiment contracts and assess compute automation setting save
  return false
}

/**
* check if automation list and setting need updating?
* @method updateAutomation
*
*/
AutomationManager.prototype.updateAutomation = function (settings) {
  console.log('automation UPDATE')
  console.log(settings)
  // check if need added, updated or delete from automation (ledger)/ list
  return true
}

export default AutomationManager
