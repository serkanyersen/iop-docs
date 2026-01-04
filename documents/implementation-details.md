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

### Anchors as Decision Locks
Crucially, **anchors capture decisions, not just locations**. They act as locks that preserve implementation choices across iterations.
*   **Why does this code look this way?** The anchor links back to the specific intent version and the decisions (e.g., "Use Fastify", "Use Hexagonal Arch") active at generation time.
*   **Drift Prevention**: Future patches must respect these locked decisions unless explicitly overridden by a new intent. Anchors ensure that the system doesn't "forget" it was told to use a specific pattern.

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

**Storage Strategy: Sharded Manifests**
We explicitly reject the "Mono-Manifest" approach (one giant `manifest.json`).
*   **Problem**: A single file leads to constant merge conflicts (like `package-lock.json` or `yarn.lock` pain) and poor scalability in large teams.
*   **Solution**: **Sharded Manifests** (e.g., `.iop/manifests/components/todo-list.v1.json`). Each intent owns its own small manifest shard.

## 4. Implementation Decisions
How does the system remember that we chose "Fastify" over "Express"?

**Hybrid Decision Tracking**
We separate high-level architectural choices from low-level file mappings to prevent bloat and improve reviewability.

1.  **Intent-Owned Decisions**: Foundational choices are written back into the Intent files themselves.
    ```hcl
    intent "runtime" {
      decided "stack" {
        language = "typescript"
        framework = "fastify"
      }
    }
    ```
    *   *Why?* Decisions live next to *why* they exist. They are diffable, reviewable, and part of the spec.

2.  **Code-Mapping Decisions**: Low-level details (specific filenames, internal IDs) live in the Manifest shards.
    *   *Why?* These are implementation details that don't need high-level human review.

## 5. Drift Detection
The Orchestrator hashes "Managed" zones after every patch. On the next run, it compares the current hash to the stored hash.
*   **Match**: Safe to patch.
*   **Mismatch**: Human modified the code manually. The system flags this as a "Manual Override" and requests confirmation before proceeding, preventing accidental overwrites.
