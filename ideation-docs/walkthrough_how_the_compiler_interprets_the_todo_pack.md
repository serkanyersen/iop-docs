# IOP Walkthrough: How the Compiler Interprets the Todo Pack

This document explains how the **intent orchestrator/compiler** would interpret the *Complete Todo App (Pure Intents)* pack.

It focuses on:
- What the compiler builds internally (IR + graph)
- How validation works (errors/warnings)
- How semantic diffs are computed
- How patch plans are produced progressively

This is a conceptual walkthrough; exact formats can be finalized later.

---

## 1) Inputs to Compilation

The compiler consumes:

1. **Intent sources** (`intents/**/*.intent`)
2. **Compiler artifacts** (if present):
   - `.iop/lock.json` — pinned implementation decisions
   - `.iop/manifest.json` — intent→code anchor mapping + patch history
   - `.iop/cache/` — cached IR and compiled outputs

The compiler’s job is to produce:
- a canonical IR
- an intent graph
- validation results
- a patch plan (if changes exist)

---

## 2) Parsing & Canonicalization

### 2.1 Parse
Each file is parsed into a structured in-memory representation:
- intent header
- references/dependencies
- atomic blocks
- machine-visible fields (route, inputs, fields, actions, etc.)

### 2.2 Canonicalization
To ensure determinism, the compiler normalizes:
- whitespace + indentation in `text` blocks
- stable ordering for fields where order is not semantically meaningful
- explicit defaults (e.g., lifecycle defaults to `active`)
- stable IDs for substructures (or errors if missing)

Output: **Canonical Intent IR**, suitable for hashing and diffing.

---

## 3) Building the Intent Graph

### 3.1 Nodes
The compiler constructs nodes for:
- each intent (e.g., `view.homepage.v1`)
- each atomic block (e.g., `component.todo_list.v1::define.interaction.drag_drop`)

### 3.2 Edges
Edges are created from explicit fields:

- `renders`: UI composition edges
  - homepage → todo_list
  - todo_list → todo_create
  - todo_list → todo_item
  - todo_item → todo_details
  - todo_details → todo_edit

- `depends_on`: required capability edges
  - todo_list → saving.todos
  - todo_actions → saving.todos

- `uses`: policy/resource edges
  - most UI intents → a11y_policy
  - homepage → branding

- `exports`: capability nodes
  - saving exports `todos`
  - todo_actions exports actions

The graph is **fully resolvable** without interpreting English prose.

---

## 4) What the Compiler Derives (Without LLMs)

Even with natural language, the compiler can deterministically derive:

### 4.1 Feature topology
- entry point
- screens/routes
- which parts render which

### 4.2 Data dependencies
- which views/components depend on which data collections
- which actions mutate which collections

### 4.3 Impact surfaces
- what a change can affect (schema, API surface, UI, tests)

### 4.4 Ownership boundaries
Using the manifest (once implemented), it knows:
- managed zones
- patchable zones
- opaque zones

---

## 5) Validation: Compiler Errors vs Warnings

### 5.1 Errors (fail compilation)
The compiler fails fast when:
- an intent ID is duplicated
- a referenced intent cannot be resolved
- a referenced export does not exist
- a view route conflicts with another route
- a required header field is missing
- an atomic block lacks structure (e.g., no `text`)

Examples in the Todo pack:
- `@saving.todos` must resolve to an export in `saving.intent`
- `@todo_actions.create` must exist in `todo-actions.intent`

### 5.2 Warnings (compile continues)
- missing acceptance criteria in a define block
- missing resources for UI intents
- ambiguous language heuristics (optional)
- unused exports

### 5.3 Policy-driven checks
Policies can add deterministic validations. For example:
- `@a11y_policy` might require every interactive block to include a keyboard accessibility constraint.

---

## 6) Semantic Diff: What Changes Mean

The compiler diffs **canonical IR**, not text.

Diff granularity:
1. Intent-level changes
2. Atomic block changes
3. Reference graph changes
4. Machine-visible field changes

