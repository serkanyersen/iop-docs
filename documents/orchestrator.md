# The Intent Orchestrator

The **Intent Orchestrator** is the core system of IOP. It is a **deterministic compiler** that translates declarative intent into actionable plans.

> **Important**: The Orchestrator is standard code (e.g., Rust/Go/Key TS), *not* an LLM. It relies on strict logic to ensure safety.

## Compilation Pipeline

The Orchestrator processes intents in 5 stages:

### 1. Parsing & Canonicalization
*   **Input**: Raw `.intent` files.
*   **Process**: Parses High-Level Intent files into memory.
*   **Canonicalization**: Normalizes whitespace, sorts keys, and resolves defaults to create a **Canonical IR**. This ensures that "formatting changes" do not look like "logic changes."

### 2. Graph Building
Constructs the **Intent Graph** by resolving references.
*   **Nodes**: Intents and Atomic Blocks.
*   **Edges**: `renders`, `depends_on`, `uses`, `exports`.
*   **Result**: A traversable graph representing the entire application topology.

### 3. Validation
Runs deterministic checks before any planning happens.
*   **Errors (Fail Fast)**: Duplicate IDs, Unresolvable references, Circular dependencies (where forbidden), Schema violations.
*   **Warnings**: Missing acceptance criteria, Unused exports.

### 4. Semantic Diffing
Compares the *current* Canonical IR against the *previous* Canonical IR.
*   **Granularity**: Detects changes at the specific *Atomic Block* or *Field* level.
*   **Operations**: `ADD_INTENT`, `MODIFY_BLOCK`, `REMOVE_EDGE`, `UPDATE_FIELD`.
*   **Benefit**: We know exactly *what changed* in meaning, ignoring noise.

### 5. Patch Planning
Converts the Semantic Diff into a **Patch Plan**.
1.  **Impact Analysis**: Traverses the graph from changed nodes to find affected components.
2.  **Task Synthesis**: Generates discrete **Patch Tasks**.
    *   *Example*: "Update `todo_item.tsx` to render the new `notes` field defined in `entity.todo.v1`."

## Output Artifacts
The Orchestrator does *not* write code directly. It emits:
1.  **Intent Graph** (JSON)
2.  **Semantic Diff** (JSON)
3.  **Patch Plan** (List of Tasks)

These artifacts are handed off to **Agents** for execution, or presented to the human for review.
