import type { Loader, ModuleType } from "../config"

/**
 * Template Render Options
 */
export interface TemplateRenderOptions {
  loader: Loader
  moduleType: ModuleType
  fileType: string
  context: Record<string, any>
}

/**
 * Render a template
 */
export async function renderTemplate(options: TemplateRenderOptions): Promise<string | null> {
  const { loader, moduleType, fileType, context } = options

  try {
    // For now, generate default templates inline
    // In production, these would be loaded from template files
    return generateDefaultTemplate(loader, moduleType, fileType, context)
  } catch (error) {
    console.error(`Template render error for ${moduleType}/${fileType}:`, error)
    return null
  }
}

/**
 * Generate default template content
 */
function generateDefaultTemplate(
  loader: Loader,
  moduleType: ModuleType,
  fileType: string,
  ctx: Record<string, any>,
): string | null {
  const { package: pkg, class_name, registry_name, mod_id, properties = {} } = ctx

  const isForgeLike = loader === "forge" || loader === "neoforge"

  // Block Java Template (Forge/NeoForge)
  if (moduleType === "block" && fileType === "java" && isForgeLike) {
    const material = properties.material || "STONE"
    const hardness = properties.hardness || 1.0
    const resistance = properties.resistance || 1.0
    const lightLevel = properties.light_level || 0

    return `package ${pkg}.blocks;

import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.state.BlockBehaviour;
import net.minecraft.world.level.material.Material;
import net.minecraft.world.level.material.PushReaction;

public class ${class_name} extends Block {
    public ${class_name}() {
        super(BlockBehaviour.Properties.of(Material.${material})
            .strength(${hardness}f, ${resistance}f)
            ${lightLevel > 0 ? `.lightLevel((state) -> ${lightLevel})` : ""}
            .requiresCorrectToolForDrops());
    }
}
`
  }

  // Block Java Template (Fabric)
  if (moduleType === "block" && fileType === "java" && loader === "fabric") {
    const material = properties.material || "STONE"
    const hardness = properties.hardness || 1.0
    const resistance = properties.resistance || 1.0

    return `package ${pkg}.blocks;

import net.fabricmc.fabric.api.object.builder.v1.block.FabricBlockSettings;
import net.minecraft.block.Block;
import net.minecraft.block.Material;
import net.minecraft.sound.BlockSoundGroup;

public class ${class_name} extends Block {
    public ${class_name}() {
        super(FabricBlockSettings.of(Material.${material})
            .strength(${hardness}f, ${resistance}f)
            .sounds(BlockSoundGroup.STONE)
            .requiresTool()
        );
    }
}
`
  }

  // Item Java Template (Forge/NeoForge)
  if (moduleType === "item" && fileType === "java" && isForgeLike) {
    const maxStackSize = properties.max_stack_size || 64

    return `package ${pkg}.items;

import net.minecraft.world.item.Item;
import net.minecraft.world.item.Rarity;

public class ${class_name} extends Item {
    public ${class_name}() {
        super(new Item.Properties()
            .stacksTo(${maxStackSize})
            .rarity(Rarity.COMMON)
        );
    }
}
`
  }

  // Item Java Template (Fabric)
  if (moduleType === "item" && fileType === "java" && loader === "fabric") {
    const maxStackSize = properties.max_stack_size || 64

    return `package ${pkg}.items;

import net.fabricmc.fabric.api.item.v1.FabricItemSettings;
import net.minecraft.item.Item;
import net.minecraft.util.Rarity;

public class ${class_name} extends Item {
    public ${class_name}() {
        super(new FabricItemSettings()
            .maxCount(${maxStackSize})
            .rarity(Rarity.COMMON)
        );
    }
}
`
  }

  // Tool Java Template (Forge/NeoForge)
  if (moduleType === "tool" && fileType === "java" && isForgeLike) {
    const tier = properties.tier || "IRON"
    const toolType = properties.tool_type || "pickaxe"
    const attackDamage = properties.attack_damage || 1.0
    const attackSpeed = properties.attack_speed || -2.8

    return `package ${pkg}.items;

import net.minecraft.world.item.Item;
import net.minecraft.world.item.Rarity;
import net.minecraft.world.item.Tier;
import net.minecraft.world.item.crafting.Ingredient;
import net.minecraft.world.item.Tiers;
import net.minecraft.world.item.${toolType.charAt(0).toUpperCase() + toolType.slice(1)}Item;

public class ${class_name} extends ${toolType.charAt(0).toUpperCase() + toolType.slice(1)}Item {
    private static final Tier TIER = Tiers.${tier};
    
    public ${class_name}() {
        super(TIER, ${attackDamage}f, ${attackSpeed}f, new Item.Properties()
            .rarity(Rarity.COMMON)
        );
    }
}
`
  }

  // Tool Java Template (Fabric)
  if (moduleType === "tool" && fileType === "java" && loader === "fabric") {
    const tier = properties.tier || "IRON"
    const toolType = properties.tool_type || "pickaxe"
    const attackDamage = properties.attack_damage || 1.0
    const attackSpeed = properties.attack_speed || -2.8
    const classType = `${toolType.charAt(0).toUpperCase() + toolType.slice(1)}Item`
    return `package ${pkg}.items;

import net.minecraft.item.${classType};
import net.minecraft.item.ToolMaterial;
import net.minecraft.item.ToolMaterials;

public class ${class_name} extends ${classType} {
    private static final ToolMaterial TIER = ToolMaterials.${tier};

    public ${class_name}() {
        super(TIER, (int) ${attackDamage}, ${attackSpeed}f, new Settings());
    }
}
`
  }

  // Armor Java Template (Forge/NeoForge)
  if (moduleType === "armor" && fileType === "java" && isForgeLike) {
    const material = properties.material || "IRON"
    const slot = (properties.armor_type || "chestplate").toUpperCase()
    return `package ${pkg}.items;

import net.minecraft.world.item.ArmorItem;
import net.minecraft.world.item.ArmorMaterials;

public class ${class_name} extends ArmorItem {
    public ${class_name}() {
        super(ArmorMaterials.${material}, Type.${slot}, new Properties());
    }
}
`
  }

  // Armor Java Template (Fabric)
  if (moduleType === "armor" && fileType === "java" && loader === "fabric") {
    const material = properties.material || "IRON"
    const slot = (properties.armor_type || "chestplate").toUpperCase()
    return `package ${pkg}.items;

import net.minecraft.item.ArmorItem;
import net.minecraft.item.ArmorMaterials;

public class ${class_name} extends ArmorItem {
    public ${class_name}() {
        super(ArmorMaterials.${material}, Type.${slot}, new Settings());
    }
}
`
  }

  // Food Java Template (Forge/NeoForge)
  if (moduleType === "food" && fileType === "java" && isForgeLike) {
    const nutrition = properties.nutrition || 4
    const saturation = properties.saturation || 0.3
    return `package ${pkg}.items;

import net.minecraft.world.food.FoodProperties;
import net.minecraft.world.item.Item;

public class ${class_name} extends Item {
    public ${class_name}() {
        super(new Item.Properties().food(new FoodProperties.Builder()
            .nutrition(${nutrition})
            .saturationMod(${saturation}f)
            .build()
        ));
    }
}
`
  }

  // Food Java Template (Fabric)
  if (moduleType === "food" && fileType === "java" && loader === "fabric") {
    const nutrition = properties.nutrition || 4
    const saturation = properties.saturation || 0.3
    return `package ${pkg}.items;

import net.minecraft.component.type.FoodComponent;
import net.minecraft.item.Item;

public class ${class_name} extends Item {
    public ${class_name}() {
        super(new Settings().food(new FoodComponent.Builder()
            .nutrition(${nutrition})
            .saturationModifier(${saturation}f)
            .build()
        ));
    }
}
`
  }

  if (moduleType === "entity" && fileType === "java" && isForgeLike) {
    const category = properties.category || "CREATURE"
    const width = properties.width || 0.6
    const height = properties.height || 1.8
    return `package ${pkg}.entities;

import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.entity.ai.goal.FloatGoal;
import net.minecraft.world.entity.ai.goal.WaterAvoidingRandomStrollGoal;
import net.minecraft.world.entity.animal.Animal;
import net.minecraft.world.level.Level;

public class ${class_name} extends Animal {
    public ${class_name}(EntityType<? extends ${class_name}> type, Level level) {
        super(type, level);
    }

    public static AttributeSupplier.Builder createAttributes() {
        return Animal.createLivingAttributes()
            .add(Attributes.MAX_HEALTH, 10.0)
            .add(Attributes.MOVEMENT_SPEED, 0.25)
            .add(Attributes.FOLLOW_RANGE, 16.0);
    }

    @Override
    protected void registerGoals() {
        this.goalSelector.addGoal(0, new FloatGoal(this));
        this.goalSelector.addGoal(1, new WaterAvoidingRandomStrollGoal(this, 1.0));
    }

    @Override
    public net.minecraft.world.entity.AgeableMob getBreedOffspring(
        net.minecraft.server.level.ServerLevel level,
        net.minecraft.world.entity.AgeableMob parent
    ) {
        return null;
    }
}
`
  }

  if (moduleType === "fluid" && fileType === "java" && isForgeLike) {
    return `package ${pkg}.fluids;

import net.minecraft.world.level.material.Fluid;
import net.minecraft.world.level.material.FluidState;
import net.minecraft.world.level.material.Fluids;
import net.minecraft.world.phys.Vec3;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.core.Direction;
import net.minecraftforge.fluids.ForgeFlowingFluid;

public abstract class ${class_name} extends ForgeFlowingFluid {
    protected ${class_name}(Properties properties) {
        super(properties);
    }

    public static class Source extends ${class_name} {
        public Source(Properties properties) {
            super(properties);
        }

        @Override
        public boolean isSource(FluidState state) {
            return true;
        }

        @Override
        public int getAmount(FluidState state) {
            return 8;
        }
    }

    public static class Flowing extends ${class_name} {
        public Flowing(Properties properties) {
            super(properties);
        }

        @Override
        public boolean isSource(FluidState state) {
            return false;
        }

        @Override
        public int getAmount(FluidState state) {
            return state.getValue(LEVEL);
        }
    }
}
`
  }

  if (moduleType === "dimension" && fileType === "java" && isForgeLike) {
    return `package ${pkg}.dimensions;

import net.minecraft.core.BlockPos;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.resources.ResourceKey;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.dimension.DimensionType;
import net.minecraft.world.level.dimension.LevelStem;
import net.minecraft.world.level.levelgen.WorldOptions;
import net.minecraftforge.common.world.ForgeWorldPreset;

public class ${class_name} extends ForgeWorldPreset {
    public ${class_name}() {
        super("dimension");
    }

    @Override
    public LevelStem levelStem(ResourceKey<LevelStem> key, WorldOptions options) {
        return null;
    }
}
`
  }

  if (moduleType === "biome" && fileType === "java" && isForgeLike) {
    const temperature = properties.temperature || 0.5
    const downfall = properties.downfall || 0.5
    return `package ${pkg}.world.biome;

import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.biome.BiomeGenerationSettings;
import net.minecraft.world.level.biome.MobSpawnSettings;
import net.minecraft.world.level.levelgen.GenerationStep;
import net.minecraft.data.worldgen.BiomeDefaultFeatures;

public class ${class_name} {
    public static Biome create() {
        MobSpawnSettings.Builder mobSettings = new MobSpawnSettings.Builder();
        BiomeGenerationSettings.Builder genSettings = new BiomeGenerationSettings.Builder();

        BiomeDefaultFeatures.addPlainGrass(genSettings);
        BiomeDefaultFeatures.addDefaultOres(genSettings);

        return new Biome.BiomeBuilder()
            .precipitation(Biome.Precipitation.RAIN)
            .temperature(${temperature}f)
            .downfall(${downfall}f)
            .specialEffects((new net.minecraft.world.level.biome.BiomeSpecialEffects.Builder())
                .waterColor(0x3F76E4)
                .waterFogColor(0x050533)
                .fogColor(0xC0D8FF)
                .skyColor(0x78A7FF)
                .build())
            .mobSpawnSettings(mobSettings.build())
            .generationSettings(genSettings.build())
            .build();
    }
}
`
  }

  if (moduleType === "screen" && fileType === "java" && isForgeLike) {
    return `package ${pkg}.screens;

import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.gui.screens.inventory.AbstractContainerScreen;
import net.minecraft.network.chat.Component;
import net.minecraft.world.entity.player.Inventory;

public class ${class_name} extends AbstractContainerScreen<${class_name}Menu> {
    public ${class_name}(${class_name}Menu menu, Inventory playerInventory, Component title) {
        super(menu, playerInventory, title);
        this.imageWidth = 176;
        this.imageHeight = 166;
    }

    @Override
    protected void renderBg(GuiGraphics guiGraphics, float partialTick, int mouseX, int mouseY) {
    }

    @Override
    public void render(GuiGraphics guiGraphics, int mouseX, int mouseY, float partialTick) {
        this.renderBackground(guiGraphics);
        super.render(guiGraphics, mouseX, mouseY, partialTick);
        this.renderTooltip(guiGraphics, mouseX, mouseY);
    }
}
`
  }

  if (moduleType === "screen" && fileType === "menu" && isForgeLike) {
    return `package ${pkg}.menus;

import net.minecraft.world.Container;
import net.minecraft.world.SimpleContainer;
import net.minecraft.world.entity.player.Inventory;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.inventory.AbstractContainerMenu;
import net.minecraft.world.inventory.MenuType;
import net.minecraft.world.inventory.Slot;
import net.minecraft.world.item.ItemStack;

public class ${class_name}Menu extends AbstractContainerMenu {
    private final Container container;

    public ${class_name}Menu(int containerId, Inventory playerInventory) {
        this(containerId, playerInventory, new SimpleContainer(9));
    }

    public ${class_name}Menu(int containerId, Inventory playerInventory, Container container) {
        super(null, containerId);
        this.container = container;
        checkContainerSize(container, 9);

        for (int row = 0; row < 3; ++row) {
            for (int col = 0; col < 3; ++col) {
                this.addSlot(new Slot(container, col + row * 3, 62 + col * 18, 17 + row * 18));
            }
        }

        for (int row = 0; row < 3; ++row) {
            for (int col = 0; col < 9; ++col) {
                this.addSlot(new Slot(playerInventory, col + row * 9 + 9, 8 + col * 18, 84 + row * 18));
            }
        }

        for (int col = 0; col < 9; ++col) {
            this.addSlot(new Slot(playerInventory, col, 8 + col * 18, 142));
        }
    }

    @Override
    public ItemStack quickMoveStack(Player player, int index) {
        return ItemStack.EMPTY;
    }

    @Override
    public boolean stillValid(Player player) {
        return this.container.stillValid(player);
    }
}
`
  }

  if (moduleType === "tile_entity" && fileType === "java" && isForgeLike) {
    return `package ${pkg}.tileentities;

import net.minecraft.core.BlockPos;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;

public class ${class_name} extends BlockEntity {
    public ${class_name}(BlockPos pos, BlockState state) {
        super(null, pos, state);
    }

    @Override
    protected void saveAdditional(CompoundTag tag) {
        super.saveAdditional(tag);
    }

    @Override
    public void load(CompoundTag tag) {
        super.load(tag);
    }
}
`
  }

  if (moduleType === "creative_tab" && fileType === "java" && isForgeLike) {
    return `package ${pkg}.creative_tabs;

import net.minecraft.core.registries.Registries;
import net.minecraft.network.chat.Component;
import net.minecraft.world.item.CreativeModeTab;
import net.minecraft.world.item.ItemStack;
import net.minecraftforge.eventbus.api.IEventBus;
import net.minecraftforge.registries.DeferredRegister;
import net.minecraftforge.registries.RegistryObject;
import ${pkg}.items.ModItems;

public class ${class_name} {
    public static final DeferredRegister<CreativeModeTab> TABS = 
        DeferredRegister.create(Registries.CREATIVE_MODE_TAB, "${mod_id}");

    public static final RegistryObject<CreativeModeTab> ${registry_name.toUpperCase()}_TAB = TABS.register(
        "${registry_name}",
        () -> CreativeModeTab.builder()
            .title(Component.translatable("itemGroup.${mod_id}.${registry_name}"))
            .icon(() -> new ItemStack(ModItems.SOME_ITEM.get()))
            .displayItems((parameters, output) -> {
            })
            .build()
    );

    public static void register(IEventBus eventBus) {
        TABS.register(eventBus);
    }
}
`
  }

  if (moduleType === "enchantment" && fileType === "java" && isForgeLike) {
    const maxLevel = properties.max_level || 3
    const rarity = properties.rarity || "UNCOMMON"
    return `package ${pkg}.enchantments;

import net.minecraft.world.entity.EquipmentSlot;
import net.minecraft.world.item.enchantment.Enchantment;
import net.minecraft.world.item.enchantment.EnchantmentCategory;

public class ${class_name} extends Enchantment {
    public ${class_name}() {
        super(Rarity.${rarity}, EnchantmentCategory.BREAKABLE, EquipmentSlot.MAINHAND);
    }

    @Override
    public int getMaxLevel() {
        return ${maxLevel};
    }

    @Override
    public int getMinCost(int level) {
        return 1 + (level - 1) * 10;
    }

    @Override
    public int getMaxCost(int level) {
        return this.getMinCost(level) + 15;
    }
}
`
  }

  if (moduleType === "potion" && fileType === "java" && isForgeLike) {
    const duration = properties.duration || 200
    const amplifier = properties.amplifier || 0
    return `package ${pkg}.potions;

import net.minecraft.world.effect.MobEffect;
import net.minecraft.world.effect.MobEffectCategory;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.entity.ai.attributes.AttributeModifier;

public class ${class_name} extends MobEffect {
    public ${class_name}() {
        super(MobEffectCategory.BENEFICIAL, 0xFF0000);
    }

    public MobEffectInstance createInstance() {
        return new MobEffectInstance(this, ${duration}, ${amplifier});
    }
}
`
  }

  // Blockstate JSON Template
  if (moduleType === "block" && fileType === "blockstate") {
    return `{
  "variants": {
    "": {
      "model": "${mod_id}:block/${registry_name}"
    }
  }
}
`
  }

  // Block Model JSON Template
  if (moduleType === "block" && fileType === "model_block") {
    return `{
  "parent": "minecraft:block/cube_all",
  "textures": {
    "all": "${mod_id}:block/${registry_name}"
  }
}
`
  }

  // Item Model JSON Template (for block items)
  if (moduleType === "block" && fileType === "model_item") {
    return `{
  "parent": "${mod_id}:block/${registry_name}"
}
`
  }

  // Item Model JSON Template
  if (
    (moduleType === "item" || moduleType === "tool" || moduleType === "armor" || moduleType === "food") &&
    fileType === "model"
  ) {
    return `{
  "parent": "minecraft:item/generated",
  "textures": {
    "layer0": "${mod_id}:item/${registry_name}"
  }
}
`
  }

  if (moduleType === "recipe" && fileType === "recipe") {
    const ingredient = properties.ingredient || "minecraft:stone"
    const count = properties.count || 1
    return `{
  "type": "minecraft:crafting_shapeless",
  "ingredients": [
    {
      "item": "${ingredient}"
    }
  ],
  "result": {
    "item": "${mod_id}:${registry_name}",
    "count": ${count}
  }
}
`
  }

  if (moduleType === "loot_table" && fileType === "loot_table") {
    return `{
  "type": "minecraft:block",
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:item",
          "name": "${mod_id}:${registry_name}"
        }
      ]
    }
  ]
}
`
  }

  if (moduleType === "entity" && fileType === "model" && isForgeLike) {
    return `{
  "format_version": "1.20.0",
  "minecraft:geometry": [
    {
      "description": {
        "identifier": "${mod_id}:${registry_name}",
        "texture_width": 64,
        "texture_height": 64,
        "visible_bounds_width": 2,
        "visible_bounds_height": 3,
        "visible_bounds_offset": [0, 0.5, 0]
      },
      "bones": [
        {
          "name": "body",
          "pivot": [0, 0, 0],
          "cubes": [
            {"origin": [-4, 0, -2], "size": [8, 6, 4], "uv": [0, 0]}
          ]
        }
      ]
    }
  ]
}
`
  }

  if (moduleType === "fluid" && fileType === "blockstate" && isForgeLike) {
    return `{
  "variants": {
    "": {
      "model": "${mod_id}:block/${registry_name}"
    }
  }
}
`
  }

  if (moduleType === "fluid" && fileType === "model_block" && isForgeLike) {
    return `{
  "parent": "minecraft:block/water",
  "textures": {
    "particle": "${mod_id}:block/${registry_name}_flow"
  }
}
`
  }

  return null
}

/**
 * Clear template cache
 */
export function clearTemplateCache(): void {
  return
}
