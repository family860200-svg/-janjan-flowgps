# AK-Threads-Booster: Topics Module

Recommend 3–5 worthwhile next topics by analyzing comment demand, historical performance, and semantic freshness.

## Core Process

1. **Mine comment demand** — recurring questions, pain points, strong emotional reactions; extra weight on topics user replied to extensively
2. **Analyze historical performance** — topic distribution, content types, engagement metrics
3. **Assess semantic freshness** — fatigue risk scores, days-since-last-similar-post
4. **External validation** — classify candidates: Green (recommend) / Yellow (reframe needed) / Red (too saturated)

## Output Per Topic

- Source and reasoning
- Related historical posts
- External freshness status
- Self-repetition risk
- Suggested angles
- Contextual notes

## Prerequisites

- `threads_daily_tracker.json` (required; run `/setup` if missing)
- `style_guide.md` and `concept_library.md` (if available)
- Optional: freshness data from `scripts/update_topic_freshness.py`

## Special Handling

- Thin data (< 5 posts): adjust expectations
- Comeback posts (3+ day gap): note context
- Accounts with topic banks: cross-reference before recommending

Log all freshness audits with timestamps and verdicts to `threads_freshness.log`.
