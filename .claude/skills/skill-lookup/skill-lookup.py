#!/usr/bin/env python3
"""
SkillsMP Agent Skills 搜尋與推薦系統

使用 SkillsMP API 搜尋和推薦 agent skills
"""

import sys
import json
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path


class InstalledSkillsChecker:
    """檢查已安裝的 Skills 和 MCP"""

    @staticmethod
    def get_installed_skills():
        """取得已安裝的 skills 列表"""
        skills_dir = Path(".claude/skills")
        if not skills_dir.exists():
            return []

        return sorted([d.name for d in skills_dir.iterdir() if d.is_dir() and not d.name.startswith(".")])

    @staticmethod
    def find_related_skills(query):
        """根據查詢詞找相關的已安裝 skills"""
        installed = InstalledSkillsChecker.get_installed_skills()
        if not installed:
            return []

        # 關鍵字對應（可依自己的 skills 庫調整）
        keywords = {
            "testing": ["web-testing", "playwright-skill", "unit-test-reporter"],
            "mobile": ["device-testing"],
            "web": ["web-design-guidelines", "frontend-design"],
            "automation": ["github-tracker", "n8n-workflow-patterns"],
            "documentation": ["beautiful-mermaid"],
            "ui": ["frontend-design", "web-design-guidelines"],
            "skill": ["skill-lookup", "solution-scout"],
            "development": ["dev-lookup", "backend-architecture"],
            "content": ["threads-writer", "youtube-smart-transcript"],
            "tracking": ["subscription-tracker", "github-tracker"],
        }

        related = []
        query_lower = query.lower()

        for keyword, skill_list in keywords.items():
            if keyword in query_lower:
                related.extend([s for s in skill_list if s in installed])

        return list(set(related))  # 去重


class SkillsMP:
    """SkillsMP API 客戶端"""

    BASE_URL = "https://skillsmp.com/api/v1"

    def __init__(self, api_key=None):
        """初始化 API 客戶端"""
        if api_key:
            self.api_key = api_key
        else:
            # 從 .claude/secrets/.env 讀取 API key
            self.api_key = self._load_api_key()

        if not self.api_key:
            raise ValueError("❌ 找不到 SKILLSMP_API_KEY，請設定在 .claude/secrets/.env")

    def _load_api_key(self):
        """從 .env 檔案載入 API key"""
        env_file = Path(".claude/secrets/.env")
        if not env_file.exists():
            return None

        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line.startswith("SKILLSMP_API_KEY="):
                    return line.split("=", 1)[1].strip()
        return None

    def _make_request(self, endpoint, params=None):
        """發送 HTTP 請求"""
        url = f"{self.BASE_URL}{endpoint}"

        if params:
            url += "?" + urllib.parse.urlencode(params)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "User-Agent": "skill-lookup/1.0"
        }

        req = urllib.request.Request(url, headers=headers)

        try:
            with urllib.request.urlopen(req) as response:
                data = response.read().decode('utf-8')
                return json.loads(data)
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            try:
                error_data = json.loads(error_body)
                raise Exception(f"API Error: {error_data.get('error', {}).get('message', 'Unknown error')}")
            except json.JSONDecodeError:
                raise Exception(f"HTTP Error {e.code}: {error_body}")
        except Exception as e:
            raise Exception(f"Request failed: {str(e)}")

    def ai_search(self, query):
        """AI 語義搜尋"""
        return self._make_request("/skills/ai-search", {"q": query})

    def search(self, query, page=1, limit=20, sort_by=None):
        """關鍵字搜尋"""
        params = {"q": query, "page": page, "limit": limit}
        if sort_by:
            params["sortBy"] = sort_by
        return self._make_request("/skills/search", params)


class SkillsSh:
    """Skills.sh 爬蟲客戶端（真實 Installs 數據）"""

    BASE_URL = "https://skills.sh"

    @staticmethod
    def parse_markdown(markdown_text):
        """解析 Skills.sh Markdown 格式的排行榜數據"""
        import re

        skills = []

        pattern = r'\[(\d+)[\s\S]*?\*\*([\w:\-]+)\*\*[\s\S]*?([\w\-]+/[\w\-]+)[\s\S]*?(\d+(?:\.\d+)?[KM])\]\((https://skills\.sh/[\w\-/]+)\)'

        matches = re.findall(pattern, markdown_text)

        for match in matches:
            rank = int(match[0])
            skill_name = match[1]
            repo = match[2]
            installs = match[3]
            skill_url = match[4]
            github_url = f"https://github.com/{repo}"

            skills.append({
                'rank': rank,
                'name': skill_name,
                'repository': repo,
                'installs': installs,
                'url': skill_url,
                'github_url': github_url
            })

        return skills

    def get_leaderboard_url(self, board_type=''):
        """獲取排行榜 URL"""
        return f"{self.BASE_URL}/{board_type}".rstrip('/')


