# Intent-Oriented Programming (IOP)
## Glossary & Core Concepts

This document supplements the main *IOP – Working Notes* by defining shared vocabulary and mental models. Its goal is alignment, not completeness.

---

## Intent
A **declarative, addressable description** of a part of an application’s purpose, behavior, or structure.

Characteristics:
- Human-readable (structured natural language)
- Machine-addressable (stable IDs)
- Referenceable by other intents
- Independent of implementation details

Examples:
- Homepage intent
- Todo list intent
- Authentication intent
- Storage intent

An intent describes *what must exist*, not *how it is built*.

---

## Structured Natural Language (SNL)

**Structured Natural Language** is constrained English embedded in a strict schema.

It allows:
- Product-level clarity
- Non-programmer readability
- Deterministic compilation

Rules:
- Natural language appears only inside atomic blocks
- Every block has an ID
- Ambiguity is constrained via explicit lists (constraints, acceptance, non-goals)

SNL is not free prose. It is *prompt text with guardrails*.

---

## Atomic Block

An **atomic block** is the smallest unit of intent that can change independently.

Each atomic block contains:
- Text (purpose / description)
- Constraints (must not be violated)
- Acceptance criteria (must be true)
- Optional non-goals (explicit exclusions)
- Optional resources (designs, assets, references)

Atomic blocks are:
- Diffed semantically
- Planned independently
- Patched incrementally

---

## Intent Graph

The **intent graph** is the resolved dependency graph formed by all intents.

Nodes:
- Intents
- Atomic blocks

Edges:
- Renders
- Depends-on
- References
- Uses

The intent graph is the primary input to the orchestrator.

---

## Intent Orchestrator

The **intent orchestrator** is a deterministic compiler-like system.

It:
- Parses intent files
- Builds the intent graph
- Validates consistency
- Computes semantic diffs
- Produces patch plans
- Can leverage LLMs for planning, analysis, and decision-making

It does *not* generate code directly.

---

## Semantic Diff

A **semantic diff** is the difference between two versions of the intent graph.

Unlike text diffs, it operates on meaning:
- Added / removed intents
- Modified atomic blocks
- Changed dependencies
- Updated constraints or acceptance

Semantic diffs drive all downstream changes.

---

## Patch Plan

A **patch plan** is a structured, ordered list of small change tasks derived from a semantic diff.

Each task:
- Has a narrow scope
- Declares affected intent IDs
- Specifies constraints
- Targets known code anchors

Patch plans are stable, reviewable artifacts.

---

## Agent (Invisible Worker)

An **agent** is an implementation backend, not a collaborator.

Properties:
- Executes one patch task at a time
- Cannot change scope or intent
- Cannot introduce new concepts
- Operates under strict constraints

Agents are intentionally hidden from the developer experience.

---

## Manifest

The **manifest** records the relationship between intent artifacts and realized code.

It tracks:
- Intent ID → code anchor mappings
- Applied patch history
- Ownership zones
- Implementation decisions

The manifest enables incremental compilation and safe patching.

---

## Ownership Zones

Code is divided into zones:

- **Managed**: compiler-owned, freely patchable
- **Patchable**: compiler may propose changes
- **Opaque**: compiler cannot modify

Zones prevent accidental overreach and preserve human authorship.

---

## Lifecycle State

Intents move through lifecycle states:
- Active
- Deprecated
- Disabled
- Removed
- Archived

Deletion is modeled as *decommissioning*, not erasure.

---

## Migration Intent

A **migration intent** defines a multi-step evolution of intent structure.

It:
- Declares source and target intents
- Specifies ordered steps
- Enforces invariants
- Produces multiple patch batches

This reframes refactors as planned evolution.

---

## Progressive Compilation

Compilation is incremental by default:
- Only changed intents are recompiled
- Unchanged outputs are reused
- No global regeneration

This ensures stability and trust.

---

## Build Artifacts

**Build artifacts** are derived outputs:
- Source code
- Migrations
- Tests
- UI components

They are not the source of truth.

---

## Design Goal Summary

IOP aims to:
- Replace implicit intent with explicit structure
- Turn large changes into safe, incremental steps
- Make AI reliable by removing decision-making authority
- Keep applications understandable over time

This glossary defines the shared language needed to build the system.

