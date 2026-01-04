# Context Management & Retrieval Strategy

One of the hardest challenges in Agentic Coding is answering: *“What files does the agent need to see to solve this problem?”*

*   **Too little context**: The agent acts blindly, hallucinating imports or reinventing existing patterns.
*   **Too much context**: The agent gets overwhelmed, costs explode, and irrelevant details confuse the logic.

IOP solves this deterministically using the **Intent Graph**.

## The Context Builder

The **Context Builder** is a submodule of the Orchestrator. Its job is to assemble the perfect "Prompt Context" for a specific Patch Task.

Unlike chat-based tools that rely on vector search (RAG) or heuristic scraping, IOP uses **Graph-Walking Retrieval**.

### Strategy: Graph-Walking Retrieval

When a Patch Task is triggered by an Intent Block (e.g., `todo_list::interaction.add_item`), the Context Builder walks the graph to find dependencies.

1.  **Primary Target**: The code anchors directly owned by the modified Intent Block.
2.  **Explicit Dependencies**:
    *   If the intent `depends_on = ["@saving.todos"]`, the builder looks up the manifest entry for `@saving.todos`.
    *   It retrieves the **Interface/Signature** of that code, not the implementation.
3.  **Rendered Children**:
    *   If the intent `renders = ["@todo_item"]`, it retrieves the public props/interface of the `TodoItem` component.

### The "Context Header" Analogy

The Context Builder treats code like a compiler treats libraries: it needs the **Headers (.h, .d.ts)**, not the source.

*   **Managed Code**: The system extracts signatures from the live code anchors.
*   **Opaque (Legacy) Code**: The system reads the type definitions or explicit interface files marked in the intent.

## The Context Window Structure

For any given task, the agent receives a highly structured context window:

### 1. The Assignment
*   **Goal**: The text from the Intent Block.
*   **Constraints**: The hard rules from the Intent Block.

### 2. The Active Context (Read/Write)
*   The actual source code of the file/anchor being patched.
*   *Permission*: **EDIT**

### 3. The Reference Context (Read-Only)
*   **Interfaces**: `Todo` entity definition.
*   **Signatures**: `saveTodo(todo: Todo): Promise<void>`
*   **Style Guide**: Summarized conventions from `project.intent`.
*   *Permission*: **READ ONLY** (Agent cannot hallucinate changes to APIs it doesn't own).

## Handling Legacy Context (Opaque Zones)

In a Hybrid/Brownfield project, an agent might need to call a massive legacy `UserService.ts`.

1.  The Intent declares `depends_on = ["@legacy.user_service"]`.
2.  The Manifest maps `@legacy.user_service` to `src/legacy/UserService.ts`.
3.  The Context Builder **extracts only the public method signatures** from that file using AST parsing.
4.  The Agent sees `getUser(id): User`, but it does *not* see the 5,000 lines of spaghetti code implementation.

**Result**: The agent uses the legacy code correctly without being confused by its complexity.
