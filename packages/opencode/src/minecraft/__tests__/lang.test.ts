import { describe, expect, test } from "bun:test"
import { getLangKey, generateLangEntries, mergeLangContent, getLangFilePath } from "../tool/lang"

describe("minecraft lang", () => {
  test("generates correct lang key for block", () => {
    const key = getLangKey("block", "examplemod", "ruby_block")
    expect(key).toBe("block.examplemod.ruby_block")
  })

  test("generates correct lang key for item", () => {
    const key = getLangKey("item", "examplemod", "ruby_item")
    expect(key).toBe("item.examplemod.ruby_item")
  })

  test("generates correct lang key for entity", () => {
    const key = getLangKey("entity", "examplemod", "ruby_golem")
    expect(key).toBe("entity.examplemod.ruby_golem")
  })

  test("generates correct lang key for creative_tab", () => {
    const key = getLangKey("creative_tab", "examplemod", "ruby_tab")
    expect(key).toBe("itemGroup.examplemod.ruby_tab")
  })

  test("generates correct lang key for enchantment", () => {
    const key = getLangKey("enchantment", "examplemod", "ruby_touch")
    expect(key).toBe("enchantment.examplemod.ruby_touch")
  })

  test("generates correct lang key for potion", () => {
    const key = getLangKey("potion", "examplemod", "ruby_effect")
    expect(key).toBe("effect.examplemod.ruby_effect")
  })

  test("generates lang entries from module specs", () => {
    const entries = generateLangEntries([
      { moduleType: "block", modId: "examplemod", registryName: "ruby_block", displayName: "Ruby Block" },
      { moduleType: "item", modId: "examplemod", registryName: "ruby_item", displayName: "Ruby" },
    ])

    expect(entries.length).toBe(2)
    expect(entries[0].key).toBe("block.examplemod.ruby_block")
    expect(entries[0].value).toBe("Ruby Block")
    expect(entries[1].key).toBe("item.examplemod.ruby_item")
    expect(entries[1].value).toBe("Ruby")
  })

  test("merges lang content with existing content", () => {
    const existing = JSON.stringify({
      "block.examplemod.old_block": "Old Block",
    })

    const merged = mergeLangContent(existing, [{ key: "block.examplemod.ruby_block", value: "Ruby Block" }])

    const parsed = JSON.parse(merged)
    expect(parsed["block.examplemod.old_block"]).toBe("Old Block")
    expect(parsed["block.examplemod.ruby_block"]).toBe("Ruby Block")
  })

  test("creates new lang content when no existing content", () => {
    const merged = mergeLangContent(null, [{ key: "block.examplemod.ruby_block", value: "Ruby Block" }])

    const parsed = JSON.parse(merged)
    expect(parsed["block.examplemod.ruby_block"]).toBe("Ruby Block")
  })

  test("overwrites existing keys", () => {
    const existing = JSON.stringify({
      "block.examplemod.ruby_block": "Old Name",
    })

    const merged = mergeLangContent(existing, [{ key: "block.examplemod.ruby_block", value: "Ruby Block" }])

    const parsed = JSON.parse(merged)
    expect(parsed["block.examplemod.ruby_block"]).toBe("Ruby Block")
  })

  test("generates correct lang file path", () => {
    const path = getLangFilePath("/workspace/my-mod", "examplemod")
    expect(path).toContain("assets")
    expect(path).toContain("examplemod")
    expect(path).toContain("lang")
    expect(path).toContain("en_us.json")
  })
})
