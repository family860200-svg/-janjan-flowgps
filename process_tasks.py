import re
import os
import datetime

# Read the file
with open('/Users/user/-janjan-flowgps/F｜行動聚焦漏斗/玩家待辦任務.md', 'r') as f:
    lines = f.readlines()

new_lines = []
archived_lines = []

for line in lines:
    stripped = line.strip()
    # Check if completed
    if stripped.startswith('- [x]') or stripped.startswith('- [X]') or '- [x]' in stripped or '- [X]' in stripped or '~~' in stripped:
        if stripped.startswith('- [ ]') and '~~' not in stripped:
             # Wait, if it's - [ ] it's not completed unless it has strikethrough
             new_lines.append(line)
        elif stripped.startswith('- [X] ~~⭐ **機車三台五個險種**'):
            # Special case for line 62
            archived_lines.append(line)
            new_lines.append('  - [ ] 簽名回傳（260429 處理）\n')
        else:
            archived_lines.append(line)
    else:
        new_lines.append(line)

# Clean up empty sections? (Optional)

with open('/Users/user/-janjan-flowgps/F｜行動聚焦漏斗/玩家待辦任務.md', 'w') as f:
    f.writelines(new_lines)

today_str = datetime.datetime.now().strftime("%y%m%d")
archive_path = f'/Users/user/-janjan-flowgps/W｜八大財富積累/歸檔待辦/{today_str}_歸檔.md'
archive_content = f"> 清簡自動歸檔，來源：玩家待辦任務.md\n> 歸檔時間：2026-05-01\n\n" + "".join(archived_lines)
with open(archive_path, 'w') as f:
    f.write(archive_content)

print(f"Archived {len(archived_lines)} items to {today_str}_歸檔.md")
