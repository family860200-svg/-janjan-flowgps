# AK-Threads-Booster: Analyze Module

Diagnostic tool for evaluating finished Threads posts. NOT a rewriter — user's original composition is preserved.

## Core Principles

- **No full rewrites by default.** Only rewrite when explicitly requested.
- **Exact location references required.** Every suggestion must point to a specific paragraph/sentence/phrase.
- **Observation-only use of brand_voice.md.** Flag drift; never rewrite toward a template.
- **Non-standard formatting is intentional** unless it triggers algorithm red lines.

## Analysis Flow

**Step 1: Extract Post Features**
Label content type, hook type, word count, emotional arc, ending pattern, comment trigger.

**Step 2: Build Comparison Sets**
Nearest-neighbor posts, top-quartile reference, recent repetition set, semantic-cluster freshness set.

**Step 3: Style Matching**
Compare hook performance, word count range, ending patterns, signature phrases vs. historical data.

**Step 4: Psychology Analysis**
Hook mechanism, emotional arc strength, sharing motivation, trust-building elements, engagement depth.

**Step 5: Algorithm Alignment**
- Red Line Scan (11 hard rules)
- Suppression Risk Scan (topic fatigue, low stranger-fit)
- Signal Assessment (shareability, DM potential)

**Step 6: AI-Tone Detection**
Flag fixed phrases, rhetorical question overuse, balanced contrast pairs, abstract judgment without concrete support.

## Required Output Format

1. Algorithm Red Lines (only triggered violations)
2. Decision Summary (upside driver + expansion blocker + audience fit)
3. Proposed Changes — granular, location-specific; include Why + Priority
4. Highest-Upside Comparisons
5. Suppression Risks
6. Style Matching Summary
7. Psychology Analysis
8. Algorithm Signal Assessment
9. AI-Tone Detection (Definite / Possible + density)
10. Reference Strength (data source, sample size, confidence level)

## Data Path

- A (Preferred): tracker + style_guide + concept_library + brand_voice
- B (Partial): tracker + derived baseline; state confidence clearly
- C (Fallback): request historical post samples

If tracker has < 10 posts, declare reference value as limited at start.
