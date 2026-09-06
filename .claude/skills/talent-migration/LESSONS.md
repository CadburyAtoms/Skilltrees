# What sixteen passes measured

Every entry cost a pass to learn. They are grouped by the mistake they prevent, not chronologically.
Full prose lives in `docs/archive/EDHA_EDITABILITY_AUDIT.md` §9n and §9o; this is the distillate.

---

## 1. Estimation — why the columns lie, and in which direction

**Every headline number this migration produced was an over-estimate, and always for the same
reason:** the per-step column counts talents whose **gate** is satisfied. `needs` never recorded the
payload, the coupling, the shape, or whether the talent's data lives somewhere a rule can reach.

| step as planned | predicted | delivered |
|---|--:|--:|
| "the 11 already satisfiable, build nothing" | 7 | **0** |
| build H3 — "clears Chaos and Knowledge outright" | +29 | **+3** |
| build H8 | +29 | **+3** |
| "the 31 already satisfiable" | ~3 | **1** |
| build H6 | +28 | **10** (and 4 of the 10 were not H6 consumers) |
| convert bucket 1 | 6 | **1** — *0 of the 6 were bucket 1* |
| "build the 1b fields" | 39 | **7** |

**The mechanism, named on 07-24v:** `bucket` and `needs` were assigned by asking whether a handler is
**registered**. That is a different question from "can this behaviour be expressed" — and they differ
whenever the handler is config-only, the schema lacks the gate, or no event fires. **Apply the
three-leg test (SKILL.md Phase 2) instead.**

**COMPLETED 07-25 (pass 2bQ): it is FOUR legs, not three — executor / schema field / event / and is
that event REACHABLE AT ALL.** The three-leg framing still implies the missing piece is always a
handler. Twice it is not, and both are properties of how the talent is *invoked*, which no
handler-demand column can ever see:
- **A takeover cancels the event.** All **19** `preUseItem` hooks end in a bare `return false`. A
  talent named in one of the nine Sets can never fire `use`, so every authored `use` rule on it is
  inert **while the Events tab looks perfect**. 15 of the 64 that "read ready" were in one.
- **`activation.type: none`** — no `use` event exists at all (the pass-P finding, still recurring:
  11 more of the 64).

Measured: **33 of 64 "ready" talents could not hold a rule at all**, and **48 of the 63 remaining
carry more than one name-keyed site**, so even the survivors are rarely one-rule conversions.
**Schedule by TAKEOVER SET, not by handler** — one Set is a coherent dismantle that frees a whole
tree, which is a better-shaped atom than any handler.

**Corollary — a config-only handler in `needs` is a GATE, not an answer.** H8 `edha-watch` has a stub
executor by design; all **44** talents naming it still need a separate real payload handler. 41
handler types exist and **18 have stub executors** (all 18 do have readers — none are dead). Check
`executor:` before reading a `needs` entry as satisfied.

**The one time forecasts held (pass P, 3 for 3)** they were made by naming all three legs per talent
rather than reading the column. Even then, both slips were **build size**, never talent count: H20's
re-homing problem and H15's veto + ordering. **The column predicts WHICH talents move; it has never
predicted how much work moving them is.**

**Also:** a handler can be finished and still leave its demand column untouched — H15 and H19 served
bucket-**1b** talents, which `consumers` never counted. Do not read a non-zero count as "unbuilt".

---

## 2. The atom is rarely a talent

Five atom kinds, each found by getting it wrong. See SKILL.md Phase 1 for the table. The reusable
moves:

- **Before scheduling a talent, ask what FUNCTION it lives in and who else lives there.** Black's
  three focus passives were three loops inside one function sharing its preconditions and
  once-per-round bookkeeping. They converted together or not at all.
- **A coupling through a named call can be cut at the CALLER, and then the callee converts alone.**
  Pass F deferred Crown + Kneel + Absolute Authority as a unit because two converters called
  `edhaCrownPing`. What worked was making the call sites *announce* a resolved test rather than route
  to a named talent. Crown then picked the announcement up from its own document, and Kneel stayed
  behind at no cost. **Try this before batching N talents together.**
