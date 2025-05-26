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
          mode: 'null'
        }
      }
    };
    const inputData = [1, 2, 3, 4, 5];
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
          hash: '60514b180fa029f751c4eb7b3e3e48d49b0182856988e589361bdae9e7fbb43b',
          mode: 'wasm'
        }
      }
    };
    const inputData = [1, 2, 3, 4, 5];
    const result = await computeSystem.computationSystem(contract, {}, inputData);
    console.log(result)
    expect(result.state).toBe(true);
    expect(result.result).toBe(3); // Update the expected result based on the new logic
  });
});

/*
describe('Blind Path Integration', () => {
  let computeSystem;

  beforeEach(() => {
    computeSystem = new ComputeSystem({ publicLibrary: [] }); // Initialize with an empty public library for testing
  });

  it('should process a number list through blind path - observation', async () => {
    const contract = {
      compute: [{ value: { computational: { name: 'observation' } } }]
    };
    const inputData = [1, 2, 3, 4, 5];
    const result = await computeSystem.computationSystem(contract, {}, inputData);
    expect(result.state).toBe(true);
    expect(result.result.data).toEqual(inputData); // Update the expected result based on the new logic
  });

  it('should process a number list through blind path - average', async () => {
    const contract = {
      compute: [{ value: { computational: { name: 'average' } } }]
    };
    const inputData = [1, 2, 3, 4, 5];
    const result = await computeSystem.computationSystem(contract, {}, inputData);
    expect(result.state).toBe(true);
    expect(result.result.result).toBe(3); // Update the expected result based on the new logic
  });
});*/