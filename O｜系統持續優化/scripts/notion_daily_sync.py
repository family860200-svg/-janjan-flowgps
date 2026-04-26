#!/usr/bin/env python3
"""每日存檔後同步對話摘要到 Notion 當日頁面。"""

import os
import sys
import datetime
import glob
import httpx

NOTION_VERSION = "2022-06-28"
WORKSPACE = "/Users/user/-janjan-flowgps"


def get_headers():
    token = os.getenv("NOTION_TOKEN") or os.getenv("NOTION_API_KEY")
    if not token:
        print("❌ 找不到 NOTION_TOKEN，請確認 ~/.claude/secrets/.env", file=sys.stderr)
        sys.exit(1)
    return {
        "Authorization": f"Bearer {token}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


def find_today_page(headers):
    today = datetime.date.today().isoformat()  # 2026-04-25
    r = httpx.post(
        "https://api.notion.com/v1/search",
        headers=headers,
        json={"query": today, "page_size": 5},
    )
    r.raise_for_status()
    for item in r.json().get("results", []):
        if item["object"] != "page":
            continue
        props = item.get("properties", {})
        for p in props.values():
            if p.get("type") == "title":
                texts = p.get("title", [])
                title = texts[0].get("plain_text", "") if texts else ""
                if today in title:
                    return item["id"]
    return None


def read_today_summary():
    today = datetime.date.today().strftime("%y%m%d")  # 260425
    pattern = os.path.join(WORKSPACE, f"F｜行動聚焦漏斗/對話摘要/{today}_*.md")
    files = sorted(glob.glob(pattern))
    if not files:
        return None, None
    latest = files[-1]
    with open(latest, "r", encoding="utf-8") as f:
        return latest, f.read()


def build_blocks(filename, content):
    name = os.path.basename(filename)
    now = datetime.datetime.now().strftime("%H:%M")
    blocks = [
        {
            "object": "block",
            "type": "divider",
            "divider": {},
        },
        {
            "object": "block",
            "type": "callout",
            "callout": {
                "rich_text": [{"type": "text", "text": {"content": f"🤖 FlowGPS 存檔同步｜{now}｜{name}"}}],
                "icon": {"emoji": "📦"},
                "color": "gray_background",
            },
        },
    ]

    for line in content.splitlines():
        stripped = line.strip()
        if not stripped:
            blocks.append({"object": "block", "type": "paragraph", "paragraph": {"rich_text": []}})
            continue

        if stripped.startswith("# "):
            blocks.append({
                "object": "block", "type": "heading_2",
                "heading_2": {"rich_text": [{"type": "text", "text": {"content": stripped[2:]}}]},
            })
        elif stripped.startswith("## "):
            blocks.append({
                "object": "block", "type": "heading_3",
                "heading_3": {"rich_text": [{"type": "text", "text": {"content": stripped[3:]}}]},
            })
        elif stripped.startswith("- ") or stripped.startswith("* "):
            blocks.append({
                "object": "block", "type": "bulleted_list_item",
                "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": stripped[2:]}}]},
            })
        else:
            # Notion 單一 rich_text 最多 2000 字
            text = stripped[:2000]
            blocks.append({
                "object": "block", "type": "paragraph",
                "paragraph": {"rich_text": [{"type": "text", "text": {"content": text}}]},
            })

    return blocks


def append_to_page(page_id, blocks, headers):
    # Notion API 每次最多 100 blocks
    for i in range(0, len(blocks), 100):
        chunk = blocks[i:i + 100]
        r = httpx.patch(
            f"https://api.notion.com/v1/blocks/{page_id}/children",
            headers=headers,
            json={"children": chunk},
        )
        r.raise_for_status()


def main():
    headers = get_headers()

    filename, content = read_today_summary()
    if not content:
        print("⚠️  今日無對話摘要，略過 Notion 同步")
        return

    page_id = find_today_page(headers)
    if not page_id:
        print(f"⚠️  Notion 找不到今日頁面（{datetime.date.today().isoformat()}），略過同步")
        return

    blocks = build_blocks(filename, content)
    append_to_page(page_id, blocks, headers)
    print(f"✅ 已同步到 Notion｜{os.path.basename(filename)}｜{len(blocks)} 個 blocks")


if __name__ == "__main__":
    main()
