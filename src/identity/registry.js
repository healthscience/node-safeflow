export class Registry {
  constructor() {
    this.agentToEntity = new Map();
    this.activeAgents = new Set();
  }

  register(agentId, entityId) {
    this.agentToEntity.set(agentId, entityId);
    this.activeAgents.add(agentId);
  }

  getEntityId(agentId) {
    return this.agentToEntity.get(agentId);
  }
}
