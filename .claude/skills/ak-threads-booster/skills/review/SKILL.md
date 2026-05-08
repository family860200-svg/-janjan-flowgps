# AK-Threads-Booster: Review Module

Post-publish feedback loop — compare actual performance vs. prediction, update tracker assets.

## Core Workflow

1. Sweep expired draft placeholders
2. Collect actual metrics (user-supplied or tracker refresh)
3. Compare against prior prediction (conservative / baseline / optimistic)
4. Update tracker, style_guide, concept_library cautiously

"Prediction error is normal — the job is to learn why, not to score the user."

## Data Collection

- **User-supplied**: views, likes, replies, reposts, shares at specified hours post-publish
- **Tracker-backed**: refresh via automated scripts

## Prediction Comparison

When prior prediction exists:
- Flag whether outcome landed inside / above / below predicted bands

## Safety Mechanisms

Before writing to any file:
- Backup with ISO timestamp
- Keep only 5 most recent backups per file
- Block partial writes entirely

## Deviation Analysis

Examine: posting time, hook quality, topic fatigue, external events, comment depth, account trends, psychological/algorithmic signals.

## Hygiene Checks

- Freshness-gate health (flag if >30% failed runs)
- Refresh-log staleness (flag if >48 hours without refresh)

## Output Structure

1. Actual data
2. Prediction comparison
3. Deviation analysis
4. Data updates applied
5. Signal validation
6. Timing notes
7. Cumulative learning trends

Avoid false precision when data is partial.
