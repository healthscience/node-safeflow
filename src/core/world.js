import { Registry } from '../identity/registry.js';
import { Weaver } from 'consilience-weave';

export class World {
  constructor() {
    this.entities = new Map();
    this.systems = [];
    this.registry = new Registry(); // The Foreman
    this.weaver = new Weaver(); // The Weaver
  }

  addSystem(system) {
    this.systems.push(system);
  }

  // The Heartbeat: Triggered by HeliClock
  tick(heliStamp) {
    const context = { heliStamp, registry: this.registry };
    for (const system of this.systems) {
      system.update(this.entities, context);
    }
  }
}
