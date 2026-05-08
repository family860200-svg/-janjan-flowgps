# AK-Threads-Booster: Refresh Module

Pull latest posts, metrics, and comments into `threads_daily_tracker.json`.

## Source Priority

1. **Threads API** (preferred) — run `python scripts/update_snapshots.py`
2. **Chrome MCP** (fallback) — scrape logged-in profile if no API token

## Execution Modes

**Interactive**: user confirmations allowed during live sessions.

**Headless** (`--headless` or scheduler-triggered): no questions, read from tracker state, fail within bounded time.

Headless args: `--handle @name`, `--max-posts N`, `--max-minutes N`, `--force`, `--log-file PATH`

## Chrome Preconditions

- Chrome MCP tools callable
- Threads logged in
- Logged-in account matches target handle
- Handle is known

## Chrome Steps

1. Load/create tracker; record existing post IDs and `last_updated`
2. Navigate to profile; confirm handle match
3. Run selector health check (abort if zero posts + login wall)
4. Scroll and collect until no new load / max / timeout
5. Extract: ID, text, timestamp, permalink, media, metrics
6. For new/changed-reply posts: open permalink, extract replies, flag author replies
7. Move expired prediction placeholders to `discarded_drafts[]`
8. Merge: existing posts update metrics + snapshot; new posts insert; replies append
9. Backup → write merged → regenerate companions
10. Report: posts scraped, replies added, performance windows, confidence level

## Failure Logging (headless)

```json
{"ts":"<ISO>","ok":false,"reason":"<code>","detail":"<short>"}
```
Codes: `login_wall`, `selector_health_failed`, `timeout`, `backup_failed`
