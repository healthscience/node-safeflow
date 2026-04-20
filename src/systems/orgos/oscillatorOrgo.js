/**
 * Orgo Oscillator
 * The metronome for Capacity Pillars.
 * Generates a rhythmic wave representing Effort (Peak) and Recovery (Trough).
 */

export const createOscillatorOrgo = (initialState = {}) => {
  return {
    // The "DNA" of the wave
    params: {
      amplitude: initialState.amplitude || 1.0,  // Intensity of the 400IM
      frequency: initialState.frequency || 0.5,  // How often (Orbits per pulse)
      phase: initialState.phase || 0,            // Timing offset
      damping: initialState.damping || 0.05,    // The decay of the capacity over time
      ...initialState
    },

    /**
     * The Seer's Projection
     * Calculates the capacity value at any given 't' (Time/Orbit)
     */
    calculate: function(t) {
      const { amplitude, frequency, phase, damping } = this.params;
      
      // The Core Wave: A sine wave modified by exponential decay (Heli-math)
      // y = A * sin(2π * f * t + φ) * e^(-d * t)
      const resonance = amplitude * Math.sin(2 * Math.PI * frequency * t + phase);
      const decay = Math.exp(-damping * t);
      
      return resonance * decay;
    },

    /**
     * The Sifter Snap
     * Adjusts the Orgo's frequency based on Polar/Withings batch data.
     */
    snapToEvidence: function(batchData) {
      if (!batchData || batchData.length < 2) return;

      // Calculate the average time between "Pulses" in the JSON
      const intervals = [];
      for (let i = 1; i < batchData.length; i++) {
        intervals.push(batchData[i].timestamp - batchData[i-1].timestamp);
      }
      const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;

      // Set frequency to match the Peer's real-world rhythm
      this.params.frequency = 1 / avgInterval;
    }
  };
};
