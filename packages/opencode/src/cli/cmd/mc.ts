/**
 * OpenMods Minecraft CLI Commands
 * 
 * This module provides CLI commands for Minecraft mod development.
 */

import type { CommandModule } from "yargs"
import { cmd } from "./cmd"
import { UI } from "../ui"
import path from "path"
import { Filesystem } from "@/util/filesystem"
import { LoaderSchema, ModuleTypeSchema, type ProjectConfig } from "@/minecraft/config"
import { generateModule, toSnakeCase, writeFiles } from "@/minecraft/tool/generate"
import { runGradleBuild, runMinecraft } from "@/minecraft/tool/build"
import { validateModuleSpec, validateProjectConfig } from "@/minecraft/tool/validate"
import { initProject } from "@/minecraft/tool/scaffold"
import { bootstrap } from "../bootstrap"
import { createOpencodeClient } from "@opencode-ai/sdk/v2"
import { Server } from "@/server/server"
import { PermissionNext } from "@/permission/next"
import type { ModuleSpec } from "@/minecraft/schema/mod_spec"

function defaultPackage(name: string) {
  const id = toSnakeCase(name).replace(/[^a-z0-9_]/g, "")
  return `com.example.${id || "mymod"}`
}

function normalizeModId(name: string) {
  const id = toSnakeCase(name)
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
  const safe = id || "mymod"
  if (/^[a-z]/.test(safe)) return safe
  return `m${safe}`
}

function valueString(value: unknown, fallback = "") {
  if (typeof value === "string") return value
  return fallback
}

function valueNumber(value: unknown, fallback: number) {
  if (typeof value === "number") return value
  return fallback
}

function valueBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value
  return fallback
}

function parseJsonPayload(raw: string): unknown {
  const text = raw.trim()
  if (!text) return null
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    return JSON.parse(fenced[1].trim())
  }
  return JSON.parse(text)
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function asSpecs(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => !!toRecord(item))
  }
  const record = toRecord(value)
  if (!record) return []
  const modules = record.modules
  if (!Array.isArray(modules)) return []
  return modules.filter((item): item is Record<string, unknown> => !!toRecord(item))
}

function normalizeGeneratedSpec(value: Record<string, unknown>): ModuleSpec | null {
  const typeRaw = valueString(value.type)
  const type = ModuleTypeSchema.safeParse(typeRaw)
  if (!type.success) return null
  const name = valueString(value.name)
  if (!name) return null
  const id = valueString(value.id, toSnakeCase(name))
  const description = valueString(value.description, "")
  const maybeProps = toRecord(value.properties)
  const properties = maybeProps ?? {}
  const result: ModuleSpec = {
    type: type.data,
    name,
    id,
    properties,
  }
  if (description) {
    result.description = description
  }
  return result
}

