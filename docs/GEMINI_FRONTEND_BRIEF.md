# Poseidon — Gemini Front-End Product Brief

## Purpose

This document is the visual/product handoff for building Poseidon's first coherent front end.

Read alongside:

- `PRODUCT.md` — product vision and principles
- `docs/PRD.md` — behavioral requirements and MVP boundary
- `docs/UI_DATA_CONTRACT.md` — stable front-end data interface
- `docs/CONTENT_AND_ASSETS.md` — marine-life content/art direction

The goal is **not** to invent a generic dive-log dashboard.

The goal is to make the first convincing visual expression of:

> **A beautiful personal atlas of your underwater life.**

The front end may initially run entirely from realistic fixture data. Do not block visual/product work on backend completion.

---

# 1. Product character

Poseidon is personal, aquatic, exploratory and alive.

It should feel:

- light-mode first;
- rich in deep and clear ocean blues;
- supported by aquatic/seaweed greens;
- punctuated by coral, reef and tropical-fish colours;
- tactile and fluid;
- polished enough to feel like a treasured personal object;
- playful without becoming childish;
- visually rich without becoming cluttered.

Avoid:

- black/dark dive-computer styling;
- industrial gauges and instrument-panel aesthetics;
- dense technical forms;
- generic SaaS dashboards;
- stock scuba imagery as decoration;
- endless identical cards;
- gamification chrome everywhere;
- visual noise competing with creature artwork.

Creature illustrations should provide much of the saturated colour and personality.

---

# 2. Product ancestry — Liebestraum

Inspect `BenWassa/liebestraum` selectively as the primary product ancestor.

Transfer the philosophy, not the styling:

- accumulated personal history is the main character;
- latest memory can anchor Home;
- creation is immediate and familiar;
- timeline/history, geography and collection reinforce each other;
- small statistics describe the shape of a life rather than turning Home into analytics;
- important real-world content provides the delight.

Poseidon must feel unmistakably aquatic rather than romantic/travel-journal themed.

---

# 3. Navigation model

Primary product areas:

1. **Home**
2. **Journal**
3. **Atlas**
4. **Collection**
5. **Log Dive**

A strong mobile pattern is preferred. A central/primary Log Dive action may be appropriate, but choose the interaction based on hierarchy rather than copying another app mechanically.

Settings/profile are secondary and should not compete with the main personal-history surfaces.

---

# 4. Home — the whole underwater life

Home should not be a menu or KPI dashboard.

It should answer:

> **What does my underwater life feel like right now?**

Recommended hierarchy:

## A. Latest Dive / Latest Chapter hero

The dominant Home object.

Show enough to evoke the memory:

- dive site;
- area/location;
- date;
- highlight creature artwork;
- a few supporting sightings;
- concise depth + duration;
- route into Dive Detail.

The creature artwork can overlap or escape conventional card geometry if the composition remains clear and robust.

The hero should feel like a memory artifact, not a database summary.

## B. Lifetime shape

Compact, quiet summary of accumulated history.

Initial useful measures:

- total dives;
- sites;
- creatures;
- countries/regions where known.

These are supporting context, not the visual hero.

## C. Recent discoveries

A small visual strip or composition of recently first-seen creatures.

Artwork + common name.

This should create the feeling that the personal marine collection is growing.

## D. Atlas glimpse

A restrained preview of geographic history.

For the prototype this may be:

- a simplified map treatment;
- region/country chips with counts;
- a geographic card that later becomes the full Atlas.

Do not let a map dominate Home unless rendered evidence shows it clearly improves the composition.

## E. Log Dive

The route to creating the next dive must remain obvious and thumb-friendly.

---

# 5. Journal

The Journal is the complete chronological record.

Every dive belongs, including ordinary ones.

Each entry should prioritize:

1. site/location;
2. date;
3. highlight creature artwork where available;
4. other creature indicators;
5. depth and duration as secondary information.

Avoid making every row a giant identical card.

Explore visual rhythm between entries while preserving scanability.

The Journal should remain useful with:

- 3 dives;
- 20 dives;
- 200 dives.

---

# 6. Dive Detail

A dive should feel worth revisiting.

Hierarchy:

- location/site + date;
- highlight creature as the emotional anchor;
- other sightings as a rich visual set;
- depth + duration;
- optional operator/buddies;
- notes;
- edit action.

Do not display the record as a technical specification sheet.

The visual composition should still work when:

- no curated creature artwork exists;
- there is only one sighting;
- there are many sightings;
- notes are absent.

---

# 7. Log Dive flow

