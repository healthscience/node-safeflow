class ExoCueSystem {
  update(entityManager) {
    // 1. Snag all active relationship wrappers
    const cueEntities = entityManager.getEntitiesWith(['exoCue']);
    
    for (let i = 0; i < cueEntities.length; i++) {
      const cue = entityManager.getComponent(cueEntities[i], 'exoCue');
      
      // 2. Fetch the actual structural layers for both target parts
      const bodyA = entityManager.getComponent(cue.anchorA, 'orgo');
      const bodyB = entityManager.getComponent(cue.anchorB, 'orgo');
      
      if (!bodyA || !bodyB) continue;

      // 3. Resolve the math (e.g., maintain the hinge distance)
      // Enforce the physical limits and pull bodyB into coordinate alignment with bodyA
      this.applyReciprocalForces(bodyA, bodyB, cue);
    }
  }

  applyReciprocalForces(orgoA, orgoB, constraint) {
    // Structural alignment calculations happen here every pulse
    // Directly mutates coordinates to keep the arm snapped cleanly to the torso
  }
}