async function generateSpecsWithAgent(input: {
  workspace: string
  agent: string
  description: string
  config: ProjectConfig
}) {
  const { workspace, agent, description, config } = input
  return bootstrap(workspace, async () => {
    const fetchFn = (async (request: RequestInfo | URL, init?: RequestInit) => {
      const req = new Request(request, init)
      return Server.Default().fetch(req)
    }) as typeof globalThis.fetch

    const sdk = createOpencodeClient({
      baseUrl: "http://opencode.internal",
      fetch: fetchFn,
      directory: workspace,
    })

    const rules: PermissionNext.Ruleset = [
      {
        permission: "question",
        action: "deny",
        pattern: "*",
      },
      {
        permission: "plan_enter",
        action: "deny",
        pattern: "*",
      },
      {
        permission: "plan_exit",
        action: "deny",
        pattern: "*",
      },
    ]
    const sessionID = await sdk.session
      .create({
        title: "openmods-mc-create",
        permission: rules,
      })
      .then((result) => result.data?.id)

    if (!sessionID) throw new Error("Failed to create session for minecraft agent")

    const prompt = [
      "You are generating OpenMods module specs.",
      "Return only valid JSON. Do not include markdown fences and do not explain.",
      "Output format:",
      '{"modules":[{"type":"block","name":"Ruby Block","id":"ruby_block","description":"...","properties":{}}]}',
      `Project config: ${JSON.stringify(config)}`,
      `User request: ${description}`,
      "Generate 1-5 modules that best match the request.",
    ].join("\n")

    const events = await sdk.event.subscribe()
    const chunks: string[] = []
    let assistantID: string | undefined
    const capture = (async () => {
      for await (const event of events.stream) {
        if (event.type === "permission.asked" && event.properties.sessionID === sessionID) {
          await sdk.permission.reply({
            requestID: event.properties.id,
            reply: "reject",
          })
          continue
        }
        if (event.type === "message.updated" && event.properties.info.role === "assistant") {
          assistantID = event.properties.info.id
          continue
        }
        if (event.type === "message.part.updated") {
          const part = event.properties.part
          if (part.sessionID !== sessionID || part.type !== "text" || !part.time?.end) continue
          if (assistantID && part.messageID !== assistantID) continue
          chunks.push(part.text)
          continue
        }
        if (
          event.type === "session.status" &&
          event.properties.sessionID === sessionID &&
          event.properties.status.type === "idle"
        ) {
          break
        }
      }
    })()

    const response = await sdk.session.prompt({
      sessionID,
      agent,
      directory: workspace,
      parts: [{ type: "text", text: prompt }],
    })
    if (!assistantID) {
      assistantID = response.data?.info?.id
    }

    await capture
    return chunks.join("\n").trim()
  })
}

