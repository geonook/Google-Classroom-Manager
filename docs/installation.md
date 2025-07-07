# 安裝指南

本指南將引導您完成 Google Classroom Manager Pro 的完整安裝過程。

## 📋 前置需求

### 系統需求
- **Google Workspace 帳戶**：教育版或企業版
- **管理員權限**：Google Classroom 管理員權限
- **瀏覽器**：Chrome、Firefox、Safari 或 Edge 最新版本
- **網路連線**：穩定的網際網路連線

### 權限需求
- Google Classroom API 存取權限
- Google Apps Script 執行權限
- Google Sheets 讀寫權限
- Google Drive 基本存取權限

## 🚀 安裝方式

### 方式一：使用 Google Apps Script CLI (clasp) - 推薦

#### 1. 安裝 Node.js 和 clasp
```bash
# 安裝 Node.js (v14 或更高版本)
https://nodejs.org/

# 安裝 Google Apps Script CLI
npm install -g @google/clasp

# 登入 Google 帳戶
clasp login
```

#### 2. 建立新專案
```bash
# 建立新的 Apps Script 專案
clasp create --type standalone --title "Classroom Manager Pro"

# 記錄專案 ID（稍後會用到）
```

#### 3. 部署程式碼
```bash
# Clone 或下載專案程式碼
git clone https://github.com/your-org/classroom-manager-pro.git
cd classroom-manager-pro

# 設定 clasp 專案 ID
echo '{"scriptId":"YOUR_SCRIPT_ID"}' > .clasp.json

# 推送程式碼到 Google Apps Script
clasp push

# 部署為網頁應用程式（選用）
clasp deploy --description "Production v2.0.0"
```

### 方式二：手動安裝

