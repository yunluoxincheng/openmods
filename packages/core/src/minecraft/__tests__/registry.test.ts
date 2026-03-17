import { describe, expect, test } from "bun:test"
import { generateRegistryClass, groupEntriesByModuleType } from "../tool/registry"
import type { RegistryEntry } from "../tool/registry"

describe("minecraft registry", () => {
  test("generates ModBlocks class for blocks", () => {
    const entries: RegistryEntry[] = [
      { className: "RubyBlock", registryName: "ruby_block", moduleType: "block" },
      { className: "SapphireBlock", registryName: "sapphire_block", moduleType: "block" },
    ]

    const content = generateRegistryClass({
      modId: "examplemod",
      packageName: "com.example.examplemod",
      entries,
      moduleType: "block",
      loader: "forge",
    })

    expect(content).toBeTruthy()
    expect(content).toContain("public class ModBlocks")
    expect(content).toContain("DeferredRegister<Block>")
    expect(content).toContain("RUBY_BLOCK")
    expect(content).toContain("SAPPHIRE_BLOCK")
    expect(content).toContain('"ruby_block"')
    expect(content).toContain("MODBLOCKS.register(")
  })

  test("generates ModItems class for items", () => {
    const entries: RegistryEntry[] = [
      { className: "RubyItem", registryName: "ruby_item", moduleType: "item" },
      { className: "RubyPickaxe", registryName: "ruby_pickaxe", moduleType: "tool" },
    ]

    const content = generateRegistryClass({
      modId: "examplemod",
      packageName: "com.example.examplemod",
      entries,
      moduleType: "item",
      loader: "forge",
    })

    expect(content).toBeTruthy()
    expect(content).toContain("public class ModItems")
    expect(content).toContain("DeferredRegister<Item>")
  })

  test("generates ModEntities class for entities", () => {
    const entries: RegistryEntry[] = [{ className: "RubyGolem", registryName: "ruby_golem", moduleType: "entity" }]

    const content = generateRegistryClass({
      modId: "examplemod",
      packageName: "com.example.examplemod",
      entries,
      moduleType: "entity",
      loader: "forge",
    })

    expect(content).toBeTruthy()
    expect(content).toContain("public class ModEntities")
    expect(content).toContain("DeferredRegister<EntityType<?>>")
  })

  test("returns empty string for empty entries", () => {
    const content = generateRegistryClass({
      modId: "examplemod",
      packageName: "com.example.examplemod",
      entries: [],
      moduleType: "block",
      loader: "forge",
    })

    expect(content).toBe("")
  })

  test("returns empty string for fabric loader", () => {
    const entries: RegistryEntry[] = [{ className: "RubyBlock", registryName: "ruby_block", moduleType: "block" }]

    const content = generateRegistryClass({
      modId: "examplemod",
      packageName: "com.example.examplemod",
      entries,
      moduleType: "block",
      loader: "fabric",
    })

    expect(content).toBe("")
  })

  test("groups entries by module type", () => {
    const entries: RegistryEntry[] = [
      { className: "RubyBlock", registryName: "ruby_block", moduleType: "block" },
      { className: "SapphireBlock", registryName: "sapphire_block", moduleType: "block" },
      { className: "RubyItem", registryName: "ruby_item", moduleType: "item" },
      { className: "RubyGolem", registryName: "ruby_golem", moduleType: "entity" },
    ]

    const grouped = groupEntriesByModuleType(entries)

    expect(grouped.size).toBe(3)
    expect(grouped.get("block")?.length).toBe(2)
    expect(grouped.get("item")?.length).toBe(1)
    expect(grouped.get("entity")?.length).toBe(1)
  })
})
