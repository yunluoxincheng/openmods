import { z } from "zod"
import path from "path"
import { Filesystem } from "@/util/filesystem"
import type { ModuleSpec } from "../schema/mod_spec"
import type { ProjectConfig, ModuleType } from "../config"
import { renderTemplate } from "./template"
import { getLangKey, mergeLangContent, getLangFilePath } from "./lang"

export type { RegistryEntry } from "./registry"
export { generateAllRegistryClasses, groupEntriesByModuleType } from "./registry"

/**
 * Generate Context
 */
export interface GenerateContext {
  config: ProjectConfig
  module: ModuleSpec
  workspace: string
}

/**
 * Output File
 */
export interface OutputFile {
  path: string
  content: string
  type: "java" | "json" | "texture" | "lang"
}

/**
 * Generate Java file path
 */
function getJavaPath(ctx: GenerateContext, moduleType: ModuleType, className: string): string {
  const packagePath = ctx.config.mod.package.replace(/\./g, "/")
  const typeToFolder: Record<ModuleType, string> = {
    block: "blocks",
    item: "items",
    tool: "items",
    armor: "items",
    food: "items",
    entity: "entities",
    fluid: "fluids",
    dimension: "dimensions",
    biome: "world/biome",
    creative_tab: "creative_tabs",
    enchantment: "enchantments",
    potion: "potions",
    particle: "particles",
    screen: "screens",
    tile_entity: "tileentities",
    recipe: "data",
    loot_table: "data",
  }
  const folder = typeToFolder[moduleType] || moduleType + "s"
  return path.join(ctx.workspace, "src/main/java", packagePath, folder, `${className}.java`)
}

/**
 * Generate Resource file path
 */
function getResourcePath(ctx: GenerateContext, type: string, name: string): string {
  const modId = ctx.config.mod.id
  const basePath = path.join(ctx.workspace, "src/main/resources/assets", modId)
  const dataPath = path.join(ctx.workspace, "src/main/resources/data", modId)

  switch (type) {
    case "blockstate":
      return path.join(basePath, "blockstates", `${name}.json`)
    case "model_block":
      return path.join(basePath, "models/block", `${name}.json`)
    case "model_item":
    case "model":
      return path.join(basePath, "models/item", `${name}.json`)
    case "lang":
      return path.join(basePath, "lang", "en_us.json")
    case "texture_block":
      return path.join(basePath, "textures/block", `${name}.png`)
    case "texture_item":
      return path.join(basePath, "textures/item", `${name}.png`)
    case "recipe":
      return path.join(dataPath, "recipes", `${name}.json`)
    case "loot_table":
      return path.join(dataPath, "loot_tables/blocks", `${name}.json`)
    default:
      return path.join(basePath, type, `${name}.json`)
  }
}

/**
 * Convert to PascalCase
 */
export function toPascalCase(text: string): string {
  return text
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")
}

/**
 * Convert to camelCase
 */
export function toCamelCase(text: string): string {
  const pascal = toPascalCase(text)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

/**
 * Convert to snake_case
 */
export function toSnakeCase(text: string): string {
  return text
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "")
    .replace(/[- ]/g, "_")
}

/**
 * Generate code for a module
 */
export async function generateModule(ctx: GenerateContext): Promise<OutputFile[]> {
  const files: OutputFile[] = []
  const { module, config } = ctx
  const className = toPascalCase(module.name)
  const registryName = module.id

  // Prepare template context
  const templateContext = {
    mod_id: config.mod.id,
    mod_name: config.mod.name,
    mod_version: config.mod.version,
    package: config.mod.package,
    package_path: config.mod.package.replace(/\./g, "/"),
    minecraft_version: config.minecraft.version,
    java_version: config.minecraft.java_version,
    loader: config.minecraft.loader,
    class_name: className,
    registry_name: registryName,
    module_name: module.name,
    module_type: module.type,
    properties: module.properties || {},
  }

  // Generate Java file
  const javaContent = await renderTemplate({
    loader: config.minecraft.loader,
    moduleType: module.type,
    fileType: "java",
    context: templateContext,
  })

  if (javaContent) {
    files.push({
      path: getJavaPath(ctx, module.type, className),
      content: javaContent,
      type: "java",
    })
  }

  // Generate JSON resources for blocks and items
  if (module.type === "block") {
    // Blockstate
    const blockstateContent = await renderTemplate({
      loader: config.minecraft.loader,
      moduleType: "block",
      fileType: "blockstate",
      context: templateContext,
    })
    if (blockstateContent) {
      files.push({
        path: getResourcePath(ctx, "blockstate", registryName),
        content: blockstateContent,
        type: "json",
      })
    }

    // Block model
    const blockModelContent = await renderTemplate({
      loader: config.minecraft.loader,
      moduleType: "block",
      fileType: "model_block",
      context: templateContext,
    })
    if (blockModelContent) {
      files.push({
        path: getResourcePath(ctx, "model_block", registryName),
        content: blockModelContent,
        type: "json",
      })
    }

    // Item model (for block item)
    const itemModelContent = await renderTemplate({
      loader: config.minecraft.loader,
      moduleType: "block",
      fileType: "model_item",
      context: templateContext,
    })
    if (itemModelContent) {
      files.push({
        path: getResourcePath(ctx, "model_item", registryName),
        content: itemModelContent,
        type: "json",
      })
    }
  }

  if (module.type === "item" || module.type === "tool" || module.type === "armor" || module.type === "food") {
    // Item model
    const itemModelContent = await renderTemplate({
      loader: config.minecraft.loader,
      moduleType: module.type,
      fileType: "model",
      context: templateContext,
    })
    if (itemModelContent) {
      files.push({
        path: getResourcePath(ctx, "model_item", registryName),
        content: itemModelContent,
        type: "json",
      })
    }
  }

  if (module.type === "recipe") {
    const recipeContent = await renderTemplate({
      loader: config.minecraft.loader,
      moduleType: "recipe",
      fileType: "recipe",
      context: templateContext,
    })
    if (recipeContent) {
      files.push({
        path: getResourcePath(ctx, "recipe", registryName),
        content: recipeContent,
        type: "json",
      })
    }
  }

  if (module.type === "loot_table") {
    const lootTableContent = await renderTemplate({
      loader: config.minecraft.loader,
      moduleType: "loot_table",
      fileType: "loot_table",
      context: templateContext,
    })
    if (lootTableContent) {
      files.push({
        path: getResourcePath(ctx, "loot_table", registryName),
        content: lootTableContent,
        type: "json",
      })
    }
  }

  return files
}

export async function writeFiles(files: OutputFile[]): Promise<void> {
  for (const file of files) {
    await Filesystem.write(file.path, file.content)
  }
}

export async function updateLangFile(
  workspace: string,
  modId: string,
  moduleType: ModuleType,
  registryName: string,
  displayName: string,
): Promise<void> {
  const langPath = getLangFilePath(workspace, modId)
  const key = getLangKey(moduleType, modId, registryName)

  let existingContent: string | null = null
  try {
    existingContent = await Filesystem.readText(langPath)
  } catch {
    existingContent = null
  }

  const newContent = mergeLangContent(existingContent, [{ key, value: displayName }])
  await Filesystem.write(langPath, newContent)
}
