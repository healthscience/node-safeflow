import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import ComputeSystem from '../../src/systems/compute/computeSystem.js';
import HolepunchHOP from 'holepunch-hop';
import HopQuerybuilder from 'hop-query-builder';
import BbAI from 'beebee-ai';
import PublicLibrarymin from './helpers/publicLibrary-build.js';

describe('Blind Path Integration', () => {
  let liveHolepunch;
  let computeSystem;
  let queryBuilder;
  let bbAI;
  let publicLib;
  
  beforeAll(async () => {
    liveHolepunch = new HolepunchHOP('hop-storage-test');
    await liveHolepunch.BeeData.setupHyperbee();
    await liveHolepunch.DriveFiles.setupHyperdrive();
    
    const libraryHelper = new PublicLibrarymin(liveHolepunch);
    publicLib = await libraryHelper.setupMinLibrary();
    computeSystem = new ComputeSystem({ publicLibrary: publicLib });
    queryBuilder = new HopQuerybuilder(liveHolepunch);
    bbAI = new BbAI(liveHolepunch);
  });

  beforeEach(() => {
    if (publicLib) {
      publicLib = [...publicLib]; // Create new array reference
    }
  });

  it('should process a number list through blind path - observation', async () => {
    // Create a mock message from BentoBox-DS
    const message = {
      action: 'blind',
      data: {
        text: 'chart the numbers',
        numbers: [10, 20, 30, 40, 50],
        compute: 'observation'
      },
      bbid: 'test-bbid'
    };

    const bbAIResponse = await bbAI.nlpflow(message);
    // Generate HOP query with publicLib
    const fileInfo = {}; // Optional parameter
    const hopQuery = queryBuilder.queryPath({
      action: 'blind',
      data: {
        numbers: message.data.numbers,
        data: { input: { data: { compute: 'observation' } } }
      }
    }, publicLib, fileInfo);

    // Process through compute system
    // extract the compute contract from HOPquery
    let computeContract = {};
    for (let mod of hopQuery.modules) {
      if (mod.value.style === 'compute') {
        computeContract = mod;
        break;
      }
    }

    try {
      const resultData = await computeSystem.computationSystem(computeContract, {}, message.data.numbers);
      // console.log('Final result:', resultData);
      expect(resultData).toBeDefined();
      expect(resultData.state).toBe(true);
      expect(resultData.result.data).toEqual([10, 20, 30, 40, 50]);
      expect(resultData.timestamp).toBeDefined();
    } catch (error) {
      console.error('Error in compute system:', error);
      throw error;
    }
  });

  it('should process a number list through blind path - average', async () => {
    // Create a mock message from BentoBox-DS
    const message = {
      action: 'blind',
      data: {
        text: 'chart the numbers',
        numbers: [10, 20, 30, 40, 50],
        compute: 'average'
      },
      bbid: 'test-bbid'
    };

    // Process through bbAI
    const bbAIResponse = await bbAI.nlpflow(message);

    // Generate HOP query with publicLib
    const fileInfo = {}; // Optional parameter
    const hopQuery = queryBuilder.queryPath({
      action: 'blind',
      data: {
        numbers: message.data.numbers,
        data: { input: { data: { compute: 'average' } } }
      }
    }, publicLib, fileInfo);

    // Process through compute system
    // extract the compute contract from HOPquery
    let computeContract = {};
    for (let mod of hopQuery.modules) {
      if (mod.value.style === 'compute') {
        computeContract = mod;
      }
    }

    const resultData = await computeSystem.computationSystem(computeContract, {}, message.data.numbers);
    expect(resultData.state).toBe(true);
    expect(resultData.result.result).toBe(30);
  });
 
});