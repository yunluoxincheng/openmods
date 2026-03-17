import { describe, expect, test } from "bun:test"
import path from "path"
import { mkdtemp, rm } from "fs/promises"
import { tmpdir } from "os"
import type { ProjectConfig } from "../config"
import { initProject } from "../tool/scaffold"
import { validateProjectConfig, validateModuleSpec } from "../tool/validate"
import { generateModule, writeFiles } from "../tool/generate"

async function withTempDir<T>(run: (dir: string) => Promise<T>) {
  const dir = await mkdtemp(path.join(tmpdir(), "openmods-mc-workflow-"))
  try {
    return await run(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

describe("minecraft workflow", () => {
  test("runs init -> add flow and writes expected files", async () => {
    await withTempDir(async (workspace) => {
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

      const configValidation = validateProjectConfig(config)
      expect(configValidation.valid).toBe(true)

      await initProject({
        workspace,
        projectName: "example-mod",
        config,
        skipWrapperSetup: true,
      })

      const module = {
        type: "block" as const,
        name: "Ruby Block",
        id: "ruby_block",
        properties: {
          hardness: 3,
          resistance: 5,
        },
      }
      const moduleValidation = validateModuleSpec(module)
      expect(moduleValidation.valid).toBe(true)

      const files = await generateModule({
        workspace,
        config,
        module,
      })
      expect(files.length).toBeGreaterThanOrEqual(4)

      await writeFiles(files)

      const relative = files.map((file) => path.relative(workspace, file.path))
      expect(relative).toContain(path.join("src", "main", "resources", "assets", "examplemod", "blockstates", "ruby_block.json"))
      expect(relative).toContain(
        path.join("src", "main", "java", "com", "example", "examplemod", "blocks", "RubyBlock.java"),
      )
    })
  })
})
