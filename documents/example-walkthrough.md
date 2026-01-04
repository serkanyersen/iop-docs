# Example Walkthrough: The Todo Service

This document demonstrates how the Orchestrator interprets a concrete example: the **Todo App Pack**.

## 1. Inputs
The developer provides a set of intent files:
*   `app.intent` (Entry point)
*   `features/todo/list.intent` (UI component)
*   `features/todo/entity.intent` (Data model)

## 2. Graph Construction
The Orchestrator builds dependencies:
*   `list.intent` renders `@todo_item`
*   `list.intent` depends on `@saving.todos`
*   `entity.intent` exports `fields` used by `@saving`

## 3. Scenario: Adding a "Notes" Field

The developer adds a `notes` field to `entity.intent`.

### Change in Intent
```diff
  entity "todo_item" {
    fields {
      title = "string"
+     notes = "string (optional, max 500 chars)"
    }
  }
```

### Generated Semantic Diff
The Orchestrator computes:
```
MODIFY_ENTITY_FIELD(entity.todo_item.v1::fields.notes)
```

### Impact Analysis
The system traverses the graph to see what uses `todo_item`:
1.  **Storage layer**: Needs a schema migration.
2.  **DTOs**: TypeScript interfaces need updating.
3.  **UI Details View**: Needs to display the new field.
4.  **UI Edit Form**: Needs an input for the new field.

### Generated Patch Plan
The Orchestrator proposes a specific order of operations:

1.  **Task 1 (Storage)**: Update database schema to add `notes` column.
2.  **Task 2 (Model)**: Update TypeScript `Todo` interface.
3.  **Task 3 (UI)**: Update `TodoDetails.tsx` to render `todo.notes`.
4.  **Task 4 (UI)**: Update `TodoEdit.tsx` to add textarea for `notes`.
5.  **Task 5 (Test)**: Add test case for optional notes.

## 4. Scenario: Decommissioning "Details Page"

The developer decides to remove the separate details page in favor of an inline expansion.

### Change in Intent
```diff
  view "todo_details" {
-   lifecycle = "active"
+   lifecycle = "deprecated"
  }

  component "todo_list" {
    block "interaction" {
-     text = "Clicking item navigates to details."
+     text = "Clicking item expands details inline."
    }
  }
```

### Generated Patch Plan
1.  **Task 1**: Update `TodoList.tsx` to implement inline expansion logic.
2.  **Task 2**: Add a "Deprecated" warning to `TodoDetails` route (or redirect).
3.  **Task 3**: Compiler now emits a **Warning** if any new intent tries to reference `@todo_details`.

This shows how IOP manages evolution safely, treating code deletions as managed deprecations.
