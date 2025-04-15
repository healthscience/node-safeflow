import { describe, it, expect, beforeEach } from 'vitest';
import ComputeSystem from '../../src/systems/compute/computeSystem.js';
import HolepunchHOP from 'holepunch-hop'
import HopQuerybuilder from 'hop-query-builder';
import BbAI from 'beebee-ai';
import PublicLibrarymin from './helpers/publicLibrary-build.js'

describe('Blind Path Integration', () => {
  let liveHolepunch = new HolepunchHOP()
  liveHolepunch.BeeData.setupHyperbee()
  liveHolepunch.DriveFiles.setupHyperdrive()
  let computeSystem;
  let queryBuilder;
  let bbAI;
  let publicLib;
  
  beforeEach(async () => {
    const libraryHelper = new PublicLibrarymin(liveHolepunch);
    publicLib = await libraryHelper.setupMinLibrary();
    console.log('pub library')
    console.log(publicLib)
    computeSystem = new ComputeSystem();
    queryBuilder = new HopQuerybuilder();
    
    // Initialize bbAI with required dependencies
    bbAI = new BbAI(liveHolepunch);
  });

  describe('Blind Path - Number List', () => {
   it('should process a number list through blind path', async () => {
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
      let computeContract = {}
      for (let mod of hopQuery.modules) {
        console.log(mod)
        if (mod.value.style === 'compute') {
          computeContract = mod;
        }
      }
      const result = await computeSystem.computationSystem(computeContract, {}, message.data.numbers);
      console.log('result')
      console.log(result)
      expect(result.state).toBe(true);
      // expect(result.data).toBeDefined();
      // expect(result.data.result).toBe(30); // Average of 10-50
    });
  }); 
});

  /*
  describe('Blind Path - File Data', () => {
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
      const result = await computeSystem.computationSystem(hopQuery, {}, message.data.filedata.content);
      
      expect(result.state).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.result.slope).toBeDefined();
      expect(result.data.result.intercept).toBeDefined();
    });
  }); */