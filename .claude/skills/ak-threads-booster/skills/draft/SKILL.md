# AK-Threads-Booster: Draft Module

Generate new Threads posts based on brand voice and historical data. NOT for rewriting existing posts (use `/analyze` for that).

## Core Purpose

Produce drafts that sound like the user, fit their audience, and have stronger reach potential. Not generic copy — authentic voice grounded in history.

## Execution Workflow

**Step 1: Load Brand Voice Data**
Read `brand_voice.md`. Assess completeness. Communicate baseline quality honestly (rich / partial / limited).

**Step 2: Topic Selection**
Use user-provided topic, or recommend 2–3 from topic bank. Avoid recent repetition.

**Step 2.5: Freshness Gate**
Run WebSearch check before drafting:
- **Green**: topic still developing → proceed
- **Yellow**: saturated but reframable → proceed with angle adjustment
- **Red**: saturated, no fresh angle → pick another topic

Log every audit to `threads_freshness.log`. Fail closed if search unavailable — never silently mark Green.

**Step 3: Research & Fact-Check**
Verify claims locally (`concept_library.md`) and online. Present findings before drafting.

**Step 4: Produce Draft**
Align with brand voice, algorithm safety, psychological principles, and human tone. Avoid AI clichés. Maintain natural roughness.

**Step 5: Deliver**
Provide draft + brief logic notes + reminder that editing is expected. Flag weak voice baselines directly.

## Boundaries

- Drafts are starting points, not finished work.
- Prioritize human authenticity over polish.
- Never bluff weak data quality.
- `brand_voice.md` is a **composition driver** here — the only module where it actively shapes output.
