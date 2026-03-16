import { describe, expect, test } from "bun:test"
import path from "path"
import { mkdtemp, readFile, rm } from "fs/promises"
import { tmpdir } from "os"
import type { ProjectConfig } from "../config"
import { initProject } from "../tool/scaffold"

async function withTempDir<T>(run: (dir: string) => Promise<T>) {
  const dir = await mkdtemp(path.join(tmpdir(), "openmods-mc-scaffold-"))
  try {
    return await run(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

const forgeConfig: ProjectConfig = {
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

describe("minecraft scaffold", () => {
  test("creates forge gradle files and metadata", async () => {
    await withTempDir(async (workspace) => {
      await initProject({
        workspace,
        projectName: "example-mod",
        config: forgeConfig,
        skipWrapperSetup: true,
      })

      const build = await readFile(path.join(workspace, "build.gradle"), "utf-8")
      const settings = await readFile(path.join(workspace, "settings.gradle"), "utf-8")
      const mods = await readFile(path.join(workspace, "src/main/resources/META-INF/mods.toml"), "utf-8")
      const main = await readFile(
        path.join(workspace, "src/main/java/com/example/examplemod/ExamplemodMod.java"),
        "utf-8",
      )

      expect(build).toContain("net.minecraftforge.gradle")
      expect(build).toContain("net.minecraftforge:forge:1.20.1-47.2.20")
      expect(settings).toContain("pluginManagement")
      expect(mods).toContain('modId="examplemod"')
      expect(main).toContain('@Mod("examplemod")')
    })
  })
})
