import type { KitchenSourceTemplate } from "../types/content";

/**
 * Fixed roster of clickable kitchen hotspots, positioned over the real illustrated background
 * (public/kitchen/kitchen-background.jpeg). The kitchen scene's layout never changes run to
 * run -- what varies is which sources are active and what they roll on reveal (src/systems/kitchen.ts).
 * Hotspot coordinates are percentages of the image's width/height.
 */
export const KITCHEN_SOURCES: KitchenSourceTemplate[] = [
  {
    id: "toaster",
    name: "Bookshelf",
    hotspot: { x: 8.75, y: 0, width: 20.25, height: 8 },
    revealCount: { min: 2, max: 3 },
    revealPool: [
      { templateId: "rubber_band", weight: 5 },
      { templateId: "battery_pack", weight: 4 },
      { templateId: "toaster_cord", weight: 4 },
      { templateId: "popsicle_stick_fin", weight: 3 },
      { templateId: "crumpled_napkin", weight: 6 },
    ],
  },
  {
    id: "refrigerator",
    name: "Refrigerator",
    hotspot: { x: 77.5, y: 0, width: 22.5, height: 78 },
    revealCount: { min: 3, max: 4 },
    revealPool: [
      { templateId: "aluminum_foil_sheet", weight: 5 },
      { templateId: "baking_sheet", weight: 3 },
      { templateId: "vent_cover_slat", weight: 4 },
      { templateId: "zip_tie_pack", weight: 5 },
      { templateId: "soggy_sponge", weight: 6 },
      { templateId: "yogurt_cup", weight: 6 },
    ],
  },
  {
    id: "junk_drawer",
    name: "Kitchen Island",
    hotspot: { x: 35, y: 41.2, width: 21.5, height: 36.7 },
    revealCount: { min: 3, max: 5 },
    revealPool: [
      { templateId: "rubber_band", weight: 5 },
      { templateId: "zip_tie_pack", weight: 5 },
      { templateId: "paper_clip_chain", weight: 6 },
      { templateId: "duct_tape_roll", weight: 4 },
      { templateId: "crumpled_napkin", weight: 6 },
      { templateId: "sticker_sheet", weight: 4 },
    ],
  },
  {
    id: "blender",
    name: "Stove",
    hotspot: { x: 23, y: 35, width: 12, height: 39.4 },
    revealCount: { min: 2, max: 3 },
    revealPool: [
      { templateId: "pizza_box_flap", weight: 4 },
      { templateId: "battery_pack", weight: 4 },
      { templateId: "hot_glue_stick", weight: 5 },
      { templateId: "fan_blade", weight: 4 },
      { templateId: "ceramic_mug", weight: 6 },
    ],
  },
  {
    id: "kitchen_drawer",
    name: "Junk Drawer",
    hotspot: { x: 0, y: 15, width: 8, height: 10 },
    revealCount: { min: 2, max: 4 },
    revealPool: [
      { templateId: "rubber_band", weight: 5 },
      { templateId: "zip_tie_pack", weight: 5 },
      { templateId: "paper_clip_chain", weight: 6 },
      { templateId: "duct_tape_roll", weight: 4 },
      { templateId: "crumpled_napkin", weight: 6 },
      { templateId: "sticker_sheet", weight: 4 },
    ],
  },
  {
    id: "broom_closet",
    name: "Floor Cabinet",
    hotspot: { x: 0, y: 25.1, width: 8, height: 47 },
    revealCount: { min: 2, max: 4 },
    revealPool: [
      { templateId: "broom_handle", weight: 5 },
      { templateId: "wire_hanger", weight: 5 },
      { templateId: "shoelace", weight: 4 },
      { templateId: "popsicle_stick_fin", weight: 3 },
      { templateId: "soggy_sponge", weight: 6 },
    ],
  },
  {
    id: "toolbox",
    name: "Upper Cabinet",
    hotspot: { x: 47, y: 0, width: 14, height: 28.7 },
    revealCount: { min: 3, max: 4 },
    revealPool: [
      { templateId: "velcro_strip", weight: 5 },
      { templateId: "zip_tie_pack", weight: 5 },
      { templateId: "hot_glue_stick", weight: 5 },
      { templateId: "fishing_weight", weight: 4 },
      { templateId: "paint_stir_stick", weight: 4 },
    ],
  },
  {
    id: "pantry_shelf",
    name: "Spice Shelf",
    hotspot: { x: 8.75, y: 9, width: 20.25, height: 17.9 },
    revealCount: { min: 2, max: 4 },
    revealPool: [
      { templateId: "cardboard_scrap", weight: 5 },
      { templateId: "plastic_wrap_roll", weight: 5 },
      { templateId: "baking_soda", weight: 4 },
      { templateId: "mustard_bottle", weight: 3 },
      { templateId: "diet_soda", weight: 4 },
      { templateId: "fruity_gel_candy_mints", weight: 3 },
      { templateId: "sticker_sheet", weight: 4 },
      { templateId: "lucky_charm_bead", weight: 2 },
    ],
  },
  {
    id: "under_sink",
    name: "Countertop",
    hotspot: { x: 61.5, y: 20.6, width: 16.5, height: 20.6 },
    revealCount: { min: 2, max: 3 },
    revealPool: [
      { templateId: "rubber_strap_band", weight: 5 },
      { templateId: "backpack_strap", weight: 4 },
      { templateId: "bungee_cord", weight: 4 },
      { templateId: "soggy_sponge", weight: 6 },
      { templateId: "glitter_glue_tube", weight: 4 },
    ],
  },
  {
    id: "trash_bin",
    name: "Recycling Nook",
    hotspot: { x: 56.5, y: 41.2, width: 21.5, height: 36.7 },
    revealCount: { min: 2, max: 4 },
    revealPool: [
      { templateId: "iron_skillet", weight: 8 },
      { templateId: "soggy_sponge", weight: 7 },
      { templateId: "crumpled_napkin", weight: 7 },
      { templateId: "ceramic_mug", weight: 6 },
      { templateId: "yogurt_cup", weight: 6 },
      { templateId: "umbrella_rib", weight: 2 },
      { templateId: "racing_stripe_tape", weight: 1 },
    ],
  },
];
