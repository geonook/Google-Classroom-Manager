# 🚀 Google Classroom Manager Pro - n8n工作流系統

> **版本**: 1.0.0  
> **建立日期**: 2025-01-23  
> **適用於**: n8n 1.0+  
> **Google Classroom API**: v1

這是一套完整的n8n工作流系統，專為Google Classroom大量學生管理而設計，支援4500+筆學生資料的企業級批次處理。

## 📁 工作流清單

| 工作流檔案 | 功能說明 | Webhook路徑 | 狀態 |
|-----------|----------|-------------|------|
| **student-batch-management.json** | 🎓 學生批次管理核心 | `/student-batch` | ✅ 完成 |
| **data-processing-engine.json** | 📊 大量資料處理引擎 | `/bulk-process` | ✅ 完成 |
| **notification-system.json** | 🔔 多渠道通知系統 | `/notification` | ✅ 完成 |
| **progress-tracker.json** | 📈 即時進度追蹤 | `/progress-update`, `/progress-query` | ✅ 完成 |
| **error-handler.json** | 🛡️ 智能錯誤處理 | `/error-handler` | ✅ 完成 |

---

## 🎯 核心特性

### ⚡ 企業級性能
- **4500+筆資料處理**: 分散式並行處理，20-30分鐘完成
- **智能批次分割**: 自動調整批次大小，避免API限流
- **容錯恢復**: 自動重試機制，斷點續傳支援

### 🔄 自動化工作流
- **學生異動觸發**: 新增/移除/轉班自動化處理
- **多渠道通知**: Email/SMS/Teams/Slack整合
- **智能錯誤處理**: 自動分類、修復、重試

### 📊 即時監控
- **進度追蹤**: WebSocket即時更新，視覺化進度條
- **狀態查詢**: RESTful API查詢批次狀態
- **詳細報告**: 成功率、錯誤分析、效能統計

---

## 🚀 快速開始

### 1. 匯入工作流到n8n

```bash
# 1. 進入n8n管理界面
# 2. 點選「Import from file」
# 3. 依序匯入以下工作流：
- student-batch-management.json    # 核心處理
- data-processing-engine.json     # 大量資料處理
- notification-system.json        # 通知系統
- progress-tracker.json          # 進度追蹤
- error-handler.json             # 錯誤處理
```

### 2. 設定Google OAuth2認證

```yaml
認證設定:
  名稱: Google Classroom OAuth2
  類型: Google OAuth2 API
  範圍:
    - https://www.googleapis.com/auth/classroom.rosters
    - https://www.googleapis.com/auth/classroom.courses.readonly
    - https://www.googleapis.com/auth/classroom.profile.emails
```

### 3. 配置環境變數

```bash
# n8n環境變數設定
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=admin
export N8N_BASIC_AUTH_PASSWORD=your-password

# Google Classroom設定
export GOOGLE_CLIENT_ID=your-client-id
export GOOGLE_CLIENT_SECRET=your-client-secret

# Teams整合（可選）
export TEAMS_TEAM_ID=your-team-id
export TEAMS_CHANNEL_ID=your-channel-id
```

### 4. 啟用工作流

```bash
# 在n8n界面中啟用以下工作流：
☑️ student-batch-management
☑️ data-processing-engine  
☑️ notification-system
☑️ progress-tracker
☑️ error-handler
```

---

## 📖 使用指南

### 🎓 學生批次管理

#### 基本學生新增
```bash
# POST請求到webhook
curl -X POST https://your-n8n.com/webhook/student-batch \
  -H "Content-Type: application/json" \
  -d '{
    "students": [
      {
        "email": "student1@school.edu",
        "courseId": "779922029471",
        "courseName": "G1 Achievers"
      }
    ],
    "callbackUrl": "https://your-app.com/api/callback"
  }'
```

#### 大量資料處理（4500+筆）
```bash
# POST請求到大量處理端點
curl -X POST https://your-n8n.com/webhook/bulk-process \
  -H "Content-Type: application/json" \
  -d '{
    "students": [...], // 4500筆學生資料
    "options": {
      "conservativeMode": false,
      "maxConcurrency": 3
    },
    "progressCallbackUrl": "https://your-app.com/api/progress",
    "errorCallbackUrl": "https://your-app.com/api/error"
  }'
```

### 📈 進度查詢

#### 即時進度查詢
```bash
# GET請求查詢批次狀態
curl "https://your-n8n.com/webhook/progress-query?batchId=batch_1642934400000&includeHistory=true"

# 回應範例
{
  "success": true,
  "batchId": "batch_1642934400000",
  "currentStatus": {
    "stage": "批次處理中",
    "percentage": 75,
    "lastUpdated": "2025-01-23T10:30:00.000Z"
  },
  "statistics": {
    "totalItems": 4500,
    "processedItems": 3375,
    "successfulItems": 3200,
    "failedItems": 175
  }
}
```

