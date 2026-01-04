# IOP Example Pack: API-Only Todo Service (Foundational Intents)

This document describes a **complete API-only Todo application** using **Intent-Oriented Programming (IOP)**.

Unlike the UI example, this pack focuses on **foundational system intents** so that:
- adding a new endpoint is mostly declarative
- agents receive complete, minimal instructions
- cross-cutting concerns (security, auth, rate limits, tests) are automatic

No UI is described. This is a backend service only.

---

## High-Level Goals

- REST-style HTTP API
- Secure by default
- Authenticated access
- Rate-limited endpoints
- Deterministic API design
- Automatic test scaffolding
- Incremental, patch-only evolution

---

## Intent Map (Human Overview)

- **@app** defines the service
- **@runtime** pins language/runtime choices
- **@api_conventions** defines API style
- **@security** defines auth + authorization
- **@rate_limiting** defines limits
- **@observability** defines logging/metrics
- **@todo_entity** defines the data model
- **@storage** defines persistence
- **@todo_api** defines endpoints
- **@testing** defines unit/integration test expectations

---

## 1) `intents/app/app.intent`

intent "app" {
  id      = "app.todo_api.v1"
  kind    = "app"
  version = "1.0.0"
  title   = "Todo API Service"
  lifecycle = "active"

  uses = [
    "@runtime",
    "@api_conventions",
    "@security",
    "@rate_limiting",
    "@observability",
    "@storage",
    "@testing"
  ]

  purpose "p0" {
    text = <<PROMPT
A backend API service that allows authenticated clients to manage todo items.
The service exposes a REST-style HTTP API.
PROMPT

    constraints = [
      "Service exposes only HTTP APIs",
      "All endpoints are authenticated by default",
      "No UI or server-side rendering",
      "Service is stateless"
    ]
  }
}

---

## 2) `intents/platform/runtime.intent`

intent "runtime" {
  id      = "platform.runtime.v1"
  kind    = "platform"
  version = "1.0.0"
  title   = "Runtime Environment"
  lifecycle = "active"

  exports = { runtime = "@runtime" }

  purpose "p0" {
    text = <<PROMPT
Defines the language, runtime, and execution environment for the API service.
These choices are global and must remain stable unless explicitly changed.
PROMPT

    constraints = [
      "Primary language is TypeScript",
      "Runtime is Node.js (LTS)",
      "HTTP server uses a standard framework (locked via implementation lockfile)",
      "Codebase uses ES modules"
    ]
  }
}

---

## 3) `intents/platform/api-conventions.intent`

