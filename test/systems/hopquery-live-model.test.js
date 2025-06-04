import { describe, it, expect } from 'vitest';
import ComputeSystem, { registerModelLoader } from '../../src/systems/compute/computeSystem.js';

describe('a BLIND HOPquery with data, model already active ie. many compute at same model', () => {
  let computeSystem;
  let contract;

  beforeEach(async () => {
    contract = {
      key: 'wasm-key',
      value: {
        refcontract: 'compute',
        concept: {},
        computational: {
          primary: true,
          name: 'average-statistics',
          description: 'WASM model',
          dtprefix: 'null',
          code: '', // WASM models do not use code
          hash: '064158be46a97526a800311ff339f0a0b37afd936c0d8859c07ee3b70cbabc0c',
          mode: 'wasm'
        }
      }
    };
    computeSystem = new ComputeSystem({ publicLibrary: [] }); // Initialize with an empty
    // register the average compute wasm
    await computeSystem.registerModel(contract)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await computeSystem.loadModelFromComputeEngine(contract);

  });

  
  it('model live in compute-engine simply do compute - average', async () => {
    const inputData = {}
    inputData.data = [{ key: 'a', data: 1 }, { key: 'b', data: 2 }, { key: 'c', data: 3 }, {key: 'd',  data: 4 }, {key: 'e',  data: 5 }];
    const result = await computeSystem.computationSystem(contract, {}, inputData);
    expect(result.state).toBe(true);
    expect(result.result[0].data).toBe(3);
  });
});