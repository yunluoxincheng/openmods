# CLAUDE.md

> 此文档为 AI 助手提供 OpenMods 项目的完整上下文，帮助快速理解和参与开发。

## 项目概述

**OpenMods** 是一个 AI 驱动的 Minecraft Mod 开发 CLI 工具。用户可以通过自然语言描述来生成完整的 Minecraft Mod（支持 Forge/Fabric/NeoForge）。

### 核心价值
- 🤖 **自然语言驱动** - 用中文/英文描述即可生成 Mod
- 🎮 **多平台支持** - Forge、Fabric、NeoForge
- 📦 **一站式开发** - 从创建到构建的完整工作流
- 🔧 **可扩展** - 支持自定义模板和 Agent

### 技术栈
| 类别 | 技术 |
|------|------|
| 语言 | TypeScript |
| 运行时 | Bun |
| CLI | Yargs |
| 验证 | Zod |
| LLM | Vercel AI SDK |
| TUI | OpenTUI + SolidJS |
| 基础项目 | OpenCode (anomalyco/opencode) |

---

## 快速开始

```bash
# 安装依赖
bun install

# 启动 TUI
bun dev

# 在特定目录启动
bun dev /path/to/project

# 查看 Minecraft 命令
bun dev mc --help

# 类型检查
bun typecheck

# 运行测试
bun test
```

---

## 项目结构

```
openmods/
├── packages/
│   ├── opencode/              # 核心包 (主要开发区域)
│   │   ├── src/
│   │   │   ├── minecraft/     # ⭐ Minecraft 模块
│   │   │   │   ├── index.ts
│   │   │   │   ├── config.ts
│   │   │   │   ├── agent/
│   │   │   │   ├── tool/
│   │   │   │   ├── schema/
│   │   │   │   └── template/
│   │   │   ├── agent/         # Agent 系统
│   │   │   ├── provider/      # LLM 提供商
│   │   │   ├── tool/          # 工具定义
│   │   │   ├── cli/           # CLI 命令
│   │   │   ├── session/       # 会话管理
│   │   │   ├── mcp/           # MCP 协议
│   │   │   └── plugin/        # 插件系统
│   │   └── package.json
│   ├── app/                   # Web UI
│   ├── desktop/               # 桌面应用 (Tauri)
│   └── sdk/                   # SDK
├── README.md
├── AGENTS.md
└── CLAUDE.md                  # 本文档
```

---

## Minecraft 模块详解

### 目录结构
```
src/minecraft/
├── index.ts           # 模块入口，导出所有公开 API
├── config.ts          # 配置类型和常量
├── agent/
│   ├── minecraft.ts   # Minecraft Agent 定义
│   └── minecraft.txt  # Agent 系统提示词
├── tool/
│   ├── generate.ts    # generateModule() - 代码生成核心
│   ├── template.ts    # renderTemplate() - 模板渲染
│   ├── build.ts       # runGradleBuild() - Gradle 构建
│   └── validate.ts    # validateModuleSpec() - 规格验证
├── schema/
│   ├── mod_spec.ts    # ModSpec, ModuleSpec, TaskGraph
│   ├── block_spec.ts  # BlockProperties, BlockSpec
│   └── item_spec.ts   # ItemProperties, ToolProperties, etc.
└── template/
    ├── forge/         # Forge 模板 (待添加文件)
    └── fabric/        # Fabric 模板 (待添加文件)
```

### 核心类型

```typescript
// config.ts
type Loader = "forge" | "fabric" | "neoforge"

interface ProjectConfig {
  minecraft: {
    version: string      // "1.20.1"
    loader: Loader
    java_version: number // 17
  }
  mod: {
    id: string           // "mymod"
    name: string         // "My Mod"
    version: string      // "1.0.0"
    package: string      // "com.example.mymod"
  }
  agent?: {
    model?: string
    provider?: string
  }
}

// schema/mod_spec.ts
interface ModuleSpec {
  type: ModuleType       // "block" | "item" | "tool" | ...
  name: string           // "Ruby Block"
  id: string             // "ruby_block"
  description?: string
  properties?: Record<string, any>
}

type ModuleType = 
  | "block" | "item" | "tool" | "armor" | "food"
  | "entity" | "fluid" | "dimension" | "biome"
  | "recipe" | "loot_table" | "creative_tab"
  | "enchantment" | "potion" | "particle"
  | "screen" | "tile_entity"
```

### 代码生成流程

```
用户输入 (自然语言)
       ↓
   AI Agent 解析
       ↓
  ModuleSpec 生成
       ↓
 validateModuleSpec()
       ↓
  generateModule() → renderTemplate()
       ↓
  OutputFile[] (Java + JSON)
       ↓
   writeFiles()
```

---

## CLI 命令

### 命令定义位置
`packages/core/src/cli/cmd/mc.ts`

### 可用命令

```bash
# 初始化项目
openmods mc init <name> --loader forge --mc-version 1.20.1

# 从描述创建 Mod
openmods mc create "添加一个发光的红宝石方块"

# 添加模块
openmods mc add block ruby_block --properties '{"hardness":3}'

# 构建
openmods mc build --clean

# 运行测试
openmods mc run
```

### 添加新命令

在 `mc.ts` 中添加：

```typescript
const MyCommand = cmd({
  command: "mycommand <arg>",
  describe: "命令描述",
  builder: {
    arg: { type: "string", describe: "参数说明" },
  },
  handler: async (argv) => {
    // 实现逻辑
  },
})

// 添加到 builder 中
.builder((yargs) => {
  return yargs
    .command(MyCommand)
    // ...
})
```

---

## 模板系统

### 模板渲染函数

