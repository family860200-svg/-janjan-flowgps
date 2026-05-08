# AK-Threads-Booster: Setup Module

Initialize and import Threads account history into `threads_daily_tracker.json`.

## Import Paths

**Path A (Meta Threads API)** — recommended; provides full metrics + comments; refreshable.
1. Create Meta developer app
2. Generate access token
3. Run `python scripts/fetch_threads.py`

**Path B (Account Data Export)** — read-only accounts; lacks engagement metrics.
1. Request export via Meta's Account Center
2. Parse with `python scripts/parse_export.py`

**Path C (Direct Data)** — accepts JSON, CSV, or spreadsheet; converts to standard schema.

**Path D (Chrome Profile Scrape)** — fast import without API; leverages `/refresh` skill.

**Path E (Legacy Migration)** — detects and transforms pre-v1 schema trackers automatically.

## Core Output Schema

Normalized tracker JSON with:
- Required: `id`, `text`, `created_at`, `metrics`, `comments`, `content_type`, `topics`
- Optional: algorithm signals, psychology metrics, review states

## Three-Phase Generation

After import, generate:
1. **Style Guide** (`style_guide.md`) — catchphrases, hook patterns, emotional arcs, content-type distribution
2. **Concept Library** (`concept_library.md`) — explained concepts, repeated semantic clusters
3. **Companion Files** — `posts_by_date.md`, `posts_by_topic.md`, `comments.md`

## Data Confidence Gating

Report dataset maturity: Directional / Weak / Usable / Strong / Deep.
Communicate honestly before proceeding with downstream skills.
