# Implementation Roadmap (Bill of Materials)

To transform Intent-Oriented Programming from a specification into a working ecosystem, we need to build the following software components.

## 1. The Core (The Orchestrator)
The brain of the operation. Ideally written in a high-performance system language (Rust or Go) for speed and portability.

*   **CLI Binary (`iop`)**:
    *   **Parser**: A robust HCL/SNL parser (likely using `tree-sitter-snl` or a custom recursive descent parser).
    *   **Graph Engine**: Logic to build the DAG, detect cycles, and resolve `@` references.
    *   **Semantic Differ**: The core engine that compares `Intent State A` vs `Intent State B` vs `Code Manifest`.
    *   **Task Scheduler**: Dispatches work to local or remote agents.

## 2. Language Tooling (The DX Layer)
For developers to actually *write* intents, they need modern editor support.

*   **Language Server (LSP)**:
    *   **Validation**: Real-time error reporting (missing dependents, invalid types).
    *   **Navigation**: "Go to Definition" for references (cmd+click `@auth`).
    *   **Autocompletion**: Suggesting `id`s from the workspace in `depends_on`.
*   **VS Code Extension**:
    *   Bundles the LSP.
    *   Syntax Highlighting support for `.intent` files.
    *   Snippets for common blocks (`block`, `intent`).

## 3. The Agent Protocol & SDK
We need a standard way for the Orchestrator to talk to "Workers" (LLMs or Scripts).

*   **IOP Agent Protocol (IAP)**:
    *   A gRPC/JSON-RPC spec defining messages like `TaskRequest` (Context, Scope) and `TaskResponse` (Patch, Evidence).
*   **Agent SDKs**:
    *   **Python/TypeScript SDK**: wrapper libraries so developers can write custom agents effortlessly.
    *   *Example*: `@iop/sdk` exposes `agent.on('task', (ctx) => ...)`

## 4. The Standard Library (@iop/std)
A "Batteries Included" set of intents so users don't start from scratch.

*   **Foundation Packs**:
    *   `@iop/std.git`: Gitignore patterns, commit conventions.
    *   `@iop/std.web`: Common web app patterns (React, Vue constraints).
    *   `@iop/std.cloud`: AWS/GCP basic resource models.

## 5. The Development Environment (Future)
The "Integrated" experience envisioned in the Future Vision doc.

*   **IOP Visual Studio (Fork)**:
    *   A customized IDE (likely a VS Code fork or extension pack).
    *   **Graph View**: A React-based node editor rendering the `.intent` graph live.
    *   **Chat-to-Intent**: Integrated AI chat that writes `.intent` files, not code.

## 6. Cloud Registry
To share intents like npm packages.

*   **iop.sh (Registry)**:
    *   Host for versioned `.intent` packs.
    *   Resolution service for `depends_on = "github.com/org/pack"`.