- **Count the talent's MECHANICS, not just its call sites.** Kneel is a test + a movement veto + a
  standing rider. Converting the first alone ships a talent whose other two thirds silently stopped.
- **A deferral note that names its blocker is a work item.** Grep tree-section headers for them —
  Hollow Command + Siphoned Will were freed by a five-line build the note had already identified.
- **The highest-value conversions came from re-reading, not from the queue.** Three of pass I's seven
  were nowhere near the top of `--priority`. *A passive-sounding card on an item whose activation is a
  Reaction is usually an on-use grant* — Reactive Analysis needed no handler at all.

---

## 3. Traps that shipped, or nearly shipped, a real bug

- **The step that can REFUSE must run before the step that COMMITS.** H3's `place` committed the
  ledger then marked the creature; with no GM online the mark bailed, leaving an entry whose creature
  had no status — which reconcile-on-read then hid **for ever**. Silent three ways: the placement
  looked like a no-op, the cap never counted it, junk accumulated. It affected every H3 consumer.
- **A field that can refuse a use cannot live in the executor.** Executors run on `use`, after the
  cost is charged. Every "nothing spent" gate needs a `preUseItem` veto.
- **A boolean helper that folds "unknown" into one of its answers cannot be inverted.**
  `edhaIsFastTurn` returns `false` for three states and is safe only because it fails CLOSED;
  `!edhaIsFastTurn` fails OPEN and would have granted advantage on the first test of every
  out-of-combat scene. Grep for `!edhaIsX(...)` where `edhaIsX` early-returns false on missing state.
- **Check that a superlative has data to sort by.** "Replace the OLDEST" was unimplementable —
  nothing stamped a creation time, and the existing lookup used `.find()`, correct only while the cap
  happened to be 1.
- **A handler written for debuffs will happily apply to a buff and take its bookkeeping with it.**
  `edha-apply-status` wrote an ownership `markedBy` flag unconditionally; used for a buff it put an
  enemy-debuff flag on a friend, on a hot damage read path. Now a `mark` field.
- **Identity by NAME PREFIX breaks silently on rename.** Summons were found by
  `name.startsWith("Combat Construct")`, so renaming one broke its cap and its riders. Stamp a flag;
  keep a name fallback for documents created before the flag existed, compared against **authored**
  data rather than an engine literal.
- **For every helper the old code called, ask why it called THAT one and not the obvious one.** Bear
  Witness's "plain `kind: thp`" hid three silent narrowings: the shipped writer REPLACES where the
  retired one KEPT THE HIGHER, only the cross variant relays through the GM, and a rank of 0 was
  silent. None was visible in `needs`, the classification, or the card.
- **A dispatcher can reproduce the name-keyed mistake one level up.** `edhaDispatchOnHit` hand-listed
  the three handler types it knew and silently dropped every other rule. If a talent's `needs` are all
  BUILT and it still cannot move, **suspect the dispatcher before the primitives**.
- **A handler that re-enters the dispatcher needs its own rule type excluded from what it re-enters**,
  or the prompt re-asks for ever. Filter, don't skip inside the loop — `rules.length` must stay honest.
- **When you add a value to an existing trigger's vocabulary, check what the EXISTING consumers match
  against.** Round 1 *begins* at combat start, so adding a `round-start` moment without a filter would
  have double-fired three shipped talents.
- **A blanket guard is a policy; the first time it is wrong, make it a field.** Pass H's re-entrancy
  guard was a boolean; a real second event broke it immediately. It became a depth counter plus an
  opt-in `chain`, default off.
- **A hook that inspects `changes` for a flag written through `setFlag` with a DOTTED key must check
  the dotted form too.** `DataModel#updateSource` only expands dot-notation among **top-level** keys,
  and the top-level key is `flags` — so the dotted key survives into the hook. This bites only *after*
  a ledger migration, and it fails silently.
- **Deleting a hook can delete a DIFFERENT talent's only presence** — which leaves an empty document
  AND no engine code, the state rule 2b calls a bug. Also: **Beacon of Stability is a total orphan of
  one line inside the White Draw Mana branch**, 45 lines with no other caller. Check the block.

---

## 4. Gates

