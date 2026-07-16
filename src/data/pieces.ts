import {
  AERO_HELPER_STATS,
  ATTACHMENT_STATS,
  DECORATION_STATS,
  HARNESS_STATS,
  POWER_SOURCE_STATS,
  WING_FLAPPER_STATS,
  WING_MEMBRANE_STATS,
} from "./archetypes";
import type { PieceTemplate } from "../types/content";

const ZERO_STATS = { thrust: 0, weight: 0, drag: 0, durability: 0 };

export const PIECE_POOL: PieceTemplate[] = [
  // Wing Membrane
  { id: "cardboard_scrap", name: "Cardboard Scrap", categories: ["wingMembrane"], archetype: "cardboard", footprint: { width: 2, height: 2 }, baseStats: WING_MEMBRANE_STATS.cardboard, spawnWeight: 7 },
  { id: "plastic_wrap_roll", name: "Plastic Wrap Roll", categories: ["wingMembrane"], archetype: "plasticWrap", footprint: { width: 1, height: 2 }, baseStats: WING_MEMBRANE_STATS.plasticWrap, spawnWeight: 6 },
  { id: "aluminum_foil_sheet", name: "Aluminum Foil Sheet", categories: ["wingMembrane"], archetype: "aluminumFoil", footprint: { width: 2, height: 2 }, baseStats: WING_MEMBRANE_STATS.aluminumFoil, spawnWeight: 5 },
  { id: "baking_sheet", name: "Baking Sheet", categories: ["wingMembrane"], archetype: "bakingSheetMetal", footprint: { width: 3, height: 1 }, baseStats: WING_MEMBRANE_STATS.bakingSheetMetal, spawnWeight: 3 },

  // Power Source
  { id: "rubber_band", name: "Rubber Band", categories: ["powerSource"], archetype: "rubberBandSling", footprint: { width: 1, height: 1 }, baseStats: POWER_SOURCE_STATS.rubberBandSling, spawnWeight: 7 },
  { id: "baking_soda", name: "Baking Soda", categories: ["powerSource"], archetype: "bakingSodaJet", footprint: { width: 1, height: 1 }, baseStats: POWER_SOURCE_STATS.bakingSodaJet, spawnWeight: 5 },
  { id: "mustard_bottle", name: "Mustard Bottle", categories: ["powerSource"], archetype: "bakingSodaJet", footprint: { width: 1, height: 1 }, baseStats: POWER_SOURCE_STATS.bakingSodaJet, spawnWeight: 4 },
  { id: "diet_soda", name: "Diet Soda", categories: ["powerSource"], archetype: "mentosCore", footprint: { width: 1, height: 2 }, baseStats: POWER_SOURCE_STATS.mentosCore, spawnWeight: 4 },
  { id: "fruity_gel_candy_mints", name: "Fruity Gel Candy Mints", categories: ["powerSource"], archetype: "mentosCore", footprint: { width: 1, height: 1 }, baseStats: POWER_SOURCE_STATS.mentosCore, spawnWeight: 3 },
  { id: "battery_pack", name: "Battery Pack", categories: ["powerSource"], archetype: "hairdryer", footprint: { width: 1, height: 2 }, baseStats: POWER_SOURCE_STATS.hairdryer, spawnWeight: 4 },
  { id: "spray_can", name: "Spray Can", categories: ["powerSource"], archetype: "bakingSodaJet", footprint: { width: 1, height: 1 }, baseStats: POWER_SOURCE_STATS.bakingSodaJet, spawnWeight: 4 },

  // Wing Flapper
  { id: "broom_handle", name: "Broom Handle", categories: ["wingFlapper"], archetype: "glider", footprint: { width: 1, height: 4 }, baseStats: WING_FLAPPER_STATS.glider, spawnWeight: 6 },
  { id: "wire_hanger", name: "Wire Coat Hanger", categories: ["wingFlapper"], archetype: "flapper", footprint: { width: 1, height: 3 }, baseStats: WING_FLAPPER_STATS.flapper, spawnWeight: 6 },
  { id: "paint_stir_stick", name: "Paint Stir Stick", categories: ["wingFlapper"], archetype: "rocketRig", footprint: { width: 1, height: 3 }, baseStats: WING_FLAPPER_STATS.rocketRig, spawnWeight: 5 },
  { id: "pizza_box_flap", name: "Pizza Box Flap", categories: ["wingFlapper"], archetype: "rotorChute", footprint: { width: 2, height: 2 }, baseStats: WING_FLAPPER_STATS.rotorChute, spawnWeight: 5 },

  // Aerodynamic Helper
  { id: "fan_blade", name: "Oscillating Fan Blade", categories: ["aeroHelper"], archetype: "finStabilizer", footprint: { width: 2, height: 1 }, baseStats: AERO_HELPER_STATS.finStabilizer, spawnWeight: 5 },
  { id: "vent_cover_slat", name: "Vent Cover Slat", categories: ["aeroHelper"], archetype: "ventedSpoiler", footprint: { width: 2, height: 1 }, baseStats: AERO_HELPER_STATS.ventedSpoiler, spawnWeight: 5 },
  { id: "fishing_weight", name: "Fishing Weight", categories: ["aeroHelper"], archetype: "noseWeight", footprint: { width: 1, height: 1 }, baseStats: AERO_HELPER_STATS.noseWeight, spawnWeight: 4 },
  { id: "popsicle_stick_fin", name: "Popsicle Stick Fin", categories: ["aeroHelper"], archetype: "tailRudder", footprint: { width: 1, height: 1 }, baseStats: AERO_HELPER_STATS.tailRudder, spawnWeight: 6 },

  // Attachment
  { id: "zip_tie_pack", name: "Zip Tie Pack", categories: ["attachment"], archetype: "zipTie", footprint: { width: 1, height: 1 }, baseStats: ATTACHMENT_STATS.zipTie, spawnWeight: 7 },
  { id: "hot_glue_stick", name: "Hot Glue Stick", categories: ["attachment"], archetype: "hotGlueDab", footprint: { width: 1, height: 1 }, baseStats: ATTACHMENT_STATS.hotGlueDab, spawnWeight: 6 },
  { id: "velcro_strip", name: "Velcro Strip", categories: ["attachment"], archetype: "velcroStrap", footprint: { width: 1, height: 2 }, baseStats: ATTACHMENT_STATS.velcroStrap, spawnWeight: 5 },
  { id: "paper_clip_chain", name: "Paper Clip Chain", categories: ["attachment"], archetype: "paperClip", footprint: { width: 1, height: 1 }, baseStats: ATTACHMENT_STATS.paperClip, spawnWeight: 6 },

  // Harness
  { id: "shoelace", name: "Spare Shoelace", categories: ["harness"], archetype: "shoelaceLoop", footprint: { width: 1, height: 2 }, baseStats: HARNESS_STATS.shoelaceLoop, spawnWeight: 6 },
  { id: "rubber_strap_band", name: "Rubber Strap Band", categories: ["harness"], archetype: "rubberStrap", footprint: { width: 1, height: 1 }, baseStats: HARNESS_STATS.rubberStrap, spawnWeight: 5 },
  { id: "backpack_strap", name: "Backpack Strap", categories: ["harness"], archetype: "cordSling", footprint: { width: 1, height: 2 }, baseStats: HARNESS_STATS.cordSling, spawnWeight: 4 },
  { id: "bungee_cord", name: "Bungee Cord", categories: ["harness"], archetype: "bungeeHook", footprint: { width: 1, height: 2 }, baseStats: HARNESS_STATS.bungeeHook, spawnWeight: 4 },

  // Decoration (optional/bonus -- see Doc's Workbench)
  { id: "sticker_sheet", name: "Sticker Sheet", categories: ["decoration"], archetype: "stickerSheet", footprint: { width: 1, height: 1 }, baseStats: DECORATION_STATS.stickerSheet, spawnWeight: 6 },
  { id: "glitter_glue_tube", name: "Glitter Glue Tube", categories: ["decoration"], archetype: "glitterGlue", footprint: { width: 1, height: 1 }, baseStats: DECORATION_STATS.glitterGlue, spawnWeight: 5 },
  { id: "racing_stripe_tape", name: "Racing Stripe Tape", categories: ["decoration"], archetype: "racingStripe", footprint: { width: 1, height: 2 }, baseStats: DECORATION_STATS.racingStripe, spawnWeight: 2, flyBetter: true },
  { id: "lucky_charm_bead", name: "Lucky Charm Bead", categories: ["decoration"], archetype: "luckyCharmBead", footprint: { width: 1, height: 1 }, baseStats: DECORATION_STATS.luckyCharmBead, spawnWeight: 2, flyBetter: true },

  // Dual-purpose pieces -- ambiguous until Doc's Workbench
  { id: "toaster_cord", name: "Toaster Cord", categories: ["attachment", "harness"], archetype: "zipTie", footprint: { width: 1, height: 2 }, baseStats: { thrust: 0, weight: 1, drag: 0, durability: 2 }, spawnWeight: 4 },
  { id: "umbrella_rib", name: "Umbrella Rib", categories: ["wingFlapper", "aeroHelper"], archetype: "rotorChute", footprint: { width: 1, height: 2 }, baseStats: { thrust: 0, weight: 3, drag: 4, durability: 2 }, spawnWeight: 4 },
  { id: "duct_tape_roll", name: "Duct Tape Roll", categories: ["wingMembrane", "attachment"], archetype: "plasticWrap", footprint: { width: 1, height: 1 }, baseStats: { thrust: 0, weight: 1, drag: 1, durability: 2 }, spawnWeight: 4 },

  // Scrap (pure junk -- take up grid space, contribute nothing)
  { id: "iron_skillet", name: "Iron Skillet", categories: [], footprint: { width: 3, height: 3 }, baseStats: ZERO_STATS, spawnWeight: 8 },
  { id: "soggy_sponge", name: "Soggy Sponge", categories: [], footprint: { width: 2, height: 2 }, baseStats: ZERO_STATS, spawnWeight: 8 },
  { id: "crumpled_napkin", name: "Crumpled Napkin", categories: [], footprint: { width: 1, height: 1 }, baseStats: ZERO_STATS, spawnWeight: 6 },
  { id: "ceramic_mug", name: "Ceramic Mug", categories: [], footprint: { width: 2, height: 2 }, baseStats: ZERO_STATS, spawnWeight: 7 },
  { id: "yogurt_cup", name: "Empty Yogurt Cup", categories: [], footprint: { width: 1, height: 1 }, baseStats: ZERO_STATS, spawnWeight: 6 },
];
