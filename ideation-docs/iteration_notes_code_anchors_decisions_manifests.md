# IOP Iteration Notes: Code Anchors, Decisions & Manifests

This document captures the **current iteration** of thinking around **Code Anchors**, **implementation decisions**, and the **Manifest**, based on recent discussion. It records the *preferred direction* as well as *considered alternatives*, without locking the system prematurely.

Status: **Exploratory but converging**

---

## 1. Reframing the Problem

Earlier documents introduced the idea of a *Manifest* mapping:

> Intent IDs → code anchors

This iteration clarifies that **anchors are not just location markers**.

### Updated framing

A **code anchor** represents:
- where code lives
- *why* it exists (which intent caused it)
- *which decisions* were made when it was generated

Anchors are therefore **contracts between the Orchestrator and the codebase**, not comments for navigation.

---

## 2. Design Constraints (Now Explicit)

From prior discussions, the following constraints are now considered non-negotiable:

- Progressive compilation (no global rewrites)
- Patch-only evolution
- Multiple intents may influence the same *feature*, but must not blindly co-own the same code block
- Human edits must not be overwritten silently
- Implementation decisions must be preserved across iterations
- Giant, monolithic manifest files should be avoided (merge pain, lockfile fatigue)

These constraints rule out purely heuristic or implicit approaches.

---

## 3. What Is a Code Anchor?

### Definition (current)

A **code anchor** is a stable, explicit marker that:
- ties generated code to one or more Intent IDs
- defines an ownership zone (managed / patchable / opaque)
- provides a stable patch target for future changes

Anchors exist at *semantic boundaries*, not at every line.

---

## 4. Layered Anchoring Model (Preferred Direction)

### Layer A: File-level Ownership Header (v0)

Minimal metadata at the top of a file:

```ts
/* @iop
intent: api.todo.v1
zones:
  managed: [handlers, dto, validation]
  opaque: [customLogic]
*/
```

Purpose:
- identify which intents affect the file
- declare ownership zones
- give the Orchestrator a safe entry point

This is sufficient for early iterations and brownfield adoption.

---

### Layer B: Sparse Block Anchors (v1)

Explicit anchors only at semantic boundaries:

```ts
// @iop-anchor api.todo.v1.list_todos zone=managed
export async function listTodosHandler(...) { ... }
```

Characteristics:
- few anchors per file (not per line)
- placed on handlers, DTOs, validators, adapters, middleware
- enable precise patching without noise

AST analysis may *support* anchors, but does not replace them.

---

### Layer C: Decision Anchors (Key Insight)

Anchors also capture **implementation decisions**, such as:
- language and runtime
- frameworks and library versions
- architectural style (MVC, hexagonal, etc.)

These decisions must persist so future patches follow the same path.

---

## 5. Where Decisions Live (Chosen Direction)

### Preferred approach: **Hybrid (Option C)**

Implementation decisions are split by responsibility:

#### 1) Intent-owned decisions (written back into intents)

Foundational and architectural decisions are stored as **machine-owned blocks** inside intent files:

```hcl
intent "runtime" {
  decided "implementation.lock" {
    facts = {
      language = "typescript"
      runtime  = "node@20"
      framework = "fastify@4.26"
      architecture = "hexagonal"
    }
  }
}
```

Properties:
- decisions live next to *why* they exist
- diffable and reviewable
- clearly separated from human-authored intent blocks

#### 2) Code-mapping decisions (sharded manifests)

Low-level mappings live in small, per-intent manifest shards:

```
.iop/manifests/
  api.todo.v1.json
  storage.todo.v1.json
```

These record:
- intent ID → file path
- symbol / anchor ID
- ownership zone
- last applied patch hash

This avoids a single giant manifest file.

---

## 6. Avoiding Multi-Intent Collisions

Key rule introduced in this iteration:

> **Multiple intents should not co-own the same anchor.**

### Resolution strategy

- Cross-cutting concerns (auth, rate limiting, logging) compile into **shared layers** (e.g., middleware)
- Feature intents own feature-specific anchors (handlers, components)
- Dependencies are expressed via references, not shared patch ownership

This mirrors real-world layering patterns and prevents patch thrashing.

---

## 7. Tracking Agent vs Human Changes

Rather than tracking keystrokes or maintaining a heavy database:

### Proposed mechanism

- Managed zones are hashed after each successful patch
- On next compile, hashes are compared
- If a managed zone changed outside orchestrator control:
  - flag as "manual override"
  - require explicit confirmation before patching

### Optional extension (future)

Append-only **patch ledgers per intent**:

```
.iop/ledger/api.todo.v1.ndjson
```

Each entry records:
- patch intent
- anchors touched
- acceptance result
- commit hash

This provides auditability without central bottlenecks.

---

## 8. Alternatives Considered (Not Chosen)

### A) AST-only inference
- ❌ brittle
- ❌ ambiguous
- ❌ unsafe for patch-only guarantees

### B) One giant manifest file
- ❌ merge conflicts
- ❌ poor scalability
- ❌ lockfile-style pain

### C) Per-line anchors
- ❌ unreadable
- ❌ noisy
- ❌ unnecessary granularity

### D) Full edit-history database
- ❌ heavy
- ❌ operationally complex
- ❌ not needed for initial reliability

---

## 9. Open Questions (Deferred)

- How aggressively the orchestrator should rewrite anchors
- How anchors evolve during refactors and migrations
- How anchors interact with code formatting tools
- Whether anchors should be language-specific or abstracted

---

## Summary

This iteration establishes that:
- anchors represent **decisions + ownership**, not just locations
- sparse, explicit anchors outperform heuristic approaches
- implementation decisions must persist across iterations
- manifests should be **sharded and minimal**

This provides a solid foundation for incremental compilation and safe AI-driven patching.

