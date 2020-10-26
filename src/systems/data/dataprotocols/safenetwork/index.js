'use strict'
/**
*  SAFEnetwork manager
*
*
* @class SAFEmaster
* @package    safe API
* @copyright  Copyright (c) 2019 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
const util = require('util')
const events = require('events')
const safeNodeApp = require('@maidsafe/safe-node-app')
const app = require('electron').remote.app

var SAFEmaster = function () {
  events.EventEmitter.call(this)
  this.safeApp = {}
  this.md = {}
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(SAFEmaster, events.EventEmitter)

/**
*  fetch data from Content address
* @method safeGetData
*
*/
SAFEmaster.prototype.safeGetData = function (addressIN) {
}

/**
*  send authorisation request
* @method sendAuthRequest
*
*/
SAFEmaster.prototype.sendAuthRequest = async function () {
  console.log('Authorising SAFE application...')
  let customExecPath = [process.execPath, app.getAppPath()]
  const appInfo = {
    // User-facing name of our app. It will be shown
    // in the Authenticator user's interface.
    name: 'SAFEnetwork-DIYHS',
    // This is a unique ID of our app
    id: 'net.safe.network.fleming',
    version: '0.1.0',
    vendor: 'DIY HS LAB',
    bundle: 'com.github.electron',
    customExecPath
  }

  const opts = {
    forceUseMock: true
  }

  this.safeApp = await safeNodeApp.initialiseApp(appInfo, null, opts)
  const authUri = await this.safeApp.auth.genAuthUri({})
  await this.safeApp.auth.openUri(authUri)
}

/**
*  recieve response for access
* @method uponAuthResponset
*
*/
SAFEmaster.prototype.uponAuthResponse = async function (resAuthUri) {
  console.log('Authorisation response received')
  await this.safeApp.auth.loginFromUri(resAuthUri)
  console.log('Application connected to the network')

  const typeTag = 15000
  this.md = await this.safeApp.mutableData.newRandomPublic(typeTag)
  const initialData = {
    'random_key_1': JSON.stringify({
      text: 'Scotland to try Scotch whisky',
      made: false
    }),
    'random_key_2': JSON.stringify({
      text: 'Patagonia before I\'m too old',
      made: false
    })
  }
  await this.md.quickSetup(initialData)
}

/**
*  get data form network
* @method getItems
*
*/
SAFEmaster.prototype.getItems = async function () {
  const entries = await this.md.getEntries()
  let entriesList = await entries.listEntries()
  let items = []
  entriesList.forEach((entry) => {
    const value = entry.value
    if (value.buf.length === 0) return
    const parsedValue = JSON.parse(value.buf)
    items.push({ key: entry.key, value: parsedValue, version: value.version })
  })
  return items
}

/**
*  get data ITEM form network
* @method insertItem
*
*/
SAFEmaster.prototype.insertItem = async function (key, value) {
  const mutations = await this.safeApp.mutableData.newMutation()
  await mutations.insert(key, JSON.stringify(value))
  await this.md.applyEntriesMutation(mutations)
}

/**
*  updatedata ITEM to network
* @method updateItem
*
*/
SAFEmaster.prototype.updateItem = async function (key, value, version) {
  const mutations = await this.safeApp.mutableData.newMutation()
  await mutations.update(key, JSON.stringify(value), version + 1)
  await this.md.applyEntriesMutation(mutations)
}

/**
*  delete ITEM from network
* @method deleteItems
*
*/
SAFEmaster.prototype.deleteItems = async function (items) {
  const mutations = await this.safeApp.mutableData.newMutation()
  items.forEach(async (item) => {
    await mutations.delete(item.key, item.version + 1)
  })
  await this.md.applyEntriesMutation(mutations)
}

export default SAFEmaster
