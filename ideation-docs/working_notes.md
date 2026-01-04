# Intent-Oriented Programming (IOP) – Working Notes

## 1. Problem Statement
Traditional AI-assisted coding tools (Cursor, agentic IDEs, etc.) operate as **chat-driven, autonomous agents** that:
- produce large, hard-to-review diffs
- make implicit decisions
- drift in behavior across runs
- blur authorship and responsibility

This leads to unpredictability, inconsistency, and codebases that are *functionally correct but conceptually opaque*.

The goal is **not faster code generation**, but a new development paradigm that:
- keeps humans in control
- makes change predictable and incremental
- treats AI as an invisible implementation mechanism

---

## 2. Core Idea

**Intent-Oriented Programming (IOP)**

> Developers author *structured intent* as the source of truth.
>
> Code is a derived build artifact, generated and updated via **small, scoped patches**.

Key principles:
- Declarative, spec-first
- Progressive compilation (no full rebuilds)
- Patch-only code generation
- Deterministic planning
- Agents are hidden workers, not collaborators

---

## 3. Intents as Primary Artifacts

The repository primarily contains **intent files**, not code.

Intents:
- describe *what the application is*, not *how it is implemented*
- are readable by non-programmers
- are structured enough for deterministic compilation

### Properties of Intents
- Addressable (stable IDs)
- Referenceable (intents can depend on other intents)
- Composable (multiple intents define a full app)
- Versionable (intent diffs drive changes)

---

## 4. Structured Natural Language (SNL)

Intents use **natural language**, but only inside **structured, atomic blocks**.

Each block combines:
1. Human-readable text (purpose / description)
2. Machine-visible structure (IDs, dependencies)
3. Constraints (hard rules)
4. Acceptance criteria (testable outcomes)
5. Optional non-goals (to prevent overbuilding)

This preserves readability while enabling deterministic orchestration.

---

## 5. Intent Orchestrator (Compiler)

The orchestrator is the core system. It is **deterministic code**, not an LLM.

Responsibilities:
- Parse intent files into a canonical IR
- Resolve references and dependencies
- Detect contradictions, gaps, and invalid states
- Compute **semantic diffs** between intent versions
- Produce a **change plan** (not code)

LLMs are used only *after* the plan is finalized.

---

## 6. Progressive Compilation Model

Compilation is **incremental**:
- No regeneration of unchanged parts
- Only new or modified intents trigger changes
- Output is a set of small, scoped patch tasks

Key artifacts:
- Intent IR
- Semantic diff
- Patch plan
- Manifest mapping intent IDs → code anchors
- Lockfiles for implementation decisions

This ensures reproducibility and minimal diffs.

---

## 7. Patch-Only Code Generation

Rules:
- Code is never rewritten wholesale
- Each change is applied as a small patch
- Scope and intent of each patch is explicit

Agents:
- Do **not** decide what to change
- Only execute pre-scoped patch tasks
- Operate within strict constraints

This turns AI into a reliable execution engine.

---

## 8. Deletion and Refactoring (Reframed)

### No Hard Deletes
Deletion is modeled as **decommissioning**:
- active → deprecated → disabled → removed → archived

This allows:
- safe migration
- compiler warnings
- gradual cleanup

### Large Refactors
Handled via **migration intents**:
- explicit, multi-step plans
- compiler-enforced invariants
- applied as multiple small patch batches

Refactors become intentional, auditable evolution—not giant PRs.

---

## 9. Ownership Zones

To prevent runaway changes, the system defines zones:
- **Managed**: compiler-owned (schemas, scaffolding)
- **Patchable**: compiler suggests, human approves
- **Opaque**: compiler cannot modify

This preserves human authorship where it matters.

---

## 10. Garbage Collection Model

Code removal is implicit:
- Unreferenced intents produce unreachable artifacts
- Compiler can surface cleanup suggestions
- Actual deletion is optional and staged

The app behaves like a managed runtime.

---

## 11. Language / Framework Direction

Initial approach:
- Not a new language
- Intent framework inspired by Terraform / HCL
- Structured Natural Language within a strict schema

Possible evolution:
- Data-first intent files
- Optional restricted composition layer (Starlark-like)
- Canonical IR as single source of compilation truth

---

## 12. Long-Term Vision

- Programming shifts from authoring code → authoring intent
- AI agents become invisible compilation backends
- Codebases remain consistent, understandable, and evolvable
- Large changes are decomposed into safe, progressive steps

This is a **new development environment**, not an IDE feature.

