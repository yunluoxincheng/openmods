import { z } from "zod"

/**
 * Minecraft Mod Loader Types
 */
export const LoaderSchema = z.enum(["forge", "fabric", "neoforge"])
export type Loader = z.infer<typeof LoaderSchema>

/**
 * Minecraft Version Configuration
 */
export const MinecraftVersionSchema = z.object({
  version: z.string().default("1.20.1"),
  loader: LoaderSchema.default("forge"),
  java_version: z.number().int().default(17),
})

export type MinecraftVersion = z.infer<typeof MinecraftVersionSchema>

/**
 * Mod Configuration
 */
export const ModConfigSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9_]*$/, "Mod ID must be lowercase, start with a letter, and contain only lowercase letters, numbers, and underscores"),
  name: z.string().min(1),
  version: z.string().default("1.0.0"),
  package: z.string().regex(/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/, "Package must be a valid Java package name"),
  description: z.string().optional(),
  author: z.string().optional(),
})

export type ModConfig = z.infer<typeof ModConfigSchema>

/**
 * Full Project Configuration
 */
export const ProjectConfigSchema = z.object({
  minecraft: MinecraftVersionSchema,
  mod: ModConfigSchema,
  agent: z.object({
    model: z.string().optional(),
    provider: z.string().optional(),
  }).optional(),
})

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>

/**
 * Supported Module Types
 */
export const ModuleTypeSchema = z.enum([
  "block",
  "item", 
  "tool",
  "armor",
  "food",
  "entity",
  "fluid",
  "dimension",
  "biome",
  "recipe",
  "loot_table",
  "creative_tab",
  "enchantment",
  "potion",
  "particle",
  "screen",
  "tile_entity",
])

export type ModuleType = z.infer<typeof ModuleTypeSchema>

/**
 * Registry Type Mapping
 */
export const RegistryTypeMap: Record<ModuleType, string> = {
  block: "ModBlocks",
  item: "ModItems",
  entity: "ModEntities",
  tool: "ModItems",
  armor: "ModItems",
  food: "ModItems",
  fluid: "ModFluids",
  dimension: "ModDimensions",
  biome: "ModBiomes",
  creative_tab: "ModCreativeTabs",
  enchantment: "ModEnchantments",
  potion: "ModPotions",
  particle: "ModParticles",
  tile_entity: "ModTileEntities",
  recipe: "ModRecipes",
  loot_table: "ModLootTables",
  screen: "ModScreens",
}

/**
 * Template Paths for Module Types
 */
export const TemplatePathMap: Record<ModuleType, Record<string, string>> = {
  block: {
    java: "Block.java.ts",
    blockstate: "blockstate.json.ts",
    model_block: "model_block.json.ts",
    model_item: "model_item.json.ts",
  },
  item: {
    java: "Item.java.ts",
    model: "model.json.ts",
  },
  tool: {
    java: "ToolItem.java.ts",
    model: "model.json.ts",
  },
  armor: {
    java: "ArmorItem.java.ts",
    model: "model.json.ts",
  },
  food: {
    java: "FoodItem.java.ts",
    model: "model.json.ts",
  },
  entity: {
    java: "Entity.java.ts",
    model: "model.json.ts",
  },
  fluid: {
    java: "Fluid.java.ts",
    blockstate: "blockstate.json.ts",
    model_block: "model_block.json.ts",
  },
  dimension: {
    java: "Dimension.java.ts",
    dimension_type: "dimension_type.json.ts",
    dimension_data: "dimension.json.ts",
  },
  biome: {
    java: "Biome.java.ts",
    biome_data: "biome.json.ts",
  },
  recipe: {
    recipe: "recipe.json.ts",
  },
  loot_table: {
    loot_table: "loot_table.json.ts",
  },
  creative_tab: {
    java: "CreativeTab.java.ts",
  },
  enchantment: {
    java: "Enchantment.java.ts",
  },
  potion: {
    java: "Potion.java.ts",
  },
  particle: {
    java: "Particle.java.ts",
    particle_data: "particle.json.ts",
  },
  screen: {
    java: "Screen.java.ts",
    menu: "Menu.java.ts",
  },
  tile_entity: {
    java: "TileEntity.java.ts",
    blockstate: "blockstate.json.ts",
  },
}

/**
 * Default Configuration
 */
export const DEFAULT_CONFIG: ProjectConfig = {
  minecraft: {
    version: "1.20.1",
    loader: "forge",
    java_version: 17,
  },
  mod: {
    id: "mymod",
    name: "My Mod",
    version: "1.0.0",
    package: "com.example.mymod",
    description: "A Minecraft mod created with OpenMods",
  },
}