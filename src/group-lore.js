/* Lore + gameplay descriptions for each group (color / path / order / deity).
   Used on the Atlas view so each group gets a single rich card that jumps
   directly into its first tree. */

window.GroupLore = {
  // --- Leyline (five colors of the ley) ---
  leyline: {
    White: {
      lore: 'Order, light, and healing. White attunes the leyline to preservation — the steady pulse that mends what frays.',
      gameplay: 'Support mages. Shield allies, restore HP, suppress foes. Economy built on allied positioning and draw-triggers.',
    },
    Blue: {
      lore: 'Mind and pattern. Blue pulls the ley into knowing — memory, deduction, sight past the veil.',
      gameplay: 'Control. Counter, redirect, scry. Hand-shape and draw mana to fuel instant-speed reactions.',
    },
    Black: {
      lore: 'Ambition and attrition. Black bargains with the ley — power for pieces of oneself, or pieces of others.',
      gameplay: 'Resource trade. Spend HP, corruption, or allies for raw effect. Attrition that wears boards down.',
    },
    Red: {
      lore: 'Fury and spark. Red lets the ley burn — speed, chaos, the honest violence of a storm.',
      gameplay: 'Aggression. Damage, haste, unpredictable burst. Resource is pressure, not patience.',
    },
    Green: {
      lore: 'Growth and wildness. Green feeds the ley back into living things — beast, bough, bloom.',
      gameplay: 'Ramp and creatures. Summon allies, overgrow mana, outscale with bodies and buffs.',
    },
  },

  // --- Heroic (six mundane paths) ---
  heroic: {
    Agent: {
      lore: 'Spies, infiltrators, and shadow-walkers. The Agent trades in secrets, disguises, and the quiet knife.',
      gameplay: 'Stealth, misdirection, one-strike burst. High mobility, low defense — strike from the margins.',
    },
    Envoy: {
      lore: 'Diplomats, bards, and dealmakers. The Envoy binds factions with word and song.',
      gameplay: 'Social control. Debuff with charm, buff allies, reshape encounters through persuasion and command.',
    },
    Hunter: {
      lore: 'Trackers, rangers, beastmasters. The Hunter knows the wild things — and how to end them.',
      gameplay: 'Ranged precision and traps. Mark targets, exploit terrain, bond a companion.',
    },
    Leader: {
      lore: 'Captains and commanders. The Leader forges strangers into a unit that will not break.',
      gameplay: 'Party buffs and tactical commands. Reaction economy, repositioning, morale resources.',
    },
    Scholar: {
      lore: 'Scribes, alchemists, engineers. The Scholar turns study into lever, lens, and cure.',
      gameplay: 'Utility and consumables. Knowledge checks convert into combat effects; craft to solve problems.',
    },
    Warrior: {
      lore: 'Duellists, berserkers, line-holders. The Warrior\'s art is the art of the fight itself.',
      gameplay: 'Martial excellence. Stances, combo attacks, armored resilience. The only class that welcomes being hit.',
    },
  },

  // --- Radiant (nine orders of surgebinders) ---
  radiant: {
    Dustbringer: {
      lore: 'Releasers of the Surges of Division and Abrasion. They unmake — walls, weapons, and themselves.',
      gameplay: 'Destruction and friction. Burn matter, shatter armor. High risk / high reward.',
    },
    Edgedancer: {
      lore: 'Surges of Abrasion and Progression. They listen to the forgotten and move like wind across stone.',
      gameplay: 'Mobility, healing, frictionless skating. Weave around the fight; lift the broken up.',
    },
    Elsecaller: {
      lore: 'Surges of Transformation and Transportation. Scholars who step between the real and the imagined.',
      gameplay: 'Teleport, soulcast, reshape. Puzzle-solver in combat and out.',
    },
    Lightweaver: {
      lore: 'Surges of Illumination and Transformation. Artists whose truths become illusions — and the reverse.',
      gameplay: 'Illusion, deception, morale. Reshape the battlefield\'s perception, not its geometry.',
    },
    Skybreaker: {
      lore: 'Surges of Gravitation and Division. Sworn to a code; they judge and they fall.',
      gameplay: 'Law-bound strikes. Lashings, divisions, punishing rule-breakers with escalating force.',
    },
    Stoneward: {
      lore: 'Surges of Cohesion and Tension. Bulwarks and stone-speakers; they endure what the land cannot.',
      gameplay: 'Tank. Bind allies to stone, anchor the line, convert damage taken into fuel.',
    },
    Truthwatcher: {
      lore: 'Surges of Progression and Illumination. Seers who grow what they see and see what they grow.',
      gameplay: 'Healing and foresight. Reveal hidden things, pre-buff the unseen, regenerate over time.',
    },
    Willshaper: {
      lore: 'Surges of Transportation and Cohesion. Freedom-seekers; they rearrange the world to move through it.',
      gameplay: 'Battlefield shaping. Shift terrain, create paths, escape any binding.',
    },
    Windrunner: {
      lore: 'Surges of Gravitation and Adhesion. Oathbound protectors; they fly and they bind.',
      gameplay: 'Lashings. Invert gravity, stick enemies to surfaces, leap into and out of danger.',
    },
  },

  // --- Deity (ten deities × domains) ---
  // Keys are Deity names as they appear in data. Lore/gameplay pulled from the
  // Pantheon of Valor reference; status line surfaces current-epoch stakes.
  deity: {
    Anaveth: {
      lore: 'Life — the Overflowing. The river with no shore. Birth, growth, vitality, and the sustenance that keeps organisms functioning. With Death sealed, Anaveth is drowning in its own domain, shunting excess Investiture outward and panicking for help.',
      gameplay: 'Blue/Green. Overflow healing, regeneration, and allies that refuse to stay down. Convert excess HP into temp HP, buff creatures, sustain the line past the point where the fight should have ended.',
    },
    Morrath: {
      lore: 'Death — the Shepherd Below. Not cruelty, but completion: the guide that takes what has lived to its proper conclusion. Currently sealed by an unknown hand; the cycle has no endpoint, and the consequences ripple across Thyrcross.',
      gameplay: 'Green/Black. Harvest and finality. Reduce creatures to 0 and recover Investiture, sense the dying, raise what has fallen, or ease it onward in peace.',
    },
    Gnothis: {
      lore: 'Knowledge — the Ember Sage. Not cataloguing but experiential insight: the lesson learned by burning your hand. Missing on an open thread; the Warlock of Malcurr receives answers, but from whom, no one can say.',
      gameplay: 'Green/Red. Risk-driven discovery. Learn by striking, reward improvisation, and unlock stronger effects as the fight teaches you what it is.',
    },
    Kethane: {
      lore: 'Civilization — the Hearthwright. Cities, contracts, and the quiet work of making strangers live near each other without violence. Not targeted — simply drowning in everyone else\'s failures.',
      gameplay: 'Red/White. Bulwark and builder. Fortify positions, reinforce allies, and turn defended ground into lasting advantage.',
    },
    Maelith: {
      lore: 'Chaos — the Laughing Dark. Once genuinely unpredictable: petty, gleeful, unknowable. Now pragmatic, but seemingly random. Prayers are answered promptly, competently, purposefully — and the oldest priests notice.',
      gameplay: 'Mono-Black. Entropy and ambition. Bargain HP and Investiture for sharp effects, punish predictable play, trade resources for raw power.',
    },
    Olvarra: {
      lore: 'Fate — the Watcher at the Loom. Stripped of power for a failed coup; what remains are fragments, hunches, the agony of seeing wrongness without clarity. Does not yet know its own fall created the opening.',
      gameplay: 'Green/White. Foresight and inevitability. Pre-commit to outcomes, reveal hidden threads, and redirect consequences along lines you chose earlier.',
    },
    Razkael: {
      lore: 'Destruction — the Unmoored. Banished from the divine framework and walking the mortal world without its portfolio. Removed because it might have recognized the true threat; it may still remember what did it.',
      gameplay: 'Red/Blue. Precision ruin. Identify structural weakness, shatter armor, demolish defenses — not wanton annihilation, but knowing exactly where to strike.',
    },
    Tessavain: {
      lore: 'Order — the Covenant Keeper. Law, oaths, institutions. Alarmed: recognizes Tyrith\'s movement pattern and is trying to convene a divine council that may already be too late.',
      gameplay: 'Blue/White. Contracts and control. Bind foes by rule, enforce agreements, punish violations. Knowledge in service of structure.',
    },
    Tyrith: {
      lore: 'Power — the Crowned Aspirant. Ambition and authority, convinced it is the right hand to lead. Planning a coup against Verdannis and genuinely believing it would do better — and the true threat is counting on it.',
      gameplay: 'Blue/White. Command and dominance. Seize initiative, dictate positioning, and convert influence into battlefield control.',
    },
    Verdannis: {
      lore: 'Nature — the Rootfather. Eldest voice, leader of the pantheon, stewards of the natural cycle. Credibility failing: reaching through the leyline network in search of answers, draining Thalendor\'s green lines as it looks.',
      gameplay: 'Black/White. Cycle and structure. Decay feeds renewal; enforce seasonal rhythm on the battlefield, turning loss into the next growth.',
    },
  },
};
