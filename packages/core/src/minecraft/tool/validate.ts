import { z } from "zod"
import { ModuleSpecSchema, ModSpecSchema } from "../schema/mod_spec"
import { ProjectConfigSchema, ModuleTypeSchema } from "../config"

/**
 * Validation Result
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate Module Specification
 */
export function validateModuleSpec(data: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    const result = ModuleSpecSchema.safeParse(data)
    
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.join(".")
        errors.push(`${path}: ${issue.message}`)
      }
    }
    
    // Additional validation
    if (result.success) {
      const module = result.data
      
      // Check for reserved names
      const reservedNames = ["block", "item", "entity", "tile", "minecraft"]
      if (reservedNames.includes(module.id)) {
        errors.push(`Module ID "${module.id}" is reserved`)
      }
      
      // Check for common issues
      if (module.name.length > 50) {
        warnings.push("Module name is very long, consider shortening it")
      }
      
      // Type-specific validation
      if (module.type === "block" && module.properties) {
        const props = module.properties as Record<string, any>
        if (props.hardness !== undefined && props.hardness < 0) {
          errors.push("Block hardness cannot be negative")
        }
        if (props.resistance !== undefined && props.resistance < 0) {
          errors.push("Block resistance cannot be negative")
        }
        if (props.light_level !== undefined && (props.light_level < 0 || props.light_level > 15)) {
          errors.push("Block light level must be between 0 and 15")
        }
      }
      
      if (module.type === "tool" && module.properties) {
        const props = module.properties as Record<string, any>
        if (props.attack_damage !== undefined && props.attack_damage < 0) {
          errors.push("Tool attack damage cannot be negative")
        }
      }
      
      if (module.type === "food" && module.properties) {
        const props = module.properties as Record<string, any>
        if (props.nutrition !== undefined && props.nutrition < 0) {
          errors.push("Food nutrition cannot be negative")
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  } catch (e) {
    return {
      valid: false,
      errors: [e instanceof Error ? e.message : "Unknown validation error"],
      warnings,
    }
  }
}

/**
 * Validate Mod Specification
 */
export function validateModSpec(data: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    const result = ModSpecSchema.safeParse(data)
    
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.join(".")
        errors.push(`${path}: ${issue.message}`)
      }
    }
    
    if (result.success) {
      const mod = result.data
      
      // Validate each module
      for (let i = 0; i < mod.modules.length; i++) {
        const moduleResult = validateModuleSpec(mod.modules[i])
        if (!moduleResult.valid) {
          for (const err of moduleResult.errors) {
            errors.push(`modules[${i}]: ${err}`)
          }
        }
        warnings.push(...moduleResult.warnings.map(w => `modules[${i}]: ${w}`))
      }
      
      // Check for duplicate module IDs
      const ids = mod.modules.map(m => m.id)
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
      if (duplicates.length > 0) {
        errors.push(`Duplicate module IDs found: ${duplicates.join(", ")}`)
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  } catch (e) {
    return {
      valid: false,
      errors: [e instanceof Error ? e.message : "Unknown validation error"],
      warnings,
    }
  }
}

/**
 * Validate Project Configuration
 */
export function validateProjectConfig(data: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    const result = ProjectConfigSchema.safeParse(data)
    
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.join(".")
        errors.push(`${path}: ${issue.message}`)
      }
    }
    
    if (result.success) {
      const config = result.data
      
      // Check Minecraft version compatibility
      const mcVersion = parseFloat(config.minecraft.version.split(".")[1])
      if (mcVersion >= 20 && config.minecraft.java_version < 17) {
        errors.push("Minecraft 1.20+ requires Java 17 or higher")
      }
      if (mcVersion >= 21 && config.minecraft.java_version < 21) {
        warnings.push("Minecraft 1.21+ is recommended to use Java 21")
      }
      
      // Check package name
      if (config.mod.package.startsWith("minecraft.")) {
        errors.push("Package name cannot start with 'minecraft.'")
      }
      if (config.mod.package.startsWith("net.minecraft.")) {
        errors.push("Package name cannot start with 'net.minecraft.'")
      }
      
      // Check mod ID
      if (config.mod.id.length > 63) {
        warnings.push("Mod ID is very long, consider shortening it")
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  } catch (e) {
    return {
      valid: false,
      errors: [e instanceof Error ? e.message : "Unknown validation error"],
      warnings,
    }
  }
}

/**
 * Check if module type is supported
 */
export function isModuleTypeSupported(type: string): boolean {
  const result = ModuleTypeSchema.safeParse(type)
  return result.success
}

/**
 * Get list of supported module types
 */
export function getSupportedModuleTypes(): string[] {
  return ModuleTypeSchema.options
}