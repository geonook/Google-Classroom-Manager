# 貢獻指南

感謝您對 Google Classroom Manager Pro 的興趣！我們歡迎任何形式的貢獻，無論是回報錯誤、建議功能、改進文件或提交程式碼。

## 🤝 如何貢獻

### 回報錯誤 🐛
1. **搜尋現有 Issues**：先確認問題是否已被回報
2. **建立新 Issue**：使用 [Bug 回報範本](.github/ISSUE_TEMPLATE/bug_report.md)
3. **提供詳細資訊**：包含重現步驟、環境資訊、錯誤日誌

### 建議功能 💡
1. **搜尋現有 Issues**：確認功能是否已被建議
2. **建立功能請求**：使用 [功能建議範本](.github/ISSUE_TEMPLATE/feature_request.md)
3. **描述使用情境**：說明功能的價值和使用場景

### 提交程式碼 👨‍💻
1. **Fork 專案**
2. **建立功能分支**：`git checkout -b feature/amazing-feature`
3. **撰寫程式碼**：遵循專案的程式碼風格
4. **新增測試**：確保新功能有適當的測試覆蓋
5. **更新文件**：更新相關文件
6. **提交變更**：使用清楚的提交訊息
7. **建立 Pull Request**：使用我們的 [PR 範本](.github/pull_request_template.md)

## 📋 開發環境設定

### 前置需求
- Node.js 16+ 和 npm
- Google Apps Script CLI (clasp)
- Git
- Google Workspace 帳戶

### 設定步驟
```bash
# 1. Fork 並 clone 專案
git clone https://github.com/your-username/classroom-manager-pro.git
cd classroom-manager-pro

# 2. 安裝依賴
npm install

# 3. 執行設定腳本
npm run setup

# 4. 登入 Google Apps Script
clasp login

# 5. 建立測試專案
clasp create --type standalone --title "Classroom Manager Pro - Dev"

# 6. 開始開發
npm run dev
```

## 🎨 程式碼風格

### JavaScript 風格指南
- 使用 2 個空格縮排
- 使用單引號
- 每行最多 100 字元
- 使用 semicolon
- 遵循 ESLint 規則

```javascript
// ✅ 好的範例
function createCourse(name, ownerId = 'me') {
  if (!name) {
    throw new Error('課程名稱不能為空');
  }
  
  return Classroom.Courses.create({
    name: name,
    ownerId: ownerId,
    courseState: 'ACTIVE'
  });
}

// ❌ 不好的範例
function createCourse(name,ownerId){
if(!name){
throw new Error("課程名稱不能為空")
}
return Classroom.Courses.create({name:name,ownerId:ownerId,courseState:"ACTIVE"})
}
```

### 命名慣例
- **函式**：使用 camelCase，動詞開頭
- **變數**：使用 camelCase，名詞或形容詞
- **常數**：使用 UPPER_SNAKE_CASE
- **類別**：使用 PascalCase

```javascript
// 函式命名
function listCourses() { }
function createCourse() { }
function deleteCourseById() { }

// 變數命名
const courseList = [];
const isProcessing = false;
const userEmail = 'user@example.com';

// 常數命名
const MAX_RETRY_COUNT = 3;
const API_ENDPOINT = 'https://classroom.googleapis.com';

// 類別命名
class RateLimiter { }
class ErrorHandler { }
```

## 🧪 測試

### 測試類型
1. **單元測試**：測試個別函式和模組
2. **整合測試**：測試模組間的互動
3. **效能測試**：測試大量資料處理效能

### 撰寫測試
```javascript
// tests/unit/RateLimiter.test.js
describe('RateLimiter', () => {
  let rateLimiter;
  
  beforeEach(() => {
    rateLimiter = new RateLimiter();
  });
  
  test('should delay API calls correctly', async () => {
    const startTime = Date.now();
    
    await rateLimiter.execute(() => {
      return Promise.resolve('test');
    });
    
    const duration = Date.now() - startTime;
    expect(duration).toBeGreaterThanOrEqual(1200);
  });
});
```

