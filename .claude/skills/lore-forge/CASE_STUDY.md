# Lore-forge case study — the famine layer-1 correction (2026-07-13)

The worked example behind every phase of `SKILL.md`. It is a *correction* rather than a fresh
build, which makes it the sharpest teaching case: it shows exactly how invented lore that reads
fine can be logically broken, how the derive-from-a-ruling method catches it, and what a clean
fix + sweep looks like. Read this before writing or auditing any world-truth.

---

## The bug as Ben first reported it

> "The suggestions to layer one of the famine make no sense to me."

A vague symptom pointed at one bullet — the Lunavar culture block's night-calendar rationale
("the sun ripens nothing now — §1a — and daytime sleep spares hunger"). The **first pass fixed
the wrong thing**: it treated the report as a card-text problem (a misquote of §1a, a weak
rationalization) and proposed rewriting the *Lunavar bullet*. That's symptom-patching — the
lore-forge equivalent of the test-pass-fixes "root-cause before fixing" rule.

Ben's second message relocated the bug from the symptom to the source:

> "I don't think the current logic of how layer 1 works makes sense, or is compatible with the
> way that 'lack of mechanical capacity' is how things currently die… The famine layer 1 is the
> question of how the above logic applies to food and plants."

The bug was never in Lunavar. It was in **§1a layer 1 itself** — a cosmology claim — and Lunavar
merely *referenced* it. Lesson: when a reference "makes no sense," audit the thing it references,
not the reference. (Same shape as test-pass-fixes' "one bug or a family?" — the Lunavar bullet,
the primer line, and the session opener were three symptoms of one broken ruling.)

## Why the original claim was invention, not derivation (Phase 1 + 2)

The load-bearing constraint is **ruling 9, the consent/mechanical-death model**: death is
mechanical; steel works; *only the wasting* (slow deaths — disease, starvation, age) fails to
finish, because that final step was Morrath's mercy. Now run the original layer-1 text against it:

> "Ripening is a small death… crops grow but stall… too degraded to ripen… Livestock waste
> without dying on time."

Trace each claim to its mechanism (the Phase-2 death-model check):

- **"Ripening is a small death."** Ripening is enzymes and senescence — *mechanical*. And it
  isn't even a death: the plant is alive and thriving when it fruits. Ruling 9 says mechanical
  processes are untouched, so the seal has no lever on ripening. **Contradiction.**
- **"The harvest never finishes."** The death in the food chain is a person or animal *eating*
  the crop (or harvesting, or slaughtering the cow) — mechanical, steel-works, no god needed.
  So healthy food production should be *completely fine*. **The claim invents a famine where the
  model produces none.**
- **Ben's own coup de grâce:** *"how is ripening a slow death? The people kill the plant by
  eating it."* Exactly — the asserted mechanism doesn't exist.

The original layer 1 had smuggled the pre-ruling-9 "death is broken" cosmology back in through
the crops. It read fine; it derived from nothing; it contradicted the model. That is the entire
failure mode Phase 1–2 exist to catch.

## Deriving the real answer (Phase 1, done right)

Ask the Phase-1 question honestly: *given ruling 9, where can a famine come from at all?* If
healthy crops are fine, the famine can only enter the **one channel the seal actually broke — the
wasting.** What in the food economy is a slow death?

**Crop blight and livestock murrain.** A pathogen population dying out is itself a wasting (§1a
already says so for human plague — Anaveth's "disease organisms persist past their span,"
epidemics "can't burn out"). Apply the *identical, already-canon* rule to the agricultural base:

- A blighted field can't resolve — the blight can't finish killing the stalk, the stalk can't
  throw it off, the pathogen never dies out to let the ground be cleared and sown clean.
- Sick herds linger, eating feed and giving nothing, and can't be culled clean because the
  murrain is already everywhere and permanent.
- The arable base **ratchets down**: every season more ground locked into un-ending disease.

This is the answer because it **needs no new rule** — it's Anaveth's persistence (already canon)
applied to crops instead of people. Three confirmations it's right, not just another patch:

1. **It unifies.** The hospice-plague (people who won't finish dying) and the crop famine (fields
   that won't finish dying) become *one* phenomenon with a human face and an agricultural face —
   layer 1 and "plague" stop being separate statuses.
2. **The existing imagery was already this.** The session-1 material said "black-blighted wheat
   that won't fall," "cut a stalk and it neither dries nor rots." That was *disease* imagery all
   along — the old §1a text had simply mislabeled its own mechanism. The fix aligned the rule to
   the imagery, not the reverse (the Phase-2 which-direction check).
3. **"The Last Harvest" survives.** Her name is the reaping-of-souls metaphor, never literal crop
   ripening — so dropping the ripening claim costs nothing.

## The one genuine design question (Phase 3 gate)

Not everything was derivable. One real fork remained — **is layer 1 purely the disease reading,
or also a soil/return-leg mechanism** (two years of souls pooling instead of returning starves
farmland of Investiture)? The soil idea is thematically strong but is a *new* cosmological rule,
not something ruling 9 forces. That is a Ben decision, so it went to him as the gate — with a
recommendation (disease-only spine; soil available later as an act-3 flourish). Ben ruled
disease-only. Note the discipline: **the correctness fix proceeded** (the mechanism has a right
answer once you follow the model), but the **additive new rule waited for the yes.** That line —
correction-proceeds, invention-waits — is Phase 3.

## The fix and the sweep (Phase 4–6)

- **Rewrote §1a layer 1** as "the blight that never clears," with the derivation stated inline
  (healthy crops fine → famine enters through the wasting → blight/murrain never finish → base
  ratchets down → agricultural face of the hospice persistence → bites by margin).
- **Added ruling 24**, explicitly *superseding* the old framing and *recording* the declined
  soil option, so no future session re-derives either error.
- **Swept six docs** (Phase 5): §5b Lunavar (night-calendar regrounded in doctrine, control-case
  reworded, margin/Vorsk severity clause added), the primer, the session-1 opening, and two TODO
  W-items. The opening/session-1 blight imagery needed no change — it was already correct.
- **Close-out:** handoff delta (docs-only, no rebuild), `validate.js` green.

## The transferable lessons

1. **A reference that "makes no sense" usually indicts what it references.** Audit up the chain
   to the load-bearing ruling, not the leaf.
2. **Evocative prose hides broken mechanism.** "Ripening stalls, crops stuck mid-death" *sounds*
   like famine and derives from nothing. Always ask which ruling forces a mechanical claim.
3. **The best fix invents no new rule.** The answer was an existing ruling (Anaveth's
   persistence) applied to a new domain. Reach for that before adding cosmology.
4. **Fix the rule to match the imagery when the imagery is the older truth** — the table material
   was already disease-based; the abstract rule was the thing that had drifted.
5. **Correction proceeds; addition waits.** Following the model to its right answer is a
   correctness fix. Bolting on a new mechanism (the soil idea) is invention — that one gates.
