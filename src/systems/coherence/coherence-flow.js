class CoherenceSystem {
  constructor(routeEmitter) {
    this.emitter = routeEmitter;
  }

  update(entityManager) {
    const structuralNodes = entityManager.getEntitiesWith(['orgo', 'gelle']);
    const structuralPayload = {};

    for (let i = 0; i < structuralNodes.length; i++) {
      const id = structuralNodes[i];
      structuralPayload[id] = {
        orgo: entityManager.getComponent(id, 'orgo'),
        gelle: entityManager.getComponent(id, 'gelle')
      };
    }

    // Broadcast the full, stabilized body snapshot down the conduction wire
    this.emitter.emit('sf-displayEntityRange', structuralPayload);
  }
}