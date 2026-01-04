# Developer Workflow

IOP introduces a **Dual-Cycle Workflow** that strictly separates *Planning* from *Implementation*.

## Cycle A: Planning (Intent ↔ Orchestrator)
**Goal**: Define *what* to build and verify the plan.

1.  **Draft Intent**: Developer writes or updates an `.intent` file.
2.  **Compile**: Orchestrator validates the schema and structure.
3.  **Refine**:
    *   Orchestrator may request missing details ("What fields are in this entity?").
    *   Human provides answers via structured options.
4.  **Plan Generation**: Orchestrator produces a **Patch Plan**.
5.  **Approval**: Human reviews the plan (not the code yet).

## Cycle B: Implementation (Orchestrator ↔ Agent)
**Goal**: Execute the approved plan reliably.

1.  **Dispatch**: Orchestrator assigns a single **Patch Task** to an Agent.
2.  **Execution**: Agent modifies code *only* within the allowed **Code Anchors** and **Ownership Zones**.
3.  **Gate Checks**:
    *   **Gate 0 (Structure)**: Did the agent respect the allowed scope?
    *   **Gate 1 (Automated)**: Do tests and linters pass?
4.  **Promotion**: If gates pass, the patch is applied.

## The Human in the Loop (Verification)

Automation handles the "mechanical" verification, but humans handle the "behavioral" verification.

### Verification Gates
1.  **Intent Correctness**: (Auto) Schema & Logic.
2.  **Patch Safety**: (Auto) Scope & Anchors.
3.  **Code Correctness**: (Auto) Tests & Lints.
4.  **Behavioral Acceptance**: (**Human**) User Experience & Correctness.

### Feedback Loop
If the human finds a bug during Behavioral Acceptance:
*   **Traditional**: Fix the code manually.
*   **IOP Way**: **Update the Intent** (e.g., add a new constraint or test case) and let the system re-patch. This ensures the Intent remains the Source of Truth.

## Agent-Compiler Protocol
Agents are not chat bots here. They follow a strict protocol:
*   **Input**: Task ID, Scope (Files/Anchors), Constraints, Acceptance Criteria.
*   **Output**: Code Diff, Updated Anchors, Evidence (Test Logs).

This structured interaction prevents "drift" and hallucinations common in open-ended chat sessions.
