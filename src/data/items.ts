import { ENGINE_STATS, FRAME_STATS, SKIN_STATS } from "./archetypes";
import type { ItemTemplate } from "../types/content";

const ZERO_STATS = { thrust: 0, weight: 0, drag: 0, durability: 0 };

export const ITEM_POOL: ItemTemplate[] = [
  // Frame candidates
  { id: "broom_handle", name: "Broom Handle", slotType: "frame", archetype: "glider", footprint: { width: 1, height: 4 }, baseStats: FRAME_STATS.glider, spawnWeight: 6 },
  { id: "wire_hanger", name: "Wire Coat Hanger", slotType: "frame", archetype: "flapper", footprint: { width: 1, height: 3 }, baseStats: FRAME_STATS.flapper, spawnWeight: 6 },
  { id: "paint_stir_stick", name: "Paint Stir Stick", slotType: "frame", archetype: "rocketRig", footprint: { width: 1, height: 3 }, baseStats: FRAME_STATS.rocketRig, spawnWeight: 5 },
  { id: "pizza_box_flap", name: "Pizza Box Flap", slotType: "frame", archetype: "rotorChute", footprint: { width: 2, height: 2 }, baseStats: FRAME_STATS.rotorChute, spawnWeight: 5 },
  { id: "umbrella_rib", name: "Umbrella Rib", slotType: "frame", archetype: "rotorChute", footprint: { width: 1, height: 2 }, baseStats: FRAME_STATS.rotorChute, spawnWeight: 5 },

  // Skin candidates
  { id: "cardboard_scrap", name: "Cardboard Scrap", slotType: "skin", archetype: "cardboard", footprint: { width: 2, height: 2 }, baseStats: SKIN_STATS.cardboard, spawnWeight: 7 },
  { id: "plastic_wrap_roll", name: "Plastic Wrap Roll", slotType: "skin", archetype: "plasticWrap", footprint: { width: 1, height: 2 }, baseStats: SKIN_STATS.plasticWrap, spawnWeight: 6 },
  { id: "aluminum_foil_sheet", name: "Aluminum Foil Sheet", slotType: "skin", archetype: "aluminumFoil", footprint: { width: 2, height: 2 }, baseStats: SKIN_STATS.aluminumFoil, spawnWeight: 5 },
  { id: "baking_sheet", name: "Baking Sheet", slotType: "skin", archetype: "bakingSheetMetal", footprint: { width: 3, height: 1 }, baseStats: SKIN_STATS.bakingSheetMetal, spawnWeight: 3 },
  { id: "duct_tape_roll", name: "Duct Tape Roll", slotType: "skin", archetype: "plasticWrap", footprint: { width: 1, height: 1 }, baseStats: SKIN_STATS.plasticWrap, spawnWeight: 5 },

  // Engine candidates
  { id: "rubber_band", name: "Rubber Band", slotType: "engine", archetype: "rubberBandSling", footprint: { width: 1, height: 1 }, baseStats: ENGINE_STATS.rubberBandSling, spawnWeight: 7 },
  { id: "soda_bottle", name: "Baking Soda & Mustard Bottle", slotType: "engine", archetype: "bakingSodaJet", footprint: { width: 1, height: 2 }, baseStats: ENGINE_STATS.bakingSodaJet, spawnWeight: 5 },
  { id: "mentos_diet_soda", name: "Diet Soda & Mentos", slotType: "engine", archetype: "mentosCore", footprint: { width: 1, height: 2 }, baseStats: ENGINE_STATS.mentosCore, spawnWeight: 3 },
  { id: "battery_pack", name: "Battery Pack", slotType: "engine", archetype: "hairdryer", footprint: { width: 1, height: 2 }, baseStats: ENGINE_STATS.hairdryer, spawnWeight: 4 },
  { id: "squeaky_toy", name: "Squeaky Toy", slotType: "engine", archetype: "rubberBandSling", footprint: { width: 1, height: 1 }, baseStats: ENGINE_STATS.rubberBandSling, spawnWeight: 5 },

  // Junk (red herrings)
  { id: "iron_skillet", name: "Iron Skillet", slotType: "junk", footprint: { width: 3, height: 3 }, baseStats: ZERO_STATS, spawnWeight: 8 },
  { id: "soggy_sponge", name: "Soggy Sponge", slotType: "junk", footprint: { width: 2, height: 2 }, baseStats: ZERO_STATS, spawnWeight: 8 },
  { id: "crumpled_napkin", name: "Crumpled Napkin", slotType: "junk", footprint: { width: 1, height: 1 }, baseStats: ZERO_STATS, spawnWeight: 6 },
  { id: "ceramic_mug", name: "Ceramic Mug", slotType: "junk", footprint: { width: 2, height: 2 }, baseStats: ZERO_STATS, spawnWeight: 7 },
  { id: "yogurt_cup", name: "Empty Yogurt Cup", slotType: "junk", footprint: { width: 1, height: 1 }, baseStats: ZERO_STATS, spawnWeight: 6 },
];