The semantic diff is represented as operations like:
- `ADD_INTENT(component.todo_edit.v1)`
- `MODIFY_BLOCK(component.todo_list.v1::define.interaction.drag_drop)`
- `ADD_EDGE(homepage → todo_list)`
- `MODIFY_ENTITY_FIELD(entity.todo_item.v1::field.title)`

Because blocks and intents are stable-IDed, diffing is resilient to formatting.

---

## 7) Patch Planning: From Diff → Tasks

The patch plan is generated in two steps:

### 7.1 Impact Analysis
The compiler traverses the graph starting from changed nodes.

Examples:
- Changing `entity.todo_item.v1::fields.core` impacts:
  - saving (storage mapping)
  - actions (effects validation)
  - views/components that mention or display fields

- Changing `todo_list::interaction.drag_drop` impacts:
  - todo_list UI
  - reorder action
  - possibly a11y policy compliance

### 7.2 Task Synthesis
Compiler emits a list of **small patch tasks**.

Each task includes:
- scope (files/anchors)
- intent IDs involved
- required constraints
- acceptance targets (tests or checks)
- ordering dependencies

Agents are invoked only at this stage.

---

## 8) Progressive Compilation Behavior

The compiler does not rebuild the whole app.

It uses:
- IR hashes of each intent and block
- manifest mapping to code anchors

If only one block changes:
- only tasks connected to that block are generated
- unrelated areas remain untouched

This is analogous to:
- incremental builds in compilers
- incremental apply in infra tools

---

## 9) Worked Change Examples

### Example A: Add a new field to Todo items: `notes`

#### Intent change
- Update `todo_entity::fields.core` to include `notes` (optional, max length)
- Update `todo_details::ui.content` to display notes
- Update `todo_edit` to allow editing notes
- Update `todo_actions` to update notes

#### Semantic diff
- `MODIFY_ENTITY_FIELD(todo_item.notes)`
- `MODIFY_BLOCK(todo_details::ui.content)`
- `MODIFY_BLOCK(todo_edit::ui.form)`
- `MODIFY_ACTION(todo_actions.update_notes)` (added or modified)

#### Patch plan (conceptual)
1. Storage schema update task (add column/field)
2. Data model update task
3. Details view rendering task
4. Edit form update task
5. Action/update logic task
6. Tests: validation + persistence

Optional suggestion (warning-level):
- “Do you want to show notes preview in the list?”

---

### Example B: Change drag-and-drop behavior

#### Intent change
- Modify `todo_list::interaction.drag_drop` constraints to require keyboard fallback

#### Semantic diff
- `MODIFY_BLOCK(todo_list::interaction.drag_drop)`

#### Patch plan
1. Implement keyboard reorder controls (up/down)
2. Ensure reorder action is used
3. Add accessibility tests

No schema changes.

---

### Example C: Remove the details page (decommission)

Instead of deleting files, the intent lifecycle changes.

#### Intent change
- Set `todo_details.lifecycle = deprecated`
- Update `todo_item::interaction.open_details` to open inline details

#### Semantic diff
- `MODIFY_INTENT(todo_details.lifecycle)`
- `MODIFY_BLOCK(todo_item::interaction.open_details)`

#### Patch plan
1. Replace navigation with inline expansion
2. Keep route working but show deprecation notice or redirect
3. Add a compiler warning preventing new references to `@todo_details`

---

## 10) Artifacts Emitted by the Compiler

On each compile run, the system should emit:

- `build/intent_graph.json` (or equivalent)
- `build/semantic_diff.json` (if changes)
- `build/patch_plan.json` (if changes)
- updated `.iop/manifest.json`
- updated `.iop/cache/` entries

These are reviewable and can be checked into CI logs.

---

## 11) Practical Guardrails

To keep behavior consistent over time:

- Prefer **block-level edits** over broad changes
- Require acceptance criteria for user-facing blocks
- Use non-goals to constrain scope
- Treat policies as deterministic validators
- Make the compiler refuse unresolvable references

---

## Summary

The key point: the compiler derives most structure from **explicit graph and stable IDs**, not from prose.

Natural language is permitted, but:
- it is contained in atomic blocks
- it is constrained by deterministic fields
- it is validated and planned via semantic diffs

This enables progressive compilation and patch-only evolution with AI as an invisible backend.

