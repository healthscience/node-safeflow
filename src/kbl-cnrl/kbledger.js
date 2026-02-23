'use strict'
/**
*  Knowledge Bundle Ledger
*
*
* @class KBLedger
* @package    KBLedger
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import KBLstorage from './kblStorage.js'
import { EventEmitter } from 'events'

class KBLedger extends EventEmitter {
  constructor(apiCNRL, setIN) {
    super()
    this.liveKBLStorage = new KBLstorage(setIN)
    this.liveAPI = apiCNRL
  }

  /**
  *  initialise forming of KBL
  * @method genesisKBL
  *
  */
  genesisKBL() {
    let newLedger = 'new'
    return newLedger
  }

  /**
  *
  * @method kbIndexQuery
  *
  */
  async kbIndexQuery(cnrl, n) {
    // latest nxp and ledger entries, CNRL contract look ups
    let indexKBLedger = await this.liveKBLStorage.getKBLindex(cnrl, n)
    return indexKBLedger
  }

  /**
  * reads KBIDS and extracts components
  * @method kbidReader
  *
  */
  async kbidReader(kbid) {
    let kbData = await this.liveKBLStorage.kblEntry(kbid)
    return kbData
  }

  /**
  * save KBID entry
  * @method kbidEntrysave
  *
  */
  async kbidEntrysave(kbidi) {
    let kbData = await this.liveKBLStorage.saveKBID(kbidi)
    return true
  }

  /**
  * save KBID INDEX
  * @method kbidINDEXsave
  *
  */
  async kbidINDEXsave(kbidi) {
    let kbData = await this.liveKBLStorage.saveKBIDindex(kbidi)
    return kbData
  }

  /**
  * save or get start Status data
  * @method startSettings
  *
  */
  async startSettings(flag, bundle) {
    let startStatusData = []
    if (flag === 'save') {
      startStatusData = await this.liveDataSystem.saveStartStatus(bundle)
    } else if (flag === 'retreive') {
      startStatusData = await this.liveTestStorage.getStartSettings()
    } else if (flag === 'remove') {
      startStatusData = await this.liveDataSystem.removeStartStatus(bundle)
    } else if (flag === 'removedash') {
      startStatusData = await this.liveDataSystem.removeStartDash(bundle)
    }
    return startStatusData
  }
}

export default KBLedger
