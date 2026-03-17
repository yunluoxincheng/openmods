/**
 * Minecraft Agent Configuration
 *
 * This module defines the Minecraft-specific agent for OpenMods.
 * The agent is specialized for generating Minecraft Forge mod code and resources.
 *
 * Supported Platform:
 * - Minecraft: 1.20.1
 * - Mod Loader: Forge 47.4.10
 * - Java: 17
 */

import { PermissionNext } from "@/permission/next"
import type { Agent } from "@/agent/agent"
import PROMPT_MINECRAFT from "./minecraft.txt"
import path from "path"
import { existsSync } from "fs"

/**
 * Minecraft Agent Configuration
 */
export const MinecraftAgentConfig: Agent.Info = {
  name: "minecraft",
  description:
    "Specialized agent for Minecraft Forge mod development. Generates Java code, JSON resources, and project configuration. Supports Minecraft 1.20.1 with Forge 47.4.10.",
  mode: "primary",
  native: false,
  prompt: PROMPT_MINECRAFT,
  options: {
    minecraft_version: "1.20.1",
    forge_version: "47.4.10",
    java_version: 17,
  },
  permission: PermissionNext.fromConfig({
    "*": "allow",
    write: {
      "*": "allow",
    },
    read: {
      "*": "allow",
    },
    bash: {
      "*": "allow",
      gradlew: "allow",
      "gradlew.bat": "allow",
    },
    glob: "allow",
    grep: "allow",
  }),
}

/**
 * Register Minecraft Agent
 *
 * This function should be called during initialization to register
 * the Minecraft agent with the agent system.
 */
export async function registerMinecraftAgent(): Promise<void> {
  return
}

/**
 * Minecraft Agent Tools
 *
 * These are the tools that the Minecraft agent can use.
 */
export const MinecraftAgentTools = ["write", "read", "edit", "bash", "glob", "grep", "question"]

/**
 * Check if a directory is a Minecraft mod project
 */
export function isMinecraftProject(dir: string): boolean {
  const configPath = path.join(dir, "openmods.json")
  if (existsSync(configPath)) return true

  const indicators = [
    path.join(dir, "build.gradle"),
    path.join(dir, "src/main/java"),
    path.join(dir, "src/main/resources"),
  ]
  return indicators.every((item) => existsSync(item))
}

/**
 * Get suggested agent based on project type
 */
export function getSuggestedAgent(projectDir: string): string {
  if (isMinecraftProject(projectDir)) {
    return "minecraft"
  }
  return "minecraft"
}
