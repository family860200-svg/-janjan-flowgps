# AK-Threads-Booster: Predict Module

Estimate 24-hour post performance using historical data. Always provide ranges, never point estimates.

## Workflow

**Step 1: Feature Extraction**
Content type, hook style, topic, word count, emotional arc, shareability signals.

**Step 2: Historical Comparison**
- Nearest neighbors (3–5 posts)
- Top-quartile similar posts
- Last 10 posts
Match on: content type, hook, topic, word count, tone.

**Step 3: Trend Analysis**
Recent trajectory, topic fatigue, semantic saturation.

**Step 4: Output Table**
| Scenario | Views | Likes | Replies | Reposts | Shares |
|---|---|---|---|---|---|
| Conservative | | | | | |
| Baseline | | | | | |
| Optimistic | | | | | |

Include upside drivers and uncertainty factors.

**Step 5: Persist**
After user confirmation, store prediction snapshot in tracker.
- Backup before writing (keep 5 most recent)
- Handle overwrite with user consent

## Key Constraints

- Never false precision — always ranges
- < 5 comparable posts → use min-max logic instead of percentiles
- No quotes metric (excluded due to sparsity)
- Always backup tracker before mutations
