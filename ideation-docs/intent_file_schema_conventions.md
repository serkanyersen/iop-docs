# Intent-Oriented Programming (IOP)
## Intent File Schema & Conventions

This document defines the **minimum schema** for intent files and the conventions that make them predictable, diffable, and compilable.

The intent language is **Structured Natural Language (SNL)**: natural-language text inside a strict, machine-addressable structure.

---

## 1. Design Goals for the Schema

The schema must enable:
- **Determinism**: same intents → same canonical IR
- **Incremental compilation**: only changed parts recompile
- **Semantic diffs**: changes are identified by stable IDs
- **Patch planning**: orchestrator can compute impact without interpreting prose
- **Human readability**: understandable without programming

---

## 2. File Organization

Recommended repo layout:

- `intents/` — all intent files
- `intents/app/` — app-level composition intents
- `intents/features/` — feature intents (todo, auth, profile, etc.)
- `intents/shared/` — shared resources and reusable intents
- `.iop/` — compiler artifacts (manifest, locks, caches)

Suggested file naming:
- One intent per file: `<intent_name>.intent`
- Use kebab-case or snake_case consistently

Examples:
- `intents/app/app.intent`
- `intents/features/todo/todo-list.intent`
- `intents/shared/branding.intent`

---

## 3. Intent Header (Required)

Every intent must define the following top-level fields:

### Required
- `intent` (string): the intent name
- `id` (string): stable globally unique identifier
- `kind` (enum): the intent category
- `version` (string): semantic version for the intent

### Recommended
- `title` (string): short human-readable label
- `summary` (string): one-line explanation
- `lifecycle` (enum): active/deprecated/disabled/removed/archived
- `owners` (list): teams or individuals
- `tags` (list): search and grouping

#### Kind (initial set)
- `app` — composition and entry points
- `view` — screen/route
- `component` — reusable UI piece
- `entity` — data model
- `actions` — mutations/commands
- `storage` — persistence behavior
- `policy` — authorization/privacy rules
- `migration` — multi-step evolution plan
- `resource` — design/assets references

---

## 4. References & Dependencies (Required where applicable)

Intents must explicitly declare references so the orchestrator can build an intent graph.

### Standard fields
- `renders`: list of intent references rendered/used directly
- `depends_on`: list of required upstream intents
- `uses`: list of supporting intents (resources, policies)
- `exports`: named capabilities this intent provides

### Reference syntax
- `@<intent_name>` — reference another intent
- `@<intent_name>.<export>` — reference an exported capability

Examples:
- `renders = ["@todo_list"]`
- `uses = ["@branding", "@a11y.policy"]`

Notes:
- References must be resolvable at compile time.
- Orchestrator must flag unknown references as errors.

---

## 5. Atomic Blocks (Required)

All natural language must be inside **atomic blocks**.

### Atomic block requirements
- Each block has a stable ID (unique within intent)
- Each block contains `text`
- Each block contains at least one of:
  - `constraints`
  - `acceptance`
  - `non_goals`

### Block types (recommended)
- `purpose` — why this intent exists
- `define` — a concrete behavior or requirement
- `notes` — non-normative commentary

### Minimal block shape
- `id` (string)
- `text` (string)
- `resources` (map, optional)
- `constraints` (list, optional)
- `acceptance` (list, optional)
- `non_goals` (list, optional)
- `severity` (enum, optional): `error | warning | info`

---

## 6. Resources (Strongly Recommended)

Resources are any external inputs that guide implementation.

Examples:
- Figma links
- Asset paths
- Copy decks
- Branding guidelines
- API references

Resource keys should be stable and descriptive:
- `figma_design`
- `icons_dir`
- `copy_source`
- `brand_guidelines`

Resources must be declared per atomic block when they are relevant.

---

## 7. Constraints, Acceptance, Non-goals

These are the primary mechanisms to reduce ambiguity.

### Constraints
Hard rules that must not be violated.
- Prefer short, testable statements
- Avoid subjective language when possible

Examples:
- “No viewport scrolling; list scrolls internally”
- “Drag handle only; not the entire card”
- “Do not add new dependencies”

### Acceptance
Observable outcomes that must be true.
- Ideally testable in CI

Examples:
- “Order persists after refresh”
- “Keyboard can reorder via fallback controls”

### Non-goals
Explicitly states what not to build.
- Used to prevent agent scope creep

Examples:
- “No animations beyond basic hover state”
- “No multi-select dragging”

---

## 8. Recommended Machine-Visible Fields (By Kind)

These fields make orchestration possible without reading prose.

### view
- `route` (string)
- `params` (map)
- `renders` (list)

### component
- `inputs` (map)
- `renders` (list)

### entity
- `fields` (map)
- `types` (optional)

### actions
- `actions` (list or map)
- `effects` (structured, stack-agnostic)

### storage
- `entities` used
- `persistence` declarations

### policy
- `rules` (structured)
- `scope` (what it governs)

### migration
- `from`, `to`
- `steps` (ordered)
- `invariants`

Note: the initial MVP can support only a subset.

---

## 9. Canonicalization Rules (For Deterministic IR)

To make caching and semantic diffs reliable, the orchestrator must produce a canonical IR.

Recommended rules:
- Sort keys deterministically
- Normalize whitespace in `text` (preserve meaning)
- Resolve defaults explicitly
- Maintain stable ordering for lists where order is not semantically meaningful
- Assign stable IDs for unnamed substructures (or require explicit IDs)

The canonical IR is what the orchestrator diffs.

---

## 10. Linting & Validation

The orchestrator should provide compiler-style validation:

### Errors (fail compilation)
- Unknown intent references
- Duplicate IDs
- Missing required header fields
- Atomic blocks missing required structure
- Cycles where forbidden (optional)

### Warnings (compile allowed)
- Missing acceptance criteria
- Missing resources where expected
- Ambiguous language (heuristic)
- Unused exports

### Infos
- Suggestions for consistency
- Potentially impacted views/components

---

## 11. Example Minimal Intent Skeleton

(Conceptual structure, not final syntax)

- `intent`: "todo_list"
- `id`: "component.todo_list.v1"
- `kind`: "component"
- `version`: "1.0.0"
- `renders`: ["@todo_item"]
- `depends_on`: ["@saving"]
- `blocks`:
  - `purpose p0`
  - `define render.list`
  - `define interaction.drag_drop`

---

## 12. Open Questions (Intentionally Unresolved)

These are schema decisions to finalize later:
- How strict to be about machine-visible fields in MVP
- Whether `text` is a single string or structured sentences
- Whether block IDs are hierarchical (recommended) or flat
- How to represent conditional behavior without adding full programming
- How to represent effects/actions without committing to a stack

---

## Summary

The schema is designed to strike a balance:
- Natural language for human clarity
- Strict structure for deterministic orchestration
- Atomic blocks for stable semantic diffs

This enables progressive compilation and patch-only evolution while keeping the system legible.

