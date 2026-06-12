/* Edha talent icon picker.
 *
 * pickTalentIcon({name, tags, specialty, fallback}) returns a Foundry public/icons path:
 *   1. first KEYWORD_RULES regex (ordered, specific→general) that matches "<name> <tags>"
 *   2. else the SPECIALTY_ICONS default for the talent's specialty/domain
 *   3. else `fallback` (the tree's color/atlas icon)
 *
 * EVERY path here is verified to exist under
 *   C:\Program Files\Foundry Virtual Tabletop\resources\app\public\icons
 * (a 404 icon renders an invisible talent-tree node). Re-run scripts validation after edits.
 */

// Ordered: earlier = more specific/thematic. First match wins.
const KEYWORD_RULES = [
  // restorative / vital
  [/heal|mend|restor|regrow|recover|resurg|reknit|\bknit\b|vital surge|\bsurge\b/, "icons/magic/life/cross-flared-green.webp"],
  // defense
  [/shield|guard|bulwark|barrier|\bwall\b|interpos|aegis|bastion|\bward\b|defend|protect|shelter|unbreakable/, "icons/magic/defensive/shield-barrier-blue.webp"],
  // detonation / kinetic burst (before generic fire)
  [/detonat|explod|explos|\bblast\b|\bcharge\b|\bburst\b|shockwave|shock slam|concuss|cascad|fault|sunder|breaking point/, "icons/magic/fire/explosion-embers-orange.webp"],
  // fire / pyromancy
  [/\bfire\b|flame|\bburn|sear|kindle|ember|\bpyre\b|ignite|blaze|scorch|flashpoint|afterburn|conflagrat/, "icons/magic/fire/beam-jet-stream-trails-orange.webp"],
  // lightning
  [/lightning|\barc\b|\bshock\b|spark|thunder|\bvolt/, "icons/magic/lightning/bolt-forked-large-blue-yellow.webp"],
  // poison
  [/poison|venom|toxic|\bspit\b/, "icons/magic/nature/plant-poison-spit-green.webp"],
  // plant control / terrain
  [/thorn|vine|root|bramble|entangl|grasping|\bgarden\b|spreading|territor|\bgrowth\b|\bgrasp/, "icons/magic/nature/root-vine-thorns-poison-green.webp"],
  // generic nature / primal
  [/\bleaf\b|nature|forest|\bwild\b|primal|verdant|\bbloom\b/, "icons/magic/nature/leaf-glow-triple-green.webp"],
  // necromancy / corpse
  [/\bbone\b|skull|corpse|\bdead\b|undead|\braise\b|risen|reaper|\bgrave\b|necro|harvest|remain|fallen/, "icons/magic/death/grave-tombstone-glow-tan.webp"],
  // curse / drain / wither
  [/curse|\bhex\b|wither|blight|\bsap\b|decay|\bdrain\b|siphon|necrotic|\brot\b|hollow/, "icons/magic/death/hand-withered-gray.webp"],
  // fear / intimidation
  [/dread|\bfear\b|terror|intimidat|unnerv|menace|frighten/, "icons/magic/control/fear-fright-mask-orange.webp"],
  // mind control / domination
  [/\bmind\b|thought|psychic|telepath|mental|dominat|command|puppet|coerc|subjug|compel|whisper|suggest|extract|\bwill\b|baleful/, "icons/magic/control/hypnosis-mesmerism-swirl.webp"],
  // illusion
  [/illusion|phantom|ghost|mirror|\bimage\b|holograph|double|mirage|specter|ghostly|\bfalse\b/, "icons/magic/control/silhouette-aura-energy.webp"],
  // binding / traps
  [/\bchain|shackle|restrain|\bsnare\b|\btrap\b|\bnet\b|immobiliz|sever|\bbind\b/, "icons/magic/control/debuff-chains-purple.webp"],
  // scrying
  [/\bscry|crystal ball|clairvoy|\borb\b/, "icons/magic/perception/orb-crystal-ball-scrying-blue.webp"],
  // perception / foresight
  [/\beye\b|sight|foresee|forewarn|forewarned|vision|\bwatch\b|\bscout\b|predict|augur|insight|percei|\bsense\b|anticipat|reactive|probable|read intent|pattern|calculat/, "icons/magic/perception/eye-ringed-green.webp"],
  // fate / threads
  [/thread|\bfate\b|destiny|\bweave\b|inevitab|ordain|foreknown|prophe/, "icons/magic/time/hourglass-tilted-glowing-gold.webp"],
  // time / patience
  [/\btime\b|\bclock\b|\bhour\b|patien|\bdelay\b/, "icons/magic/time/clock-stopwatch-white-blue.webp"],
  // sovereignty / rulership
  [/\bcrown\b|\bking\b|sovereign|throne|\brule\b|reign|\broyal\b|mantle|warlord|overwhelming authority|voice of authority/, "icons/equipment/head/crown-gold-red.webp"],
  // law / order / balance
  [/\bscale|balance|\blaw\b|\border\b|\bjudge\b|edict|justice|\bdecree\b|verdict|covenant clause/, "icons/tools/hand/scale-balances-merchant-brown.webp"],
  // oaths / pacts
  [/\boath\b|\bpact\b|covenant|\bvow\b|accord|\bterms\b|\bbond\b|sworn|\bword\b/, "icons/sundries/scrolls/scroll-bound-blue-tan.webp"],
  // banners / coordination
  [/banner|standard|signal|rally|beacon|guiding|advance|formation|concord|\bunity\b|pillar/, "icons/sundries/flags/banner-blue.webp"],
  // ranged / archery
  [/\barrow\b|\bbow\b|\bshot\b|volley|archer|ranged|\bquarry\b|tagging|\bseek\b/, "icons/weapons/ammunition/arrow-broadhead-glowing-orange.webp"],
  // daggers / assassination
  [/dagger|\bknife\b|\bstab\b|assassin|backstab|\bcruel\b/, "icons/weapons/daggers/dagger-black.webp"],
  // fists / momentum
  [/\bfist\b|\bpunch\b|\bslam\b|\bsmash\b|unstoppable|momentum|reckless|\badvance\b|volatile|\bdrive\b|leap/, "icons/skills/melee/unarmed-punch-fist-yellow-red.webp"],
  // beasts / pack / hunt
  [/\bfang\b|\bclaw\b|beast|\bpack\b|\bhunt\b|\bprey\b|predator|scent|instinct|feral|apex|packmate/, "icons/creatures/abilities/fangs-teeth-bite.webp"],
  // tracking / companion
  [/\bpaw\b|\btrack\b|companion|\btrail\b/, "icons/creatures/abilities/paw-print-tan.webp"],
  // construction
  [/construct|\bforge\b|\bbuild\b|anvil|golem|automaton|foundation|\bwall\b/, "icons/tools/smithing/anvil.webp"],
  // machinery / fabrials
  [/\bgear\b|machine|fabrial|device|mechan|clockwork|\bcog\b|artific/, "icons/commodities/tech/cog-gold.webp"],
  // knowledge / study
  [/\bbook\b|\blore\b|\bstudy\b|knowledge|\btome\b|research|erudit|scholar|deduc/, "icons/sundries/books/book-embossed-blue.webp"],
  // movement / speed
  [/\bboot\b|\bdash\b|\bstep\b|swift|agile|\bdodge\b|tempo|escape|phantom step/, "icons/equipment/feet/boots-armored-green.webp"],
  // focus / discipline
  [/focus|\bcalm\b|compose|composed|disciplin|steady|collected|\bresolve\b/, "icons/magic/holy/meditation-chi-focus-blue.webp"],
  // holy / faith
  [/\bholy\b|\bfaith\b|divine|sacred|\bangel\b|bless|prayer|devot|conduit/, "icons/magic/holy/prayer-hands-glowing-yellow.webp"],
  // blood / sacrifice
  [/\bblood\b|sanguine|sacrific|\bvein\b/, "icons/magic/death/blood-corruption-vomit-red.webp"],
  // rage / strength / frenzy
  [/\brage\b|frenzy|\bfury\b|\bfever\b|overload|incite|berserk|battle|\bmight\b|emotional/, "icons/magic/control/buff-strength-muscle-damage-red.webp"],
  // chaos / entropy / swirl
  [/chaos|entropy|unmak|\brandom\b|vortex|\bswirl\b|fracture|complication|\bomen\b/, "icons/magic/air/air-burst-spiral-large-blue.webp"],
  // grasping hand / reach
  [/\bhand\b|\btouch\b|\breach\b|\bpull\b/, "icons/magic/unholy/hand-grasping-green.webp"],
  // generic blade / strike
  [/\bsword\b|\bblade\b|\bslash\b|\bedge\b|\bduel\b|cleave|swordplay|\bstrike\b|\bcut\b/, "icons/weapons/swords/greatsword-crossguard-blue.webp"],
];

