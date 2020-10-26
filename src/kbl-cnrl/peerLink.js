'use strict'
/**
*  peerLink interface to Peer to Peer Infrastructure
*
*
* @class PeerLink
* @package    PeerLink
* @copyright  Copyright (c) 2020 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
const util = require('util')
const events = require('events')

var WebSocketClient = require('websocket').client
var client = new WebSocketClient()

var PeerLink = function () {
  console.log('peerlink started')
  events.EventEmitter.call(this)
  this.commWebSocket()
}

/**
* inherits core emitter class within this class
* @method inherits
*/
util.inherits(PeerLink, events.EventEmitter)

/**
*  communciate with websocket (api)
* @method commWebSocket
*
*/
PeerLink.prototype.commWebSocket = function () {
  console.log('PeerLink active')
  client.on('connectFailed', function(error) {
      console.log('Connect Error: ' + error.toString());
  })

  client.on('connect', function(connection) {
      console.log('WebSocket Client Connected')
      connection.on('error', function(error) {
          console.log("Connection Error: " + error.toString());
      })
      connection.on('close', function() {
          console.log('echo-protocol Connection Closed');
      })
      connection.on('message', function(message) {
          if (message.type === 'utf8') {
              console.log("Received: '" + message.utf8Data + "'");
          }
      })

      function sendNumber() {
          if (connection.connected) {
              var number = Math.round(Math.random() * 0xFFFFFF)
              connection.sendUTF(number.toString())
              setTimeout(sendNumber, 2000)
          }
      }
      sendNumber()
  });

  client.connect('ws://localhost:9888')

}

export default PeerLink
