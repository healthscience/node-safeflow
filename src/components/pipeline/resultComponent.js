'use strict'

class ResultComponent {
  constructor(result, previousHash, hash) {
    this.result = result
    this.previousHash = previousHash
    this.hash = hash
    this.timestamp = Date.now()
    this.savedToLedger = false
  }
}

export default ResultComponent
