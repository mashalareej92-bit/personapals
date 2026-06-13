/**
 * Central Milo image registry.
 *
 * You currently only have ONE asset: milo_base.png — so every key below points
 * to it for now. As you generate the real artwork, just change the require()
 * on the matching line (e.g. swap milo_base.png -> Routine/milo_brush.png).
 * Nothing else in the app needs to change.
 *
 * NOTE: Metro requires STATIC string literals inside require(), so each key must
 * keep its own literal require() — you cannot build the path dynamically.
 */

// The one image you have right now.
const BASE = require('../../assets/images/milo/milo_base.png');

export const MILO = {
  // ── Meta / state poses ──────────────────────────────────────────
  base: BASE,            // Default / Home — neutral explorer pose
  celebrate: BASE,       // Quest completion (milo_celebrate.png)
  encourage: BASE,       // Mid-task support (milo_encourage.png)
  thinking: BASE,        // API / loading state (milo_thinking.png)
  sleepy: BASE,          // Parent PIN / lock screen (milo_sleepy.png)

  // ── Routine ─────────────────────────────────────────────────────
  morning_launchpad: BASE,   // milo_morning.png
  dental_sparkle: BASE,      // milo_brush.png
  backpack_pack: BASE,       // milo_backpack.png
  lunchbox_ready: BASE,      // milo_lunchbox.png
  shoes_on: BASE,            // milo_shoes.png
  bedtime_winddown: BASE,    // milo_bedtime.png
  wash_hands: BASE,          // milo_wash.png
  take_shower: BASE,         // milo_shower.png

  // ── Chores ──────────────────────────────────────────────────────
  clean_room: BASE,          // milo_cleanroom.png
  do_laundry: BASE,          // milo_laundry.png
  fold_clothes: BASE,        // milo_fold.png
  plant_care: BASE,          // milo_garden.png
  empty_trash: BASE,         // milo_trash.png

  // ── Kitchen ─────────────────────────────────────────────────────
  basic_cooking: BASE,       // milo_chef.png
  set_table: BASE,           // milo_table.png
  wipe_counters: BASE,       // milo_wipe.png
  wash_dishes: BASE,         // milo_dishes.png

  // ── Social ──────────────────────────────────────────────────────
  buy_something: BASE,       // milo_shop.png
  phone_call: BASE,          // milo_phone.png
  ask_directions: BASE,      // milo_info.png

  // ── Calm ────────────────────────────────────────────────────────
  cool_down: BASE,           // milo_meditate.png
  screen_timer: BASE,        // milo_disconnect.png

  // ── Safety ──────────────────────────────────────────────────────
  safety_trusted_adults: BASE, // milo_safety_adult.png
  safety_boundaries: BASE,     // milo_safety_zone.png
  safety_digital: BASE,        // milo_digital_safe.png

  // ── Independence ────────────────────────────────────────────────
  independence_shopping: BASE, // milo_market_pro.png
  independence_money: BASE,    // milo_banker.png
  independence_ordering: BASE, // milo_order_hero.png
} as const;

export type MiloKey = keyof typeof MILO;

/** Safe lookup: returns the matching pose, or the base image if the key is unknown. */
export function getMilo(key?: string) {
  if (key && key in MILO) {
    return MILO[key as MiloKey];
  }
  return MILO.base;
}
