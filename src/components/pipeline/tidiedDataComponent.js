'use strict'

class TidiedDataComponent {
  constructor(data, previousHash, hash) {
    this.data = data
    this.previousHash = previousHash
    this.hash = hash
    this.timestamp = Date.now()
  }
}

export default TidiedDataComponent