This is the highest-priority interactive flow.

It must feel quick enough after a real dive while preserving a rich creature-selection moment.

Recommended stages:

## 1. Where & when

- date defaulting intelligently;
- area/location;
- dive site;
- reuse prior same-day context where useful.

## 2. Dive basics

- max depth;
- duration;
- optional operator;
- optional buddies.

Do not introduce technical-diving fields.

## 3. What did you see?

**Signature interaction.**

This is deliberately visual and delightful rather than the fewest-taps possible form.

Show a gallery of:

- creature artwork;
- common names;
- unmistakable selected states.

Ordering when context exists:

1. locally likely creatures;
2. recently/frequently encountered creatures;
3. broader content.

Also provide:

- search;
- add unlisted creature;
- selected-creatures review;
- highlight creature selection.

Do not make text search the primary experience.

## 4. Memory & save

- optional note;
- confirm/change highlight;
- save.

Completion can contain a small satisfying moment, but it must not slow logging repeated dives.

---

# 8. Creature gallery

Creature logging should be one of the most visually memorable interfaces in the app.

Requirements:

- image + common name always visible for curated content;
- fast scanning at phone width;
- tactile tap/selection feedback;
- selected state cannot rely on colour alone;
- layouts remain stable as images lazy-load;
- missing art has an intentional fallback;
- gallery remains usable with dozens/hundreds of entries;
- search exists but does not replace visual browsing.

For prototype work, fixture art/placeholder assets are acceptable if final artwork is unavailable. Do not create an architecture that assumes all creatures have art.

---

# 9. Marine Collection

Collection is **the user's encountered life**, not an encyclopedia landing page.

Initial emphasis:

- creatures personally seen;
- polished artwork;
- common name;
- first-seen / recent context where useful.

Creature Detail can show:

- artwork;
- common name;
- first seen;
- most recently seen;
- number of dives encountered on;
- locations/sites;
- links back into relevant dives.

Unseen species may become a discovery layer later but should not visually overwhelm the personal collection in v0.

---

# 10. Atlas

Long-term, Atlas should show the geographic shape of the user's diving life.

Possible levels:

- world/countries;
- regions;
- dive sites.

The first front-end prototype should establish an appealing Atlas direction even if the backend/location dataset is still fixture-driven.

Atlas is about **places with memories**, not finding commercial dive businesses.

Prefer a restrained map + associated personal-history context over a generic full-screen pins product.

---

# 11. Empty and sparse states

Personal use means the app may remain sparse for some time.

Design intentionally for:

- zero dives;
- one dive;
- three dives;
- a handful of creatures.

Do not rely on a huge collection for the app to look finished.

The first-dive state should make Poseidon inviting rather than empty.

---

# 12. Motion and delight

Use motion for:

- orientation;
- tactile selection;
- creature appearance/reveal;
- save confirmation;
- transitions between personal-history layers.

Do not use motion merely to decorate every screen.

Honor reduced-motion behavior.

---

# 13. Performance assumptions

The visual design may assume engineering will provide:

- thumbnail/low-resolution creature image variants;
- lazy loading;
- stable image aspect ratios/placeholders;
- larger variants only on hero/detail surfaces;
- caching for repeat/offline use.

Design the gallery around this model. Do not require full-resolution eager image loading.

---

# 14. Front-end implementation boundary

For the first UI build, use the interfaces and fixture data in `docs/UI_DATA_CONTRACT.md`.

The front end should not directly depend on a specific database SDK.

All reads/writes should sit behind a small application/domain service boundary so the real persistence implementation can replace fixtures without redesigning components.

This is what allows visual work and backend work to proceed in parallel.

---

# 15. First prototype screen set

Build a coherent navigation shell and representative versions of:

1. Home
2. Journal
3. Dive Detail
4. Log Dive — Where/When
5. Log Dive — Basics
6. Log Dive — Creature Gallery
7. Log Dive — Memory/Save
8. Marine Collection
9. Creature Detail
10. Atlas direction

Do not treat these as ten unrelated design exercises. They are one product system.

If time/implementation budget requires prioritization, the essential sequence is:

**Home → Log Dive → Creature Gallery → Dive Detail → Journal → Collection**

Atlas and Creature Detail can follow once the core visual language is coherent.

---

# 16. Evaluation standard

The prototype is successful if rendered on a real phone-sized viewport and it makes the following statement believable without explanatory text:

> **This is my underwater life, and adding the next dive will make it richer.**

It should be visually strong enough that engineering should want to preserve the front-end direction rather than replace it with a utilitarian implementation.