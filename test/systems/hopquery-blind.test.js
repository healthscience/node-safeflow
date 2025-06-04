import { describe, it, expect } from 'vitest';
import ComputeSystem from '../../src/systems/compute/computeSystem.js';

describe('a BLIND HOPquery with data, assume model not registered and needs loaded before compute', () => {
  let computeSystem;

  beforeEach(() => {
    computeSystem = new ComputeSystem({ publicLibrary: [] }); // Initialize with an empty public library for testing
  });

  it('should process a number list through blind path - observation', async () => {
    const contract = {
      key: 'observation-test',
      value: {
        refcontract: 'compute',
        concept: {},
        computational: {
          primary: true,
          name: 'observation',
          description: 'view raw data',
          dtprefix: 'null',
          code: 'null',
          hash: 'hash',
          mode: 'wasm'
        }
      }
    };
    const inputData = {}
    inputData.data = [{ key: 'a', data: 1 }, { key: 'b', data: 2 }, { key: 'c', data: 3 }, {key: 'd',  data: 4 }, {key: 'e',  data: 5 }];
    const result = await computeSystem.computationSystem(contract, {}, inputData);
    expect(result.state).toBe(true);
    expect(result.result).toEqual(inputData);
  });

  
  it('should process a number list through blind path - average', async () => {
    const contract = {
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
    const inputData = {}
    inputData.data = [{ key: 'a', data: 1 }, { key: 'b', data: 2 }, { key: 'c', data: 3 }, {key: 'd',  data: 4 }, {key: 'e',  data: 5 }];
    const result = await computeSystem.computationSystem(contract, {}, inputData);
    expect(result.state).toBe(true);
    expect(result.result[0].data).toBe(3); // Update the expected result based on the new logic
  });
});