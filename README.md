# Intent-Oriented Programming (IOP) Documentation

Welcome to the system documentation for Intent-Oriented Programming. This documentation covers the ecosystem's philosophy, language, architecture, and workflows.

## Documentation Index

The following documents should be read in order to build a complete mental model of the system.


### [📒 NoteBookLM](https://notebooklm.google.com/notebook/a5363f5c-92ef-4491-bf0b-407691cd1e30)

### 1. Foundation
*   **[Whitepaper](whitepaper.pdf)**
    *   The formal definition of the Intent-Oriented Programming paradigm.
*   **[Introduction](documents/introduction.md)**
    *   Start here. Explains why IOP exists, the problem it solves, and the high-level vision.
*   **[Glossary](documents/glossary.md)**
    *   Defines the shared vocabulary (Intent, Atomic Block, Orchestrator, etc.) used throughout the project.
*   **[System Architecture](documents/architecture-diagram.md)**
    *   **Visual Guide**: A high-level diagram showing the Planning and Implementation cycles.

### 2. The Language
*   **[Language Specification](documents/iop-language.md)**
    *   Details the "Structured Natural Language" (SNL), the `.intent` file schema, and how atomic blocks work.

### 3. Architecture
*   **[The Orchestrator](documents/orchestrator.md)**
    *   Deep dive into the system's brain: compilation, graph building, semantic diffing, and patch planning.
*   **[Implementation Architecture](documents/implementation-details.md)**
    *   Technical details on how intents map to code, including Code Anchors, Ownership Zones, and Manifests.
*   **[Context Management](documents/context-management.md)**
    *   How the system deterministically builds the "perfect prompt" for agents using Graph-Walking Retrieval.

### 4. Workflows & Usage
*   **[Developer Workflow](documents/developer-workflow.md)**
    *   How to build with IOP: The Planning Cycle (Intent ↔ Orchestrator) and the Implementation Cycle (Orchestrator ↔ Agent).
*   **[Example Walkthrough](documents/example-walkthrough.md)**
    *   A step-by-step example of adding a feature ("Notes field") and deprecating a page in a Todo App.
*   **[Adoption Strategy](documents/adoption-guide.md)**
    *   How to bring IOP into an existing "Brownfield" project using Hybrid Mode and the `iop intentify` command.
*   **[Collaboration Guide](documents/collaboration-guide.md)**
    *   Git workflows, merging strategies, and the "Merge then Recompile" model for teams.
*   **[CLI Reference](documents/cli-reference.md)**
    *   Documentation for `iop plan`, `apply`, `check`, and migration commands.
*   **[Implementation Roadmap](documents/implementation-roadmap.md)**
    *   The "Bill of Materials" required to build the actual toolset (CLI, LSP, SDKs).

### 5. The Future
*   **[Future Vision](documents/future-vision.md)**
    *   The roadmap for development experiences: Dedicated IDEs, Visual Node Graphs, and Intent-Only Views.

---
*Generated from ideation documents.*
