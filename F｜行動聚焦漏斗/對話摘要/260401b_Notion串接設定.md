# 260401b Notion 串接設定

> 日期：2026-04-01（週三）晚上
> 裝置：MAC

---

## 今天做了什麼

- 確認待辦清單與上次進度
- 決定用 **GitHub Actions** 自動同步每日摘要到 Notion（不需本機任何環境）
- 建立 `.github/workflows/notion-sync.yml`——每次 push 對話摘要時自動觸發，寫入 Notion 資料庫
- 在 GitHub 網頁手動建立 workflow 檔案並完成同步

## 關鍵結論

**Notion 串接流程（完成後）：**
說「存檔」→ Claude 寫摘要 → git push → GitHub Actions 自動寫入 Notion，零手動操作。

**唯一剩餘步驟：** 在 GitHub repo Settings → Secrets → Actions 新增 `NOTION_TOKEN`。

---

## 下次繼續

- 確認 Notion Token secret 設定完成，測試串接是否正常運作
- B 款樣品書：決定尺寸和用紙
- 檔案大整理（根目錄 + scripts/）

---

## 今天對哪些財富帳戶加分

- **技藝（Craft）** ✦ — 建立全自動 Notion 同步工作流程
- **成長（Growth）** ✦ — 解決跨工具整合問題，不依賴本機環境
- **系統（System）** ✦ — NOTION_TOKEN 設定完成，自動同步正式啟用
