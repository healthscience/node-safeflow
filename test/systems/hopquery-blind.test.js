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
    liveHolepunch = new HolepunchHOP();
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
        compute: {
          type: 'observation'
        }
      },
      bbid: 'test-bbid'
    };

    console.log('Processing through bbAI...');
    const bbAIResponse = await bbAI.nlpflow(message);
    console.log('bbAI response:', bbAIResponse);

    // Generate HOP query with publicLib
    const fileInfo = {}; // Optional parameter
    const hopQuery = queryBuilder.queryPath({
      action: 'blind',
      data: {
        numbers: message.data.numbers,
        compute: message.data.compute
      }
    }, publicLib, fileInfo);
    console.log('Generated HOP query:', hopQuery);

    // Process through compute system
    // extract the compute contract from HOPquery
    let computeContract = {};
    for (let mod of hopQuery.modules) {
      if (mod.value.style === 'compute') {
        computeContract = mod;
        break;
      }
    }
    console.log('Extracted compute contract:', computeContract);

    try {
      const resultData = await computeSystem.computationSystem(computeContract, {}, message.data.numbers);
      console.log('Final result:', resultData);
      
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
        compute: {
          type: 'average'
        }
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
        compute: message.data.compute
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
    console.log('compute contract-----------');
    console.log(computeContract.value.info);
    console.log('comoute eninge lookat 33 ');
    console.log(computeSystem);
    const resultData = await computeSystem.computationSystem(computeContract, {}, message.data.numbers);
    console.log('result');
    console.log(resultData);
    expect(resultData.state).toBe(true);
    expect(resultData.result.result).toBe(30); // Average of 10-50
  });
/*
  it('should process file data through blind path', async () => {
    // Create a mock message with file data
    const message = {
      action: 'blind',
      data: {
        filedata: {
          content: '1,10\n2,20\n3,30\n4,40\n5,50',
          type: 'csv',
          size: 'small'
        },
        compute: {
          type: 'linear-regression'
        }
      }
    };

    // Process through bbAI
    const bbAIResponse = await bbAI.nlpflow(message);

    // Generate HOP query
    const hopQuery = queryBuilder.queryPath(bbAIResponse, {}, {});

    // Process through compute system
    const result = await computeSystem.computationSystem(hopQuery, {}, {});
    expect(result.data.result.slope).toBeDefined();
    expect(result.data.result.intercept).toBeDefined();
  }); */
 
});