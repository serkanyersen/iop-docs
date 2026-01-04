# IOP Example Pack: Complete Todo App (Pure Intents)

This pack is a **complete** Todo application described using **Structured Natural Language (SNL)** inside strict intent structure.

Goals of the pack:
- Demonstrate *composition* (homepage renders todo list)
- Demonstrate *references* (list → item → details)
- Demonstrate *storage + actions* (create/update/delete/reorder)
- Demonstrate *progressive change friendliness* (atomic blocks with stable IDs)
- Remain understandable without programming knowledge

> Notes
> - This is **intents only**: no stack, no language, no framework.
> - Implementation choices are deferred to the orchestrator + lockfiles.

---

## 0) `intents/app/app.intent`

intent "app" {
  id      = "app.todo.v1"
  kind    = "app"
  version = "1.0.0"
  title   = "Todo"
  lifecycle = "active"

  uses = ["@branding", "@a11y_policy", "@saving"]
  exports = {
    entry = "@homepage"
  }

  purpose "p0" {
    text = <<PROMPT
A simple Todo application for creating, reordering, completing, and deleting todos.
The entry screen is @homepage.
PROMPT

    constraints = [
      "App is usable on mobile and desktop",
      "Core flows: create, view, edit, complete, reorder, delete",
      "Data persists across refresh"
    ]
  }
}

---

## 1) `intents/shared/branding.intent`

intent "branding" {
  id      = "resource.branding.v1"
  kind    = "resource"
  version = "1.0.0"
  title   = "Branding"
  lifecycle = "active"

  exports = {
    resource = "@branding"
  }

  purpose "p0" {
    text = <<PROMPT
Defines the app’s visual identity and tone.
PROMPT

    resources = {
      figma_style_guide = "<FIGMA_LINK_STYLE_GUIDE>"
      icons_dir         = "assets/icons/"
      copy_doc          = "<COPY_DOC_LINK>"
    }

    constraints = [
      "Typography, spacing, and colors should follow the style guide",
      "Icons must be sourced from icons_dir or the style guide"
    ]
  }
}

---

## 2) `intents/shared/a11y-policy.intent`

intent "a11y_policy" {
  id      = "policy.a11y.v1"
  kind    = "policy"
  version = "1.0.0"
  title   = "Accessibility Policy"
  lifecycle = "active"

  exports = {
    policy = "@a11y_policy"
  }

  purpose "p0" {
    text = <<PROMPT
Ensures the Todo app is accessible via keyboard and assistive technologies.
PROMPT

    constraints = [
      "All interactive elements are keyboard reachable",
      "Visible focus states exist",
      "Controls have accessible labels",
      "No critical action is mouse-only; provide a keyboard alternative"
    ]
  }
}

---

## 3) `intents/data/todo-entity.intent`

intent "todo_entity" {
  id      = "entity.todo_item.v1"
  kind    = "entity"
  version = "1.0.0"
  title   = "Todo Item Entity"
  lifecycle = "active"

  exports = {
    entity = "@todo_entity"
  }

  purpose "p0" {
    text = <<PROMPT
Represents a single todo item created by the user.
PROMPT

    constraints = [
      "Each todo item has a stable identifier",
      "Title is user-provided text",
      "Completed is a boolean state",
      "Order is a numeric position for stable list ordering"
    ]
  }

  define "fields.core" {
    text = <<PROMPT
The todo item includes: id, title, completed, order, created_at, updated_at.
PROMPT

    acceptance = [
      "An item can be uniquely identified",
      "Items can be sorted deterministically by order"
    ]

    # Machine-visible (optional in MVP but shown here)
    fields = {
      id         = { type = "id", required = true }
      title      = { type = "string", required = true, max_len = 140, trim = true }
      completed  = { type = "bool", required = true, default = false }
      order      = { type = "number", required = true }
      created_at = { type = "timestamp", required = true, default = "now" }
      updated_at = { type = "timestamp", required = true, default = "now" }
    }
  }
}

---

## 4) `intents/data/saving.intent`

intent "saving" {
  id      = "storage.todo.v1"
  kind    = "storage"
  version = "1.0.0"
  title   = "Todo Storage"
  lifecycle = "active"

  depends_on = ["@todo_entity"]
  exports = {
    todos = "@saving.todos"
  }

  purpose "p0" {
    text = <<PROMPT
Stores todo items and provides query and write capabilities.
The storage mechanism is an implementation detail chosen and locked by the orchestrator.
PROMPT

    constraints = [
      "Data persists across refresh",
      "Reads are fast enough for interactive list updates",
      "Writes are durable and reflected immediately"
    ]
  }

  define "collection.todos" {
    text = <<PROMPT
Provide a collection of todo items that can be listed by order, fetched by id, and updated.
PROMPT

    acceptance = [
      "Can list all items ordered by the order field",
      "Can fetch a single item by id",
      "Can create, update, delete items"
    ]

    # Machine-visible declaration of capability (stack-agnostic)
    collection "todos" {
      entity = "@todo_entity"
      primary_key = "id"
      ordering = { field = "order", direction = "asc" }
    }
  }
}

