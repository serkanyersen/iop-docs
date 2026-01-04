# Collaboration & Merge Strategy

Collaborating on Intents is similar to collaborating on schema files (Protobuf, Thrift, SQL) or standard code. This document outlines the workflow for teams working on shared Intent files.

## The Mental Model: "Merge, Then Recompile"

IOP follows the standard Continuous Integration flow. You do not merge the *generated code patches* manually; you merge the *Intents*.

> **Analogy**: Think of `.intent` files like `.proto` files. After you merge a branch that changed a `.proto` file, you must run the compiler to regenerate the language bindings.

### The Workflow

1.  **Branch**: Developer A and Developer B create feature branches.
2.  **Edit**: They both modify `app.intent`.
3.  **Merge**: They open PRs. Git handles the text merge.
4.  **Resolve**: If they touched the same Atomic Block, a conflict occurs.
5.  **Compile**: After merging, the CI (or local dev) runs `iop compile`. The Orchestrator computes the new state and patches the code to match the merged intent.

## Handling Conflicts

### 1. Natural Language Conflicts
If two developers edit the `text` of the same block:
*   **Conflict**: Git markup (`<<<<<<< HEAD`).
*   **Resolution**: The human deciding the merge must read both versions and synthesize them.
    *   *Dev A*: "The list must be sorted by date."
    *   *Dev B*: "The list must be sorted by priority."
    *   *Resolution*: "The list must be sorted by priority, then date."
*   **Outcome**: The Orchestrator sees this as a `MODIFY_BLOCK` and generates a patch to implement the new combined logic.

### 2. ID/Structure Conflicts
If two developers add a block with the same ID (rare, if conventions are followed):
*   **Resolution**: One must be renamed.
*   **Outcome**: The Orchestrator sees an `ADD_BLOCK` for the new ID.

### 3. Generated Artifact Conflicts
*   **Manifests**: Since manifests are sharded per-intent (e.g., `.iop/manifests/feature.v1.json`), conflicts are rare unless two people edit the exact same feature.
*   **Lockfiles**: Standard lockfile merge strategies apply.

## The Post-Merge Re-Compilation: Patching, Not Rewriting

After a git merge, the codebase might be momentarily out of sync with the combined intent. However, running the compiler **does not trigger a full rewrite**.

### 1. Manual Code Merging
Just as you merged the intents, you also merge the code conflicts using standard Git tools.
    *   *Dev A's code* + *Dev B's code* = *Merged Code*.

### 2. Manual Trigger of the Orchestrator
Merging the files does not update the code automatically. The codebase is now in a **"Pending Intent" state**. You must explicitly trigger the Orchestrator to reconcile the difference.

```bash
$ iop plan  # See what the merge requires
$ iop apply # Execute the necessary patches
```

*   **Batching**: The Orchestrator analyzes *all* changes from the merge together.
*   **Efficiency**: It asks: *"Does the manually merged code already satisfy the merged intent?"*
    *   **Outcome A**: Yes. (Zero-op).
    *   **Outcome B**: No. A specific patch is generated to close the gap.

**Rule**: Never commit a merge result to `main` without running `iop apply` first. The repository should always be in a consistent state where `Code == Intent`.

## CI/CD integration

CI pipelines should enforce:
1.  **Intent Validity**: `iop check` passes on the PR.
2.  **Drift Check**: `iop status` confirms that the code matches the intent (no unapplied patches).

This ensures that `main` is always a valid, compiled state.
