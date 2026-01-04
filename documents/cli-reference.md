# IOP CLI Reference

This document serves as the reference guide for the `iop` command-line interface. Use these commands to interact with the Intent Orchestrator.

## Core Workflow

### `iop plan`
Analyzes the current state of Intents vs. Code and generates a preview of operations.
*   **Usage**: `iop plan [flags]`
*   **Output**: A list of proposed Patch Tasks (ADD, MODIFY, DELETE).
*   **Analogy**: `terraform plan`.

### `iop apply`
Executes the pending Patch Tasks using Agent workers.
*   **Usage**: `iop apply [flags]`
*   **Flags**:
    *   `--dry-run`: Same as `plan`.
    *   `--auto-approve`: Skip interactive confirmation (CI mode).
*   **Analogy**: `terraform apply` / `kubectl apply`.

### `iop check`
Validates the syntax and integrity of `.intent` files.
*   **Usage**: `iop check`
*   **Checks**: Schema validation, missing references, circular dependencies.
*   **Use Case**: Run this in CI before merging PRs.

### `iop status`
Checks for **Drift** (discrepancies between the Manifest and the Code).
*   **Usage**: `iop status`
*   **Output**: "Clean" or "Drift Detected" (e.g., File changed manually outside of Anchor rules).

## Adoption & Ejection

### `iop init`
Initializes a new IOP workspace.
*   **Usage**: `iop init`
*   **Effect**: Creates `.iop/`, `intents/`, and `app.intent`.

### `iop intentify`
Bootstraps an existing file into the IOP system.
*   **Usage**: `iop intentify <path-to-file>`
*   **Effect**:
    1.  Reverse-engineers existing logic into an `.intent` file.
    2.  Adds `@iop` anchors to the source file.

### `iop deintentify`
Removes IOP artifacts from a file or project.
*   **Usage**: `iop deintentify <path-to-file> | --all`
*   **Effect**: Strips headers/anchors, deletes intent files. Leaves clean code used.

## Debugging

### `iop doctor`
Diagnoses system issues.
*   **Usage**: `iop doctor`
*   **Checks**: Agent API connectivity, permission issues, manifest corruption.