// Fallback by specialty / deity-domain (lowercased). Covers every leyline, deity, and heroic specialty.
const SPECIALTY_ICONS = {
  // leyline
  coordination: "icons/sundries/flags/banner-blue.webp",
  bulwark: "icons/magic/defensive/shield-barrier-blue.webp",
  accord: "icons/sundries/scrolls/scroll-bound-blue-tan.webp",
  foresight: "icons/magic/perception/eye-ringed-green.webp",
  calculation: "icons/magic/time/clock-stopwatch-white-blue.webp",
  illusion: "icons/magic/control/silhouette-aura-energy.webp",
  isolation: "icons/magic/death/hand-withered-gray.webp",
  ritual: "icons/magic/death/blood-corruption-vomit-red.webp",
  subjugation: "icons/magic/control/hypnosis-mesmerism-swirl.webp",
  momentum: "icons/skills/melee/unarmed-punch-fist-yellow-red.webp",
  conflagration: "icons/magic/fire/explosion-embers-orange.webp",
  frenzy: "icons/magic/control/buff-strength-muscle-damage-red.webp",
  territory: "icons/magic/nature/root-vine-thorns-poison-green.webp",
  restoration: "icons/magic/life/cross-flared-green.webp",
  instinct: "icons/creatures/abilities/fangs-teeth-bite.webp",
  // deity (domain == specialty)
  life: "icons/magic/life/cross-area-circle-green-white.webp",
  knowledge: "icons/sundries/books/book-embossed-blue.webp",
  civilization: "icons/tools/smithing/anvil.webp",
  chaos: "icons/magic/air/air-burst-spiral-large-blue.webp",
  death: "icons/magic/death/grave-tombstone-glow-tan.webp",
  fate: "icons/magic/time/hourglass-tilted-glowing-gold.webp",
  power: "icons/equipment/head/crown-gold-red.webp",
  destruction: "icons/magic/fire/explosion-embers-orange.webp",
  order: "icons/tools/hand/scale-balances-merchant-brown.webp",
  sovereignty: "icons/equipment/head/crown-gold-blue.webp",
  // heroic
  investigator: "icons/magic/perception/eye-ringed-green.webp",
  spy: "icons/magic/control/fear-fright-mask-orange.webp",
  thief: "icons/weapons/daggers/dagger-black.webp",
  diplomat: "icons/sundries/scrolls/scroll-bound-blue-tan.webp",
  faithful: "icons/magic/holy/prayer-hands-glowing-yellow.webp",
  mentor: "icons/sundries/books/book-embossed-blue.webp",
  archer: "icons/weapons/ammunition/arrow-broadhead-glowing-orange.webp",
  assassin: "icons/weapons/daggers/dagger-bone-black.webp",
  tracker: "icons/creatures/abilities/paw-print-tan.webp",
  champion: "icons/sundries/flags/banner-blue.webp",
  officer: "icons/sundries/flags/banner-flag-red-white.webp",
  politico: "icons/sundries/scrolls/scroll-bound-blue-red.webp",
  artifabrian: "icons/commodities/tech/cog-gold.webp",
  strategist: "icons/magic/time/clock-stopwatch-white-blue.webp",
  surgeon: "icons/magic/life/cross-flared-green.webp",
  duelist: "icons/weapons/swords/greatsword-crossguard-blue.webp",
  shardbearer: "icons/weapons/swords/greatsword-blue.webp",
  soldier: "icons/magic/defensive/shield-barrier-blue.webp",
};

function pickTalentIcon({ name, specialty, fallback }) {
  // Match on the talent NAME only — tags are mechanical tokens (e.g. "investiture_recovery",
  // "spirit_damage", "sense") that cause false thematic matches.
  const hay = `${name || ""}`.toLowerCase();
  for (const [re, ic] of KEYWORD_RULES) if (re.test(hay)) return ic;
  const sp = (specialty || "").toLowerCase();
  if (SPECIALTY_ICONS[sp]) return SPECIALTY_ICONS[sp];
  return fallback;
}

module.exports = { pickTalentIcon, KEYWORD_RULES, SPECIALTY_ICONS };
