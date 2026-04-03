export class PulseBridge {
  constructor(world) {
    this.world = world;
  }

  // The 'ingestLive' entry point
  ingestLive(agentId, pulseData) {
    const entityId = this.world.registry.getEntityId(agentId);
    if (!entityId) return console.warn(`Agent ${agentId} not registered.`);

    const entity = this.world.entities.get(entityId);
    if (!entity) return console.warn(`Entity ${entityId} not found for agent ${agentId}.`);

    // Update the 'PulseComponent' state
    if (!entity.components) entity.components = {};
    
    entity.components.Pulse = {
      ...entity.components.Pulse,
      ...pulseData,
      lastUpdated: Date.now()
    };
  }
}
