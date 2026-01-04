# Adoption Strategy: Brownfield & Hybrid

Real-world applications cannot require a complete rewrite to adopt Intent-Oriented Programming (IOP). This document outlines the **Hybrid Adoption Strategy**, which allows intents and legacy code to coexist.

## The Philosophy: Coexistence, Not Rewrite

We explicitly reject the "Big Bang" migration. Instead, we treat IOP as a virus that beneficially infects a codebase one module at a time.

*   **Legacy Code**: Treated as "Opaque" zones by default.
*   **New Code**: Written via Intents.
*   **Bridge**: Automated reverse-engineering tools to "Intentify" existing code on demand.

## Phase 1: Automated Bootstrapping

The goal of bootstrapping is not to convert everything, but to **teach the Orchestrator about the existing world** so it can operate safely within it.

### Step 1: Foundational Analysis
A high-intelligence agent (e.g., Gemini 3 Pro, Opus) performs a read-only pass of the repository to generate **Foundational Intents**.

*   **Inputs**: `package.json`, file structure, config files, existing patterns.
*   **Outputs**:
    *   `intents/project.intent`: Captures the tech stack (e.g., "React + Vite + Tailwind").
    *   `intents/conventions.intent`: Captures code style, folder structure rules, and naming conventions.
    *   **Result**: The Orchestrator now "knows" how to generate code that looks like it belongs in this project.

### Step 2: The "Low-Hanging Fruit" Pass
The agent identifies simple, self-contained components (e.g., UI atoms, utility functions) that are easy to model and converts them to intents.

*   **Goal**: Create a "reference set" of valid `.intent` files for the team to learn from.
*   **Outcome**: A `intents/examples/` folder is populated with real working examples from the codebase.

## Phase 2: Hybrid Development

Once bootstrapped, the project operates in a hybrid state.

### New Features
Developers write new `.intent` files. The Orchestrator generates new code that imports *existing legacy code* (via Opaque references) without needing to understand the implementation details of the legacy code.

### The "Intentify" Command
To migrate existing code incrementally, IOP provides an on-demand tool:

```bash
$ iop intentify src/components/Calendar.tsx
```

**What happens:**
1.  **Analysis**: The agent reads `Calendar.tsx` and its immediate dependencies.
2.  **Abstraction**: It reverse-engineers the *purpose* and *constraints* of the code.
3.  **Generation**: It produces `intents/components/calendar.intent`.
4.  **Anchoring**: It injects `@iop` headers and anchors into `Calendar.tsx`, formally transferring ownership to the new intent.

**Result**: The file is now "Managed" and editable via IOP.

## Roadmap Example
1.  **Day 1**: Run `iop init`. System learns stack and conventions.
2.  **Day 2**: Team writes *new* Feature X using `.intent` files.
3.  **Day 30**: Team decides to refactor the old "User Profile" page.
4.  **Action**: Run `iop intentify src/pages/Profile.tsx`.
5.  **Refactor**: Modify `profile.intent` to describe the new desired state.
6.  **Apply**: Orchestrator patches the code to match the new intent.

This strategy de-risks adoption by ensuring that IOP only touches what you explicitly ask it to manage.

## Ejection Strategy: No Vendor Lock-in

A critical design goal of IOP is that **generated code is just code**. It does not require a runtime library or a proprietary server to run.

If you decide to stop using IOP, you lose nothing but the automation.

### The "De-intentify" Command
To opt out, you can run:

```bash
$ iop deintentify src/components/Calendar.tsx
# OR
$ iop deintentify --all
```

**What happens:**
1.  **Stripping**: The tool removes all `/* @iop ... */` headers and `// @iop-anchor` comments.
2.  **Cleanup**: It deletes the `.intent` files and the `.iop` directory.
3.  **Result**: You are left with a standard, clean codebase (React, Python, etc.) exactly as if a human had written it.

**Zero Runtime Dependency**: Since IOP is a build-time orchestrator, your production application never depends on IOP "being there." You can eject at any time without breaking your app.
