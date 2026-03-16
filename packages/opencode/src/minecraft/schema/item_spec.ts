import { z } from "zod"

/**
 * Item Properties Schema
 */
export const ItemPropertiesSchema = z.object({
  max_stack_size: z.number().int().min(1).max(99).default(64),
  rarity: z.enum(["COMMON", "UNCOMMON", "RARE", "EPIC"]).default("COMMON"),
  fire_resistant: z.boolean().default(false),
  glow: z.boolean().default(false),
  tooltip: z.string().optional(),
  creative_tab: z.string().default("MISC"),
})

export type ItemProperties = z.infer<typeof ItemPropertiesSchema>

/**
 * Full Item Module Specification
 */
export const ItemSpecSchema = z.object({
  type: z.literal("item"),
  name: z.string().min(1),
  id: z.string().regex(/^[a-z][a-z0-9_]*$/),
  description: z.string().optional(),
  properties: ItemPropertiesSchema.optional(),
})

export type ItemSpec = z.infer<typeof ItemSpecSchema>

/**
 * Tool Properties Schema
 */
export const ToolPropertiesSchema = ItemPropertiesSchema.extend({
  tool_type: z.enum(["pickaxe", "axe", "shovel", "hoe", "sword", "shears"]).default("pickaxe"),
  tier: z.enum(["WOOD", "STONE", "IRON", "GOLD", "DIAMOND", "NETHERITE"]).default("IRON"),
  attack_damage: z.number().min(0).default(1.0),
  attack_speed: z.number().default(-2.8),
  durability: z.number().int().positive().optional(),
  enchantability: z.number().int().positive().optional(),
})

export type ToolProperties = z.infer<typeof ToolPropertiesSchema>

/**
 * Full Tool Module Specification
 */
export const ToolSpecSchema = z.object({
  type: z.literal("tool"),
  name: z.string().min(1),
  id: z.string().regex(/^[a-z][a-z0-9_]*$/),
  description: z.string().optional(),
  properties: ToolPropertiesSchema.optional(),
})

export type ToolSpec = z.infer<typeof ToolSpecSchema>

/**
 * Armor Properties Schema
 */
export const ArmorPropertiesSchema = ItemPropertiesSchema.extend({
  armor_type: z.enum(["helmet", "chestplate", "leggings", "boots"]).default("helmet"),
  material: z.enum(["LEATHER", "CHAIN", "IRON", "GOLD", "DIAMOND", "NETHERITE"]).default("IRON"),
  defense: z.number().int().min(0).default(1),
  toughness: z.number().min(0).default(0.0),
  knockback_resistance: z.number().min(0).max(1).default(0.0),
  durability: z.number().int().positive().optional(),
  enchantability: z.number().int().positive().optional(),
})

export type ArmorProperties = z.infer<typeof ArmorPropertiesSchema>

/**
 * Full Armor Module Specification
 */
export const ArmorSpecSchema = z.object({
  type: z.literal("armor"),
  name: z.string().min(1),
  id: z.string().regex(/^[a-z][a-z0-9_]*$/),
  description: z.string().optional(),
  properties: ArmorPropertiesSchema.optional(),
})

export type ArmorSpec = z.infer<typeof ArmorSpecSchema>

/**
 * Food Properties Schema
 */
export const FoodPropertiesSchema = ItemPropertiesSchema.extend({
  nutrition: z.number().int().min(0).default(4),
  saturation: z.number().min(0).default(0.3),
  is_meat: z.boolean().default(false),
  can_always_eat: z.boolean().default(false),
  eat_duration: z.number().int().positive().default(32),
  effects: z.array(z.object({
    effect_id: z.string(),
    duration: z.number().int().positive(),
    amplifier: z.number().int().min(0).default(0),
    probability: z.number().min(0).max(1).default(1.0),
  })).optional(),
})

export type FoodProperties = z.infer<typeof FoodPropertiesSchema>

/**
 * Full Food Module Specification
 */
export const FoodSpecSchema = z.object({
  type: z.literal("food"),
  name: z.string().min(1),
  id: z.string().regex(/^[a-z][a-z0-9_]*$/),
  description: z.string().optional(),
  properties: FoodPropertiesSchema.optional(),
})

export type FoodSpec = z.infer<typeof FoodSpecSchema>

/**
 * Tool Tier Configuration
 */
export const ToolTierConfig = {
  WOOD: { uses: 59, speed: 2.0, attack_damage_bonus: 0.0, level: 0, enchantment_value: 15 },
  STONE: { uses: 131, speed: 4.0, attack_damage_bonus: 1.0, level: 1, enchantment_value: 5 },
  IRON: { uses: 250, speed: 6.0, attack_damage_bonus: 2.0, level: 2, enchantment_value: 14 },
  GOLD: { uses: 32, speed: 12.0, attack_damage_bonus: 0.0, level: 0, enchantment_value: 22 },
  DIAMOND: { uses: 1561, speed: 8.0, attack_damage_bonus: 3.0, level: 3, enchantment_value: 10 },
  NETHERITE: { uses: 2031, speed: 9.0, attack_damage_bonus: 4.0, level: 4, enchantment_value: 15 },
} as const

/**
 * Armor Material Configuration
 */
export const ArmorMaterialConfig = {
  LEATHER: { durability: [11, 16, 15, 13], defense: [1, 3, 2, 1], enchantment_value: 15, toughness: 0.0, knockback_resistance: 0.0 },
  CHAIN: { durability: [165, 240, 225, 195], defense: [1, 5, 4, 2], enchantment_value: 12, toughness: 0.0, knockback_resistance: 0.0 },
  IRON: { durability: [165, 240, 225, 195], defense: [2, 6, 5, 2], enchantment_value: 9, toughness: 0.0, knockback_resistance: 0.0 },
  GOLD: { durability: [77, 112, 105, 91], defense: [2, 5, 3, 1], enchantment_value: 25, toughness: 0.0, knockback_resistance: 0.0 },
  DIAMOND: { durability: [363, 528, 495, 429], defense: [3, 8, 6, 3], enchantment_value: 10, toughness: 2.0, knockback_resistance: 0.0 },
  NETHERITE: { durability: [407, 592, 555, 481], defense: [3, 8, 6, 3], enchantment_value: 15, toughness: 3.0, knockback_resistance: 0.1 },
} as const