// The true, agnostic SafeFlow-ecs cyclic runner

export function runBesearchCycle(sortedExoCues, globalBuffers, currentCycleTime) {
  
  // The orrery doesn't know what these cues are. 
  // It just blindly trusts the execution graph order.
  for (const cue of sortedExoCues) {
    
    // 1. Gather only the inputs this specific exoCue contract requested
    const localInputs = {};
    for (const inChannel of cue.conductionChannels.input) {
      localInputs[inChannel] = globalBuffers[inChannel] || 0;
    }

    // 2. Run the Orgo (The Nanobot/WASM/JS Driver)
    // The driver executes its logic using the current cycle time as a constraint
    const outputs = cue.orgoDriver.resolve(localInputs, currentCycleTime);

    // 3. Write outputs back to the global buffer for the next exoCue in the graph
    for (const [outChannel, value] of Object.entries(outputs)) {
      if (cue.conductionChannels.output.includes(outChannel)) {
        globalBuffers[outChannel] = value;
      }
    }
  }
}