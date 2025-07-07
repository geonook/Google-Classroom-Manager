# 部署指南

本指南詳細說明如何將 Google Classroom Manager Pro 部署到不同環境，包括開發、測試和生產環境。

## 🎯 部署策略

### 環境類型
1. **開發環境 (Development)**：用於本地開發和測試
2. **測試環境 (Staging)**：用於整合測試和功能驗證
3. **生產環境 (Production)**：正式使用環境

### 部署方式
- **手動部署**：適用於小規模或一次性部署
- **自動化部署**：使用 GitHub Actions 進行 CI/CD
- **版本化部署**：支援多版本並行和回滾

## 🔧 環境設定

### 1. 開發環境設定

#### 前置需求
```bash
# 安裝 Node.js 和 npm
node --version  # 應該 >= 16
npm --version   # 應該 >= 8

# 安裝 Google Apps Script CLI
npm install -g @google/clasp

# 驗證安裝
clasp --version
```

#### 專案初始化
```bash
# Clone 專案
git clone https://github.com/your-org/classroom-manager-pro.git
cd classroom-manager-pro

# 安裝依賴
npm install

# 執行初始設定
npm run setup

# 登入 Google Apps Script
clasp login
```

#### 建立開發專案
```bash
# 建立新的 Apps Script 專案
clasp create --type standalone --title "Classroom Manager Pro - Dev"

# 設定專案 ID
# 將返回的 Script ID 複製到 .clasp.json 中的 scriptId 欄位
```

#### 本地開發
```bash
# 開啟監視模式，自動推送變更
npm run dev

# 手動推送程式碼
npm run push

# 查看執行日誌
npm run logs
```

### 2. 測試環境設定

#### GitHub Secrets 設定
在 GitHub 專案設定中新增以下 Secrets：

```
CLASP_CREDENTIALS  # clasp 認證資訊
STAGING_SCRIPT_ID  # 測試環境的 Script ID
PRODUCTION_SCRIPT_ID  # 生產環境的 Script ID
```

#### 取得 CLASP_CREDENTIALS
```bash
# 在本地執行 clasp login 後
cat ~/.clasprc.json

# 將輸出內容複製到 GitHub Secrets 的 CLASP_CREDENTIALS
```

#### 建立測試專案
```bash
# 建立測試環境專案
clasp create --type standalone --title "Classroom Manager Pro - Staging"

# 記錄 Script ID，稍後設定到 GitHub Secrets
```

### 3. 生產環境設定

#### 建立生產專案
```bash
# 建立生產環境專案
clasp create --type standalone --title "Classroom Manager Pro"

# 記錄 Script ID，設定到 GitHub Secrets 的 PRODUCTION_SCRIPT_ID
```

#### 權限設定
1. 在 Google Apps Script 中開啟專案
2. 點選「部署」→「新增部署作業」
3. 選擇「網頁應用程式」類型
4. 設定適當的存取權限
5. 記錄 Web App URL

## 🚀 部署流程

### 1. 手動部署

#### 開發環境部署
```bash
# 確保在正確的專案目錄
cd classroom-manager-pro

# 推送程式碼到 Google Apps Script
clasp push

# 部署新版本
clasp deploy --description "Development build $(date)"

# 查看部署狀態
clasp deployments
```

#### 測試環境部署
```bash
# 切換到測試環境配置
cp .clasp.staging.json .clasp.json

# 推送並部署
clasp push
clasp deploy --description "Staging v$(npm run version --silent)"
```

#### 生產環境部署
```bash
# 切換到生產環境配置
cp .clasp.production.json .clasp.json

# 推送並部署
clasp push
clasp deploy --description "Production v$(npm run version --silent)"
```

### 2. 自動化部署 (GitHub Actions)

#### 觸發條件
- **測試環境**：推送到 `develop` 分支時自動部署
- **生產環境**：推送到 `main` 分支時自動部署

#### 部署流程
1. **程式碼檢查**：執行 linting 和格式檢查
2. **測試執行**：執行單元測試和整合測試
3. **建置專案**：編譯和打包程式碼
4. **部署到環境**：推送到對應的 Google Apps Script 專案
5. **部署驗證**：執行部署後測試
6. **通知團隊**：發送部署狀態通知

#### 手動觸發部署
```bash
# 觸發測試環境部署
git push origin develop

# 觸發生產環境部署
git push origin main

# 或使用 GitHub 介面手動觸發 workflow
```

## 📋 部署檢查清單

