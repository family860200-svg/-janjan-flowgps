#!/usr/bin/env python3
import http.server
import json
import os
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent
PORT = 3737


def today_prefix():
    now = datetime.now()
    return now.strftime("%y%m%d")  # e.g. 260403


def parse_todos(md):
    sections = []
    current = None
    for line in md.splitlines():
        if line.startswith("## "):
            if current:
                sections.append(current)
            current = {"title": line[3:].strip(), "items": []}
        elif current:
            indent = 1 if line.startswith("  - ") else 0
            stripped = line.strip()
            if stripped.startswith("- [ ]"):
                text = re.sub(r"^- \[ \]\s*", "", stripped)
                current["items"].append({"done": False, "text": text, "indent": indent})
            elif stripped.startswith("- [x]"):
                text = re.sub(r"^- \[x\]\s*", "", stripped)
                current["items"].append({"done": True, "text": text, "indent": indent})
            elif stripped.startswith("- ~~") or stripped.startswith("~~"):
                text = stripped.replace("~~", "").replace("- ", "", 1).strip()
                current["items"].append({"done": True, "text": text, "indent": indent})
    if current:
        sections.append(current)
    return sections


def get_today_summary():
    prefix = today_prefix()
    d = ROOT / "F｜行動聚焦漏斗" / "對話摘要"
    if not d.exists():
        return None
    files = sorted([f for f in d.iterdir() if f.name.startswith(prefix)])
    if not files:
        return None
    return files[-1].read_text(encoding="utf-8")


def get_manual_notes():
    f = ROOT / "F｜行動聚焦漏斗" / "manual_notes.json"
    if not f.exists():
        return []
    try:
        data = json.loads(f.read_text(encoding="utf-8"))
        return data.get(today_prefix(), [])
    except Exception:
        return []


def save_manual_note(note):
    f = ROOT / "F｜行動聚焦漏斗" / "manual_notes.json"
    data = {}
    if f.exists():
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            pass
    key = today_prefix()
    if key not in data:
        data[key] = []
    data[key].insert(0, {
        "text": note,
        "time": datetime.now().strftime("%H:%M")
    })
    f.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # quiet

    def send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors()
        self.end_headers()

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            html = (Path(__file__).parent / "dashboard.html").read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_cors()
            self.end_headers()
            self.wfile.write(html)
            return

        if self.path == "/api/data":
            todo_file = ROOT / "F｜行動聚焦漏斗" / "玩家待辦任務.md"
            md = todo_file.read_text(encoding="utf-8")
            now = datetime.now()
            weekdays = ["一", "二", "三", "四", "五", "六", "日"]
            wday = weekdays[now.weekday()]
            date_str = f"{now.year} 年 {now.month} 月 {now.day} 日（週{wday}）"
            payload = {
                "todos": parse_todos(md),
                "summary": get_today_summary(),
                "notes": get_manual_notes(),
                "date": date_str,
            }
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_cors()
            self.end_headers()
            self.wfile.write(body)
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/note":
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            try:
                data = json.loads(raw)
                note = data.get("note", "").strip()
                if note:
                    save_manual_note(note)
            except Exception:
                pass
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_cors()
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
            return

        self.send_response(404)
        self.end_headers()


if __name__ == "__main__":
    server = http.server.HTTPServer(("localhost", PORT), Handler)
    print(f"✅ FlowGPS 日報啟動：http://localhost:{PORT}")
    print("按 Ctrl+C 停止")
    server.serve_forever()