### 🔔 通知系統

#### 發送自訂通知
```bash
# POST請求發送通知
curl -X POST https://your-n8n.com/webhook/notification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "student_added",
    "data": {
      "studentEmail": "student@school.edu",
      "courseName": "G1 Achievers",
      "courseId": "779922029471"
    },
    "callbackUrl": "https://your-app.com/api/notification-callback"
  }'
```

### 🛡️ 錯誤處理

#### 手動觸發錯誤處理
```bash
# POST請求處理錯誤
curl -X POST https://your-n8n.com/webhook/error-handler \
  -H "Content-Type: application/json" \
  -d '{
    "error": "Rate limit exceeded",
    "batchId": "batch_1642934400000",
    "context": {
      "batchSize": 50,
      "retryCount": 0
    },
    "callbackUrl": "https://your-app.com/api/error-callback"
  }'
```

---

## 🔧 進階配置

### 批次處理優化

#### 調整批次大小
```javascript
// 在 data-processing-engine.json 中
const chunkSize = Math.min(Math.ceil(totalStudents / (pipelineCount * 20)), 100);

// 針對不同資料量的建議：
// < 500筆:   批次大小 50
// 500-2000: 批次大小 75  
// > 2000筆:  批次大小 100（最大）
```

#### 並行管道數量
```javascript
// 自動計算管道數量
if (totalStudents > 1000) {
  pipelineCount = Math.min(Math.ceil(totalStudents / 1500), 5); // 最多5條管道
} else if (totalStudents > 200) {
  pipelineCount = Math.min(Math.ceil(totalStudents / 500), 3);  // 最多3條管道
}
```

### API配額管理

#### 智能限流設定
```javascript
// 在各工作流中調整延遲
const apiDelay = {
  normal: 1200,      // 1.2秒（安全）
  conservative: 2000, // 2秒（保守）
  aggressive: 800    // 0.8秒（積極，需監控）
};
```

### 通知系統客製化

#### 新增通知渠道
```javascript
// 在 notification-system.json 中新增
const channelRecipients = {
  email: [...],
  sms: [...],
  teams: [...],
  slack: [...],        // 現有
  discord: [...],      // 新增Discord支援
  webhook: [...]       // 新增自訂Webhook
};
```

#### 客製化通知模板
```html
<!-- Email模板客製化 -->
<div class="custom-header" style="background: your-brand-color;">
  <h2>🎓 您的學校名稱 - Classroom Manager</h2>
</div>
```

---

## 🧪 測試與驗證

### 單元測試

#### 測試學生批次處理
```bash
# 使用小量資料測試
curl -X POST https://your-n8n.com/webhook/student-batch \
  -H "Content-Type: application/json" \
  -d '{
    "students": [
      {"email": "test@school.edu", "courseId": "test-course-123"}
    ]
  }'
```

#### 測試錯誤處理
```bash
# 故意觸發錯誤測試恢復機制
curl -X POST https://your-n8n.com/webhook/error-handler \
  -H "Content-Type: application/json" \
  -d '{
    "error": "Rate limit exceeded",
    "batchId": "test-batch"
  }'
```

### 壓力測試

#### 大量資料測試腳本
```javascript
// generate-test-data.js
const generateTestStudents = (count) => {
  return Array.from({length: count}, (_, i) => ({
    email: `student${i}@school.edu`,
    courseId: "779922029471",
    courseName: "Test Course"
  }));
};

// 生成4500筆測試資料
const testData = generateTestStudents(4500);
```

---

## 📊 監控與分析

### 效能指標

#### 關鍵監控指標
```yaml
處理效能:
  - 平均處理時間: < 30分鐘 (4500筆)
  - 成功率: > 95%
  - API錯誤率: < 1%
  - 重試成功率: > 80%

系統健康:
  - 工作流可用性: > 99.9%
  - 記憶體使用: < 2GB
  - CPU使用率: < 70%
  - 網路延遲: < 500ms
```

### 日誌分析

#### 重要日誌模式
```bash
# 成功處理
✅ 批次處理完成: 成功 4250 筆，失敗 250 筆

# API限流
⚠️ API配額警告: 接近限制，啟動限流模式

# 錯誤恢復
🔧 自動修復成功: RATE_LIMIT_EXCEEDED → 延遲重試

# 系統異常
❌ 系統錯誤: 需要人工介入
```

