import os

search_dir = r"C:\Users\user\Documents\JANJAN x FlowGPS"
keywords = ["客訴流程", "公告", "FAX", "草稿", "親愛的客戶", "為提升", "傳真", "Mail代替", "流程"]

for root, _, files in os.walk(search_dir):
    for f in files:
        if f.endswith(".md"):
            filepath = os.path.join(root, f)
            with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                lines = file.readlines()
                for i, line in enumerate(lines):
                    if "草稿" in line or "公告" in line or "Mail" in line or "MAIL" in line or "客戶" in line:
                        print(f"[{f}:{i}] {line.strip()[:100]}")