async function loadProjectConfig(workspace: string): Promise<ProjectConfig | null> {
  const configPath = path.join(workspace, "openmods.json")
  if (!(await Filesystem.exists(configPath))) {
    UI.error(`Missing openmods.json in ${workspace}. Run "openmods mc init" first.`)
    return null
  }
  try {
    const data = await Filesystem.readJson(configPath)
    const result = validateProjectConfig(data)
    if (!result.valid) {
      UI.error(`Invalid openmods.json:\n${result.errors.join("\n")}`)
      return null
    }
    for (const warning of result.warnings) {
      UI.println(`${UI.Style.TEXT_WARNING_BOLD}! ${UI.Style.TEXT_NORMAL}${warning}`)
    }
    return data as ProjectConfig
  } catch (error) {
    UI.error(`Failed to read openmods.json: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

/**
 * Initialize a new Minecraft mod project
 */
const McInitCommand = cmd({
  command: "init [name]",
  describe: "Initialize a new Minecraft mod project",
  builder: {
    name: {
      type: "string",
      describe: "Project name",
    },
    loader: {
      type: "string",
      choices: ["forge", "fabric", "neoforge"],
      default: "forge",
      describe: "Mod loader",
    },
    "mc-version": {
      type: "string",
      default: "1.20.1",
      describe: "Minecraft version",
    },
    "java-version": {
      type: "number",
      default: 17,
      describe: "Java version",
    },
    package: {
      type: "string",
      describe: "Java package name (e.g., com.example.mymod)",
    },
  },
  handler: async (argv) => {
    const projectName = valueString(argv.name, "my-mod")
    const loaderResult = LoaderSchema.safeParse(argv.loader)
    const loader = loaderResult.success ? loaderResult.data : "forge"
    const mcVersion = valueString(argv["mc-version"], "1.20.1")
    const javaVersion = valueNumber(argv["java-version"], 17)
    const packageName = valueString(argv.package, defaultPackage(projectName))
    const modId = normalizeModId(projectName)
    const workspace = path.resolve(process.cwd(), projectName)
    const exists = await Filesystem.exists(workspace)
    if (exists) {
      UI.error(`Directory already exists: ${workspace}`)
      return
    }
    const config: ProjectConfig = {
      minecraft: {
        version: mcVersion,
        loader,
        java_version: javaVersion,
      },
      mod: {
        id: modId,
        name: projectName,
        version: "1.0.0",
        package: packageName,
      },
    }
    const validation = validateProjectConfig(config)
    if (!validation.valid) {
      UI.error(`Invalid project config:\n${validation.errors.join("\n")}`)
      return
    }
    UI.println(`\n🎮 Initializing Minecraft mod project: ${projectName}`)
    UI.println(`   Loader: ${loader}`)
    UI.println(`   Minecraft: ${mcVersion}`)
    UI.println(`   Java: ${javaVersion}`)
    UI.println(`   Package: ${packageName}`)
    UI.println("")
    await initProject({
      workspace,
      projectName,
      config,
    })
    UI.println(`✅ Project initialized successfully!`)
    UI.println(`\nNext steps:`)
    UI.println(`  cd ${projectName}`)
    UI.println(`  openmods create "Your mod description"`)
  },
})

/**
 * Create mod from natural language description
 */
const McCreateCommand = cmd({
  command: "create <description>",
  describe: "Create mod from natural language description",
  builder: {
    description: {
      type: "string",
      describe: "Natural language description of the mod",
    },
    agent: {
      type: "string",
      default: "minecraft",
      describe: "Agent to use for generation",
    },
  },
  handler: async (argv) => {
    const description = valueString(argv.description)
    const agent = valueString(argv.agent, "minecraft")
    const workspace = process.cwd()
    const config = await loadProjectConfig(workspace)
    if (!config) return

    UI.println(`\n🤖 Creating mod from description...`)
    UI.println(`   Description: "${description}"`)
    UI.println(`   Agent: ${agent}`)
    UI.println(`\n`)

    let generated = ""
    try {
      generated = await generateSpecsWithAgent({
        workspace,
        agent,
        description,
        config,
      })
    } catch (error) {
      UI.error(`Failed to generate module specs with agent: ${error instanceof Error ? error.message : String(error)}`)
      return
    }

    const payload = (() => {
      try {
        return parseJsonPayload(generated)
      } catch {
        return null
      }
    })()
    if (!payload) {
      UI.error(`Agent did not return parseable JSON. Raw output:\n${generated || "(empty)"}`)
      return
    }
    const specs = asSpecs(payload).map(normalizeGeneratedSpec).filter((spec): spec is ModuleSpec => !!spec)
    if (!specs.length) {
      UI.error(`Agent returned no module specs.`)
      return
    }

    const files = []
    for (const spec of specs) {
      const validation = validateModuleSpec(spec)
      if (!validation.valid) {
        UI.error(`Generated module is invalid (${valueString(spec.name, "unknown")}):\n${validation.errors.join("\n")}`)
        return
      }
      const generatedFiles = await generateModule({
        config,
        module: spec,
        workspace,
      })
      files.push(...generatedFiles)
    }

    if (!files.length) {
      UI.error("No files generated from agent output.")
      return
    }

    await writeFiles(files)
    UI.println(`✅ Mod created successfully!`)
    UI.println(`\nGenerated files:`)
    for (const file of files) {
      UI.println(`  - ${path.relative(workspace, file.path)}`)
    }
  },
})

/**
 * Add a new module to the mod
 */
const McAddCommand = cmd({
  command: "add <type> <name>",
  describe: "Add a new module (block, item, tool, etc.) to the mod",
  builder: {
    type: {
      type: "string",
      describe: "Module type (block, item, tool, armor, food, entity, etc.)",
    },
    name: {
      type: "string",
      describe: "Module name",
    },
    id: {
      type: "string",
      describe: "Module ID (registry name, defaults to snake_case of name)",
    },
    properties: {
      type: "string",
      describe: "Module properties as JSON string",
    },
  },
  handler: async (argv) => {
    const typeRaw = valueString(argv.type)
    const name = valueString(argv.name)
    const id = valueString(argv.id, toSnakeCase(name))
    const typeResult = ModuleTypeSchema.safeParse(typeRaw)
    if (!typeResult.success) {
      UI.error(`Unsupported module type: ${typeRaw}`)
      UI.println(`Supported types: ${ModuleTypeSchema.options.join(", ")}`)
      return
    }
    const type = typeResult.data
    let properties: Record<string, unknown> = {}
    if (argv.properties) {
      try {
        properties = JSON.parse(valueString(argv.properties))
      } catch {
        UI.error("Invalid --properties JSON")
        return
      }
    }
    const workspace = process.cwd()
    const config = await loadProjectConfig(workspace)
    if (!config) return
    const moduleSpec = {
      type,
      name,
      id,
      properties,
    }
    const validation = validateModuleSpec(moduleSpec)
    if (!validation.valid) {
      UI.error(`Module validation failed:\n${validation.errors.join("\n")}`)
      return
    }
    for (const warning of validation.warnings) {
      UI.println(`${UI.Style.TEXT_WARNING_BOLD}! ${UI.Style.TEXT_NORMAL}${warning}`)
    }
    const files = await generateModule({
      config,
      module: moduleSpec,
      workspace,
    })
    if (!files.length) {
      UI.error("No files generated. Template may be missing for this module type.")
      return
    }
    await writeFiles(files)
    UI.println(`\n📦 Adding ${type}: ${name}`)
    UI.println(`   ID: ${id}`)
    UI.println(`   Properties: ${JSON.stringify(properties)}`)
    UI.println("")
    UI.println(`✅ Module added successfully!`)
    UI.println(`\nGenerated files:`)
    for (const file of files) {
      UI.println(`  - ${path.relative(workspace, file.path)}`)
    }
  },
})

/**
 * Build the mod
 */
const McBuildCommand = cmd({
  command: "build",
  describe: "Build the Minecraft mod",
  builder: {
    clean: {
      type: "boolean",
      default: false,
      describe: "Clean before build",
    },
    debug: {
      type: "boolean",
      default: false,
      describe: "Enable debug output",
    },
  },
  handler: async (argv) => {
    const clean = valueBoolean(argv.clean, false)
    const debug = valueBoolean(argv.debug, false)
    const workspace = process.cwd()
    UI.println(`\n🔨 Building Minecraft mod...`)
    if (clean) UI.println(`   Clean build: enabled`)
    if (debug) UI.println(`   Debug mode: enabled`)
    UI.println("")
    const result = await runGradleBuild({
      workspace,
      clean,
      debug,
    })
    if (!result.success) {
      UI.error(result.error || "Build failed")
      if (result.output.trim()) UI.println(result.output)
      return
    }
    UI.println(`✅ Build completed successfully!`)
    if (result.jarPath) {
      UI.println(`\nOutput: ${path.relative(workspace, result.jarPath)}`)
      return
    }
    UI.println(`\nOutput: build/libs/*.jar`)
  },
})

/**
 * Run Minecraft with the mod
 */
const McRunCommand = cmd({
  command: "run",
  describe: "Run Minecraft with the mod for testing",
  builder: {
    gui: {
      type: "boolean",
      default: true,
      describe: "Run with GUI",
    },
  },
  handler: async () => {
    UI.println(`\n🎮 Starting Minecraft...`)
    UI.println("")
    const workspace = process.cwd()
    const result = await runMinecraft(workspace)
    if (!result.success) {
      UI.error(result.error || "Failed to start Minecraft")
      if (result.output.trim()) UI.println(result.output)
      return
    }
    UI.println(`Minecraft client finished.`)
  },
})

/**
 * Minecraft command group
 */
export const McCommand = {
  command: "mc",
  describe: "Minecraft mod development commands",
  builder: (yargs: any) => {
    return yargs
      .command(McInitCommand)
      .command(McCreateCommand)
      .command(McAddCommand)
      .command(McBuildCommand)
      .command(McRunCommand)
      .demandCommand()
  },
  handler: () => {},
} satisfies CommandModule