### 執行測試
```bash
# 執行所有測試
npm test

# 執行單元測試
npm run test:unit

# 執行整合測試
npm run test:integration

# 產生覆蓋率報告
npm run test:coverage
```

## 📝 文件撰寫

### JSDoc 註解
```javascript
/**
 * 建立新課程
 * @param {string} courseName - 課程名稱
 * @param {string} [ownerId='me'] - 課程擁有者 ID
 * @returns {Object} 建立的課程物件
 * @throws {Error} 當課程名稱為空時
 * @example
 * const course = createCourse('數學101', 'teacher@school.edu');
 */
function createCourse(courseName, ownerId = 'me') {
  // 實作內容
}
```

### Markdown 文件
- 使用清楚的標題層級
- 提供程式碼範例
- 包含螢幕截圖（如需要）
- 保持文件最新

## 🔧 提交指南

### 提交訊息格式
遵循 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交類型
- `feat`: 新功能
- `fix`: 錯誤修復
- `docs`: 文件變更
- `style`: 程式碼格式（不影響功能）
- `refactor`: 重構（不是新功能也不是修復）
- `perf`: 效能改善
- `test`: 新增或修正測試
- `chore`: 建置或輔助工具變更

### 範例
```bash
feat(classroom): add batch course creation with progress tracking

- Implement ProgressTracker for real-time feedback
- Add error recovery mechanism
- Support for 500+ courses in single operation

Closes #123
```

## 🎯 Pull Request 指南

### PR 檢查清單
- [ ] 所有測試通過
- [ ] 程式碼符合風格指南
- [ ] 已新增/更新相關測試
- [ ] 已更新文件
- [ ] 沒有合併衝突
- [ ] PR 描述清楚

### 審查流程
1. **自動檢查**：CI/CD 管線會自動執行測試和檢查
2. **程式碼審查**：維護者會審查程式碼品質
3. **功能測試**：確認功能符合需求
4. **文件檢查**：確認文件完整且正確
5. **合併**：通過所有檢查後合併

## 🏷️ 發布流程

### 版本編號
遵循 [語義化版本](https://semver.org/lang/zh-TW/) (SemVer)：
- **主版本**：不相容的 API 變更
- **次版本**：向後相容的功能新增
- **修訂版本**：向後相容的錯誤修復

### 發布步驟
1. 更新 `CHANGELOG.md`
2. 更新 `package.json` 版本號
3. 建立 Git tag
4. 推送到 main 分支
5. GitHub Actions 自動部署

## 🤖 自動化工具

### Linting 和格式化
```bash
# 檢查程式碼風格
npm run lint

# 自動修正可修復的問題
npm run lint:fix

# 格式化程式碼
npm run format
```

### Git Hooks
專案使用 Husky 設定 Git hooks：
- **pre-commit**：執行 lint 和格式化
- **pre-push**：執行測試

## 🆘 需要協助？

### 取得協助
- 📧 Email: dev@classroom-manager-pro.com
- 💬 [GitHub Discussions](https://github.com/your-org/classroom-manager-pro/discussions)
- 🐛 [GitHub Issues](https://github.com/your-org/classroom-manager-pro/issues)

### 學習資源
- [Google Apps Script 文件](https://developers.google.com/apps-script)
- [Google Classroom API](https://developers.google.com/classroom)
- [JavaScript 最佳實務](https://github.com/ryanmcdermott/clean-code-javascript)

## 🎉 貢獻者

感謝所有為這個專案做出貢獻的人！

### 如何成為貢獻者
1. 提交有意義的 PR
2. 協助回答社群問題
3. 改進文件
4. 回報和修復 bug
5. 建議和實作新功能

### 貢獻者權益
- 名字列在 README 貢獻者清單
- 特殊的 GitHub 徽章
- 優先獲得新功能預覽
- 參與專案方向討論

## 📜 授權條款

透過貢獻程式碼，您同意您的貢獻將在與專案相同的 [MIT License](LICENSE) 下授權。

---

再次感謝您的貢獻！每一個貢獻都讓 Google Classroom Manager Pro 變得更好。