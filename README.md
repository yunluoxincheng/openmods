<p align="center">
  <a href="https://openmods.dev">
    <img src="logo.png" alt="OpenMods logo">
  </a>
</p>
<p align="center">AI-powered Minecraft Mod Development CLI</p>
<p align="center">
  <a href="https://www.npmjs.com/package/openmods-ai"><img alt="npm" src="https://img.shields.io/npm/v/openmods-ai?style=flat-square" /></a>
  <a href="https://github.com/openmods-ai/openmods/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/openmods-ai/openmods/publish.yml?style=flat-square&branch=main" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README_zh.md">简体中文</a>
</p>

[![OpenMods Terminal UI](cli.png)](https://openmods.dev)

---

## Introduction

OpenMods is an open-source AI-powered Minecraft Mod development tool. It automatically generates Java code and resources for Forge mods using natural language descriptions.

**Supported Platform:**

- Minecraft: 1.20.1
- Mod Loader: Forge 47.4.10
- Java: 17

### Features

- 🤖 **AI-Powered** - Generate complete mods using natural language descriptions
- 🎮 **Forge Support** - Focused on Forge platform for best compatibility
- 📦 **All-in-One** - Complete workflow from creation to build
- 🔧 **Extensible** - Support for custom templates and agents
- 🌐 **Multi-LLM Support** - OpenAI, Anthropic, DeepSeek, local models, etc.

---

## Installation

```bash
# YOLO
curl -fsSL https://openmods.dev/install | bash

# Package managers
npm i -g openmods-ai@latest        # or bun/pnpm/yarn
scoop install openmods             # Windows
choco install openmods             # Windows
brew install openmods-ai/tap/openmods # macOS and Linux
```

---

## Quick Start

### Launch OpenMods

```bash
# Start in any directory
openmods

# Or specify a directory
openmods /path/to/project
```

### Describe Your Mod in Natural Language

After launching, simply describe the mod you want in the chat:

```
> I want to create a ruby mod with ruby ore, ruby item, and ruby tool set
```

The minecraft agent will:

1. Automatically detect if project initialization is needed
2. Ask for necessary configuration
3. Generate all Java code and resource files

### Command Line Usage

You can also use command line directly:

```bash
# Initialize project
openmods mc init my-mod --loader forge --mc-version 1.20.1
cd my-mod

# Generate mod using natural language
openmods mc create "Add a ruby ore that drops ruby when mined"

# Add specific modules
openmods mc add block ruby_ore --properties '{"hardness":3}'

# Build and test
openmods mc build
openmods mc run
```

> Tips:
>
> - Run `openmods` to start interactive interface and describe your needs
> - The minecraft agent will automatically initialize project and generate code
> - Fixed configuration: Minecraft 1.20.1 + Forge 47.4.10 + Java 17

---

## Documentation

Full documentation at [openmods.dev/docs](https://openmods.dev/docs)

### Configuration

The `openmods.json` file is automatically created by the agent, or you can create it manually:

**Project Config** (`./openmods.json`):

```json
{
  "minecraft": {
    "version": "1.20.1",
    "loader": "forge",
    "java_version": 17
  },
  "mod": {
    "id": "ruby_mod",
    "name": "Ruby Mod",
    "version": "1.0.0",
    "package": "com.example.ruby_mod"
  }
}
```

**LLM Config** (`./openmods.json` or `~/.config/openmods/openmods.json`):

```json
{
  "model": "anthropic/claude-sonnet-4-5",
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "your-api-key"
      }
    }
  }
}
```

### Configuration Priority

```
1. Project config (./openmods.json)
2. Custom config (OPENMODS_CONFIG environment variable)
3. Global config (~/.config/openmods/openmods.json)
```

### Environment Variables

```bash
export ANTHROPIC_API_KEY=your-key
export OPENAI_API_KEY=your-key
export DEEPSEEK_API_KEY=your-key
```

---

## Supported Module Types

| Type          | Description                              |
| ------------- | ---------------------------------------- |
| `block`       | Custom blocks                            |
| `item`        | Custom items                             |
| `tool`        | Tools (pickaxe, axe, shovel, hoe, sword) |
| `armor`       | Armor pieces                             |
| `food`        | Food items                               |
| `entity`      | Custom entities/mobs                     |
| `fluid`       | Custom fluids                            |
| `dimension`   | Custom dimensions                        |
| `biome`       | Custom biomes                            |
| `recipe`      | Crafting recipes                         |
| `enchantment` | Custom enchantments                      |
| `potion`      | Custom potions                           |
| `particle`    | Particle effects                         |
| `tile_entity` | Block entities                           |

---

## Development

### Requirements

- Bun 1.3+
- Node.js 18+ (optional)
- Java 17+ (for mod building)

### Local Development

```bash
# Clone repository
git clone https://github.com/openmods-ai/openmods.git
cd openmods

# Install dependencies
bun install

# Start development mode
bun dev
```

### Build Executable

```bash
./packages/opencode/script/build.ts --single
```

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Acknowledgments

This project is based on [OpenCode](https://github.com/anomalyco/opencode). Thanks to the OpenCode team for their open-source contribution.

---

**Join the Community** [Discord](https://discord.gg/openmods) | [X.com](https://x.com/openmods_ai)
