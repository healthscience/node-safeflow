import { expect, it, describe, beforeAll } from 'vitest';
import HolepunchHOP from 'holepunch-hop'
import ComputeSystem from '../../src/systems/compute/computeSystem.js';
import PublicLibrarymin from './helpers/publicLibrary-build.js';

let holepunch;
let libraryHelper;
class MockWebSocket {
  constructor() {
    this.sentMessages = []
  }
  
  send(data) {
    this.sentMessages.push(data)
  }
  
  close() {}
}

beforeAll(async () => {
  console.log('before all start')
    const mockWs = new MockWebSocket()
    // setup store
    const storeName = 'test-hop-storage'
     holepunch = new HolepunchHOP(storeName)
    // Add timeout to prevent hanging
    console.log('start stores')
    // Wait for 3 seconds before proceeding
    await new Promise(resolve => setTimeout(resolve, 3000))
    holepunch.setWebsocket(mockWs)
    await holepunch.startStores()
    holepunch.on('hcores-active', () => {
      // count number of bee stores
      console.log(holepunch.BeeData.activeBees) 
    })
  await new Promise((resolve) => setTimeout(resolve, 3000))
  libraryHelper = new PublicLibrarymin(holepunch);
  console.log('end of beforelll')
});

describe('ComputeSystem Initial Preload', () => {

  it('should preload default models on initialization', async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    // Prepare default contracts using the helper
    const defaultLibraryContracts = await libraryHelper.setupMinLibrary();
    // Initialize ComputeSystem with the contracts
    const computeSystem = new ComputeSystem({ publicLibrary: defaultLibraryContracts });
    // Wait for the preloadModels to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check the compute contract observervation (javascript) and average (wasm) are loaded
    for (let compCont of defaultLibraryContracts) {
      if (compCont.value.refcontract === 'compute') {
        if (compCont.value.computational.mode === 'javascript') {
        } else if (compCont.value.computational.mode === 'wasm') {
          await computeSystem.loadModelFromComputeEngine(compCont);
          // Test the model
          const result = await computeSystem.computeEngine.models[compCont.value.computational.hash].compute([1, 2, 3, 4, 5], { useWasm: true });
          expect(result.result).toBe(3);
        }
      }
    }
    console.log('end of test')
  });

});