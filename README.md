# Intent-Oriented Programming (IOP) Documentation

Welcome to the system documentation for Intent-Oriented Programming. This documentation covers the ecosystem's philosophy, language, architecture, and workflows.

## Documentation Index

The following documents should be read in order to build a complete mental model of the system.

### 1. Foundation
*   **[Introduction](documents/introduction.md)**
    *   Start here. Explains why IOP exists, the problem it solves, and the high-level vision.
*   **[Glossary](documents/glossary.md)**
    *   Defines the shared vocabulary (Intent, Atomic Block, Orchestrator, etc.) used throughout the project.

### 2. The Language
*   **[Language Specification](documents/iop-language.md)**
    *   Details the "Structured Natural Language" (SNL), the `.intent` file schema, and how atomic blocks work.

### 3. Architecture
*   **[The Orchestrator](documents/orchestrator.md)**
    *   Deep dive into the system's brain: compilation, graph building, semantic diffing, and patch planning.
*   **[Implementation Architecture](documents/implementation-details.md)**
    *   Technical details on how intents map to code, including Code Anchors, Ownership Zones, and Manifests.

### 4. Workflows & Usage
*   **[Developer Workflow](documents/developer-workflow.md)**
    *   How to build with IOP: The Planning Cycle (Intent ↔ Orchestrator) and the Implementation Cycle (Orchestrator ↔ Agent).
*   **[Example Walkthrough](documents/example-walkthrough.md)**
    *   A step-by-step example of adding a feature ("Notes field") and deprecating a page in a Todo App.

---
*Generated from ideation documents.*
