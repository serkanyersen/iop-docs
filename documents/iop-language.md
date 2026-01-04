# IOP Language Specification

This document defines the **Structured Natural Language (SNL)** and the schema for Intent files. It ensures that intents are predictable, diffable, and compilable.

## 1. Design Philosophy

The Intent Language is designed to allow:
-   **Product-level clarity**: Readable by non-programmers.
-   **Determinism**: Same intents always produce the same Canonical IR.
-   **Incremental Compilation**: Only changed parts trigger updates.
-   **Patch Planning**: The orchestrator can mostly understand impact without reading the prose.

## 2. File Organization

Intent files live in the repository (e.g., `intents/`).

*   **Recommended Structure**:
    *   `intents/app/`: App-level composition.
    *   `intents/features/`: Feature-specific intents (e.g., `todo`, `auth`).
    *   `intents/shared/`: Reusable resources and policies.
*   **Naming Convention**: `<intent_name>.intent` (kebab-case).

## 3. Intent Schema

### 3.1 Intent Header
Every intent file must start with a header defining its identity.

```hcl
intent  = "todo_list"
id      = "component.todo_list.v1"
kind    = "component"
version = "1.0.0"

# Optional Metadata
title   = "Todo List Component"
summary = "Main list view for tasks"
owners  = ["@team-core"]
```

**Common Kinds**: `app`, `view`, `component`, `entity`, `actions`, `storage`, `policy`, `resource`.

### 3.2 References & Dependencies
Intents must explicitly declare their relationships to build the **Intent Graph**.

*   `renders`: Intents this intent directly renders/includes.
*   `depends_on`: Upstream requirements (e.g., data stores).
*   `uses`: Supporting resources or policies.
*   `exports`: Capabilities provided by this intent.

**Syntax**: `@<intent_name>` or `@<intent_name>.<export>`

```hcl
renders    = ["@todo_item"]
depends_on = ["@saving.todos"]
uses       = ["@branding", "@a11y.policy"]
```

### 3.3 Atomic Blocks
All natural language "prose" must be contained within **Atomic Blocks**. This is what makes the file "structured."

**Structure**:
*   **ID**: Stable identifier (e.g., `purpose`, `interaction.drag_drop`).
*   **Text**: The human-readable description.
*   **Constraints**: Hard rules (MUST NOT).
*   **Acceptance**: Verifiable outcomes (MUST BE TRUE).
*   **Non-goals**: Explicit out-of-scope items.
*   **Resources**: Links to designs or assets.

**Example**:
```hcl
block "interaction.drag_drop" {
  text = "Users can reorder items by dragging them."
  constraints = [
    "Drag handle must be distinct from the content area",
    "No auto-scrolling during drag"
  ]
  acceptance = [
    "New order persists after page refresh",
    "Keyboard users can reorder via up/down actions"
  ]
  resources = {
    design = "figma://..."
  }
}
```

## 4. Machine-Visible Fields
While text describes behavior, specific fields are exposed for the Orchestrator to route and plan effectively without understanding English.

*   **View**: `route`, `params`
*   **Component**: `inputs`
*   **Entity**: `fields` (map), `types`
*   **Actions**: `signatures`

## 5. Canonicalization
To ensure reliable diffing, the Orchestrator canonicalizes intent files before processing:
1.  Sorts keys deterministically.
2.  Normalizes whitespace in text blocks.
3.  Resolves implicit defaults.
4.  Assigns stable IDs to unnamed substructures if necessary.

**The Canonical IR is what the Orchestrator diffs, ensuring that formatting changes do not trigger code generation.**
