# IOP Iteration Notes: Agent–Compiler Protocol & Human-in-the-Loop Cycles

This document captures the proposed **development cycle** and the **Agent–Compiler protocol** for reliable patch-based code generation.

It reflects the key constraint: **validation cannot be fully automated**. Human evaluation is essential, especially for UX/behavior and real-world correctness.

Status: **Converging design**

---

## 1) Core Principles

1. **Orchestrator is deterministic authority**
   - owns parsing, graph building, semantic diffs, planning, verification gates
   - never “vibes” changes into existence

2. **Agents are scoped executors**
   - act only on patch tasks
   - cannot expand scope
   - must emit anchors + decision facts when they introduce choices

3. **Humans remain final validators**
   - especially for behavioral/UX correctness
   - system should *guide* human validation rather than pretend to replace it

4. **Conversation is optional and constrained**
   - to avoid drift and infinite chat loops
   - preference for structured interactions: checklists, multi-choice, forms

---

## 2) Two Nested Cycles

### Cycle A: Intent ↔ Orchestrator (Planning & Refinement)
Purpose: improve intent quality *before* code changes.

Stages:
1. Draft intent (can be vague)
2. Orchestrator validates structure (schema, references)
3. Orchestrator proposes missing details (as options)
4. Human selects/edits until plan stabilizes

Outputs of Cycle A:
- Updated intent(s)
- Verified intent graph
- **Implementation plan** (ordered patch tasks)
- Optional locked decisions (runtime/lib choices)

This resembles Antigravity’s plan-first workflow.

---

### Cycle B: Orchestrator ↔ Agent(s) (Implementation)
Purpose: apply approved plan as minimal, safe patches.

Stages:
1. Orchestrator assigns a patch task to an agent
2. Agent modifies code only within permitted anchors/zones
3. Agent produces:
   - code diff
   - updated anchors (if new)
   - decision facts (if new)
   - evidence: tests run, lint output
4. Orchestrator validates automatically (gate checks)
5. If pass: patch becomes eligible for human review

---

### Human Validation Loop (Reality Check)
Purpose: validate what automation can’t.

Stages:
1. Human runs/observes behavior (manual or semi-automated)
2. If issues exist, human submits structured feedback
3. Orchestrator converts feedback into:
   - intent refinements
   - or new patch tasks

Humans can bounce between Cycle A and Cycle B until satisfied.

---

## 3) Verification Gates (What is “Validated”?)

Validation must be multi-tiered.

### Gate 0: Intent correctness (Orchestrator)
- schema validity
- resolvable references
- no contradictory constraints (as detectable)
- required acceptance criteria presence (policy-based)

### Gate 1: Patch safety (Orchestrator)
- patch touches only allowed anchors
- ownership zones respected
- no unmanaged files modified without explicit approval

### Gate 2: Automated checks (Orchestrator)
- unit tests (fast)
- typecheck/lint
- API contract tests
- snapshot / golden tests where applicable

### Gate 3: Human acceptance (Human)
- behavior correctness
- UX correctness
- edge-case evaluation
- compatibility checks

Key premise: **Gate 3 cannot be eliminated**.

---

## 4) Agent–Compiler Protocol (Task Contract)

Each patch task must include:
- `task_id`
- `scope`: allowed anchors, files, zones
- `intent_refs`: which intent blocks are driving this task
- `constraints`: must not violate
- `acceptance`: how to prove completion
- `evidence_required`: tests/logs
- `decision_policy`: when to ask vs when to choose

Agent must return a structured result:
- `diff`
- `anchors_added/modified`
- `decisions_made` (facts)
- `checks_run` + results
- `notes` (brief, not a chat)

---

## 5) Failure Handling (The Missing Loop)

A cyclic loop is required when checks fail.

### Transaction model
- patches are applied in a temporary workspace
- only promoted if validation passes
- otherwise rejected cleanly

### Auto-retry policy
- allowed for deterministic failures (tests failing, lint errors)
- capped retries (e.g., 2–3)
- each retry must explain what changed

### Human intervention policy
- triggered after:
  - repeated failure
  - ambiguous acceptance criteria
  - missing information

---

## 6) Structured Human Interaction (Avoiding Old Chat-Driven Drift)

To reduce conversational drift, default interactions should be structured.

### Orchestrator → Human: “Option Cards”
Examples:
- Choose framework: A) Fastify B) Express C) Hono
- Choose auth strategy: A) JWT B) opaque token + introspection
- Choose persistence: A) SQLite B) Postgres

### Human → Orchestrator: “Feedback Forms”
Instead of freeform:
- Issue type: bug / mismatch / missing / unclear intent
- Where: endpoint / component / policy
- Expected behavior (short)
- Observed behavior (short)
- Evidence: logs/screenshot/test failure

### Human approvals
- “Approve plan”
- “Approve patch batch”
- “Request changes” with categorized reasons

Freeform conversation remains possible but is not the default.

---

## 7) Intent Refinement from Feedback

When humans report issues, the system should encourage:
- updating intents rather than “hotfixing code”

Two mechanisms:

1) **Issue → Intent suggestion**
   - an agent can summarize feedback and propose which intent blocks should change

2) **Patch request → Intent delta**
   - orchestrator generates suggested edits to intent blocks
   - human accepts/rejects

Outcome: the intent becomes more complete over time.

---

## 8) Roles Beyond Engineers

IOP targets broader roles (PM, design, legal, marketing).

Implications:
- intent authoring must start simple
- orchestrator must supply missing technical detail as options
- acceptance criteria can be co-authored via templates

Engineer mode:
- engineers can add strict technical constraints
- orchestrator must obey them and surface conflicts early

---

## 9) Suggested User Experience Summary

1) Write a minimal intent
2) Orchestrator asks structured questions (multi-choice + short inputs)
3) Orchestrator generates a plan for review
4) Human approves plan
5) Agents implement via patch tasks
6) Automated gates run
7) Human validates behavior
8) Feedback improves intents
9) Iterate until done

---

## 10) Open Questions (Next Iterations)

- How to best encode human feedback so it becomes deterministic intent improvements
- How to represent manual validation steps as checklists tied to acceptance criteria
- How much freeform conversation to allow, and when
- How to support environment-dependent validation (staging, real APIs)

---

## Summary

The core advancement here is the **dual-cycle workflow**:
- Intent refinement with orchestrator (plan-first)
- Implementation via agents (patch-only)

Human validation is treated as a first-class gate, not a failure of automation.

The system minimizes drift by defaulting to **structured interactions** rather than open-ended chat.

