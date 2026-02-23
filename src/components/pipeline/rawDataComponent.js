'use strict'

class RawDataComponent {
  constructor(data, hash) {
    this.data = data
    this.hash = hash
    this.timestamp = Date.now()
  }
}

export default RawDataComponent
