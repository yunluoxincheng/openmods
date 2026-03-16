import { z } from "zod"
import { ModuleTypeSchema } from "../config"

/**
 * Module Specification Schema
 */
export const ModuleSpecSchema = z.object({
  type: ModuleTypeSchema,
  name: z.string().min(1, "Module name is required"),
  id: z.string().regex(/^[a-z][a-z0-9_]*$/, "Module ID must be lowercase, start with a letter, and contain only lowercase letters, numbers, and underscores"),
  description: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional(),
})

export type ModuleSpec = z.infer<typeof ModuleSpecSchema>

/**
 * Mod Specification Schema (Full Mod)
 */
export const ModSpecSchema = z.object({
  mod_id: z.string(),
  mod_name: z.string(),
  version: z.string(),
  package: z.string(),
  description: z.string().optional(),
  modules: z.array(ModuleSpecSchema).default([]),
})

export type ModSpec = z.infer<typeof ModSpecSchema>

/**
 * Task Graph Schema
 */
export const TaskNodeSchema = z.object({
  id: z.string(),
  agent: z.string(),
  action: z.string(),
  dependencies: z.array(z.string()).default([]),
  params: z.record(z.string(), z.any()).default({}),
  status: z.enum(["pending", "running", "completed", "failed"]).default("pending"),
})

export type TaskNode = z.infer<typeof TaskNodeSchema>

export const TaskGraphSchema = z.object({
  tasks: z.array(TaskNodeSchema).default([]),
})

export type TaskGraph = z.infer<typeof TaskGraphSchema>