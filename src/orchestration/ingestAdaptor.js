/**
 * Adapts expanded HOP contracts into the SafeFlow-ECS orrery pipeline.
 * @class SafeFlowIngestAdapter
 */
class SafeFlowIngestAdapter {
  constructor(safeFlowInstance) {
    this.safeFlow = safeFlowInstance;
  }

  /**
   * Translates an expanded HOPstory into an active entity entity slot.
   */
  processAndIngest(expandedHopstory, emulationWorldState) {
    const bundle = {
      storyId: expandedHopstory.id || `story-${Date.now()}`,
      components: {
        lifestrapStory: expandedHopstory.lifestrapStory || null,
        lensGlue: expandedHopstory.lensGlue || null,
        exoCues: {
          torso: {
            orgoSpecs: expandedHopstory.expandedOrgos || [],
            gelleSpecs: expandedHopstory.expandedGelles || []
          }
        },
        data: {
          instruments: expandedHopstory.expandedInstruments || [],
          emulation: emulationWorldState || {}
        }
      }
    };

    // Dispatch directly into SafeFlow's core ingestion routine
    const entityId = this.safeFlow.ingestHOPstoryBundle(bundle);
    return entityId;
  }
}

export default SafeFlowIngestAdapter