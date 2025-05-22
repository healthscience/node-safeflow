import { describe, it, expect } from 'vitest';
import ComputeSystem from '../../src/systems/compute/computeSystem.js'; // Adjust the import based on your actual usage

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
});

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
});