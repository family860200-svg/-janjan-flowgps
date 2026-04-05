import os
import datetime
import subprocess
import json
import re
from notion_client import Client

# --- 設定路徑 ---
WORKSPACE_PATH = "/Users/user/Documents/My Second Brain"
CONFIG_PATH = os.path.join(WORKSPACE_PATH, "scripts/config.json")

# --- 載入設定 ---
with open(CONFIG_PATH, "r") as f:
    config = json.load(f)
    NOTION_TOKEN = config.get("NOTION_TOKEN")
    DATABASE_ID = config.get("DATABASE_ID")

notion = Client(auth=NOTION_TOKEN)

def sync_git_repo():
    """執行自動同步（Pull 來自公司電腦的更新，並 Push 本機變動）"""
    os.chdir(WORKSPACE_PATH)
    status_msg = "✅ 本機已是最新狀態"
    try:
        # 1. Fetch & Pull
        subprocess.check_output(["git", "fetch", "origin"])
        pull_res = subprocess.check_output(["git", "pull", "origin", "main", "--rebase"]).decode('utf-8')
        if "Already up to date" not in pull_res:
            status_msg = "📥 已同步公司電腦最新進度"
        
        # 2. Add, Commit, Push (將今日變動同步回雲端)
        # 檢查是否有變動需要提交
        status = subprocess.check_output(["git", "status", "--porcelain"]).decode('utf-8').strip()
        if status:
            subprocess.check_output(["git", "add", "."])
            subprocess.check_output(["git", "commit", "-m", f"auto: nightly sync and flow summary {datetime.datetime.now().strftime('%H:%M')}"])
            subprocess.check_output(["git", "push", "origin", "main"])
            status_msg += " & 🚀 已同步回報至雲端"
            
        return status_msg
    except Exception as e:
        return f"⚠️ 同步發生異常: {str(e)}"

def get_today_timeline():
    """獲取今日 Git Commit 紀錄並整理成時間線"""
    os.chdir(WORKSPACE_PATH)
    try:
        # 取得今日 Commit (包含雜湊與主旨)
        git_cmd = ["git", "log", "--since=midnight", "--format=%ad | %s", "--date=format:%H:%M"]
        git_log = subprocess.check_output(git_cmd).decode('utf-8').strip()
        if not git_log:
            return []
        
        # 整理成列表
        timeline = []
        for line in git_log.splitlines():
            timeline.append(f"[{line.split(' | ')[0]}] {line.split(' | ')[1]}")
        return timeline
    except Exception as e:
        print(f"無法讀取 Git 紀錄: {e}")
        return []