- **Expect gates to break as talents leave the engine, and treat the breakage as a finding.**
  `audit.py`'s soft-laziness check detected wiring by looking at the *engine*, so the first
  document-driven conversion FAILED a gate it satisfied better than before. Lint pass 5 broke the same
  way. **Every gate that detects wiring by looking at the engine will hit this.**
- **A gate can lie in the REASSURING direction, which is worse than breaking.** Lint pass 7 counted a
  status `label:` as dispatch, keeping a fully-converted talent on the ratchet — invisible, and
  inherited by every later pass. **Measure before changing a gate:** exactly one name in the engine
  occurred solely as a label.
- **A gate that reads repo data through the machine's locale passes CI and fails Ben.** `audit.py`
  used bare `json.load(open(path))`; the first authored emoji containing byte `0x8f` crashed it on
  Windows while CI, defaulting to UTF-8, stayed green. **Any gate that reads repo data must name its
  codec.**
- **A test caught a real bug, which is the point of pinning them.** `whenTotal: "at-most", 0` used
  `Number(ev.total)`, and `Number(null)` is `0` — so an event carrying no value would have satisfied
  "reached 0 focus". The pinned case failed on first run and the engine was fixed, not the test.
- **`validate-packs.js` is CI-only** and is the only real proof authored data survives the pipeline.

---

## 5. Wins worth copying

- **A registered type with zero dispatch sites is a migration unlock hiding in plain sight.**
  `edha-combat-timing` had been registered since 07-18 and nothing ever dispatched it; wiring it once
  unlocked three things at once.
- **An ALWAYS-ACTIVE talent (`activation.type: none`) can hold no `use` rule** — its empty tab is not
  neglect, nothing *can* be put in it. Give it an event, or find an engine-detected one that already
  fires (Calculated Patience needed no new event: `edha-pre-test` already fired).
- **A RULING can retire a blocker with nothing built.** False Premise sat in a demand column for four
  passes until a fail-open ruling deleted its second path. **When a ruling lands, re-read the `needs`
  of everything it touches** — the classification does not know a decision was made.
- **The tree as documented is the SPEC** (§9m q11). A handler's limitation is never a reason to narrow
  a talent. Widen the primitive instead.
- **Building the card's promise is a legitimate way to settle a card-vs-engine drift.** Pack Hunting
  and Authority were built rather than corrected; the 07-12 Withering Ray call went the other way.
  Either can be right — but "the card is aspirational" should be a decision, not a default.
- **When a name-keyed branch is deleted, ask what it was ENFORCING and re-provide it generically.**
  Crown's manual "ping" button became a generic watch trigger carrying its observation as data
  attributes, so it names no talent and any future watch talent can post one.
- **Prefer a STATUS to a flag for a scene-scoped arm** — a rule can write a status but not an
  arbitrary flag, and it shows on the token, so "am I armed?" stops being a memory test.
- **Reach for rule ORDER before adding a gate field.** H3's `release` returns false when there was
  nothing to release, and the dispatcher stops on false — so `[status] → [release] → [damage]`
  expresses "if it bears my mark, shatter it" with no new field.
- **A conversion can be a genuine BEHAVIOUR UPGRADE.** Incite's engine case posted "on a success…"
  and resolved nothing — a note pretending to be wiring, which had passed every gate for months.
  **A name-keyed talent whose whole body is one `ChatMessage.create` beginning "on a success" is not
  wired.**
- **State whether a conversion moved a MECHANIC or a REMINDER.** Four of the Envoy cluster's six were
  strings. Converting them is worth doing — the text becomes editable — but the ratchet cannot tell
  the difference, and the count quietly starts overstating how automated the game is.
- **For a LEDGER, the deliverable is the REPOINT, not the talent count.** After `covenants` moved,
  all five remaining readers agreed on one array, so the tree is coherent whether or not the other
  three ever convert. Scoring that as "2 of 5" is the same mistake as scoring a handler by raw demand.
- **One accessor beats a schema field.** Repointing `edhaGetCovenants` to a dotted flag key moved the
  ledger and all 12 readers followed for free — and with one array the "ledger in two places" hazard
  cannot occur, rather than being managed.
