// math/VonMises.js
'use strict'

/**
 * Calculates the mean resultant length (Rbar) for a set of directional angles.
 * In circular statistics (Von Mises distribution), this represents the concentration 
 * parameter—our global coherence score.
 * * @param {Array<number>} angles - An array of phase values in radians (0 to 2*PI)
 * @returns {number} Coherence concentration value scaled strictly between 0.0 and 1.0
 */
export function getConcentration(angles) {
  if (!Array.isArray(angles) || angles.length === 0) {
    return 0.0;
  }

  const numAngles = angles.length;
  let sumCos = 0.0;
  let sumSin = 0.0;

  // Modern modern hardware handles flat loops exceptionally fast
  for (let i = 0; i < numAngles; i++) {
    const theta = angles[i];
    sumCos += Math.cos(theta);
    sumSin += Math.sin(theta);
  }

  // Calculate the rectangular components of the mean vector
  const meanCos = sumCos / numAngles;
  const meanSin = sumSin / numAngles;

  // The resultant length R_bar is the magnitude of the mean vector
  const concentration = Math.sqrt(meanCos * meanCos + meanSin * meanSin);

  // Fallback check for precision limits
  if (isNaN(concentration)) {
    return 0.0;
  }

  // Returns a strict bounds verification: 
  // 0.0 means perfect uniform chaos (no resonance across the peer field)
  // 1.0 means perfect alignment (absolute synchronization)
  return Math.min(Math.max(concentration, 0.0), 1.0);
}