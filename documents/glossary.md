# Glossary & Core Concepts

This document defines the shared vocabulary and mental models for the Intent-Oriented Programming (IOP) system.

## Foundational Terms

### Intent
A **declarative, addressable description** of a part of an application’s purpose, behavior, or structure.
*   **Characteristics**: Human-readable (Structured Natural Language), Machine-addressable (stable IDs), Referenceable, Implementation-independent.
*   **Examples**: `view.homepage`, `entity.user`, `policy.security`.
*   An intent describes *what must exist*, not *how it is built*.

### Atomic Block
The smallest unit of intent that can change independently.
*   **Components**:
    *   `text`: The natural language purpose/description.
    *   `constraints`: Hard rules that must not be violated.
    *   `acceptance`: Criteria that must be true for the block to be considered implemented.
    *   `non-goals`: Explicit exclusions.
    *   `resources`: Visual artifacts, designs, or reference links.
*   Atomic blocks allow the system to diff meaning rather than just text.

### Intent Graph
The resolved dependency graph formed by all intents in the system.
*   **Nodes**: Intents, Atomic Blocks.
*   **Edges**: Renders, Depends-on, References, Uses.
*   The Intent Graph is the primary input to the Orchestrator.

## System Components

### Intent Orchestrator
A deterministic, compiler-like system that manages the lifecycle of the application.
*   **Responsibilities**: Parses intent files, builds the intent graph, validates consistency, computes semantic diffs, and produces patch plans.
*   **Note**: The Orchestrator is deterministic code; it is *not* an LLM.

### Agent (Invisible Worker)
The AI backend that executes implementation tasks.
*   **Properties**: Executes one patch task at a time, operates within strict scope/constraints, cannot introduce new concepts without permission.
*   Agents are intentionally hidden from the high-level developer experience.

## Workflow Concepts

### Semantic Diff
The difference between two versions of the Intent Graph, operating on meaning rather than text.
*   **Captures**: Added/removed intents, modified blocks, changed dependencies.
*   Semantic diffs are what drive the creation of Patch Plans.

### Patch Plan
A structured, ordered list of small change tasks derived from a Semantic Diff.
*   Each task has a narrow scope, declares affected IDs, and specifies constraints.
*   Patch plans are stable, reviewable artifacts produced *before* code is written.

### Manifest
A record of the relationship between Intent artifacts and realized code.
*   **Tracks**: Intent ID → Code Anchor mappings, applied patch history, ownership zones.
*   The manifest enables incremental compilation and ensures the system knows "who owns what."

## Lifecycle & Governance

### Ownership Zones
Divisions of code responsibility to prevent AI overreach.
*   **Managed**: Compiler-owned, freely patchable.
*   **Patchable**: Compiler may propose changes, but requires approval.
*   **Opaque**: Compiler cannot modify; purely human territory.

### Lifecycle State
Intents move through explicit states:
*   `active`
*   `deprecated`
*   `disabled`
*   `removed`
*   `archived`
Deletion is modeled as *decommissioning*, preserving history and safe migration paths.

### Migration Intent
A specialized intent type that defines a multi-step evolution of standard intents (e.g., a large refactor).
*   Declares source and target states, ordered steps, and invariants.
*   Turns messy refactors into planned, reversible evolutions.

## Decision & Execution Terms

### Decision Lock
A mechanism (often via Code Anchors) that preserves implementation decisions (e.g., "Use SQLite", "Use Express") across iterations.
*   Preventing the "new guy syndrome" where every AI run tries to rewrite the architecture.
*   Intent-owned decisions are locked in the intent file; Code-mapping decisions are locked in the manifest.

### Drift
The tendency of AI agents to diverge from the original plan or valid code state over time.
*   **Behavioral Drift**: The app works, but differently than specified.
*   **Architectural Drift**: The app works, but the code structure is messy or violates patterns.
*   IOP mitigates drift via strict Orchestration and Patch Plans.

### Patch
The fundamental unit of change in IOP.
*   **Distinct from a Git Commit**: A patch is an atomic change to code driven by a single Intent Block modification.
*   **Distinct from a Refactor**: A patch does not change the high-level intent; it aligns the code to the intent.
*   Patches are small, scoped, and reversible.