def _quality_label(installs, source_repo):
    """根據安裝量和來源給品質標注"""
    trusted_orgs = {"vercel-labs", "anthropics", "microsoft", "composiohq", "remotion-dev"}
    org = source_repo.split("/")[0].lower() if "/" in source_repo else ""

    # 解析安裝量數字
    install_num = 0
    try:
        if isinstance(installs, str):
            if installs.endswith("M"):
                install_num = float(installs[:-1]) * 1_000_000
            elif installs.endswith("K"):
                install_num = float(installs[:-1]) * 1_000
            else:
                install_num = float(installs)
        else:
            install_num = float(installs)
    except (ValueError, AttributeError):
        install_num = 0

    if install_num < 100:
        return f"❌ 不推薦（{installs} installs，低於安全門檻）"
    elif install_num < 1000 or org not in trusted_orgs:
        return f"⚠️ 謹慎評估（{installs} installs，{'非知名來源' if org not in trusted_orgs else '安裝量偏低'}）"
    else:
        label = "官方" if org in trusted_orgs else "高下載"
        return f"✅ 官方優質（{installs} installs，{org} {label}）"


def format_skill(skill, index=None):
    """格式化單個 skill 的輸出"""
    from datetime import datetime

    prefix = f"### {index}. " if index else "### "

    name = skill.get('name', 'Unknown')
    stars = skill.get('stars', 0)
    downloads = skill.get('downloads', 0)
    description = skill.get('description', 'No description')

    github_url = skill.get('githubUrl', '')
    skill_url = skill.get('skillUrl', github_url)

    if github_url:
        parts = github_url.replace('https://github.com/', '').split('/')
        repo = f"{parts[0]}/{parts[1]}" if len(parts) >= 2 else 'unknown/unknown'
    else:
        repo = skill.get('author', 'unknown') + '/unknown'

    url = skill_url or f"https://github.com/{repo}"

    updated_raw = skill.get('updatedAt', skill.get('lastUpdated', 'Unknown'))
    try:
        updated = datetime.fromtimestamp(int(updated_raw)).strftime('%Y-%m-%d')
    except (ValueError, TypeError):
        updated = updated_raw if updated_raw != 'Unknown' else 'Unknown'

    title_parts = [f"{prefix}[{name}]"]
    if stars > 0:
        title_parts.append(f"⭐ {stars:,}")
    if downloads > 0:
        title_parts.append(f"📥 {downloads:,}")

    clone_url = github_url or f"https://github.com/{repo}"
    repo_name = repo.split('/')[-1] if repo != 'unknown/unknown' else name

    quality = _quality_label(downloads or 0, repo)

    output = [
        " ".join(title_parts),
        f"**來源**：{repo}",
        f"**描述**：{description}",
        f"**更新**：{updated}",
        f"**品質**：{quality}",
        f"**SkillsMP**：{url}",
        f"**GitHub**：{clone_url}",
        "",
        "**安裝方式**：",
        "```bash",
        f"npx skills add {repo}@{name}",
        "```",
        "",
        "---",
        ""
    ]

    return "\n".join(output)


def cmd_ai_search(client, query, limit=5):
    """執行 AI 搜尋命令"""
    print(f"🔍 使用 AI 語義搜尋：「{query}」\n")

    related_skills = InstalledSkillsChecker.find_related_skills(query)
    if related_skills:
        print("✅ **你已安裝的相關工具**：\n")
        for skill in related_skills:
            print(f"  • `{skill}`")
        print("\n💡 **建議**：先嘗試使用上面的工具，或繼續搜尋其他選項\n")
        print("---\n")

    try:
        result = client.ai_search(query)

        if not result.get('success'):
            print(f"❌ 搜尋失敗：{result.get('error', {}).get('message', 'Unknown error')}")
            return

        skills = result.get('data', {}).get('skills', [])

        if not skills:
            print("❌ 沒有找到相關 skills\n")
            print("💡 沒有找到？試試：")
            print("  1. 我還是可以直接幫你做這件事，告訴我你想做什麼")
            print("  2. 自建 skill：`npx skills init my-skill-name`")
            return

        skills = skills[:limit]
        print(f"## 🎯 找到 {len(skills)} 個最相關的 Skills\n")

        for i, skill in enumerate(skills, 1):
            print(format_skill(skill, i))

        print(f"\n💡 **提示**：安裝前請先 review 代碼確保安全性")

    except Exception as e:
        print(f"❌ 錯誤：{str(e)}")
        sys.exit(1)


