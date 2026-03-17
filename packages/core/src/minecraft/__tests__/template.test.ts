import { describe, expect, test } from "bun:test"
import { renderTemplate } from "../tool/template"

const context = {
  package: "com.example.examplemod",
  class_name: "RubyItem",
  registry_name: "ruby_item",
  mod_id: "examplemod",
  properties: {},
}

describe("minecraft template", () => {
  test("renders forge-like template for neoforge block", async () => {
    const content = await renderTemplate({
      loader: "neoforge",
      moduleType: "block",
      fileType: "java",
      context: {
        ...context,
        class_name: "RubyBlock",
        registry_name: "ruby_block",
      },
    })

    expect(content).toBeTruthy()
    expect(content || "").toContain("public class RubyBlock")
  })

  test("renders fabric tool java template", async () => {
    const content = await renderTemplate({
      loader: "fabric",
      moduleType: "tool",
      fileType: "java",
      context: {
        ...context,
        properties: {
          tier: "IRON",
          tool_type: "pickaxe",
        },
      },
    })

    expect(content).toBeTruthy()
    expect(content || "").toContain("extends PickaxeItem")
  })

  test("renders recipe and loot table json templates", async () => {
    const recipe = await renderTemplate({
      loader: "forge",
      moduleType: "recipe",
      fileType: "recipe",
      context: {
        ...context,
        registry_name: "ruby_ingot",
      },
    })
    const lootTable = await renderTemplate({
      loader: "forge",
      moduleType: "loot_table",
      fileType: "loot_table",
      context: {
        ...context,
        registry_name: "ruby_block",
      },
    })

    expect(recipe).toBeTruthy()
    expect(lootTable).toBeTruthy()
    expect(recipe || "").toContain("minecraft:crafting_shapeless")
    expect(lootTable || "").toContain("minecraft:item")
  })

  test("renders forge entity java template with full implementation", async () => {
    const entity = await renderTemplate({
      loader: "forge",
      moduleType: "entity",
      fileType: "java",
      context: {
        ...context,
        class_name: "RubyGolem",
        registry_name: "ruby_golem",
        properties: {
          category: "CREATURE",
          width: 0.6,
          height: 1.8,
        },
      },
    })

    expect(entity).toBeTruthy()
    expect(entity || "").toContain("extends Animal")
    expect(entity || "").toContain("createAttributes()")
  })

  test("renders forge fluid java template", async () => {
    const fluid = await renderTemplate({
      loader: "forge",
      moduleType: "fluid",
      fileType: "java",
      context: {
        ...context,
        class_name: "RubyFluid",
        registry_name: "ruby_fluid",
      },
    })

    expect(fluid).toBeTruthy()
    expect(fluid || "").toContain("extends ForgeFlowingFluid")
    expect(fluid || "").toContain("class Source")
    expect(fluid || "").toContain("class Flowing")
  })

  test("renders forge biome java template", async () => {
    const biome = await renderTemplate({
      loader: "forge",
      moduleType: "biome",
      fileType: "java",
      context: {
        ...context,
        class_name: "RubyBiome",
        registry_name: "ruby_biome",
        properties: {
          temperature: 0.8,
          downfall: 0.4,
        },
      },
    })

    expect(biome).toBeTruthy()
    expect(biome || "").toContain("public static Biome create()")
    expect(biome || "").toContain("0.8f")
  })

  test("renders forge screen and menu templates", async () => {
    const screen = await renderTemplate({
      loader: "forge",
      moduleType: "screen",
      fileType: "java",
      context: {
        ...context,
        class_name: "RubyScreen",
        registry_name: "ruby_screen",
      },
    })
    const menu = await renderTemplate({
      loader: "forge",
      moduleType: "screen",
      fileType: "menu",
      context: {
        ...context,
        class_name: "RubyScreen",
        registry_name: "ruby_screen",
      },
    })

    expect(screen).toBeTruthy()
    expect(menu).toBeTruthy()
    expect(screen || "").toContain("extends AbstractContainerScreen")
    expect(menu || "").toContain("extends AbstractContainerMenu")
  })

  test("renders forge tile_entity java template", async () => {
    const tileEntity = await renderTemplate({
      loader: "forge",
      moduleType: "tile_entity",
      fileType: "java",
      context: {
        ...context,
        class_name: "RubyTileEntity",
        registry_name: "ruby_tile_entity",
      },
    })

    expect(tileEntity).toBeTruthy()
    expect(tileEntity || "").toContain("extends BlockEntity")
  })

  test("renders forge creative_tab java template", async () => {
    const creativeTab = await renderTemplate({
      loader: "forge",
      moduleType: "creative_tab",
      fileType: "java",
      context: {
        ...context,
        class_name: "ModCreativeTabs",
        registry_name: "ruby_tab",
      },
    })

    expect(creativeTab).toBeTruthy()
    expect(creativeTab || "").toContain("DeferredRegister")
    expect(creativeTab || "").toContain("CreativeModeTab")
  })

  test("renders forge enchantment java template", async () => {
    const enchantment = await renderTemplate({
      loader: "forge",
      moduleType: "enchantment",
      fileType: "java",
      context: {
        ...context,
        class_name: "RubyTouch",
        registry_name: "ruby_touch",
        properties: {
          max_level: 5,
          rarity: "RARE",
        },
      },
    })

    expect(enchantment).toBeTruthy()
    expect(enchantment || "").toContain("extends Enchantment")
    expect(enchantment || "").toContain("getMaxLevel()")
    expect(enchantment || "").toContain("return 5")
  })

  test("renders forge potion java template", async () => {
    const potion = await renderTemplate({
      loader: "forge",
      moduleType: "potion",
      fileType: "java",
      context: {
        ...context,
        class_name: "RubyEffect",
        registry_name: "ruby_effect",
        properties: {
          duration: 300,
          amplifier: 2,
        },
      },
    })

    expect(potion).toBeTruthy()
    expect(potion || "").toContain("extends MobEffect")
    expect(potion || "").toContain("createInstance()")
  })
})
