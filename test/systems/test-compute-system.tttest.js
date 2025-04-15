import { describe, it, expect, beforeEach } from 'vitest';
import ComputeSystem from '../../src/systems/compute/computeSystem.js';

// Mock data for testing
const mockContract = {
  value: {
    info: {
      compute: [{
        key: 'AverageModel' // Use the actual model name
      }]
    }
  }
};

const mockData = [
  { value: 10 },
  { value: 20 },
  { value: 30 }
];

describe('ComputeSystem', () => {
  let computeSystem;
  
  beforeEach(() => {
    computeSystem = new ComputeSystem();
    // Set a short TTL for testing
    computeSystem.modelCacheTTL = 1; // 1ms
  });

  describe('Model Loading', () => {
    it('should load and cache the average model', async () => {
      const contract = mockContract;
      const data = mockData;
      
      // First call should load and cache the model
      const result = await computeSystem.computationSystem(contract, {}, data);
      expect(result.state).toBe(true);
      expect(result.data).toBeDefined();
      
      // Second call should use cached model
      const cacheKey = 'AverageModel';
      expect(computeSystem.modelCache.has(cacheKey)).toBe(true);
    });

    it('should handle unknown compute contracts with a clear error message', async () => {
      const unknownContract = {
        value: {
          info: {
            compute: [{
              key: 'unknown-hash'
            }]
          }
        }
      };

      const result = await computeSystem.computationSystem(unknownContract, {}, []);
      expect(result.state).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain(`Failed to load model: Model 'unknown-hash' not found in the model registry`);
    });
  });

  describe('Memory Management', () => {
    it('should clean up unused models after TTL', async () => {
      const contract = mockContract;
      const data = mockData;
      
      // Load a model
      await computeSystem.computationSystem(contract, {}, data);
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 2));
      
      // Model should be cleaned up
      const cacheKey = 'AverageModel';
      expect(computeSystem.modelCache.has(cacheKey)).toBe(false);
    });
  });

  describe('Compute Operations', () => {
    it('should perform average computation', async () => {
      const contract = mockContract;
      const data = mockData;
      
      const result = await computeSystem.computationSystem(contract, {}, data);
      expect(result.state).toBe(true);
      expect(result.data.result).toBe(20);
    });

    it('should handle observation contract', async () => {
      const observationContract = {
        value: {
          info: {
            compute: [{
              key: 'de55381bcc536926eb814480198f1f44ca14e5a6'
            }]
          }
        }
      };

      const result = await computeSystem.computationSystem(observationContract, {}, mockData);
      expect(result.state).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid contract format', async () => {
      const invalidContract = {};
      const result = await computeSystem.computationSystem(invalidContract, {}, []);
      expect(result.state).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid contract format: missing value property');
    });

    it('should handle compute errors', async () => {
      const mockErrorContract = {
        value: {
          info: {
            compute: [{
              key: 'error-contract'
            }]
          }
        }
      };

      const result = await computeSystem.computationSystem(mockErrorContract, {}, []);
      expect(result.state).toBe(false);
      expect(result.error).toBeDefined();
      // expect(result.error).toContain('Failed to load model: Model error-contract not found in the registry');
    });
  });
});