def cmd_search(client, query, page=1, limit=20, sort_by=None):
    """執行關鍵字搜尋命令"""
    sort_label = {
        'stars': '按 Stars 排序',
        'recent': '按最近更新排序',
        'downloads': '按下載量排序'
    }.get(sort_by, '')

    search_desc = f"🔍 關鍵字搜尋：「{query}」{(' (' + sort_label + ')') if sort_label else ''}\n"
    print(search_desc)

    related_skills = InstalledSkillsChecker.find_related_skills(query)
    if related_skills:
        print("✅ **你已安裝的相關工具**：\n")
        for skill in related_skills:
            print(f"  • `{skill}`")
        print("\n💡 **建議**：先嘗試使用上面的工具，或繼續搜尋其他選項\n")
        print("---\n")

    try:
        result = client.search(query, page, limit, sort_by)

        if not result.get('success'):
            print(f"❌ 搜尋失敗：{result.get('error', {}).get('message', 'Unknown error')}")
            return

        data = result.get('data', {})
        skills = data.get('skills', [])
        total = data.get('total', 0)

        if not skills:
            print("❌ 沒有找到相關 skills\n")
            print("💡 沒有找到？試試：")
            print("  1. 我還是可以直接幫你做這件事，告訴我你想做什麼")
            print("  2. 自建 skill：`npx skills init my-skill-name`")
            return

        print(f"## 📋 找到 {total} 個 Skills（顯示前 {len(skills)} 個）\n")

        for i, skill in enumerate(skills, 1):
            print(format_skill(skill, i))

        print(f"\n💡 **提示**：")
        print(f"  - 使用 `--limit N` 調整顯示數量")
        print(f"  - 使用 `--sort stars|recent|downloads` 排序")

    except Exception as e:
        print(f"❌ 錯誤：{str(e)}")
        sys.exit(1)


def cmd_categories():
    """顯示所有分類"""
    categories = {
        "tools": {"name": "Tools", "count": 30714},
        "development": {"name": "Development", "count": 26963},
        "data-ai": {"name": "Data & AI", "count": 17698},
        "business": {"name": "Business", "count": 16230},
        "devops": {"name": "DevOps", "count": 14793},
        "testing-security": {"name": "Testing & Security", "count": 11166},
        "content-media": {"name": "Content & Media", "count": 7831},
        "documentation": {"name": "Documentation", "count": 7764},
        "research": {"name": "Research", "count": 3931},
        "databases": {"name": "Databases", "count": 2038},
        "lifestyle": {"name": "Lifestyle", "count": 1631},
        "blockchain": {"name": "Blockchain", "count": 1025}
    }

    print("## 📂 SkillsMP 分類\n")

    for key, info in categories.items():
        print(f"- **{info['name']}**: {info['count']:,} skills")
        print(f"  URL: https://skillsmp.com/categories/{key}")
        print()


def cmd_top(client, category=None, limit=20, sort_by='downloads'):
    """顯示熱門 skills 排行榜"""
    if category:
        print(f"🏆 {category} 分類熱門排行（按{sort_by}）\n")
        query = category
    else:
        print(f"🏆 全站熱門排行（按{sort_by}）\n")
        query = "*"

    try:
        result = client.search(query, page=1, limit=limit, sort_by=sort_by)

        if not result.get('success'):
            print(f"❌ 搜尋失敗：{result.get('error', {}).get('message', 'Unknown error')}")
            return

        data = result.get('data', {})
        skills = data.get('skills', [])

        if not skills:
            print("❌ 沒有找到 skills")
            return

        print(f"## 🎯 Top {len(skills)} Skills\n")

        for i, skill in enumerate(skills, 1):
            print(format_skill(skill, i))

    except Exception as e:
        print(f"❌ 錯誤：{str(e)}")
        sys.exit(1)