---

## 5) `intents/features/homepage.intent`

intent "homepage" {
  id      = "view.homepage.v1"
  kind    = "view"
  version = "1.0.0"
  title   = "Homepage"
  lifecycle = "active"

  route = "/"
  renders = ["@todo_list"]
  uses = ["@branding", "@a11y_policy"]

  purpose "p0" {
    text = <<PROMPT
This is the first page users see when arriving at the app.
It clearly displays the todo list in a large, accessible UI.
Follow @branding.resource for typography and spacing.
PROMPT

    resources = {
      figma_design = "<FIGMA_LINK_HOMEPAGE>"
      branding     = "@branding.resource"
    }

    constraints = [
      "No viewport scrolling; the list scrolls internally",
      "Primary interaction is creating and managing todos",
      "Layout works at 320px width"
    ]
  }

  define "layout.shell" {
    text = <<PROMPT
Render a header with the app name and a clear primary action to add a todo.
Below the header, render @todo_list filling the remaining vertical space.
PROMPT

    acceptance = [
      "Header remains visible while the list scrolls",
      "Primary action is visually prominent"
    ]

    non_goals = [
      "No onboarding flow",
      "No account/login"
    ]
  }
}

---

## 6) `intents/features/todo-list.intent`

intent "todo_list" {
  id      = "component.todo_list.v1"
  kind    = "component"
  version = "1.0.0"
  title   = "Todo List"
  lifecycle = "active"

  depends_on = ["@saving.todos"]
  renders = ["@todo_create", "@todo_item"]
  uses = ["@a11y_policy"]

  purpose "p0" {
    text = <<PROMPT
Displays all todo items and supports reordering.
Renders @todo_item for each todo.
PROMPT

    constraints = [
      "List is ordered by the item order field",
      "Reordering updates the saved order",
      "List scrolls internally; page does not scroll"
    ]
  }

  define "render.create" {
    text = <<PROMPT
At the top of the list area, render @todo_create.
Creating a todo inserts it at the top of the list unless otherwise specified.
PROMPT

    acceptance = [
      "User can add a todo without leaving the page",
      "After creation, the new item appears in the list"
    ]
  }

  define "render.items" {
    text = <<PROMPT
Render todo items in a vertical list with clear separation.
Each item appears as a rounded card with a blue border and 5px padding.
PROMPT

    resources = {
      figma_design = "<FIGMA_LINK_TODO_LIST>"
    }

    constraints = [
      "Vertical layout",
      "Rounded corners",
      "Blue border",
      "Padding is 5px"
    ]

    acceptance = [
      "Items are readable and visually separated",
      "Completed and active items are distinguishable"
    ]
  }

  define "interaction.drag_drop" {
    text = <<PROMPT
Items can be drag-and-dropped to reorder.
Drag handle is on the left with a grip icon.
PROMPT

    resources = {
      grip_icon = "assets/icons/grip.svg"
    }

    constraints = [
      "Dragging uses handle only, not the entire item",
      "Provide keyboard-accessible fallback for reordering",
      "Reordering persists across refresh"
    ]

    acceptance = [
      "Dragging updates order visually",
      "Dropping updates saved order",
      "Keyboard users can reorder without dragging"
    ]

    non_goals = [
      "No multi-select reorder",
      "No advanced animations beyond basic feedback"
    ]
  }

  define "empty_state" {
    text = <<PROMPT
When there are no todos, show a friendly empty state message and prompt to add a todo.
PROMPT

    acceptance = [
      "Empty state only appears when the list is empty",
      "Empty state does not prevent adding a todo"
    ]
  }
}

---

## 7) `intents/features/todo-create.intent`