intent "api_conventions" {
  id      = "platform.api_conventions.v1"
  kind    = "policy"
  version = "1.0.0"
  title   = "API Conventions"
  lifecycle = "active"

  exports = { policy = "@api_conventions" }

  purpose "p0" {
    text = <<PROMPT
Defines consistent API design rules for all endpoints.
PROMPT

    constraints = [
      "REST-style endpoints",
      "JSON request and response bodies",
      "Use HTTP status codes consistently",
      "Errors use a standard error envelope",
      "No breaking changes without version bump"
    ]

  define "response.shape" {
    text = <<PROMPT
Successful responses return a JSON object with a `data` field.
Errors return a JSON object with `error.code` and `error.message`.
PROMPT

    acceptance = [
      "All endpoints conform to the same response envelope"
    ]
  }
}

---

## 4) `intents/platform/security.intent`

intent "security" {
  id      = "platform.security.v1"
  kind    = "policy"
  version = "1.0.0"
  title   = "Security & Authentication"
  lifecycle = "active"

  exports = { policy = "@security" }

  purpose "p0" {
    text = <<PROMPT
Ensures all API endpoints are authenticated and authorized.
PROMPT

    constraints = [
      "Authentication uses bearer tokens",
      "Requests without valid tokens are rejected",
      "Each request has an authenticated principal",
      "Authorization is enforced per resource"
    ]
  }
}

---

## 5) `intents/platform/rate-limiting.intent`

intent "rate_limiting" {
  id      = "platform.rate_limiting.v1"
  kind    = "policy"
  version = "1.0.0"
  title   = "Rate Limiting"
  lifecycle = "active"

  exports = { policy = "@rate_limiting" }

  purpose "p0" {
    text = <<PROMPT
Protects the service from abuse and ensures fair usage.
PROMPT

    constraints = [
      "Rate limits apply per authenticated user",
      "Read and write limits may differ",
      "Exceeding limits returns HTTP 429"
    ]

  define "limits.default" {
    text = <<PROMPT
Default limits: 100 read requests per minute, 20 write requests per minute.
PROMPT
  }
}

---

## 6) `intents/platform/observability.intent`

intent "observability" {
  id      = "platform.observability.v1"
  kind    = "policy"
  version = "1.0.0"
  title   = "Observability"
  lifecycle = "active"

  exports = { policy = "@observability" }

  purpose "p0" {
    text = <<PROMPT
Ensures the service emits useful logs and metrics.
PROMPT

    constraints = [
      "Each request has a request ID",
      "Errors are logged with context",
      "Latency metrics are captured per endpoint"
    ]
  }
}

---

## 7) `intents/data/todo-entity.intent`

intent "todo_entity" {
  id      = "entity.todo.v1"
  kind    = "entity"
  version = "1.0.0"
  title   = "Todo Entity"
  lifecycle = "active"

  exports = { entity = "@todo_entity" }

  purpose "p0" {
    text = <<PROMPT
Represents a single todo item owned by a user.
PROMPT

    constraints = [
      "Each todo belongs to exactly one user",
      "Only the owner can access or modify a todo"
    ]

  define "fields.core" {
    text = "Todo fields include id, user_id, title, completed, created_at, updated_at."

    fields = {
      id         = { type = "id", required = true }
      user_id    = { type = "id", required = true }
      title      = { type = "string", required = true, max_len = 140 }
      completed  = { type = "bool", required = true, default = false }
      created_at = { type = "timestamp", required = true }
      updated_at = { type = "timestamp", required = true }
    }
  }
}

---

## 8) `intents/data/storage.intent`

intent "storage" {
  id      = "storage.todo.v1"
  kind    = "storage"
  version = "1.0.0"
  title   = "Todo Storage"
  lifecycle = "active"

  depends_on = ["@todo_entity"]
  exports = { todos = "@storage.todos" }

  purpose "p0" {
    text = <<PROMPT
Provides persistent storage for todo entities.
PROMPT

    constraints = [
      "Queries are scoped by authenticated user",
      "Storage operations are transactional"
    ]

  define "collection.todos" {
    text = "Stores and retrieves todo entities by id and user_id."
  }
}

---

## 9) `intents/api/todo-api.intent`

intent "todo_api" {
  id      = "api.todo.v1"
  kind    = "api"
  version = "1.0.0"
  title   = "Todo API Endpoints"
  lifecycle = "active"

  depends_on = ["@storage.todos", "@security", "@rate_limiting"]
  uses = ["@api_conventions"]

  purpose "p0" {
    text = <<PROMPT
Defines HTTP endpoints for managing todo items.
PROMPT
  }

  define "list_todos" {
    text = "List all todos for the authenticated user."

    endpoint {
      method = "GET"
      path   = "/todos"
      auth   = "required"
      rate_limit = "read"
    }
  }

  define "create_todo" {
    text = "Create a new todo for the authenticated user."

    endpoint {
      method = "POST"
      path   = "/todos"
      auth   = "required"
      rate_limit = "write"
    }
  }

  define "update_todo" {
    text = "Update an existing todo owned by the authenticated user."

    endpoint {
      method = "PUT"
      path   = "/todos/:id"
      auth   = "required"
      rate_limit = "write"
    }
  }

  define "delete_todo" {
    text = "Delete an existing todo owned by the authenticated user."

    endpoint {
      method = "DELETE"
      path   = "/todos/:id"
      auth   = "required"
      rate_limit = "write"
    }
  }
}

---

## 10) `intents/quality/testing.intent`

intent "testing" {
  id      = "quality.testing.v1"
  kind    = "policy"
  version = "1.0.0"
  title   = "Testing Policy"
  lifecycle = "active"

  purpose "p0" {
    text = <<PROMPT
Defines testing expectations for the API service.
PROMPT

    constraints = [
      "Each endpoint has unit tests",
      "Authentication and authorization are tested",
      "Rate limiting behavior is tested",
      "Error cases are tested"
    ]
  }
}

---

## What This Enables

When you add a new endpoint intent:
- language/runtime are already chosen
- authentication is automatic
- rate limiting rules are known
- response shape is enforced
- logging and metrics are added
- test scaffolding is generated

Agents receive **precise, minimal tasks**:
- implement handler logic
- wire storage calls
- enforce policies
- generate tests

No ambiguity. No global rewrites.

---

## Summary

This API-only Todo service demonstrates how **foundational intents** remove uncertainty.

By the time a feature-level intent is added, the system already knows:
- how APIs are designed
- how security works
- how to test
- how to observe

This is the ideal environment for patch-only, deterministic AI execution.