def format_skill_sh(skill, index=None):
    """格式化 Skills.sh 的 skill 輸出"""
    prefix = f"### {index}. " if index else "### "

    name = skill.get('name', 'Unknown')
    repo = skill.get('repository', 'unknown/unknown')
    installs = skill.get('installs', '0')
    url = skill.get('github_url', f"https://github.com/{repo}")
    skill_url = skill.get('url', '')

    quality = _quality_label(installs, repo)

    output = [
        f"{prefix}[{name}] 📥 {installs} installs",
        f"**來源**：{repo}",
        f"**品質**：{quality}",
        f"**Skills.sh**：{skill_url}",
        f"**GitHub**：{url}",
        "",
        "**安裝方式**：",
        "```bash",
        f"npx skills add {repo}@{name}",
        "```",
        "",
        "---",
        ""
    ]

    return "\n".join(output)


def cmd_trending(limit=50, markdown_file=None):
    """顯示 Skills.sh 24h Trending"""
    print("🔥 Skills.sh 24h Trending（按 Installs）\n")

    try:
        if markdown_file:
            with open(markdown_file, 'r', encoding='utf-8') as f:
                markdown_text = f.read()
        else:
            print("⚠️ 此功能需要先使用 Firecrawl 抓取數據")
            print(f"\n請執行以下步驟：")
            print(f"  1. 在 Claude 對話中說：「幫我抓取 Skills.sh Trending」")
            print(f"  2. Claude 會自動使用 Firecrawl 並顯示結果")
            return

        skills = SkillsSh.parse_markdown(markdown_text)

        if not skills:
            print("❌ 無法解析 Trending 數據")
            return

        skills = skills[:limit]
        print(f"## 🎯 Top {len(skills)} Trending Skills (24h)\n")

        for i, skill in enumerate(skills, 1):
            print(format_skill_sh(skill, i))

        print(f"\n💡 **數據來源**：Skills.sh（真實 Installs 數據）")

    except Exception as e:
        print(f"❌ 錯誤：{str(e)}")
        sys.exit(1)


def cmd_hot(limit=50, markdown_file=None):
    """顯示 Skills.sh Hot Skills"""
    print("🔥 Skills.sh Hot Skills\n")

    try:
        if markdown_file:
            with open(markdown_file, 'r', encoding='utf-8') as f:
                markdown_text = f.read()
        else:
            print("⚠️ 此功能需要先使用 Firecrawl 抓取數據")
            print(f"\n請執行以下步驟：")
            print(f"  1. 在 Claude 對話中說：「幫我抓取 Skills.sh Hot」")
            print(f"  2. Claude 會自動使用 Firecrawl 並顯示結果")
            return

        skills = SkillsSh.parse_markdown(markdown_text)

        if not skills:
            print("❌ 無法解析 Hot 數據")
            return

        skills = skills[:limit]
        print(f"## 🎯 Top {len(skills)} Hot Skills\n")

        for i, skill in enumerate(skills, 1):
            print(format_skill_sh(skill, i))

        print(f"\n💡 **數據來源**：Skills.sh（真實 Installs 數據）")

    except Exception as e:
        print(f"❌ 錯誤：{str(e)}")
        sys.exit(1)


def cmd_top_installs(limit=50, markdown_file=None):
    """顯示 Skills.sh All Time Top（按 Installs）"""
    print("🏆 Skills.sh All Time Top（按真實 Installs）\n")

    try:
        if markdown_file:
            with open(markdown_file, 'r', encoding='utf-8') as f:
                markdown_text = f.read()
        else:
            print("⚠️ 此功能需要先使用 Firecrawl 抓取數據")
            print(f"\n請執行以下步驟：")
            print(f"  1. 在 Claude 對話中說：「給我看 Skills.sh Top 排行榜」")
            print(f"  2. Claude 會自動使用 Firecrawl 並顯示結果")
            return

        skills = SkillsSh.parse_markdown(markdown_text)

        if not skills:
            print("❌ 無法解析排行榜數據")
            return

        skills = skills[:limit]
        print(f"## 🎯 Top {len(skills)} Skills (All Time)\n")

        for i, skill in enumerate(skills, 1):
            print(format_skill_sh(skill, i))

        print(f"\n💡 **數據來源**：Skills.sh（真實 Installs 數據，20,598 skills）")

    except Exception as e:
        print(f"❌ 錯誤：{str(e)}")
        sys.exit(1)


