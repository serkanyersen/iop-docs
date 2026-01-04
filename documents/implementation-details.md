# Implementation Details & Architecture

This document details how IOP connects abstract Intents to concrete Code.

## 1. Code Anchors
An **Anchor** is a contract between the Orchestrator and the codebase. It is not just a location marker; it represents *why* code exists.

### Definition
A stable, explicit marker that:
1.  Ties generated code to specific Intent IDs.
2.  Defines an **Ownership Zone**.
3.  Provides a stable target for future patches.

### Anchoring Strategy
We use a **Layered Anchoring Model**:

1.  **File-Level Header**:
    ```typescript
    /* @iop
       intent: api.todo.v1
       zones: { managed: [handlers], opaque: [customLogic] }
    */
    ```
2.  **Sparse Block Anchors**: Placed only at semantic boundaries (functions, classes, interfaces), not every line.
    ```typescript
    // @iop-anchor api.todo.v1.list_todos zone=managed
    export const listTodos = async () => { ... }
    ```

## 2. Ownership Zones
To prevents AI from overwriting human work, we define strict zones:

| Zone | Owner | Description |
| :--- | :--- | :--- |
| **Managed** | System | Fully controlled by the Compiler. Can be rewritten or patched freely. |
| **Patchable** | Shared | System may propose changes, but Human must approve. |
| **Opaque** | Human | System cannot modify this code. It is "black box" logic. |

## 3. The Manifest
The Manifest is the "database" of the system's relationship to code.

**Responsibilities**:
*   Maps `Intent ID` → `File Path` + `Anchor ID`.
*   Tracks the hash of the last applied patch (for drift detection).
*   Records ownership zones.

**Storage**:
Instead of a single giant JSON file, we use **Sharded Manifests** (e.g., `.iop/manifests/api.todo.v1.json`) to avoid merge conflicts and scalability issues.

## 4. Implementation Decisions
How does the system remember that we chose "Fastify" over "Express"?

**Hybrid Decision Tracking**:
1.  **Intent-Owned Decisions**: High-level choices (Language, Framework, Architecture) are written back into the Intent files as "locked" facts.
    ```hcl
    intent "runtime" {
      decided "stack" {
        language = "typescript"
        framework = "fastify"
      }
    }
    ```
2.  **Code-Mapping Decisions**: Low-level details (filenames, folder structure) live in the Manifest shards.

## 5. Drift Detection
The Orchestrator hashes "Managed" zones after every patch. On the next run, it compares the current hash to the stored hash.
*   **Match**: Safe to patch.
*   **Mismatch**: Human modified the code manually. The system flags this as a "Manual Override" and requests confirmation before proceeding, preventing accidental overwrites.
