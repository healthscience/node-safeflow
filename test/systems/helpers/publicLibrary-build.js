'use strict'
/**
*  LibraryUtility
*
*
* @class LibraryUtility
* @package    LibraryUtility
* @copyright  Copyright (c) 2023 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
// import EventEmitter from 'events'
import LibraryManager from 'library-hop'

class LibraryUtility { //  extends EventEmitter {

  constructor(HolepunchHOP) {
    // super()
    this.liveHolepunch = HolepunchHOP
    this.libraryManager = new LibraryManager(this.liveHolepunch)
  }

  /**
  * Prepare table for public experiment list available
  * @method preparePublicNXPlist
  *
  *
  */
  setupMinLibrary = async function () {
    let defaultConts = this.prepareDefaultContracts()
    for (let message of defaultConts) {
      //this.sendMessage(contract)
      await this.libraryManager.libraryManage(message)
    }
    // ask for library updates
    let publibData = await this.liveHolepunch.BeeData.getPublicLibraryRange(100)
    return publibData
  }

  /**
  * Prepare table for public experiment list available
  * @method preparePublicNXPlist
  *
  *
  */
  preparePublicNXPlist = function (pubExpModules) {
    let gridColumns = ['id', 'name', 'description', 'time', 'device', 'action']
    let gridDatapeer = this.expandModulesrefs(pubExpModules)
    let gridPublic = {}
    gridPublic.columns = gridColumns
    gridPublic.data = gridDatapeer
    return gridPublic
  }

  /**
  * expand moudle reference to reference contract
  * @method expandModulesrefs
  *
  *
  */
  expandModulesrefs = function (pubExpModules) {
    let expandRF = []
    let expandSafeFlowStructure = []
    
    for (let pubex of pubExpModules.experiment) {
      // now expand out modlues
      for (let modr of pubex.value.modules) {
        // match to module contract
        let modMatch = {}
        for (let modc of pubExpModules.module) {
          if (modc.key === modr) {
            modMatch = modc
          }
        }
        // match ref to ref contract
        let refTypes = ['question', 'packaging', 'compute', 'visualise']
        for (let reft of refTypes) {
          for (let refi of pubExpModules[reft]) {
            if (modMatch?.value?.info?.key === refi?.key) {
              expandRF.push(refi)
            }
          }
        }
      }
      for (let exrc of expandRF) {
        if (exrc.value.refcontract  === 'question') {
          expandSafeFlowStructure.push({ id: pubex.key, name: exrc.value.concept.name, description: '--', time: Infinity, device: 'Yes', action: 'Join' })
        }
      }
      expandRF = []
    }
    /*
    const uniqueNXP = expandSafeFlowStructure.filter((value, index, self) =>
      index === self.findIndex((t) => (
          t.id === value.id
      ))
    )
    */
    return expandSafeFlowStructure
  }

  /**
  * Prepare table from bentospace saved list
  * @method prepareBentoSpaceJoinedNXPlist
  *
  */
  prepareBentoSpaceJoinedNXPlist = function (peerExpModules, publicRefContracts) {
    let gridColumns = ['id', 'name', 'description', 'time', 'device', 'action']
    let gridDatapeer = []
    for (let expMods of peerExpModules) {
      let gridExp = this.prepareBentoSpaceExperimentSummary(expMods, publicRefContracts)
      gridDatapeer.push(gridExp)
    }
     let gridPeer = {}
    gridPeer.columns = gridColumns
    gridPeer.data = gridDatapeer
    return gridPeer
  }

  /**
  * 
  * extract info. from contracts for display in list format
  * @method prepareBentoSpaceExperimentSummary
  *
  */
  prepareBentoSpaceExperimentSummary = function (peerExpModules, refContractsPublic) {
    let gridDatapeer = {}
    let question2 = {}
    for (let mod of peerExpModules.modules) {
      // look up question
      if (typeof mod.value.info === 'object' && Object.keys(mod.value.info).length > 0) {
        if (mod.value.style === 'question') {
          // get full ref contract
          let fullRef = this.matchRefContract(mod.value.info.key, refContractsPublic, 'question')
          question2 = fullRef.value.concept.name
        } else {
          question2 = 'none'
        }
      }
      if (question2 !== 'none') {
        gridDatapeer = { id: peerExpModules.exp.key, name: question2, description: '--', time: Infinity, dapps: 'Yes', device: 'Yes', action: 'Add-to' }
      }
    }
    return gridDatapeer
  }

  /**
  * 
  * select the network public experiment contract for HOP
  * @method matchPublicNXPcontract
  *
  */
  matchPublicNXPcontract = function (contractID, nxpList) {
    let contractNXP = {}
    for (let nxp of nxpList) {
      if (nxp.exp.key === contractID) {
        contractNXP = nxp
      }
    }
    return contractNXP
  }

  /**
  * 
  * update reference contract settings for join nxp contract
  * @method updateSettings
  *
  */
  updateSettings = function (contract, updates) {
    let updateNXPjoinContract = {}

    return updateNXPjoinContract
  }

  /**
  * 
  * select the network experiment contract for HOP
  * @method matchNXPcontract
  *
  */
  matchNXPcontract = function (contractID, nxpList) {
    let contractNXP = {}
    for (let nxp of nxpList) {
      if (nxp.exp.key === contractID) {
        contractNXP = nxp
      }
    }
    return contractNXP
  }

  /**
  * 
  * match ref contract id to full ref contract
  * @method matchRefContract
  *
  */
  matchRefContract = function (contractID, refList, reftype) {
    let refContract = {}
    for (let ref of refList[reftype]) {
      if (ref.key === contractID) {
        refContract = ref
      }
    }
    return refContract
  }


  /* 
  * provide summary of experiment to use in bentobox
  * @method boxLibrarySummary
  *
  */
  boxLibrarySummary = function (modules) {
    let modKeys = []
    for (let mod of modules) {
      modKeys.push(mod)
    }
    return modKeys
  }

  /* 
  * extract settings for open data toolbars
  * @method moduleExtractSettings
  *
  */
  moduleExtractSettings = function (modulesList) {
    let modSettings = {}
    for (let mod of modulesList) {
      if (mod !== undefined) {
        if (mod.value.style === 'compute') {
          // modSettings.xaxis = ['time'] // mod.value.info.settings.xaxis
          // modSettings.yaxis = mod.value.info.settings.yaxis
          // modSettings.category = mod.value.info.settings.category
          modSettings.devices = mod.value.info.settings.devices
        } else if (mod.value.style === 'packaging') {
          modSettings.xaxis = ['time'] // mod.value.info.settings.xaxis
          modSettings.yaxis = mod.value.info.value.concept.tablestructure
          modSettings.category = mod.value.info.value.concept.category
        }
      }
    }
    return modSettings
  }

  /**
  * expand single cue expand
  * @method expandCuesDTSingle
  *
  */
  expandCuesDTSingle = function (cueContract, publicLibrary) {
    let expandDTCue = cueContract
    // match datatype key to contract
    let dtContract = this.matchRefContract(cueContract.value.concept.settings.datatype, publicLibrary, 'datatype')
    expandDTCue.value.concept.settings.datatype = dtContract
    return expandDTCue
  }

  /**
  * expand out cue contract with datatypes
  * @method expandCuesDT
  *
  */
  expandCuesDT = function (cueList, publicLibrary) {
    let expandDTCue = []
    for (let relC of cueList) {
      // match datatype key to contract
      let dtContract = this.matchRefContract(relC.datatype, publicLibrary, 'datatype')
      relC.datatype = dtContract
      expandDTCue.push(relC)
    }
    return expandDTCue
  }
 
  /**
  * default contracts for time datatype  observation compute  chartjs visualisation
  * @method prepareDefaultContracts
  *
  */
  prepareDefaultContracts = function () {
    let libContracts = []
    // library minimum
    let timeContract = this.prepareDefaultMessage('datatype')
    let computeContract = this.prepareDefaultMessage('compute')
    let visualiseContract = this.prepareDefaultMessage('visualise')
    let averageComputeContract = this.prepareAverageComputeMessage()
    libContracts.push(timeContract)
    libContracts.push(computeContract)
    libContracts.push(visualiseContract)
    libContracts.push(averageComputeContract)
    return libContracts
  }

  /**
  * prepare save contract message
  * @method prepareDefaultMessage
  *
  */
  prepareDefaultMessage = function (contract) {
    const refContract = {}
    refContract.type = 'library'
    refContract.action = 'contracts'
    refContract.reftype = contract
    refContract.task = 'PUT'
    refContract.privacy = 'public'
    if (contract === 'question') {
      refContract.data = {}
    } else if (contract === 'datatype') {
      let dtSettings = {}
      dtSettings.primary =  true
      dtSettings.name = 'time'
      dtSettings.description = 'rolling out of universe'
      dtSettings.wiki = 'https://en.wikipedia.org/wiki/Timestamp'
      dtSettings.rdf = 'https://dbpedia.org/page/Timestamp'
      dtSettings.measurement = 'Integer' 
      dtSettings.datatypeType = 'datatype'
      refContract.data = dtSettings
    } else if (contract === 'compute') {
      let compSettings = {}
      compSettings.primary = true
      compSettings.name = 'observation'
      compSettings.description = 'source data'
      compSettings.dtprefix = 'null'
      compSettings.code = 'null'
      compSettings.hash = 'null'
      refContract.data = compSettings
    } else if (contract === 'packaging') {
      refContract.data = {}
    } else if (contract === 'visualise') {
      let visSettings = {}
      visSettings.primary = Boolean
      visSettings.name = 'chartjs'
      visSettings.description = 'charting visualisations'
      visSettings.structureName = 'datasets'
      visSettings.visHolder = ''
      refContract.data = visSettings
    }
    return refContract
  }

  /**
  * prepare save contract message
  * @method prepareAverageComputeMessage
  *
  */
  prepareAverageComputeMessage = function () {
    const refContract = {}
    refContract.type = 'library'
    refContract.action = 'contracts'
    refContract.reftype = 'compute'
    refContract.task = 'PUT'
    refContract.privacy = 'public'
    let compSettings = {}
    compSettings.primary = true
    compSettings.name = 'average'
    compSettings.description = 'statistical mean'
    compSettings.dtprefix = 'null'
    compSettings.code = ''
    compSettings.hash = ''
    refContract.data = compSettings
    return refContract
  }

  /**
  * default cues contracts
  * @method prepareDefaultCues
  *
  */
  prepareDefaultCues = function () {
    let libContracts = []
    // cues setup
    let cuesDatatypes = this.prepareFirstCues('datatype-gaia')
    libContracts.push(cuesDatatypes)
    let cuesDatatypes2 = this.prepareFirstCues('datatype-nature')
    libContracts.push(cuesDatatypes2)
    let cuesDatatypes3 = this.prepareFirstCues('datatype-environment')
    libContracts.push(cuesDatatypes3)
    let cuesDatatypes4 = this.prepareFirstCues('datatype-culture')
    libContracts.push(cuesDatatypes4)
    let cuesDatatypes5 = this.prepareFirstCues('datatype-life')
    libContracts.push(cuesDatatypes5)
    return libContracts
  }

  /**
  * prepare all types of contracts to make cues
  * @method prepareFirstCues
  *
  */
  prepareFirstCues = function (contract) {
    const refContract = {}
    refContract.type = 'library'
    refContract.action = 'contracts'
    refContract.reftype = contract
    refContract.task = 'PUT'
    refContract.privacy = 'public'
    if (contract === 'cue') {
      refContract.data = {}
    } else if (contract === 'datatype-gaia') {
      let dtSettings = {}
      dtSettings.primary =  true
      dtSettings.name = 'gaia'
      dtSettings.description = 'rolling out of universe'
      dtSettings.wiki = 'https://en.wikipedia.org/wiki/Gaia_hypothesis'
      dtSettings.rdf = 'https://dbpedia.org/page/Gaia_hypothesis'
      dtSettings.measurement = 'Integer' 
      dtSettings.datatypeType = 'datatype'
      refContract.data = dtSettings
    } else if (contract === 'datatype-nature') {
      let dtSettings = {}
      dtSettings.primary =  true
      dtSettings.name = 'gaia'
      dtSettings.description = 'rolling out of universe'
      dtSettings.wiki = 'https://en.wikipedia.org/wiki/Nature'
      dtSettings.rdf = 'https://dbpedia.org/page/Nature'
      dtSettings.measurement = 'Integer' 
      dtSettings.datatypeType = 'datatype'
      refContract.data = dtSettings
    } else if (contract === 'datatype-environment') {
      let dtSettings = {}
      dtSettings.primary =  true
      dtSettings.name = 'environment'
      dtSettings.description = 'man molding of nature'
      dtSettings.wiki = 'https://en.wikipedia.org/wiki/Built_environment'
      dtSettings.rdf = 'https://dbpedia.org/page/Built_environment'
      dtSettings.measurement = 'Integer' 
      dtSettings.datatypeType = 'datatype'
      refContract.data = dtSettings
    } else if (contract === 'datatype-culture') {
      let dtSettings = {}
      dtSettings.primary =  true
      dtSettings.name = 'culture'
      dtSettings.description = 'human innovation arts to tech'
      dtSettings.wiki = 'https://en.wikipedia.org/wiki/Culture'
      dtSettings.rdf = 'https://dbpedia.org/page/Culture'
      dtSettings.measurement = 'Integer' 
      dtSettings.datatypeType = 'datatype'
      refContract.data = dtSettings
    } else if (contract === 'datatype-life') {
      let dtSettings = {}
      dtSettings.primary =  true
      dtSettings.name = 'life'
      dtSettings.description = 'the game of life'
      dtSettings.wiki = 'https://en.wikipedia.org/wiki/Life'
      dtSettings.rdf = 'https://dbpedia.org/page/Life'
      dtSettings.measurement = 'Integer' 
      dtSettings.datatypeType = 'datatype'
      refContract.data = dtSettings
    }
    return refContract
  }

}

export default LibraryUtility