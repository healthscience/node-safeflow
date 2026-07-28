// execution-graph.js
export function buildExecutionOrder(exoCues) {
  const resolved = [];
  const visited = new Set();

  function visit(cue) {
    if (visited.has(cue.instanceId)) return;
    
    // Look for other cues in the pipeline that provide this cue's inputs
    for (const inputChannel of cue.conductionChannels.input) {
      const provider = exoCues.find(c => c.conductionChannels.output.includes(inputChannel));
      if (provider) visit(provider); // Recursively resolve dependencies first
    }
    
    visited.add(cue.instanceId);
    resolved.push(cue);
  }

  exoCues.forEach(visit);
  return resolved; // Returns the exact order SafeFlow-ecs must execute
}