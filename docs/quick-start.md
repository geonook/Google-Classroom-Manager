# 快速開始指南

## 🚀 5 分鐘快速部署

本指南將協助您在 5 分鐘內完成 Google Classroom Manager Pro 的基本設定並開始使用。

## 📋 前置檢查

在開始之前，請確認：
- ✅ 您有 Google Workspace 帳戶（教育版或企業版）
- ✅ 您有 Google Classroom 管理員權限
- ✅ 您可以存取 Google Apps Script
- ✅ 您有 Google Sheets 使用經驗

## ⚡ 快速部署步驟

### 步驟 1: 建立 Google Apps Script 專案 (1 分鐘)

1. 開啟 [Google Apps Script](https://script.google.com)
2. 點選 **新增專案**
3. 將專案命名為 `Google Classroom Manager Pro`
4. 記錄專案 URL 中的 Script ID

### 步驟 2: 設定專案配置 (1 分鐘)

1. 點選 **專案設定** ⚙️
2. 勾選 **在編輯器中顯示 "appsscript.json" 資訊清單檔案**
3. 返回編輯器，點選 `appsscript.json`
4. 替換內容為：

```json
{
  "timeZone": "Asia/Taipei",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Classroom",
        "serviceId": "classroom",
        "version": "v1"
      }
    ]
  },
  "webapp": {
    "access": "ANYONE_ANONYMOUS",
    "executeAs": "USER_DEPLOYING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

### 步驟 3: 部署程式碼 (2 分鐘)

#### 選項 A: 手動複製程式碼（推薦新手）

1. 在編輯器中刪除預設的 `Code.gs`
2. 從我們的 [GitHub 專案](https://github.com/geonook/Google-Classroom-Manager) 複製以下檔案：
   - `src/RateLimiter.js`
   - `src/ErrorHandler.js`
   - `src/ProgressTracker.js`
   - `src/ClassroomService.js`
   - `src/Code.js`

3. 在 Apps Script 中建立對應檔案並貼上程式碼

#### 選項 B: 使用 clasp（推薦開發者）

```bash
# 安裝 clasp
npm install -g @google/clasp

# 登入
clasp login

# Clone 專案
git clone https://github.com/geonook/Google-Classroom-Manager.git
cd Google-Classroom-Manager

# 設定專案 ID
echo '{"scriptId":"YOUR_SCRIPT_ID","rootDir":"./src"}' > .clasp.json

# 推送程式碼
clasp push
```

### 步驟 4: 首次執行與授權 (1 分鐘)

1. 在 Apps Script 編輯器中，選擇 `testInstallation` 函式
2. 點選 **執行**
3. 點選 **檢閱權限**
4. 選擇您的 Google 帳戶
5. 點選 **進階** → **前往 Google Classroom Manager Pro (不安全)**
6. 點選 **允許**

## ✅ 驗證安裝

### 測試基本功能

1. **開啟任一 Google Sheets**
2. **重新整理頁面**
3. **查看選單**：應該看到「Classroom 管理工具」選單
4. **測試功能**：點選「列出所有課程」

如果看到課程列表，恭喜！安裝成功 🎉

### 快速功能測試

```javascript
// 在 Apps Script 編輯器中執行此測試
function quickTest() {
  try {
    // 測試 API 連線
    const courses = Classroom.Courses.list({pageSize: 1});
    Logger.log('✅ API 連線正常');
    
    // 測試系統狀態
    const status = classroomService.getStatus();
    Logger.log('✅ 系統狀態:', status);
    
    return '快速測試通過！';
  } catch (error) {
    Logger.log('❌ 測試失敗:', error.message);
    return '測試失敗: ' + error.message;
  }
}
```

## 🎯 第一次使用

### 1. 列出課程

1. 開啟 Google Sheets
2. 選單 → **Classroom 管理工具** → **列出所有課程**
3. 輸入工作表名稱（例如：`課程清單`）
4. 等待處理完成

### 2. 查看課程師生

1. 在課程清單工作表中，勾選要查詢的課程（A 欄打勾）
2. 選單 → **查詢課程師生**
3. 查看 D、E 欄的師生名單

### 3. 批次建立課程

1. 建立新工作表，A 欄輸入課程名稱：
   ```
   A欄           B欄       C欄
   課程名稱      課程ID    已處理
   數學101      
   物理201
   化學301
   ```

2. 選單 → **建立新課程**
3. 設定課程擁有者（預設為自己）
4. 等待批次處理完成

## 🔧 常見問題快速解決

### Q: 看不到選單？
**A:** 重新整理 Google Sheets 頁面，等待 10-15 秒

### Q: 權限錯誤？
**A:** 確認您有 Classroom 管理員權限，重新執行授權流程

### Q: API 錯誤？
**A:** 檢查 Google Apps Script 專案是否已啟用 Classroom API

### Q: 執行超時？
**A:** 使用 v2.0 的批次處理功能，支援大量資料處理

## 📊 效能建議

### 最佳實務
- **小量測試**：先用少量資料測試功能
- **分批處理**：大量操作建議分批進行
- **網路穩定**：確保網路連線穩定
- **權限檢查**：定期檢查 Google Workspace 權限

### 效能參考值
- **課程列表**：100 個課程約需 10-15 秒
- **批次建立**：50 個課程約需 2-3 分鐘  
- **成員查詢**：10 個課程約需 30-45 秒

## 🎮 進階功能預覽

設定完成後，您可以探索以下進階功能：

### 1. 系統監控
- 選單 → **系統狀態** - 查看 API 使用狀況
- 選單 → **清除快取** - 重置系統快取

### 2. 批次成員管理
- 準備成員清單（課程 ID + Email）
- 使用**新增老師**或**新增學生**功能
- 支援數百個成員的批次處理

### 3. 錯誤恢復
- 自動重試失敗的操作
- 詳細的錯誤報告
- 智能錯誤分類與建議

### 4. 進度追蹤
- 即時進度顯示
- 預估完成時間
- 詳細的操作摘要

## 📚 下一步學習

- 📖 [完整使用手冊](user-guide.md) - 詳細功能說明
- 🔧 [安裝指南](installation.md) - 進階安裝選項
- 🚀 [部署指南](deployment-guide.md) - 生產環境部署
- 🐛 [故障排除](troubleshooting.md) - 常見問題解決

## 🤝 需要協助？

- 💬 [GitHub Issues](https://github.com/geonook/Google-Classroom-Manager/issues) - 問題回報
- 📧 Email: support@classroom-manager-pro.com
- 📚 [線上文件](https://github.com/geonook/Google-Classroom-Manager/wiki)

---

🎉 **歡迎使用 Google Classroom Manager Pro！**

這個快速開始指南讓您在 5 分鐘內就能體驗到企業級課程管理的便利性。

享受高效的課程管理體驗吧！ 🚀