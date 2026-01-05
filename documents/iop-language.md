# IOP Language Specification (Draft)

**Version**: 1.0 (Draft)
**Status**: Experimental

## 1. Introduction
The **Intent Definition Language (IDL)**, also known as **Structured Natural Language (SNL)**, is a declarative configuration language designed to define software intents. It combines strict machine-readable structure (HCL-like) with human-readable natural language blocks.

This specification defines the syntax and semantics of the language.

## 2. Notation
The syntax is specified using a variant of Extended Backus-Naur Form (EBNF):
*   `Production = Rule`
*   `{ ... }`: Zero or more repetitions.
*   `[ ... ]`: Optional.
*   `|`: Alternative.
*   `"literal"`: Terminal string.

## 3. Lexical Structure

### 3.1 Comments
*   **Single-line**: Starts with `//` or `#` and runs to the end of the line.
*   **Multi-line**: Starts with `/*` and ends with `*/`.

### 3.2 Identifiers
Identifiers start with a letter or underscore, followed by letters, digits, or underscores.
*   `foo`, `my_intent_v2`, `_internal` are valid.
*   `123var` is invalid.

### 3.3 Strings
*   **Quoted Strings**: Surrounded by double quotes (`"foo"`). Supports standard escape sequences (`\n`, `\"`).
*   **Heredoc Strings**: Surrounded by triple quotes (`"""`). Preserves newlines and base indentation.

## 4. Syntax

### 4.1 File Structure
An Intent file consists of a sequence of **Blocks** and **Attributes**.

```ebnf
File = { Attribute | Block }
```

### 4.2 Attributes
An attribute assigns a value to a key.

```ebnf
Attribute = Identifier "=" Value
Value = String | Number | Boolean | List | Map
```

### 4.3 Blocks
A block defines a scoped configuration unit. It has a type, one or more labels, and a body.

```ebnf
Block = Identifier { StringLiteral } "{" Body "}"
Body = { Attribute | Block }
```

**Example**:
```hcl
intent "core" { ... }
block "logic" { ... }
```

## 5. Standard Semantics

This section defines the meaning of the core reserved block types.

### 5.1 The `intent` Block
The root block of any file. It MUST be the first block.
*   **Label 1**: The intent kind (e.g., `"project"`, `"core"`).
*   **Attributes**:
    *   `id` (Required): Unique fully-qualified identifier (URN).
    *   `depends_on`: List of URNs this intent strictly requires.

### 5.2 The `block` Block (Atomic Block)
The fundamental unit of change.
*   **Label 1**: The machine-stable ID (e.g., `"login_form"`).
*   **Attributes**:
    *   `prompt` (Required): The natural language instruction.
    *   `lifecycle` (Optional): `"active"`, `"deprecated"`.

### 5.3 The `constraint` Block
Used within Atomic Blocks to define negative requirements.
*   **Label 1**: A short handle (e.g., `"no_sql"`).
*   **Attributes**:
    *   `prompt` (Required): The rule description (e.g., "Must not use generic SQL query builders").

### 5.4 The `acceptance` Block
Used within Atomic Blocks to define verification criteria.
*   **Attributes**:
    *   `criteria` (List<String>): Checkable assertions.

## 6. Type System
IOP IDL is a configuration language, but supports strong typing for `config` blocks used by agents.

*   `string`, `number`, `boolean`
*   `list(<type>)`
*   `map(<type>)`

## 7. Contextual Resolution
*   **Scope**: Strings inside `prompt` fields are semantically resolved by the Agent, not the Compiler.
*   **References**: Strings starting with `@` (e.g., `"@auth.login"`) are validated as URN references by the Orchestrator.

## 8. Compiler Directives (Headers)
*   `/* @iop-version 1.1 */`: Declares the language version expected.

## 9. Compiler Compliance & Validation

This section defines the rules a compliant IOP Compiler must enforce.

### 9.1 Static Validation
*   **Uniqueness**: All `id` fields must be globally unique within the resolved workspace.
*   **Acyclic Graph**: The dependency graph formed by `depends_on` MUST be a Directed Acyclic Graph (DAG). Circular dependencies are a compile-time error.
*   **Referential Integrity**: All URNs referenced in `depends_on`, `uses`, or `renders` MUST exist in the workspace.

### 9.2 Canonicalization (Stability)
To ensure that Semantic Diffing is accurate, the compiler MUST canonicalize the Internal Representation (IR) before diffing:
1.  **Key Sorting**: Attributes within a block must be sorted lexicographically by key.
2.  **Whitespace Normalization**: `prompt` strings must have leading/trailing whitespace trimmed and line endings normalized to `\n`.
3.  **Default Expansion**: Optional fields missing in the source (e.g., `lifecycle = "active"`) must be populated with their default values in the IR.

### 9.3 Resolution Strategy
*   **File Discovery**: The compiler assumes all `*.intent` files within the configured `roots` are part of the universe.
*   **Lazy Loading**: Intents are indexed by `id`. Actual parsing of the body may be deferred until the graph walk reaches that node.
