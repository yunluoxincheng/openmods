import path from "path"
import type { ModuleType } from "../config"

export interface LangEntry {
  key: string
  value: string
}

export function getLangKey(moduleType: ModuleType, modId: string, registryName: string): string {
  switch (moduleType) {
    case "block":
      return `block.${modId}.${registryName}`
    case "item":
    case "tool":
    case "armor":
    case "food":
      return `item.${modId}.${registryName}`
    case "entity":
      return `entity.${modId}.${registryName}`
    case "fluid":
      return `fluid.${modId}.${registryName}`
    case "dimension":
      return `dimension.${modId}.${registryName}`
    case "biome":
      return `biome.${modId}.${registryName}`
    case "creative_tab":
      return `itemGroup.${modId}.${registryName}`
    case "enchantment":
      return `enchantment.${modId}.${registryName}`
    case "potion":
      return `effect.${modId}.${registryName}`
    case "particle":
      return `particle.${modId}.${registryName}`
    case "tile_entity":
      return `blockEntity.${modId}.${registryName}`
    case "screen":
      return `container.${modId}.${registryName}`
    default:
      return `${moduleType}.${modId}.${registryName}`
  }
}

export function generateLangEntries(
  entries: Array<{
    moduleType: ModuleType
    modId: string
    registryName: string
    displayName: string
  }>,
): LangEntry[] {
  return entries.map((entry) => ({
    key: getLangKey(entry.moduleType, entry.modId, entry.registryName),
    value: entry.displayName,
  }))
}

export function mergeLangContent(existingContent: string | null, newEntries: LangEntry[]): string {
  let existing: Record<string, string> = {}

  if (existingContent) {
    try {
      existing = JSON.parse(existingContent)
    } catch {
      existing = {}
    }
  }

  for (const entry of newEntries) {
    existing[entry.key] = entry.value
  }

  return JSON.stringify(existing, null, 2)
}

export function getLangFilePath(workspace: string, modId: string): string {
  return path.join(workspace, "src/main/resources/assets", modId, "lang", "en_us.json")
}
