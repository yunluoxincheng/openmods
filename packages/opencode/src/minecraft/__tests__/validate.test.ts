import { describe, expect, test } from "bun:test"
import { validateModuleSpec, validateProjectConfig } from "../tool/validate"

describe("minecraft validate", () => {
  test("validates a normal block module", () => {
    const result = validateModuleSpec({
      type: "block",
      name: "Ruby Block",
      id: "ruby_block",
      properties: {
        hardness: 3,
        resistance: 5,
      },
    })

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test("rejects invalid block light level", () => {
    const result = validateModuleSpec({
      type: "block",
      name: "Bad Block",
      id: "bad_block",
      properties: {
        light_level: 99,
      },
    })

    expect(result.valid).toBe(false)
    expect(result.errors.join("\n")).toContain("light level")
  })

  test("validates project config shape and constraints", () => {
    const result = validateProjectConfig({
      minecraft: {
        version: "1.20.1",
        loader: "forge",
        java_version: 17,
      },
      mod: {
        id: "examplemod",
        name: "Example Mod",
        version: "1.0.0",
        package: "com.example.examplemod",
      },
    })

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})