#### 1. 建立 Apps Script 專案
1. 開啟 [Google Apps Script](https://script.google.com)
2. 點選「新增專案」
3. 將專案命名為「Classroom Manager Pro」

#### 2. 設定專案配置
1. 點選「專案設定」圖示 ⚙️
2. 勾選「在編輯器中顯示 "appsscript.json" 資訊清單檔案」
3. 返回編輯器，會看到 `appsscript.json` 檔案

#### 3. 更新配置檔案
將 `appsscript.json` 內容替換為：
```json
{
  "timeZone": "Asia/Taipei",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Classroom",
        "serviceId": "classroom",
        "version": "v1"
      },
      {
        "userSymbol": "AdminDirectory",
        "serviceId": "admin",
        "version": "directory_v1"
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

#### 4. 新增程式碼檔案
按順序新增以下檔案：

1. **Logger.js** - 日誌系統
2. **RateLimiter.js** - API 限速控制
3. **ErrorHandler.js** - 錯誤處理
4. **ProgressTracker.js** - 進度追蹤
5. **ClassroomService.js** - API 服務層
6. **Code.js** - 主程式

複製對應的程式碼內容到各檔案中。

#### 5. 啟用 API 服務
1. 在 Apps Script 編輯器中，點選「服務」➕
2. 選擇「Google Classroom API」
3. 點選「新增」
4. 確認版本為 v1

## 🔧 初始設定

### 1. 測試安裝
```javascript
// 在 Apps Script 編輯器中執行
function testInstallation() {
  try {
    // 測試 API 連線
    const courses = Classroom.Courses.list({pageSize: 1});
    Logger.log('✅ Classroom API 連線成功');
    
    // 測試系統狀態
    const status = classroomService.getStatus();
    Logger.log('✅ 系統狀態正常:', status);
    
    return '安裝測試通過！';
  } catch (error) {
    Logger.log('❌ 安裝測試失敗:', error.message);
    return '安裝測試失敗: ' + error.message;
  }
}
```

### 2. 設定預設值
```javascript
// 設定系統預設值
function setupDefaults() {
  const properties = PropertiesService.getScriptProperties();
  
  properties.setProperties({
    // 系統設定
    'DEBUG_MODE': 'false',
    'CACHE_TIMEOUT': '300000',      // 5 分鐘
    'API_RATE_LIMIT': '50',         // 每分鐘 50 次
    'BATCH_SIZE': '50',             // 批次大小
    'MAX_RETRIES': '3',             // 最大重試次數
    
    // 預設工作表名稱
    'defaultSheet_listCourses': '搜尋課程與老師',
    'defaultSheet_listMembers': '搜尋課程與老師',
    'defaultSheet_createCourses': '全部課程',
    'defaultSheet_addTEACHERs': '新增課程與老師',
    'defaultSheet_addSTUDENTs': '新增課程與學生',
    'defaultSheet_updateCourses': '課程名稱修改',
    'defaultSheet_archiveCourses': '課程名稱修改',
    
    // 課程建立預設值
    'defaultOwnerId_createCourses': 'me'
  });
  
  Logger.log('✅ 預設值設定完成');
}
```

### 3. 權限授權
1. 首次執行時，系統會要求授權
2. 點選「檢閱權限」
3. 選擇您的 Google 帳戶
4. 點選「進階」→「前往 Classroom Manager Pro (不安全)」
5. 點選「允許」授權所需權限

## 📊 驗證安裝

### 1. 功能測試清單

- [ ] **基本連線測試**
  ```javascript
  testInstallation()
  ```

- [ ] **課程列表測試**
  1. 開啟任一 Google Sheets
  2. 重新整理頁面
  3. 確認可見「Classroom 管理工具」選單
  4. 執行「列出所有課程」

- [ ] **權限測試**
  ```javascript
  // 測試 Classroom API 權限
  function testPermissions() {
    try {
      const courses = Classroom.Courses.list({pageSize: 5});
      Logger.log('課程數量:', courses.courses?.length || 0);
      return '權限測試通過';
    } catch (error) {
      return '權限測試失敗: ' + error.message;
    }
  }
  ```

- [ ] **系統狀態檢查**
  - 執行選單中的「系統狀態」
  - 確認所有指標顯示正常

### 2. 效能基準測試

```javascript
// 效能測試
function performanceTest() {
  const startTime = Date.now();
  
  // 測試課程列表載入
  classroomService.listAllCourses().then(result => {
    const duration = Date.now() - startTime;
    Logger.log(`載入 ${result.data.length} 個課程耗時: ${duration}ms`);
    
    if (duration < 30000) { // 30 秒內
      Logger.log('✅ 效能測試通過');
    } else {
      Logger.log('⚠️ 效能較慢，建議檢查網路連線');
    }
  });
}
```

## ⚠️ 常見安裝問題

### 問題 1: API 未啟用
**症狀**: 錯誤訊息包含 "API has not been used"
**解決方案**:
1. 前往 [Google Cloud Console](https://console.cloud.google.com)
2. 選擇與 Apps Script 相關聯的專案
3. 啟用「Google Classroom API」

### 問題 2: 權限不足
**症狀**: 錯誤訊息包含 "insufficient permissions"
**解決方案**:
1. 確認帳戶具有 Classroom 管理員權限
2. 重新執行授權流程
3. 檢查 OAuth 範圍設定

### 問題 3: 配額超限
**症狀**: 錯誤訊息包含 "quota exceeded"
**解決方案**:
1. 等待配額重置（通常為 24 小時）
2. 聯繫 Google Workspace 管理員增加配額
3. 啟用計費帳戶以獲得更高配額

### 問題 4: 腳本執行超時
**症狀**: 操作中途停止，顯示執行時間過長
**解決方案**:
1. 使用 v2.0.0 的批次處理功能
2. 減少一次處理的資料量
3. 確認網路連線穩定

## 🔒 安全設定

### 1. 腳本權限設定
```javascript
// 設定安全性參數
function securitySetup() {
  const properties = PropertiesService.getScriptProperties();
  
  properties.setProperties({
    'LOG_SENSITIVE_DATA': 'false',     // 不記錄敏感資料
    'ENABLE_DEBUG_UI': 'false',        // 生產環境關閉除錯介面
    'VALIDATE_INPUTS': 'true',         // 啟用輸入驗證
    'LOG_API_CALLS': 'false'           // 不記錄 API 呼叫詳情
  });
}
```

### 2. 使用者存取控制
```javascript
// 限制使用者存取（選用）
function checkUserAccess() {
  const allowedUsers = [
    'admin@school.edu',
    'teacher@school.edu'
  ];
  
  const currentUser = Session.getActiveUser().getEmail();
  
  if (!allowedUsers.includes(currentUser)) {
    throw new Error('您沒有使用此工具的權限');
  }
}
```

## 📱 行動裝置支援

雖然主要設計用於桌面環境，但也可在行動裝置上使用：

1. **平板電腦**: 完全支援，建議使用橫向模式
2. **智慧型手機**: 基本支援，但使用體驗較受限
3. **建議**: 重要操作建議在桌面環境進行

## 🔄 更新流程

### 自動更新檢查
```javascript
// 檢查更新（計劃中功能）
function checkForUpdates() {
  // 將在未來版本實作
  Logger.log('目前版本: 2.0.0');
  Logger.log('檢查更新功能開發中...');
}
```

### 手動更新
1. 備份現有設定
2. 下載最新版本程式碼
3. 使用 clasp 推送更新
4. 測試功能正常運作

## 📞 技術支援

如果在安裝過程中遇到問題：

1. **檢查前置需求**: 確認所有需求都已滿足
2. **查看日誌**: 在 Apps Script 編輯器中檢查執行記錄
3. **重試安裝**: 有時重新安裝可以解決問題
4. **尋求協助**: 
   - 📧 Email: support@classroom-manager-pro.com
   - 💬 [GitHub Issues](https://github.com/your-org/classroom-manager-pro/issues)
   - 📚 [故障排除指南](troubleshooting.md)

## ✅ 安裝完成確認

安裝完成後，您應該能夠：

- [x] 在 Google Sheets 中看到「Classroom 管理工具」選單
- [x] 執行「列出所有課程」功能
- [x] 查看「系統狀態」顯示正常
- [x] 執行基本的課程管理操作
- [x] 看到進度追蹤與錯誤處理機制運作

🎉 **恭喜！您已成功安裝 Google Classroom Manager Pro**

接下來請參考 [使用手冊](user-guide.md) 開始使用各項功能。