import { describe, expect, test } from "bun:test"
import path from "path"
import { mkdtemp, rm } from "fs/promises"
import { tmpdir } from "os"
import type { ProjectConfig } from "../config"
import { generateModule, writeFiles } from "../tool/generate"

async function withTempDir<T>(run: (dir: string) => Promise<T>) {
  const dir = await mkdtemp(path.join(tmpdir(), "openmods-mc-generate-"))
  try {
    return await run(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

const config: ProjectConfig = {
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
}

describe("minecraft generate", () => {
  test("generates block java and model files", async () => {
    await withTempDir(async (workspace) => {
      const files = await generateModule({
        workspace,
        config,
        module: {
          type: "block",
          name: "Ruby Block",
          id: "ruby_block",
          properties: {
            hardness: 3,
            resistance: 5,
          },
        },
      })

      expect(files.length).toBeGreaterThanOrEqual(4)
      expect(files.some((f) => f.path.endsWith(path.join("blocks", "RubyBlock.java")))).toBe(true)
      expect(files.some((f) => f.path.includes(path.join("blockstates", "ruby_block.json")))).toBe(true)

      await writeFiles(files)
    })
  })

  test("generates recipe data file", async () => {
    await withTempDir(async (workspace) => {
      const files = await generateModule({
        workspace,
        config,
        module: {
          type: "recipe",
          name: "Ruby Recipe",
          id: "ruby_recipe",
          properties: {},
        },
      })

      expect(files.some((f) => f.path.includes(path.join("data", "examplemod", "recipes", "ruby_recipe.json")))).toBe(true)
    })
  })
})
