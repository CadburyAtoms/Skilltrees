# Case studies — how past passes were root-caused (read before diagnosing)

Seven real diagnoses from this repo's history, each written as: the report → the tempting narrow
fix → what was actually wrong → the transferable lesson. The tempting fix column is the point:
every one of them would have "worked" in the moment and been wrong. Sources: the 07-05 Black
test-pass delta, the 06-13b retrofit, and the 07-04 backlog pass in `EDHA_FOUNDRY_HANDOFF.md`.

---

## 1. The false correlation — Predatory Insight (Black, 07-05)

**Report:** "The passive focus-regain only works if I've used the active ability first."

**Tempting fix:** initialize the passive's state when the active is used — codifying the
correlation Ben observed.

**Actual cause:** nothing to do with the active. Whispered Doubt's extra-focus-loss write is
tagged `edhaFocusWatch:true` so the focus watcher ignores it (to avoid loops) — so an enemy taken
to 0 focus *by Whispered Doubt itself* never fired the regain check. Using the active first merely
changed which write reached zero. Fix: run the zero-check (`edhaPredInsightZeroGain`) after our
own secondary write too.

**Lesson:** the reporter gives you a correlation and a plausible story. Treat the story as a
hypothesis; trace the code path (hook → handler → write) that actually ran in their scenario. If
your fix implements the reporter's story rather than a cause you located in code, stop.

## 2. One family, three symptoms — the roll-label family (Black, 07-05)

**Reports (three, seemingly unrelated):** "the test breakdown shows `1d(2x3+2)`"; "no Investiture
card appeared" (two talents); "Severance posted a blank card."

**Tempting fix:** three point patches — format one string, post one card, suppress one card.

**Actual cause:** ONE family. `Roll.replaceFormulaData` substitutes `@refs` but computes nothing
(hence the garbled die math), and the cosmere chat template ignores roll `flavor` (hence anonymous
and blank cards — the "blank card" was a 0-heal Investiture-regain roll with no visible label).
Fixes shipped as primitives: `edhaFoldDieMath` (numeric folding), flavor-labeled rider terms
(`1d8[Predatory Patience]` — named d20 parts *everywhere*, for free), and `edhaRollCard` (labeled
engine roll cards, mandated for all future trigger rolls).

**Lesson:** before fixing anything, group the worklist rows by the code path they share. The
number of reports is not the number of bugs — and a family fixed at its root upgrades every tree
at once, while three point patches would have left the next tree broken the same three ways.

## 3. The stale pack — Unnerving Approach (Black, 07-05)

**Report (filed as the pass's "Big Issue"):** "Unnerving Approach shows the wrong description —
it has the movement-denial text."

**Tempting fix:** "fix" the repo text — which was never wrong.

**Actual cause:** not a repo bug at all. The push text had been in every live source since the
first capture (the movement-denial text belongs to Dread Presence); Ben's machine was frozen at
the 06-16 build, and owned talents are snapshots until ⟳ Sync. Resolution: rebuild + Sync and
re-check — recorded in the delta, zero code changed.

**Lesson:** establish deploy state (checklist DEPLOY FIRST section + delta headers + `git log`)
before believing any "wrong text / old behavior" report. A bug in something changed since the
last deploy is a deployment gap until proven otherwise. "Fixing" correct data corrupts it.

## 4. "Manual by nature" overturned — Dread Presence (Black, 07-05)

**Report:** Dread Presence (Weakened creatures can't willingly approach your allies) wasn't doing
anything — it had been classified *manual by nature* (forced volition, "no hook exists").

**Tempting fix:** re-affirm the manual classification and improve the reminder card.

**Actual resolution:** the classification no longer held. A `preUpdateToken` veto CAN block a
Weakened creature in Attunement Range from moving measurably closer to any living ally — and
engine-driven forced movement stamps `options.edhaForcedMove` to bypass the veto (forced movement
isn't willing). "Manual" became *enforced*.

**Lesson:** "manual" is a claim about the current hook inventory, and the inventory grows every
pass (the 07-04 pass alone added forced-move stamps, LOS, injuries, summon relay). Re-litigate
every manual/backlog classification a test row touches, using the authoring skill's test: **if
you can name the specific hook, it's buildable.** (Conversely, respect true no-hook cases — an
NPC's *intent* is not data anywhere in Foundry, so intent-reveal talents fail the test forever.)

## 5. The point fix that became a primitive — the Opportunity menu (Black, 07-05)

**Report:** one talent — Predatory Insight's Opportunity spend was clunky.

**Tempting fix:** a bespoke prompt inside Predatory Insight's handler.

**Actual fix:** Opportunity is a *core-rules* economy (SR p.9), not a Black mechanic — so the fix
became a shared primitive: a post-roll watcher on `roll.opportunitiesCount > 0` posting a menu
card of the roller's `edha-opportunity-option` rules (new native event `edha-opportunity` +
handler type, editable on the talent), costs deducted on click, canon spends as a footer.
Predatory Insight became merely the *first consumer* — any later tree joins the menu by authoring
one rule.

**Lesson:** the generalization test. When a report names one talent, ask what the mechanic
actually belongs to — the talent, the tree, or the game. Signals it's bigger than the report: the
mechanic is core-rules; another tree's "still to build" header lists the same shape; the fix is a
formatted/labeled version of something every trigger does. Build the shared thing, register and
index it, wire the reported talent as consumer #1.

## 6. Wrong event, plausible behavior — the on-hit retrofit (Black, 06-13b)

**Report:** Sapping Hex applied Weakened, and Predatory Patience refunded Investiture, on
*misses*.

**Tempting fix:** add a hit-check inside each talent's handler.

**Actual cause:** trigger semantics. `edha-deal-damage` rides the system's `damageRoll` hook,
which fires on the attack ROLL — cosmere rolls damage on every attack, hit or miss (the GM applies
on a hit). "Works most of the time" hid that the trigger meant the wrong thing. Fix at the engine
level: a new event type **`edha-on-hit`**, dispatched by the `applyDamage` wrapper only when
`damage.dealt > 0` — then retrofit every "on hit" consumer onto it.

**Lesson:** verify what a hook *means in this system*, not just that it fires — grep the system
source; the handoff §10 gotchas are largely this trap (double-fire hooks, MERGE-not-replace
updates, deprecated hooks that still fire). And when the cause is trigger semantics, the fix is a
new/corrected *event type* plus a sweep of all consumers — never per-talent guard clauses.

## 7. The engine was right — Withering Ray's Cost line (Black, 07-05)

**Report:** Withering Ray's HP cost looked wrong at the table.

**Tempting fix:** change the engine to match the card.

**Actual cause:** the card lied. The Cost line said *half [Tier][Die]*; the ruling and the engine
both said *half [Die]*. The engine was correct — the fix was to the card text (authored JSON and
source prose together), plus a display improvement: the sheet render hook now paints the HP price
into the consume cell for any `edha-ritual-hp-cost` talent, so the table sees the real cost.

**Lesson:** drift has two directions. When text and behavior disagree, neither is canonical by
default — the ruling/handbook is. Decide canon first, then align *all three layers* (card text +
source prose, engine, docs) in the same commit. And if the confusion came from something the UI
didn't show, consider whether the durable fix is making the truth visible.