### 部署前檢查
- [ ] 所有測試通過
- [ ] 程式碼已經過審查
- [ ] 文件已更新
- [ ] 版本號已更新
- [ ] CHANGELOG 已更新
- [ ] 備份現有版本

### 部署中檢查
- [ ] 監控部署進度
- [ ] 檢查部署日誌
- [ ] 驗證權限設定
- [ ] 確認 API 連線正常

### 部署後檢查
- [ ] 功能正常運作
- [ ] 效能指標正常
- [ ] 錯誤率在預期範圍
- [ ] 使用者存取正常
- [ ] 監控系統正常

## 🔄 版本管理

### 版本策略
```
main (生產)     v2.0.0 ──── v2.0.1 ──── v2.1.0
                   │          │          │
develop (測試)     └─ v2.0.1-rc.1 ──────┘
                   │
feature/xxx        └─ 功能開發 ─────┘
```

### 版本發布流程
1. **功能開發**：在 feature 分支開發
2. **合併到 develop**：進行整合測試
3. **建立 release 分支**：準備發布
4. **合併到 main**：正式發布
5. **標記版本**：建立 Git tag

### 語義化版本
- **主版本 (Major)**：不相容的 API 變更
- **次版本 (Minor)**：向後相容的功能新增
- **修訂版本 (Patch)**：向後相容的錯誤修復

```bash
# 更新版本號
npm version major    # 1.0.0 → 2.0.0
npm version minor    # 1.0.0 → 1.1.0
npm version patch    # 1.0.0 → 1.0.1

# 推送版本標籤
git push origin --tags
```

## 🛡️ 安全性考量

### 敏感資訊管理
- **Never commit secrets**：絕不將敏感資訊提交到 Git
- **Environment variables**：使用環境變數存儲配置
- **Encrypted secrets**：使用 GitHub Secrets 存儲敏感資訊

### 權限最小化
```javascript
// 只請求必要的權限範圍
const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.rosters'
];
```

### 資料保護
- 定期備份重要資料
- 實作資料加密
- 遵循 GDPR 和 FERPA 規範

## 📊 監控與日誌

### 部署監控
```bash
# 監控部署狀態
npm run monitor:deployment

# 檢查應用程式健康狀態
npm run health:check

# 查看即時日誌
npm run logs:tail
```

### 關鍵指標
- **部署成功率**：目標 > 95%
- **部署時間**：目標 < 5 分鐘
- **回滾時間**：目標 < 2 分鐘
- **錯誤率**：目標 < 1%

### 警報設定
- API 錯誤率超過閾值
- 執行時間超過限制
- 記憶體使用量異常
- 使用者回報問題

## 🔧 故障排除

### 常見部署問題

#### 1. 權限錯誤
```bash
# 症狀
Error: Insufficient permissions

# 解決方案
# 1. 重新授權
clasp login --creds credentials.json

# 2. 檢查 OAuth 範圍
# 確認 appsscript.json 中的 oauthScopes 設定正確
```

#### 2. 腳本執行超時
```bash
# 症狀
Error: Script execution timeout

# 解決方案
# 1. 優化程式碼效能
# 2. 實作批次處理
# 3. 使用異步處理
```

#### 3. API 配額超限
```bash
# 症狀
Error: Rate limit exceeded

# 解決方案
# 1. 實作 API 限速
# 2. 使用快取機制
# 3. 申請更高配額
```

### 回滾程序
```bash
# 緊急回滾到前一版本
clasp deployments  # 查看部署歷史
clasp undeploy <deployment-id>  # 移除有問題的部署

# 或部署穩定版本
git checkout v2.0.0
clasp push
clasp deploy --description "Emergency rollback to v2.0.0"
```

## 📞 支援與聯絡

### 部署支援
- 📧 部署問題：deploy@classroom-manager-pro.com
- 🚨 緊急事件：emergency@classroom-manager-pro.com
- 💬 技術討論：[GitHub Discussions](https://github.com/your-org/classroom-manager-pro/discussions)

### 部署通知
- Slack: #deployments 頻道
- Email: 部署狀態自動通知
- GitHub: Release 通知

---

## 🎯 最佳實務

1. **漸進式部署**：先部署到測試環境驗證
2. **自動化測試**：確保部署品質
3. **監控警報**：及時發現問題
4. **快速回滾**：準備緊急應變計畫
5. **文件維護**：保持部署文件最新

記住：好的部署流程是專案成功的關鍵！