/* Color metadata: names, sigils, themes, descriptions */
const COLORS = [
  {
    id: 'white',
    name: 'White',
    sigil: '☀',
    letter: 'W',
    tag: 'Order · Unity · Authority',
    drawMana: 'Allies within Attunement Range regain HP equal to your Tier.',
    theme: 'Formation, coordination, group healing. The institutional hand that steadies the chaos of battle.',
  },
  {
    id: 'blue',
    name: 'Blue',
    sigil: '◐',
    letter: 'U',
    tag: 'Knowledge · Foresight · Probability',
    drawMana: 'Advantage on your next Cognitive test.',
    theme: 'Prediction and control. Spatial engineering, probability manipulation, telepathic links.',
  },
  {
    id: 'black',
    name: 'Black',
    sigil: '✦',
    letter: 'B',
    tag: 'Isolation · Domination · Predation',
    drawMana: 'Enemies within range with no ally adjacent become Weakened.',
    theme: 'Predatory magic that pays in blood and will. Isolates, dominates, consumes.',
  },
  {
    id: 'red',
    name: 'Red',
    sigil: '✸',
    letter: 'R',
    tag: 'Passion · Momentum · Escalation',
    drawMana: 'Advantage on next Physical test. Lose your Reaction.',
    theme: 'Reckless force and pyromancy. Gets stronger the worse the fight goes.',
  },
  {
    id: 'green',
    name: 'Green',
    sigil: '❦',
    letter: 'G',
    tag: 'Nature · Instinct · Pack',
    drawMana: 'Create difficult terrain within Attunement Range.',
    theme: 'Cluster engine. Deep healing, terrain control, adjacency bonuses, primal awareness.',
  },
];

// Specialty names per leyline color. Used for display labels; atlases.js builds columns dynamically from data.
const LEYLINE_SPECIALTY_MAP = {
  White: ['Coordination', 'Bulwark', 'Accord'],
  Blue:  ['Foresight', 'Calculation', 'Illusion'],
  Black: ['Isolation', 'Ritual', 'Subjugation'],
  Red:   ['Momentum', 'Conflagration', 'Frenzy'],
  Green: ['Territory', 'Restoration', 'Instinct'],
};

const ACTION_TYPES = ['Passive', 'Special', 'Free Action', 'Reaction', '1 Action', '2 Actions', '3 Actions'];

// Cost classification helper
function classifyCost(cost) {
  if (!cost || cost === '—' || cost === '-' || cost.toLowerCase() === 'none') return ['free'];
  const c = cost.toLowerCase();
  const out = [];
  if (c.includes('investiture')) out.push('investiture');
  if (c.includes('focus')) out.push('focus');
  if (c.includes('hp') || c.includes('lose hp') || c.includes('health')) out.push('hp');
  if (c.includes('opportunity')) out.push('opportunity');
  if (!out.length) out.push('other');
  return out;
}

// A shared dictionary of short rules references for tooltips
const RULES_GLOSSARY = {
  'Draw Mana': 'Base leyline action. 1 Action; restores Investiture and triggers your color\'s Attunement rider.',
  'Investiture': 'Magic fuel. Spent to activate talents. Drawing Mana refills it.',
  'Focus': 'Scarce mental resource. Used to resist Influence and activate select talents.',
  'Opportunity': 'A face of the Plot Die. Spendable for bonus effects.',
  'Plot Die': 'Special die rolled alongside d20 tests. Faces include Opportunity and Complications.',
  'Attunement Range': 'Radius that scales with Rank: 15/30/60/90/120 ft.',
  '[Die]': 'Rank die: d4 → d12 as you invest Rank 1 → 5.',
  '[Size]': 'Effect size: 2.5 / 5 / 10 / 15 / 20 ft by Rank.',
  'Tier': 'Character level bracket. Tier 1 = lvl 1-4, etc.',
  'Weakened': 'Condition: Disadvantage on Physical tests.',
  'Disoriented': 'Condition: Disadvantage on Cognitive tests.',
  'Determined': 'Condition: Advantage on next test.',
  'Isolated': 'Condition: The character has no ally within 10 feet.',
  'Deflect': 'Defense that reduces Impact/Keen/Energy damage. Vital and Spirit ignore it.',
  'Vital': 'Damage type that ignores Deflect. Represents bleeding, poison, internal harm.',
  'Spirit': 'Damage type that ignores Deflect. Represents soul injury.',
  'Tier': 'Character level bracket: T1 = 1-4, T2 = 5-9...',
};

window.GameData = { COLORS, TREES, ACTION_TYPES, classifyCost, RULES_GLOSSARY };