def extract_achievements_from_files():
    """從今日修改過的 Markdown 檔案中尋找對應日期的成就亮點"""
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    achievements = []
    
    os.chdir(WORKSPACE_PATH)
    try:
        # 尋找今日有更動的 .md 檔案
        find_cmd = ["find", ".", "-name", "*.md", "-mtime", "-1", "-not", "-path", "*/.*"]
        files = subprocess.check_output(find_cmd).decode('utf-8').splitlines()
        
        for f_path in files:
            f_path = f_path.strip()
            if not os.path.isfile(f_path):
                continue
            
            with open(f_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                # 尋找符合 "* 2026-03-28: 內容" 或 "- 2026-03-28: 內容" 的行
                pattern = rf"[\*\-]\s+{re.escape(today_str)}:\s+(.*)"
                matches = re.findall(pattern, content)
                for m in matches:
                    if m.strip():
                        achievements.append(m.strip())
    except Exception as e:
        print(f"提取成就失敗: {e}")
    
    return list(set(achievements)) # 去重

def get_modified_files():
    """獲取今日編輯過的檔案名稱列表"""
    os.chdir(WORKSPACE_PATH)
    try:
        find_cmd = ["find", ".", "-mtime", "-1", "-not", "-path", "*/.*"]
        files = subprocess.check_output(find_cmd).decode('utf-8').splitlines()
        return [f.replace('./', '') for f in files if os.path.isfile(f)]
    except:
        return []

def find_today_page():
    """在 Notion 資料庫中尋找或建立今天的頁面"""
    today_str = datetime.date.today().isoformat()
    try:
        db = notion.databases.retrieve(database_id=DATABASE_ID)
        sources = db.get("data_sources", [])
        if not sources:
            return None
        
        source_id = sources[0]["id"]
        
        response = notion.data_sources.query(
            data_source_id=source_id,
            filter={"property": "日期", "date": {"equals": today_str}}
        )
        if response["results"]:
            return response["results"][0]["id"]
        
        new_page = notion.pages.create(
            parent={"data_source_id": source_id},
            properties={
                "標題": {"title": [{"text": {"content": f"{today_str} 自動存檔" }}]},
                "日期": {"date": {"start": today_str}}
            }
        )
        return new_page["id"]
    except Exception as e:
        print(f"尋找頁面失敗: {e}")
        return None

def write_to_notion(page_id, timeline, achievements, files, sync_status):
    """將結構化內容寫入 Notion"""
    blocks = []
    
    # 標題
    blocks.append({
        "object": "block",
        "type": "heading_2",
        "heading_2": {
            "rich_text": [{"type": "text", "text": {"content": f"📊 {datetime.datetime.now().strftime('%H:%M')} 系統與工作同步回報"}}]
        }
    })
    
    # 0. 同步狀態 (NEW)
    blocks.append({
        "object": "block",
        "type": "callout",
        "callout": {
            "rich_text": [{"type": "text", "text": {"content": f"🔄 同步狀態：{sync_status}"}}],
            "icon": {"emoji": "🤖"}
        }
    })

    # 1. 回顧工作紀錄 (時程表)
    blocks.append({
        "object": "block", "type": "divider", "divider": {}
    })
    blocks.append({
        "object": "block",
        "type": "heading_3",
        "heading_3": {"rich_text": [{"type": "text", "text": {"content": "🕰️ 回顧工作紀錄"}}]}
    })
    if timeline:
        for t in timeline[:15]: # 最多顯示 15 筆
            blocks.append({
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": t}}]}
            })
    else:
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {"rich_text": [{"type": "text", "text": {"content": "今日暫無 Git 紀錄。"}, "annotations": {"italic": True}}]}
        })
        
    # 2. 今日核心成果
    blocks.append({
        "object": "block",
        "type": "heading_3",
        "heading_3": {"rich_text": [{"type": "text", "text": {"content": "✨ 今日核心成果"}}]}
    })
    if achievements:
        for a in achievements:
            blocks.append({
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"type": "text", "text": {"content": f"✅ {a}"}}]
                }
            })
    else:
        # 如果沒抓到成就，可以留一段示範或空行
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {"rich_text": [{"type": "text", "text": {"content": "今日尚未手動標註亮點 (小技巧：在 MD 檔中寫下 * 2026-03-28: [成就] 即可被抓取)"}, "annotations": {"color": "gray"}}]}
        })

    # 3. 異動檔案
    if files:
        blocks.append({
            "object": "block",
            "type": "toggle",
            "toggle": {
                "rich_text": [{"type": "text", "text": {"content": f"📂 相關異動檔案 ({len(files)} 筆)"}}],
                "children": [
                    {
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {"rich_text": [{"type": "text", "text": {"content": "\n".join(files[:20])}}]}
                    }
                ]
            }
        })
    
    try:
        notion.blocks.children.append(block_id=page_id, children=blocks)
        print("工作總結成功上傳 Notion。")
    except Exception as e:
        print(f"上傳 Notion 失敗: {e}")

if __name__ == "__main__":
    # 先執行 Git 同步
    sync_status = sync_git_repo()
    
    timeline = get_today_timeline()
    achievements = extract_achievements_from_files()
    files = get_modified_files()
    
    pid = find_today_page()
    if pid:
        write_to_notion(pid, timeline, achievements, files, sync_status)
    else:
        print("無法執行自動存檔：找不到頁面。")