intent "todo_create" {
  id      = "component.todo_create.v1"
  kind    = "component"
  version = "1.0.0"
  title   = "Todo Create"
  lifecycle = "active"

  depends_on = ["@todo_actions.create"]
  uses = ["@a11y_policy"]

  purpose "p0" {
    text = <<PROMPT
Allows the user to create a new todo item by entering a title and submitting.
PROMPT

    constraints = [
      "Title is required",
      "Title is trimmed",
      "Title max length is 140 characters",
      "Submission is possible via keyboard"
    ]
  }

  define "ui.form" {
    text = <<PROMPT
Provide a single-line input with placeholder text “Add a todo…”.
Provide a clear submit action labeled “Add”.
PROMPT

    acceptance = [
      "Pressing Enter submits when input is focused",
      "After submit, input clears",
      "If validation fails, show a clear error message"
    ]
  }
}

---

## 8) `intents/features/todo-item.intent`

intent "todo_item" {
  id      = "component.todo_item.v1"
  kind    = "component"
  version = "1.0.0"
  title   = "Todo Item"
  lifecycle = "active"

  renders = ["@todo_details"]
  depends_on = ["@saving.todos", "@todo_actions.set_completed", "@todo_actions.delete"]
  uses = ["@a11y_policy"]

  # Machine-visible input
  inputs = {
    todo_id = { type = "id" }
  }

  purpose "p0" {
    text = <<PROMPT
Represents a single todo in the list with completion toggle, title, and delete action.
Clicking the item opens @todo_details for that todo.
PROMPT

    constraints = [
      "Completion toggle is immediate and visible",
      "Delete is a deliberate action (confirmation or undo)",
      "Completed items appear visually distinct"
    ]
  }

  define "ui.layout" {
    text = <<PROMPT
Show a drag handle on the left, then a checkbox, then the todo title.
On the right, show a subtle indicator that details are available (e.g., chevron).
PROMPT

    acceptance = [
      "Checkbox is reachable by keyboard",
      "Title is readable and truncates gracefully if long"
    ]
  }

  define "interaction.open_details" {
    text = <<PROMPT
Clicking the item (excluding the checkbox and delete control) navigates to @todo_details.
PROMPT

    acceptance = [
      "User can open details with mouse",
      "User can open details with keyboard"
    ]
  }

  define "interaction.delete" {
    text = <<PROMPT
Provide a delete control for the item.
Deleting either asks for confirmation or offers a short undo opportunity.
PROMPT

    constraints = [
      "Deletion is not triggered accidentally",
      "After deletion, item disappears from the list"
    ]

    acceptance = [
      "User can delete an item",
      "UI provides feedback that the item was deleted"
    ]

    non_goals = [
      "No bulk delete"
    ]
  }
}

---

## 9) `intents/features/todo-details.intent`

intent "todo_details" {
  id      = "view.todo_details.v1"
  kind    = "view"
  version = "1.0.0"
  title   = "Todo Details"
  lifecycle = "active"

  route = "/todo/:id"
  depends_on = ["@saving.todos", "@todo_actions.update_title", "@todo_actions.set_completed"]
  renders = ["@todo_edit"]
  uses = ["@a11y_policy"]

  purpose "p0" {
    text = <<PROMPT
Shows details for a single todo item and allows editing the title and completion status.
PROMPT

    constraints = [
      "If the todo does not exist, show a clear not-found state",
      "Provide a way to return to the homepage",
      "Edits persist immediately"
    ]
  }

  define "ui.content" {
    text = <<PROMPT
Display the todo title prominently.
Display the completion status.
Provide @todo_edit to edit the title.
Provide a back link to the homepage.
PROMPT

    acceptance = [
      "User can understand which todo they are viewing",
      "User can navigate back"
    ]
  }

  define "not_found" {
    text = <<PROMPT
If the todo id does not match an existing item, show a not-found message and a link back home.
PROMPT

    acceptance = [
      "Not-found state is clear and non-technical",
      "User can return to the homepage"
    ]
  }
}

---

## 10) `intents/features/todo-edit.intent`

intent "todo_edit" {
  id      = "component.todo_edit.v1"
  kind    = "component"
  version = "1.0.0"
  title   = "Todo Edit"
  lifecycle = "active"

  depends_on = ["@todo_actions.update_title"]
  uses = ["@a11y_policy"]

  inputs = {
    todo_id = { type = "id" }
  }

  purpose "p0" {
    text = <<PROMPT
Allows editing the title of a todo item.
PROMPT

    constraints = [
      "Title is required",
      "Title is trimmed",
      "Title max length is 140 characters"
    ]
  }

  define "ui.form" {
    text = <<PROMPT
Provide an input prefilled with the current title.
Provide a Save action.
Saving updates the todo title and shows confirmation feedback.
PROMPT

    acceptance = [
      "User can edit and save",
      "After saving, updated title is shown",
      "Validation errors are shown clearly"
    ]
  }
}

---