---

## 🚨 故障排除

### 常見問題解決

#### 1. 權限錯誤 (403 Forbidden)
```yaml
問題: Google Classroom API權限不足
解決方案:
  - 檢查OAuth2範圍設定
  - 重新授權Google帳號
  - 確認服務帳號權限
  - 聯繫Google Workspace管理員
```

#### 2. API配額超限 (429 Too Many Requests)
```yaml
問題: API調用頻率過高
解決方案:
  - 工作流會自動啟用限流模式
  - 減少批次大小
  - 增加處理延遲
  - 申請更高API配額
```

#### 3. 學生Email無效
```yaml
問題: Email格式錯誤或不存在
解決方案:
  - 系統會自動跳過無效記錄
  - 檢查資料來源格式
  - 實施更嚴格的資料驗證
  - 查看詳細錯誤報告
```

#### 4. 課程不存在 (404 Not Found)
```yaml
問題: 課程ID無效或課程已刪除
解決方案:
  - 驗證課程ID正確性
  - 檢查課程是否仍然活躍
  - 更新課程ID映射資料
  - 聯繫教務處確認
```

### 除錯模式

#### 啟用詳細日誌
```javascript
// 在Code節點中增加debug日誌
console.log('🐛 DEBUG:', JSON.stringify(data, null, 2));
```

#### 測試個別工作流
```bash
# 使用n8n CLI測試
n8n execute --id student-batch-management --data test-data.json
```

---

## 🔄 更新與維護

### 版本更新流程

#### 1. 備份現有工作流
```bash
# 匯出當前工作流
n8n export:workflow --id=student-batch-management --output=backup/
```

#### 2. 匯入新版本
```bash
# 匯入更新後的工作流
# 注意：會覆蓋現有同名工作流
```

#### 3. 測試新功能
```bash
# 使用測試資料驗證新功能
curl -X POST https://your-n8n.com/webhook/student-batch \
  -d @test-data.json
```

### 定期維護任務

#### 每週維護清單
- [ ] 檢查API配額使用情況
- [ ] 清理過期的批次記錄
- [ ] 更新錯誤處理模式
- [ ] 檢查通知系統狀態

#### 每月維護清單
- [ ] 分析效能趨勢
- [ ] 更新OAuth2認證
- [ ] 清理日誌資料
- [ ] 檢查依賴服務狀態

---

## 📚 相關資源

### 官方文檔
- [n8n文檔](https://docs.n8n.io/)
- [Google Classroom API](https://developers.google.com/classroom/reference/rest)
- [Google OAuth2指南](https://developers.google.com/identity/protocols/oauth2)

### 社群資源
- [n8n Community](https://community.n8n.io/)
- [Google Workspace Developer Community](https://developers.google.com/workspace/community)

### 工具推薦
- [Postman Collection](https://www.postman.com/) - API測試
- [n8n Desktop App](https://n8n.io/download/) - 本地開發
- [Google Apps Script](https://script.google.com/) - 輔助工具

---

## 🤝 貢獻與支援

### 回報問題
如果您發現任何問題或有改進建議，請：

1. 檢查此README的故障排除章節
2. 查看n8n執行日誌獲取詳細錯誤資訊
3. 準備以下資訊：
   - n8n版本
   - 工作流版本
   - 錯誤訊息
   - 重現步驟

### 功能請求
歡迎提出新功能建議：

- 🎯 新的自動化場景
- 📊 額外的監控指標
- 🔔 新的通知渠道
- 🛡️ 增強的錯誤處理

---

## 📄 授權與免責聲明

### 授權
此工作流系統採用 MIT 授權條款。

### 免責聲明
- 使用者需自行確保符合Google Classroom API使用條款
- 建議在生產環境使用前進行充分測試
- 作者不對資料遺失或系統故障承擔責任
- 請確保適當的資料備份和恢復機制

---

## 🎯 版本資訊

### v1.0.0 (2025-01-23)
- ✨ 初始版本發布
- 🎓 學生批次管理核心功能
- 📊 4500+筆大量資料處理
- 🔔 多渠道通知系統
- 📈 即時進度追蹤
- 🛡️ 智能錯誤處理與恢復

### 未來版本規劃
- 📱 行動應用整合
- 🤖 AI驅動的智能化建議
- 🌐 多語言支援
- 📋 更多的報告模板
- 🔗 更多第三方服務整合

---

**🚀 現在就開始使用這套強大的n8n工作流系統，讓您的Google Classroom管理更加高效和自動化！**

---

*最後更新：2025-01-23*  
*文檔版本：1.0.0*  
*作者：SuperClaude AI Assistant*