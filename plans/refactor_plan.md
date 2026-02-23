# Refactoring Plan: ES6 Upgrade & Pure ECS Architecture

This document outlines the step-by-step plan to modernize the `node-safeflow` codebase and transition it to a pure Entity Component System (ECS) architecture.

## Phase 1: ES6 Class Refactoring (The Foundation)
**Goal:** Convert all older prototype-based objects (`var Class = function()`, `Class.prototype.method = function()`, `util.inherits`) to modern ES6 classes (`class Class extends EventEmitter`). This phase focuses *only* on syntax, ensuring the existing logic remains intact.

### Stage 1.1: Refactor Systems (`src/systems/`)
Systems contain the core logic and are a good starting point.
*   Convert `dataSystem.js` and its sub-protocols (REST, SQLite, JSON, CSV, etc.).
*   Convert `timeSystem.js`, `placeSystem.js`, and the visual systems (`visSystem.js`, `chartSystem.js`, `tableSystem.js`).
*   Ensure proper inheritance using `class SystemName extends EventEmitter`.
*   **Testing:** The existing tests in `test/systems/` are likely higher-level integration tests. **You must write new, dedicated unit tests** for each system as it is updated to ES6 to ensure the class instantiation and individual methods work correctly in isolation. All new and existing tests must pass before proceeding.

### Stage 1.2: Refactor Components (`src/components/`)
Components are the simplest data structures.
*   Convert `dataComponent.js`, `datatypeComponent.js`, `deviceComponent.js`, `placeComponent.js`, `simComponent.js`, `timeComponent.js`, and `visualComponent.js`.
*   *Note: `computeComponent.js` appears to already be partially updated or structured differently, but ensure it aligns with the new ES6 standard.*
*   **Testing:** Similar to systems, **write new, dedicated unit tests** for each component to verify their state management and methods in isolation. All new and existing tests must pass before proceeding.

### Stage 1.3: Refactor KBL and CNRL (`src/kbl-cnrl/`)
Update the ledger and reference layer classes.
*   Convert `cnrlMaster.js`, `cnrlUtility.js`, `kbledger.js`, `kblStorage.js`, `peerLink.js`, and `xlibraryStorage.js`.
*   **Testing:** Run the test suite (`npm test`). Create tests for KBL/CNRL classes if needed. All tests must pass before proceeding.

### Stage 1.4: Refactor Core Managers (`src/`)
Update the main orchestrators.
*   Convert `scienceEntities.js` (the main entity container).
*   Review and ensure `entitiesManager.js`, `automationManager.js`, and `index.js` are fully utilizing ES6 class syntax.
*   **Testing:** Run the full test suite (`npm test`). This is the final integration check for Phase 1. All tests must pass before moving to Phase 2.

---

## Phase 2: Pure ECS Architecture Implementation (Option 1)
**Goal:** Decouple the complex, event-driven control flow in `EntitiesManager` and move to a true component-driven architecture where independent Systems react to the presence of specific Components.

### Stage 2.1: Define Pipeline State Components
Create new, explicit components to represent the stages of the data pipeline and hold the hash chain (Proof of Work).
*   `DataRequestComponent`: Holds the source contract/query.
*   `RawDataComponent`: Holds the fetched data and its initial hash (`hash_A`).
*   `TidyRulesComponent`: Holds the rules for cleaning/filtering.
*   `TidiedDataComponent`: Holds the cleaned data and the chained hash (`hash_B`).
*   `ComputeContractComponent`: Holds the ML model details.
*   `ResultComponent`: Holds the final compute output and the final chained hash (`hash_C`).

### Stage 2.2: Implement `DataFetchSystem`
*   **Logic:** Queries for entities that have a `DataRequestComponent` but lack a `RawDataComponent`.
*   **Action:** Fetches the data from the source, calculates the initial hash, and attaches the `RawDataComponent` to the entity.

### Stage 2.3: Implement `DataTidySystem`
*   **Logic:** Queries for entities with a `RawDataComponent` and a `TidyRulesComponent`, but lacking a `TidiedDataComponent`.
*   **Action:** Processes the raw data according to the rules, calculates the chained hash, and attaches the `TidiedDataComponent`.

### Stage 2.4: Refactor `ComputeSystem`
*   **Logic:** Queries for entities with a `TidiedDataComponent` and a `ComputeContractComponent`, but lacking a `ResultComponent`.
*   **Action:** Executes the ML model (JS or WASM) on the tidied data, calculates the final chained hash, and attaches the `ResultComponent`.

### Stage 2.5: Implement `LedgerSystem` (Evidence System)
*   **Logic:** Queries for entities that have a `ResultComponent` but haven't been saved to the ledger yet.
*   **Action:** Extracts the full hash chain (`hash_A` -> `hash_B` -> `hash_C`) from the entity's components and writes the final proof of work to the Coherence Ledger (`KBLedger`).

### Stage 2.6: Simplify `EntitiesManager`
*   Remove the complex `subFlowFull`, `subFlowShort`, and the event emitter ping-pong (`resultCheck`, `resultsCheckback`).
*   The `EntitiesManager`'s new, simplified role:
    1. Receive the `HOPquery`.
    2. Create a new `Entity`.
    3. Attach the initial components (e.g., `DataRequestComponent`, `ComputeContractComponent`).
    4. Let the independent Systems (Fetch, Tidy, Compute, Ledger) automatically process the entity through the pipeline.