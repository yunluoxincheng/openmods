# AGENTS.md

This document provides guidelines for AI coding agents working in the OpenMods codebase.

## Project Overview

OpenMods is an AI-powered Minecraft Mod Development CLI that generates Java code and resources for Minecraft Forge mods using natural language descriptions.

**Supported Platform:**

- Minecraft: 1.20.1
- Mod Loader: Forge 47.4.10
- Java: 17

**Tech Stack:** TypeScript, Bun, Yargs (CLI), Zod (validation), Vercel AI SDK (LLM), OpenTUI (TUI)

**Based On:** [OpenCode](https://github.com/anomalyco/opencode) - The open source AI coding agent

---

## Agents

OpenMods uses a specialized agent system:

| Agent         | Mode              | Description                                                                                                                                                      |
| ------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **minecraft** | Primary (Default) | Specialized for Minecraft Forge mod development. Generates Java code, JSON resources, and project configuration. Automatically initializes projects when needed. |
| **plan**      | Primary           | Read-only mode for mod architecture design. Use for designing mod structure, module relationships, and implementation planning.                                  |

### Default Behavior

- When you run `openmods`, the **minecraft** agent is used by default
- The minecraft agent will automatically initialize a project if `openmods.json` doesn't exist
- Simply describe what you want to create in natural language
- Version configuration is fixed: Forge 1.20.1 with Java 17

---

## Build/Lint/Test Commands

```bash
# Setup
bun install

# Development
bun dev                                    # Start TUI
bun dev /path/to/project                   # Start in specific directory

# Type Checking
bun typecheck                              # From packages/core

# Testing
bun test                                   # Run tests
bun test src/minecraft/__tests__/generate.test.ts  # Specific test

# Building
./packages/core/script/build.ts --single    # Build executable
```

---

## Project Structure

```
packages/core/src/
├── minecraft/           # Minecraft-specific module
│   ├── index.ts         # Module entry point
│   ├── config.ts        # Configuration types
│   ├── agent/           # Minecraft agent
│   ├── tool/            # Minecraft tools (generate, template, build, validate)
│   ├── template/        # Code templates (forge/, fabric/)
│   └── schema/          # JSON schemas (mod_spec, block_spec, item_spec)
├── agent/               # Agent system
├── provider/            # LLM providers
├── tool/                # Tool definitions
├── cli/cmd/             # CLI commands (including mc.ts)
├── session/             # Session management
├── mcp/                 # MCP protocol
└── plugin/              # Plugin system
```

---

## Style Guide

### General Principles

- Keep things in one function unless composable or reusable
- Avoid `try`/`catch` where possible
- Avoid using the `any` type
- Prefer single word variable names where possible
- Use Bun APIs when possible, like `Bun.file()`
- Rely on type inference when possible
- Prefer functional array methods (flatMap, filter, map) over for loops

### Naming

- **Variables**: `snake_case` for locals, `PascalCase` for types
- **Functions**: `camelCase`
- **Files**: `snake_case.ts`
- **Classes/Types**: `PascalCase`
- Use single word names by default; multi-word only when necessary

```ts
// Good
const foo = 1
function journal(dir: string) {}

// Bad
const fooBar = 1
function prepareJournal(dir: string) {}
```

### Control Flow

Avoid `else` statements. Prefer early returns.

```ts
// Good
function foo() {
  if (condition) return 1
  return 2
}
```

---

## Minecraft Module Development

### Adding New Module Types

1. Add type to `ModuleTypeSchema` in `config.ts`
2. Add mapping to `TemplatePathMap` and `RegistryTypeMap`
3. Create template in `template/forge/` and `template/fabric/`
4. Add generation logic in `tool/generate.ts`
5. Add validation in `tool/validate.ts`

### CLI Commands

Commands defined using yargs in `cli/cmd/mc.ts`:

```bash
openmods mc init my-mod --loader forge --mc-version 1.20.1
openmods mc create "Add a ruby block that glows"
openmods mc add block ruby_block --properties '{"hardness":3}'
openmods mc build
openmods mc run
```

### Template Development

Templates are TypeScript functions returning string content. Context includes:

- `mod_id`, `mod_name`, `package`
- `class_name`, `registry_name`
- `loader`, `minecraft_version`
- `properties` (module-specific)

---

## Testing

- Avoid mocks; test actual implementation
- Place tests in `src/**/__tests__/`
- Run from `packages/core`, not repo root

```typescript
import { test, expect } from "bun:test"
import { validateModuleSpec } from "../tool/validate"

test("validates block spec", () => {
  const result = validateModuleSpec({
    type: "block",
    name: "Test Block",
    id: "test_block",
  })
  expect(result.valid).toBe(true)
})
```

---

## Type Checking

Always run `bun typecheck` from package directories (e.g., `packages/core`), never `tsc` directly.

---

## Conventional Commits

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Build/tool changes
