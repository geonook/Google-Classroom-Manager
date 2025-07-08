# GitHub 整合設定指南

## 🎉 專案已成功推送到 GitHub！

您的 Google Classroom Manager Pro 專案現在已經在 GitHub 上：
**https://github.com/geonook/Google-Classroom-Manager**

## 🔧 必要的 GitHub 設定

### 1. GitHub Secrets 設定

為了啟用 CI/CD 自動化部署，請在 GitHub 專案中設定以下 Secrets：

#### 進入 Secrets 設定
1. 開啟您的 GitHub 專案頁面
2. 點選 **Settings** 標籤
3. 在左側選單點選 **Secrets and variables** → **Actions**
4. 點選 **New repository secret**

#### 必要的 Secrets

##### `CLASP_CREDENTIALS`
```bash
# 在本地執行以取得認證資訊
clasp login

# 複製認證檔案內容
cat ~/.clasprc.json

# 將內容貼到 GitHub Secrets 的 CLASP_CREDENTIALS
```

##### `STAGING_SCRIPT_ID`
```bash
# 建立測試環境的 Google Apps Script 專案
clasp create --type standalone --title "Google Classroom Manager Pro - Staging"

# 記錄返回的 Script ID，設定到 STAGING_SCRIPT_ID
```

##### `PRODUCTION_SCRIPT_ID`
```bash
# 建立生產環境的 Google Apps Script 專案
clasp create --type standalone --title "Google Classroom Manager Pro"

# 記錄返回的 Script ID，設定到 PRODUCTION_SCRIPT_ID
```

##### `SLACK_WEBHOOK_URL` (選用)
如果要啟用 Slack 通知，請設定 Slack Webhook URL

### 2. 分支保護設定

#### 設定 main 分支保護
1. 在 **Settings** → **Branches**
2. 點選 **Add rule**
3. Branch name pattern: `main`
4. 啟用以下選項：
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Restrict pushes that create files over 100MB

#### 必要的狀態檢查
- `lint` - 程式碼品質檢查
- `test` - 測試執行
- `build` - 建置驗證

### 3. Issue 與 PR 範本啟用

專案已包含以下範本，GitHub 會自動使用：
- ✅ Bug 回報範本
- ✅ 功能建議範本  
- ✅ Pull Request 範本

### 4. GitHub Pages 設定 (選用)

如果要託管專案文件：
1. **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**
4. Folder: **/ (root)** 或 **/docs**

## 🚀 CI/CD 工作流程啟用

### 自動化部署觸發條件

1. **測試環境部署**
   ```bash
   # 推送到 develop 分支觸發
   git checkout -b develop
   git push origin develop
   ```

2. **生產環境部署**  
   ```bash
   # 推送到 main 分支觸發 (已完成)
   git push origin main
   ```

### 手動觸發部署

1. 前往 **Actions** 標籤
2. 選擇 **CI/CD Pipeline** workflow
3. 點選 **Run workflow**
4. 選擇要部署的分支

## 📊 專案狀態徽章

在 README.md 中新增狀態徽章：

```markdown
![Build Status](https://github.com/geonook/Google-Classroom-Manager/workflows/CI%2FCD%20Pipeline/badge.svg)
![Version](https://img.shields.io/github/v/release/geonook/Google-Classroom-Manager)
![License](https://img.shields.io/github/license/geonook/Google-Classroom-Manager)
```

## 🔒 安全性設定

### 啟用安全性功能

1. **Settings** → **Security**
2. 啟用以下功能：
   - ✅ Dependency graph
   - ✅ Dependabot alerts  
   - ✅ Dependabot security updates
   - ✅ Secret scanning
   - ✅ Push protection

### 程式碼掃描

專案已設定 CodeQL 分析，會自動：
- 掃描安全漏洞
- 檢查程式碼品質
- 提供改進建議

## 📝 團隊協作設定

### 邀請協作者

1. **Settings** → **Collaborators**
2. 點選 **Add people**
3. 輸入 GitHub 使用者名稱或 email
4. 設定適當權限等級

### 權限等級
- **Admin**: 完整專案控制權
- **Maintain**: 管理專案但無法刪除
- **Write**: 可以推送程式碼
- **Triage**: 可以管理 Issues 和 PR
- **Read**: 僅能查看和 clone

## 🏷️ 版本發布設定

### 建立第一個 Release

1. 前往 **Releases** 標籤
2. 點選 **Create a new release**
3. Tag version: `v2.0.0`
4. Release title: `Google Classroom Manager Pro v2.0.0`
5. 描述發布內容（可從 CHANGELOG.md 複製）
6. 點選 **Publish release**

### 自動化 Release

CI/CD 管線會在推送到 main 分支時自動建立 release。

## 📱 GitHub Mobile 設定

1. 安裝 GitHub Mobile app
2. 開啟專案通知
3. 設定重要事件提醒：
   - Pull requests
   - Issues
   - Releases
   - Actions

## 🔧 開發工作流程

### 標準 Git Flow

```bash
# 1. 建立功能分支
git checkout -b feature/new-feature

# 2. 開發並提交
git add .
git commit -m "feat: add new feature"

# 3. 推送分支
git push origin feature/new-feature

# 4. 在 GitHub 建立 Pull Request

# 5. 程式碼審查後合併到 main

# 6. 自動觸發生產部署
```

### 緊急修復流程

```bash
# 1. 建立 hotfix 分支
git checkout -b hotfix/critical-bug

# 2. 修復並測試
git add .
git commit -m "fix: critical bug fix"

# 3. 合併到 main 和 develop
git checkout main
git merge hotfix/critical-bug
git push origin main

git checkout develop  
git merge hotfix/critical-bug
git push origin develop
```

## 📊 監控與分析

### GitHub Insights

1. **Pulse**: 專案活動總覽
2. **Contributors**: 貢獻者統計
3. **Traffic**: 訪問流量分析
4. **Dependency graph**: 依賴關係視覺化

### Actions 監控

1. 查看工作流程執行歷史
2. 監控部署成功率
3. 分析執行時間趨勢
4. 設定失敗通知

## 🎯 下一步建議

### 立即執行
1. ✅ **設定 GitHub Secrets** - 啟用 CI/CD
2. ✅ **設定分支保護** - 提升程式碼品質
3. ✅ **邀請團隊成員** - 開始協作開發

### 短期目標 (1-2 週)
1. 📝 **建立 Wiki** - 詳細技術文件
2. 🏷️ **設定 Labels** - 問題分類管理
3. 📋 **建立 Projects** - 專案管理看板

### 長期目標 (1 個月+)
1. 📊 **設定監控** - 應用程式效能監控
2. 🔄 **自動化測試** - 增加測試覆蓋率
3. 📈 **效能分析** - 持續改進優化

## 📞 需要協助？

- 📚 [GitHub 文件](https://docs.github.com)
- 💬 [GitHub Community](https://github.community)
- 🎓 [GitHub Learning Lab](https://lab.github.com)

---

🎉 **恭喜！您的專案現在具備完整的企業級開發流程！**

專案連結：https://github.com/geonook/Google-Classroom-Manager