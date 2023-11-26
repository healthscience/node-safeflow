import assert from 'assert'
import SafeFlow from '../src/index.js'
import HQB from 'hop-query-builder'

describe('Bring SafeFlow to be and blind HOP query via HQB', function () {
  it('connecting server, socket, safeflow', function () {
    // for the HOP query
    let liveHQB = new HQB()
    // bind query
    let hqbHolder = {}
    let publicLibrary = []
    let blindFileName = ''
    queryBundle = liveHQB.queryPath(hqbHolder, publicLibrary, blindFileName)
    let liveSF = new SafeFlow()
    // console.log(liveSF)
    // perform the query
    liveSF.startFlow(queryBundle)

  })
})