def print_usage():
    """顯示使用說明"""
    usage = """
🔍 Skill Lookup Tool（三數據源整合）

📊 數據來源：
  - SkillsMP：91,908 skills（搜尋功能，需 API key）
  - Skills.sh：20,592 skills（真實 Installs 排行榜）
  - npx skills CLI：官方 CLI，免 API key

用法：
  # SkillsMP（搜尋）
  python skill-lookup.py ai <query>          # AI 語義搜尋（推薦）
  python skill-lookup.py search <query>      # 關鍵字搜尋
  python skill-lookup.py top                 # 熱門排行榜（by stars）
  python skill-lookup.py categories          # 列出所有分類

  # Skills.sh（真實 Installs 排行榜）
  python skill-lookup.py trending            # 24h Trending（by Installs）
  python skill-lookup.py hot                 # Hot Skills（by Installs）
  python skill-lookup.py top-installs        # All Time Top（by Installs）

選項：
  --limit N        限制結果數量（預設：AI=5, search=20, 排行榜=50）
  --sort stars     按 stars 排序
  --sort recent    按最近更新排序
  --sort downloads 按下載量排序
  --page N         分頁（只適用於 search）
  --category X     限定分類（只適用於 top）

範例：
  python skill-lookup.py ai "幫我自動化 GitHub PR 流程"
  python skill-lookup.py search "productivity" --limit 10 --sort stars
  python skill-lookup.py top --limit 20 --sort stars
  python skill-lookup.py trending --limit 20
  python skill-lookup.py top-installs --limit 50
  python skill-lookup.py categories
"""
    print(usage)


def main():
    """主程式"""
    if len(sys.argv) < 2:
        print_usage()
        sys.exit(1)

    command = sys.argv[1]

    if command == "categories":
        cmd_categories()
        return

    if command in ["trending", "hot", "top-installs"]:
        limit = 50
        markdown_file = None

        i = 2
        while i < len(sys.argv):
            if sys.argv[i] == "--limit" and i + 1 < len(sys.argv):
                limit = int(sys.argv[i + 1])
                i += 2
            elif sys.argv[i] == "--markdown-file" and i + 1 < len(sys.argv):
                markdown_file = sys.argv[i + 1]
                i += 2
            else:
                i += 1

        if command == "trending":
            cmd_trending(limit, markdown_file)
        elif command == "hot":
            cmd_hot(limit, markdown_file)
        elif command == "top-installs":
            cmd_top_installs(limit, markdown_file)

        return

    if command == "top":
        limit = 20
        sort_by = 'downloads'
        category = None

        i = 2
        while i < len(sys.argv):
            if sys.argv[i] == "--limit" and i + 1 < len(sys.argv):
                limit = int(sys.argv[i + 1])
                i += 2
            elif sys.argv[i] == "--sort" and i + 1 < len(sys.argv):
                sort_by = sys.argv[i + 1]
                i += 2
            elif sys.argv[i] == "--category" and i + 1 < len(sys.argv):
                category = sys.argv[i + 1]
                i += 2
            else:
                i += 1

        try:
            client = SkillsMP()
        except ValueError as e:
            print(str(e))
            sys.exit(1)

        cmd_top(client, category, limit, sort_by)
        return

    if command not in ["ai", "search"]:
        print(f"❌ 未知命令：{command}")
        print_usage()
        sys.exit(1)

    if len(sys.argv) < 3:
        print(f"❌ 缺少查詢字串")
        print_usage()
        sys.exit(1)

    query = sys.argv[2]

    limit = None
    sort_by = None
    page = 1

    i = 3
    while i < len(sys.argv):
        if sys.argv[i] == "--limit" and i + 1 < len(sys.argv):
            limit = int(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == "--sort" and i + 1 < len(sys.argv):
            sort_by = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--page" and i + 1 < len(sys.argv):
            page = int(sys.argv[i + 1])
            i += 2
        else:
            i += 1

    try:
        client = SkillsMP()
    except ValueError as e:
        print(str(e))
        sys.exit(1)

    if command == "ai":
        cmd_ai_search(client, query, limit or 5)
    elif command == "search":
        cmd_search(client, query, page, limit or 20, sort_by)


if __name__ == "__main__":
    main()