```typescript
// tool/template.ts
interface TemplateRenderOptions {
  loader: Loader
  moduleType: ModuleType
  fileType: string
  context: Record<string, any>
}

async function renderTemplate(options: TemplateRenderOptions): Promise<string | null>
```

### 模板上下文变量

| 变量 | 描述 | 示例 |
|------|------|------|
| `mod_id` | Mod ID | "mymod" |
| `mod_name` | Mod 名称 | "My Mod" |
| `package` | Java 包名 | "com.example.mymod" |
| `class_name` | 类名 (PascalCase) | "RubyBlock" |
| `registry_name` | 注册名 (snake_case) | "ruby_block" |
| `loader` | 加载器 | "forge" |
| `minecraft_version` | MC 版本 | "1.20.1" |
| `properties` | 模块属性 | { hardness: 3 } |

### 添加新模板

1. 在 `config.ts` 的 `TemplatePathMap` 中添加映射
2. 在 `tool/template.ts` 的 `generateDefaultTemplate()` 中添加生成逻辑
3. 可选：在 `template/forge/` 和 `template/fabric/` 中添加模板文件（当前主要使用 `generateDefaultTemplate()` 的内联模板）

---

## Agent 系统

### Minecraft Agent 配置

```typescript
// agent/minecraft.ts
const MinecraftAgentConfig: Agent.Info = {
  name: "minecraft",
  description: "Minecraft Mod 开发专用 Agent",
  mode: "primary",
  native: false,
  prompt: PROMPT_MINECRAFT,  // 来自 minecraft.txt
  options: {
    default_loader: "forge",
    default_mc_version: "1.20.1",
    default_java_version: 17,
  },
  permission: {
    "*": "allow",
    write: { "*": "allow" },
    bash: { "gradlew": "allow" },
  },
}
```

### Agent 提示词位置
`agent/minecraft.txt` - 定义 Agent 的行为规范

---

## 验证系统

### 验证函数

```typescript
// tool/validate.ts
function validateModuleSpec(data: unknown): ValidationResult
function validateModSpec(data: unknown): ValidationResult
function validateProjectConfig(data: unknown): ValidationResult
```

### 验证结果

```typescript
interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}
```

### 模块验证规则
- `type`: 必须是支持的模块类型
- `name`: 必填
- `id`: 必须是 `^[a-z][a-z0-9_]*$` 格式
- `properties`: 根据 `type` 有不同的验证规则

---

## 构建系统

### Gradle 构建函数

```typescript
// tool/build.ts
interface BuildOptions {
  workspace: string
  clean?: boolean
  debug?: boolean
}

interface BuildResult {
  success: boolean
  output: string
  error?: string
  jarPath?: string
}

async function runGradleBuild(options: BuildOptions): Promise<BuildResult>
async function runMinecraft(workspace: string): Promise<BuildResult>
async function cleanBuild(workspace: string): Promise<BuildResult>
```

---

## 命名转换工具

```typescript
// tool/generate.ts
function toPascalCase(text: string): string   // "ruby_block" → "RubyBlock"
function toCamelCase(text: string): string    // "ruby_block" → "rubyBlock"
function toSnakeCase(text: string): string    // "RubyBlock" → "ruby_block"
```

---

## 开发指南

### 代码风格
- 单词变量名优先
- 避免不必要的解构
- 使用 `const` 而非 `let`
- 避免显式类型注解（除非导出或需要明确）
- 使用 Bun API（如 `Bun.file()`）

### 测试
```typescript
import { test, expect } from "bun:test"

test("描述", () => {
  expect(actual).toBe(expected)
})
```

### 提交规范
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档
- `refactor:` 重构
- `test:` 测试
- `chore:` 构建/工具

---

## 重要文件索引

| 文件 | 用途 |
|------|------|
| `src/index.ts` | CLI 入口点 |
| `src/minecraft/index.ts` | Minecraft 模块入口 |
| `src/minecraft/config.ts` | 配置类型定义 |
| `src/minecraft/tool/generate.ts` | 代码生成核心 |
| `src/minecraft/tool/template.ts` | 模板渲染 |
| `src/minecraft/tool/validate.ts` | 规格验证 |
| `src/minecraft/agent/minecraft.txt` | Agent 提示词 |
| `src/cli/cmd/mc.ts` | Minecraft CLI 命令 |
| `AGENTS.md` | 开发风格指南 |
| `README.md` | 项目说明 |

---

## 待完成功能

- [x] 完善项目初始化逻辑 (`mc init`)
- [x] 添加 Forge/Fabric/NeoForge Gradle 模板生成
- [x] 实现自然语言到 ModuleSpec 的 AI 转换（`mc create` 基础链路）
- [x] 添加 Minecraft 模块单元测试与集成流程测试
- [x] 支持 NeoForge（基础模板/构建配置）
- [ ] 添加纹理生成
- [ ] 添加本地化文件生成

---

## 常见问题

### Q: 如何添加新的模块类型？
1. 在 `config.ts` 的 `ModuleTypeSchema` 添加类型
2. 在 `TemplatePathMap` 和 `RegistryTypeMap` 添加映射
3. 在 `template.ts` 添加模板生成逻辑
4. 在 `validate.ts` 添加验证规则

### Q: 如何修改默认 Minecraft 版本？
修改 `config.ts` 中的 `DEFAULT_CONFIG`

### Q: 如何添加新的 LLM 提供商？
OpenCode 已内置支持 OpenAI、Anthropic、DeepSeek 等。在配置文件中指定即可。

---

## 参考资源

- [OpenCode 文档](https://opencode.ai/docs)
- [Minecraft Forge 文档](https://docs.minecraftforge.net/)
- [Fabric 文档](https://fabricmc.net/wiki/start:introduction)
- [Bun 文档](https://bun.sh/docs)
- [Zod 文档](https://zod.dev/)