# Claude 觸發設定

## 自動觸發規則

### 「日報」指令
當使用者輸入包含「日報」關鍵字時，自動讀取並執行以下 workflow：

```
Ｚ 系統/workflows/daily-report.md
```

執行方式：讀取該 markdown 檔案的完整內容，依照其中的步驟逐步執行。
