import type { ModuleType } from "../config"
import { RegistryTypeMap } from "../config"

export interface RegistryEntry {
  className: string
  registryName: string
  moduleType: ModuleType
}

export interface RegistryClassOptions {
  modId: string
  packageName: string
  entries: RegistryEntry[]
  moduleType: ModuleType
  loader: "forge" | "fabric" | "neoforge"
}

const RegistryImports: Record<ModuleType, string[]> = {
  block: [
    "net.minecraft.world.level.block.Block",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  item: [
    "net.minecraft.world.item.Item",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  entity: [
    "net.minecraft.world.entity.EntityType",
    "net.minecraft.world.entity.MobCategory",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  tool: [
    "net.minecraft.world.item.Item",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  armor: [
    "net.minecraft.world.item.Item",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  food: [
    "net.minecraft.world.item.Item",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  fluid: [
    "net.minecraft.world.level.material.Fluid",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  dimension: [
    "net.minecraft.world.level.dimension.DimensionType",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  biome: [
    "net.minecraft.world.level.biome.Biome",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  creative_tab: [
    "net.minecraft.world.item.CreativeModeTab",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  enchantment: [
    "net.minecraft.world.item.enchantment.Enchantment",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  potion: [
    "net.minecraft.world.effect.MobEffect",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  particle: [
    "net.minecraft.core.particles.ParticleType",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  tile_entity: [
    "net.minecraft.world.level.block.entity.BlockEntityType",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  recipe: [
    "net.minecraft.world.item.crafting.RecipeSerializer",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
  loot_table: [],
  screen: [
    "net.minecraft.world.inventory.MenuType",
    "net.minecraft.core.registries.Registries",
    "net.minecraftforge.registries.DeferredRegister",
    "net.minecraftforge.registries.RegistryObject",
  ],
}

const RegistryClassSuffix: Record<ModuleType, string> = {
  block: "Blocks",
  item: "Items",
  entity: "Entities",
  tool: "Items",
  armor: "Items",
  food: "Items",
  fluid: "Fluids",
  dimension: "Dimensions",
  biome: "Biomes",
  creative_tab: "CreativeTabs",
  enchantment: "Enchantments",
  potion: "Effects",
  particle: "Particles",
  tile_entity: "BlockEntities",
  recipe: "RecipeSerializers",
  loot_table: "",
  screen: "MenuTypes",
}

function getRegistryKey(moduleType: ModuleType): string {
  const map: Record<ModuleType, string> = {
    block: "BLOCK",
    item: "ITEM",
    entity: "ENTITY_TYPE",
    tool: "ITEM",
    armor: "ITEM",
    food: "ITEM",
    fluid: "FLUID",
    dimension: "DIMENSION_TYPE",
    biome: "BIOME",
    creative_tab: "CREATIVE_MODE_TAB",
    enchantment: "ENCHANTMENT",
    potion: "MOB_EFFECT",
    particle: "PARTICLE_TYPE",
    tile_entity: "BLOCK_ENTITY_TYPE",
    recipe: "RECIPE_SERIALIZER",
    loot_table: "",
    screen: "MENU",
  }
  return map[moduleType] || ""
}

function getSubPackage(moduleType: ModuleType): string {
  const map: Record<ModuleType, string> = {
    block: "blocks",
    item: "items",
    entity: "entities",
    tool: "items",
    armor: "items",
    food: "items",
    fluid: "fluids",
    dimension: "dimensions",
    biome: "world/biome",
    creative_tab: "creative_tabs",
    enchantment: "enchantments",
    potion: "potions",
    particle: "particles",
    tile_entity: "tileentities",
    recipe: "recipes",
    loot_table: "data",
    screen: "menus",
  }
  return map[moduleType] || moduleType + "s"
}

export function generateRegistryClass(options: RegistryClassOptions): string {
  const { modId, packageName, entries, moduleType, loader } = options
  const className = RegistryTypeMap[moduleType]
  const subPackage = getSubPackage(moduleType)
  const registryKey = getRegistryKey(moduleType)
  const imports = RegistryImports[moduleType] || []

  if (entries.length === 0 || !registryKey) {
    return ""
  }

  const isForgeLike = loader === "forge" || loader === "neoforge"

  if (!isForgeLike) {
    return ""
  }

  const uniqueImports = [...new Set(imports)]
  const importStatements = uniqueImports.map((i) => `import ${i};`).join("\n")

  const fieldEntries = entries
    .map((entry) => {
      const constName = entry.registryName.toUpperCase()
      return `    public static final RegistryObject<${getRegistryType(moduleType)}> ${constName} = ${className.toUpperCase()}.register(
        "${entry.registryName}",
        () -> new ${entry.className}()
    );`
    })
    .join("\n\n")

  return `package ${packageName}.${subPackage};

${importStatements}

public class ${className} {
    public static final DeferredRegister<${getRegistryType(moduleType)}> ${className.toUpperCase()} = 
        DeferredRegister.create(Registries.${registryKey}, "${modId}");

${fieldEntries}

    public static void register(net.minecraftforge.eventbus.api.IEventBus eventBus) {
        ${className.toUpperCase()}.register(eventBus);
    }
}
`
}

function getRegistryType(moduleType: ModuleType): string {
  const map: Record<ModuleType, string> = {
    block: "Block",
    item: "Item",
    entity: "EntityType<?>",
    tool: "Item",
    armor: "Item",
    food: "Item",
    fluid: "Fluid",
    dimension: "DimensionType",
    biome: "Biome",
    creative_tab: "CreativeModeTab",
    enchantment: "Enchantment",
    potion: "MobEffect",
    particle: "ParticleType<?>>",
    tile_entity: "BlockEntityType<?>>",
    recipe: "RecipeSerializer<?>>",
    loot_table: "",
    screen: "MenuType<?>>",
  }
  return map[moduleType] || ""
}

export function groupEntriesByModuleType(entries: RegistryEntry[]): Map<ModuleType, RegistryEntry[]> {
  const grouped = new Map<ModuleType, RegistryEntry[]>()

  for (const entry of entries) {
    const existing = grouped.get(entry.moduleType) || []
    existing.push(entry)
    grouped.set(entry.moduleType, existing)
  }

  return grouped
}

export function generateAllRegistryClasses(
  modId: string,
  packageName: string,
  entries: RegistryEntry[],
  loader: "forge" | "fabric" | "neoforge",
): Map<ModuleType, string> {
  const grouped = groupEntriesByModuleType(entries)
  const results = new Map<ModuleType, string>()

  for (const [moduleType, typeEntries] of grouped) {
    const content = generateRegistryClass({
      modId,
      packageName,
      entries: typeEntries,
      moduleType,
      loader,
    })
    if (content) {
      results.set(moduleType, content)
    }
  }

  return results
}
