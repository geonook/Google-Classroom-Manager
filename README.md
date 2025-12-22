# Google Classroom Manager 🎓

透過 AI 對話管理 Google Classroom 課程

## 特色

- 🤖 **AI Agent 驅動** - 用自然語言描述需求
- 📚 **批次操作** - 一次處理多個課程
- 👨‍🏫 **成員管理** - 快速新增/移除老師學生
- 🔄 **學年初始化** - 每年開學一鍵設定

## 快速開始

### 需求

- [Node.js](https://nodejs.org/)
- [clasp](https://github.com/google/clasp) - `npm install -g @google/clasp`
- [Cursor](https://cursor.sh/) 或其他 AI IDE

### 使用方式

1. 在 Cursor 中開啟專案
2. 用自然語言描述需求，例如：
   - 「把 Carole 加進 G5 課程」
   - 「建立新學年課程」
3. AI 會修改程式碼並部署
4. 到 Google Apps Script 執行函數

## 專案結構

```
├── CLAUDE.md          # AI 記憶體（核心）
├── data/              # 資料檔案（AI 可讀寫）
├── workflows/         # 工作流程定義
└── src/               # GAS 程式碼
```

## 授權

MIT License