## 11) `intents/features/todo-actions.intent`

intent "todo_actions" {
  id      = "actions.todo.v1"
  kind    = "actions"
  version = "1.0.0"
  title   = "Todo Actions"
  lifecycle = "active"

  depends_on = ["@saving.todos", "@todo_entity"]
  exports = {
    create         = "@todo_actions.create"
    set_completed  = "@todo_actions.set_completed"
    update_title   = "@todo_actions.update_title"
    delete         = "@todo_actions.delete"
    reorder        = "@todo_actions.reorder"
  }

  purpose "p0" {
    text = <<PROMPT
Defines the core operations for creating, updating, deleting, and reordering todos.
PROMPT

    constraints = [
      "Actions are safe and do not silently fail",
      "Invalid input results in clear validation feedback",
      "Updates adjust updated_at timestamps"
    ]
  }

  define "create" {
    text = <<PROMPT
Create a new todo item with a title.
The new item is inserted at the top of the list by setting its order to the smallest position.
PROMPT

    constraints = [
      "Title must be non-empty after trimming",
      "Title length must be <= 140"
    ]

    acceptance = [
      "New todo appears in the list immediately",
      "Order remains stable"
    ]

    # Machine-visible, stack-agnostic effect (conceptual)
    action "create" {
      params = { title = { type = "string" } }
      effects = [
        "write @saving.todos: create(todo_item{title, completed=false, order=top, created_at=now, updated_at=now})"
      ]
      ui_hints = ["clear_input", "focus_input"]
    }
  }

  define "set_completed" {
    text = <<PROMPT
Set the completed status for a todo item.
PROMPT

    acceptance = [
      "Toggling completion updates UI immediately",
      "Completed state persists after refresh"
    ]

    action "set_completed" {
      params = {
        id = { type = "id" }
        completed = { type = "bool" }
      }
      effects = [
        "write @saving.todos: update(id).set(completed, updated_at=now)"
      ]
    }
  }

  define "update_title" {
    text = <<PROMPT
Update the title of a todo item.
PROMPT

    constraints = [
      "Title must be non-empty after trimming",
      "Title length must be <= 140"
    ]

    acceptance = [
      "Updated title is visible immediately",
      "Title persists after refresh"
    ]

    action "update_title" {
      params = {
        id = { type = "id" }
        title = { type = "string" }
      }
      effects = [
        "write @saving.todos: update(id).set(title, updated_at=now)"
      ]
    }
  }

  define "delete" {
    text = <<PROMPT
Delete a todo item.
Deleting is deliberate (confirmation or undo).
PROMPT

    acceptance = [
      "Item disappears from list",
      "UI indicates deletion occurred"
    ]

    action "delete" {
      params = { id = { type = "id" } }
      effects = [
        "write @saving.todos: delete(id)"
      ]
      ui_hints = ["toast:Deleted"]
    }
  }

  define "reorder" {
    text = <<PROMPT
Persist a new ordering of todo items after drag-and-drop.
The ordering is represented by updating each item’s order field.
PROMPT

    constraints = [
      "Reorder is deterministic",
      "Reorder does not lose items",
      "Works for keyboard reordering too"
    ]

    acceptance = [
      "Order persists after refresh",
      "List order matches the last user action"
    ]

    action "reorder" {
      params = {
        ordered_ids = { type = "list[id]" }
      }
      effects = [
        "write @saving.todos: batch_update_orders(ordered_ids)"
      ]
    }
  }
}

---

## 12) Optional: `intents/shared/quality.intent` (nice-to-have)

intent "quality" {
  id      = "policy.quality.v1"
  kind    = "policy"
  version = "1.0.0"
  title   = "Quality Policy"
  lifecycle = "active"

  purpose "p0" {
    text = <<PROMPT
Defines quality constraints to keep the app consistent over time.
PROMPT

    constraints = [
      "No new dependency added without explicit intent change",
      "All user-visible strings should be centralized (future i18n-ready)",
      "Every define block should have acceptance criteria"
    ]
  }
}

---

## How the Pieces Connect (Human Summary)

- **@app** → entry is **@homepage**
- **@homepage** renders **@todo_list**
- **@todo_list** renders **@todo_create** and many **@todo_item**
- **@todo_item** opens **@todo_details** and uses actions to complete/delete
- **@todo_details** renders **@todo_edit** and uses actions to edit title/complete
- **@todo_actions** performs create/update/delete/reorder using **@saving.todos**
- **@saving** stores **@todo_entity** items
- **@branding** and **@a11y_policy** guide presentation and accessibility

This is a complete functional Todo app described as pure intents.

