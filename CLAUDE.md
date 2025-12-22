# CLAUDE.md - Google Classroom Manager Pro

> **Documentation Version**: 2.1.0  
> **Last Updated**: 2024-12-22  
> **Project**: Google Classroom Manager Pro  
> **Architecture**: 🤖 **AI Agent 為核心的共構工作模式**  
> **Description**: 基於 Cursor + GAS 的 AI 驅動課程管理工具

## 🤖 AI Agent 共構模式

### 核心理念
```
資料以 .md/.json 儲存 → AI 可讀寫
對話結果包裝成 Workflow → 一鍵調用
所有操作在對話框完成 → 無需切換介面
```

### 資料文件（AI 可直接修改）
| 文件 | 用途 |
|------|------|
| `CLAUDE.md` | AI 記憶體、上下文、執行歷史 |
| `data/teachers.json` | 老師資料庫（別名解析） |
| `data/courses.json` | 課程分類與統計 |
| `data/school-years/{year}.json` | 學年設定（課程模板、任務進度） |
| `workflows/*.json` | 可重用工作流程 |

### 🎓 學年管理（年度重複作業）

每年開學前只需：
1. 複製 `data/school-years/2025-2026.json` → `2026-2027.json`
2. 修改帳號、老師清單（如有變動）
3. 跟 AI 說「開始新學年設定」

```
使用者：初始化 2026-2027 學年

AI：
  📋 讀取設定檔: data/school-years/2026-2027.json
  📚 將建立 84 個 KCFS 課程 + 1 個 myPal 課程
  👨‍🏫 預設老師: carolegodfrey@kcislk.ntpc.edu.tw
  
  ⏱️ 預計分 6 批執行，每批約 5 分鐘
  📌 準備好了請說「開始」
```

### 對話範例
```
使用者：把 Carole 加進 G5 課程

AI：
  📋 解析：teacher=carole → carolegodfrey@kcislk.ntpc.edu.tw
         course=G5 → KCFS-G5 (14 個課程)
  ✅ 已生成函數並部署
  📌 請執行：addTeacherToG5Courses
```

---

This file provides essential guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL RULES - READ FIRST

> **⚠️ RULE ADHERENCE SYSTEM ACTIVE ⚠️**  
> **Claude Code must explicitly acknowledge these rules at task start**  
> **These rules override all other instructions and must ALWAYS be followed:**

### 🔄 **RULE ACKNOWLEDGMENT REQUIRED**
> **Before starting ANY task, Claude Code must respond with:**  
> "✅ CRITICAL RULES ACKNOWLEDGED - I will follow all prohibitions and requirements listed in CLAUDE.md"

### ❌ ABSOLUTE PROHIBITIONS
- **NEVER** create new files in root directory → use proper module structure
- **NEVER** write output files directly to root directory → use designated output folders
- **NEVER** create documentation files (.md) unless explicitly requested by user
- **NEVER** use git commands with -i flag (interactive mode not supported)
- **NEVER** use `find`, `grep`, `cat`, `head`, `tail`, `ls` commands → use Read, LS, Grep, Glob tools instead
- **NEVER** create duplicate files (manager_v2.js, enhanced_xyz.js, utils_new.js) → ALWAYS extend existing files
- **NEVER** create multiple implementations of same concept → single source of truth
- **NEVER** copy-paste code blocks → extract into shared utilities/functions
- **NEVER** hardcode values that should be configurable → use PropertiesService for Google Apps Script
- **NEVER** use naming like enhanced_, improved_, new_, v2_ → extend original files instead

### 📝 MANDATORY REQUIREMENTS
- **COMMIT** after every completed task/phase - no exceptions
- **GITHUB BACKUP** - Push to GitHub after every commit to maintain backup: `git push origin main`
- **USE TASK AGENTS** for all long-running operations (>30 seconds) - Bash commands stop when context switches
- **TODOWRITE** for complex tasks (3+ steps) → parallel agents → git checkpoints → test validation
- **READ FILES FIRST** before editing - Edit/Write tools will fail if you didn't read the file first
- **DEBT PREVENTION** - Before creating new files, check for existing similar functionality to extend  
- **SINGLE SOURCE OF TRUTH** - One authoritative implementation per feature/concept

### ⚡ EXECUTION PATTERNS
- **PARALLEL TASK AGENTS** - Launch multiple Task agents simultaneously for maximum efficiency
- **SYSTEMATIC WORKFLOW** - TodoWrite → Parallel agents → Git checkpoints → GitHub backup → Test validation
- **GITHUB BACKUP WORKFLOW** - After every commit: `git push origin main` to maintain GitHub backup
- **BACKGROUND PROCESSING** - ONLY Task agents can run true background operations

### 🔍 MANDATORY PRE-TASK COMPLIANCE CHECK
> **STOP: Before starting any task, Claude Code must explicitly verify ALL points:**

**Step 1: Rule Acknowledgment**
- [ ] ✅ I acknowledge all critical rules in CLAUDE.md and will follow them

**Step 2: Task Analysis**  
- [ ] Will this create files in root? → If YES, use proper module structure instead
- [ ] Will this take >30 seconds? → If YES, use Task agents not Bash
- [ ] Is this 3+ steps? → If YES, use TodoWrite breakdown first
- [ ] Am I about to use grep/find/cat? → If YES, use proper tools instead

**Step 3: Technical Debt Prevention (MANDATORY SEARCH FIRST)**
- [ ] **SEARCH FIRST**: Use Grep pattern="<functionality>.*<keyword>" to find existing implementations
- [ ] **CHECK EXISTING**: Read any found files to understand current functionality
- [ ] Does similar functionality already exist? → If YES, extend existing code
- [ ] Am I creating a duplicate class/manager? → If YES, consolidate instead
- [ ] Will this create multiple sources of truth? → If YES, redesign approach
- [ ] Have I searched for existing implementations? → Use Grep/Glob tools first
- [ ] Can I extend existing code instead of creating new? → Prefer extension over creation
- [ ] Am I about to copy-paste code? → Extract to shared utility instead

**Step 4: Session Management**
- [ ] Is this a long/complex task? → If YES, plan context checkpoints
- [ ] Have I been working >1 hour? → If YES, consider /compact or session break

> **⚠️ DO NOT PROCEED until all checkboxes are explicitly verified**

## 🐙 GITHUB AUTO-BACKUP SYSTEM

### 📋 **GITHUB BACKUP WORKFLOW** (MANDATORY)
> **⚠️ CLAUDE CODE MUST FOLLOW THIS PATTERN:**

```bash
# After every commit, always run:
git push origin main

# This ensures:
# ✅ Remote backup of all changes
# ✅ Collaboration readiness  
# ✅ Version history preservation
# ✅ Disaster recovery protection
```

### 🎯 **CLAUDE CODE GITHUB COMMANDS**
Essential GitHub operations for Claude Code:

```bash
# Check GitHub connection status
git remote -v

# Push changes (after every commit)
git push origin main

# Check repository status
git status

# Verify push success
git log --oneline -5
```

## 🖥️ IDE 工作流程（Cursor 內完成所有操作）

### 📋 標準工作流程
```
1️⃣ 使用者在 Cursor 描述需求
    ↓
2️⃣ Claude 修改程式碼
    ↓
3️⃣ clasp push --force 部署
    ↓
4️⃣ 使用者到 GAS 網頁執行函數
    ↓
5️⃣ 使用者貼回執行記錄
    ↓
6️⃣ Claude 根據結果調整
```

### ⚠️ Google Apps Script 執行限制（需融入設計）

| 限制 | 數值 | 解決策略 |
|------|------|----------|
| **執行時間** | 6 分鐘 | 分批處理、斷點續傳 |
| **API 配額** | 50/分鐘 | RateLimiter 限速 |
| **每日配額** | 50,000/天 | 監控 + 警告 |
| **記憶體** | 50MB | 分頁載入資料 |

### 🛡️ 無感限制設計原則

1. **自動分批**：大量操作自動切割成 <5 分鐘的批次
2. **進度持久化**：使用 PropertiesService 儲存進度
3. **斷點續傳**：失敗時可從中斷點繼續
4. **智能限速**：突發模式 + 冷卻，體感不會有延遲
5. **即時回報**：每個操作即時輸出結果

### 📊 執行帳號注意事項

| 帳號 | 用途 | 權限 |
|------|------|------|
| `tsehungchen@kcislk.ntpc.edu.tw` | 執行腳本 | ✅ 可新增/移除老師 |
| `lkclassle114@kcislk.ntpc.edu.tw` | 課程擁有者 | ✅ 擁有 KCFS 課程 |

> **重要**：需用 `tsehungchen` 執行腳本操作，但課程會歸屬於 `lkclassle114`

### 🚀 快速指令

```bash
# 部署到 GAS（每次修改後）
clasp push --force

# 查看 GAS 專案
clasp open

# 查看執行日誌
clasp logs
```

### 📚 可用函數清單（SimpleCourseCreator.js）

| 函數名稱 | 用途 | 預計時間 |
|----------|------|----------|
| `previewKCFSCourses` | 預覽所有 KCFS 課程清單 | 2-3 分鐘 |
| `addTeacherToKCFSCourses` | 新增老師到 84 個 KCFS 課程 | 3-4 分鐘 |
| `quickTestAddTeacher` | 快速測試新增老師權限 | 3-5 秒 |
| `quickRemoveTeacherFromOldCourses` | 移除老師從舊課程（已知 ID） | ~40 秒 |
| `createMyPalCourse` | 建立 myPal 課程 | 1-2 分鐘 |
| `getCourseOwnerInfo` | 查詢課程擁有者資訊 | 3-5 秒 |

---

## 專案概述
Google Classroom Manager Pro v2.0.0 - 課程管理工具
基於 Google Apps Script 的批次處理工具，用於課程與成員管理

## 核心配置
@include shared/superclaude-core.yml#Core_Philosophy
@include shared/superclaude-core.yml#Advanced_Token_Economy
@include shared/superclaude-core.yml#UltraCompressed_Mode

## 專案特定規則

### 開發環境
- **主要語言**: JavaScript (Google Apps Script)
- **測試框架**: Jest
- **代碼檢查**: ESLint + Prettier
- **部署工具**: Google CLASP
- **版本控制**: Git

### 代碼標準
- 使用 ES6+ 語法
- 遵循 Google Apps Script 最佳實踐
- 保持 80% 以上測試覆蓋率
- 所有 API 調用需要錯誤處理和重試機制

### 架構模式
- 模組化設計 (RateLimiter, ErrorHandler, ProgressTracker)
- 批次處理功能
- 5分鐘快取機制
- 錯誤處理和重試

### 性能要求
- API 請求限速: 50/分鐘
- 批次大小: 50 項目
- 執行時間限制: 6分鐘 (Apps Script 限制)
- 記憶體使用: <50MB

## 自動化工具鏈

### 開發流程
```bash
# 開發模式
npm run dev

# 代碼檢查
npm run lint
npm run format

# 測試
npm test
npm run test:coverage

# 部署
npm run deploy:test
npm run deploy:prod
```

### 質量控制
- 預提交檢查: ESLint + 單元測試
- 推送前檢查: 完整測試套件
- 部署前檢查: 建置 + 整合測試

## 專案特定指令

### 常用命令
- `npm run setup`: 初始化專案設定
- `npm run validate`: 完整驗證流程
- `npm run clean`: 清理建置檔案
- `npm run docs:build`: 生成 API 文檔

### Google Apps Script 特定
- `clasp push`: 推送代碼到 GAS
- `clasp pull`: 從 GAS 拉取代碼
- `clasp logs`: 查看執行日誌
- `clasp deploy`: 部署新版本
- `clasp login`: 登入 Google Apps Script
- `clasp open`: 開啟 Apps Script IDE

## 安全標準
- 不在代碼中硬編碼 API 金鑰
- 使用 PropertiesService 存儲敏感資訊
- 遵循 OWASP 安全準則
- 符合 FERPA 和 GDPR 法規要求

## 效能指標
- API 效率: 快取機制改善
- 錯誤處理: 自動重試功能
- 處理速度: 支援大量課程
- 記憶體使用: 低使用量
- 執行時間: 6分鐘內

## SuperClaude 整合

### 輔助功能
- 代碼優化建議
- 批次處理效率
- 錯誤診斷協助
- 性能分析

### 開發輔助
- 自動生成單元測試
- API 文檔自動更新
- 依賴關係分析
- 安全漏洞掃描

## 任務管理規則
- 使用 TodoWrite 追蹤複雜任務
- 批次操作需要進度追蹤
- 錯誤處理需要詳細記錄
- 性能優化需要基準測試

## 🎯 RULE COMPLIANCE CHECK

Before starting ANY task, verify:
- [ ] ✅ I acknowledge all critical rules above
- [ ] Files go in proper module structure (not root)
- [ ] Use Task agents for >30 second operations
- [ ] TodoWrite for 3+ step tasks
- [ ] Commit after each completed task
- [ ] GitHub backup after every commit

## 🚀 COMMON COMMANDS

```bash
# Development workflow
npm run dev                # Watch and auto-push to GAS
npm run auto-push         # Format, lint, and push
npm run validate          # Full validation pipeline

# Testing and quality
npm run lint              # Check code quality
npm run format           # Format code
npm run test             # Run tests

# Deployment
npm run deploy:test      # Deploy to test environment
npm run deploy:prod      # Deploy to production
npm run logs             # View execution logs
npm run open             # Open Apps Script IDE

# GitHub backup (MANDATORY after commits)
git push origin main

# Google Apps Script setup (first time only)
clasp login              # Login to Google Apps Script
```

## 🚨 TECHNICAL DEBT PREVENTION

### ❌ WRONG APPROACH (Creates Technical Debt):
```bash
# Creating new file without searching first
Write(file_path="new_feature.js", content="...")
```

### ✅ CORRECT APPROACH (Prevents Technical Debt):
```bash
# 1. SEARCH FIRST
Grep(pattern="feature.*implementation", include="*.js")
# 2. READ EXISTING FILES  
Read(file_path="src/ExistingFeature.js")
# 3. EXTEND EXISTING FUNCTIONALITY
Edit(file_path="src/ExistingFeature.js", old_string="...", new_string="...")
```

## 🧹 DEBT PREVENTION WORKFLOW

### Before Creating ANY New File:
1. **🔍 Search First** - Use Grep/Glob to find existing implementations
2. **📋 Analyze Existing** - Read and understand current patterns
3. **🤔 Decision Tree**: Can extend existing? → DO IT | Must create new? → Document why
4. **✅ Follow Patterns** - Use established project patterns
5. **📈 Validate** - Ensure no duplication or technical debt

### Google Apps Script Specific Rules:
- All files must be in `src/` directory
- Use PropertiesService for configuration
- Follow `filePushOrder` in package.json
- Maintain Google Apps Script globals
- Use proper error handling patterns

### ✅ RECENT MAJOR FIXES (v2.0.1):
- **教師資料讀取修復**: 完全解決 "Unknown Teacher" 問題，修正欄位映射錯誤
- **學生課程資料擴展系統**: 4521 筆記錄 100% 成功處理，支援班級到課程的完整映射
- **動態教師資料系統**: 取代硬編碼，從 `course_teacher` 工作表讀取真實教師資料
- **新增測試功能**: `testTeacherMapping()` 用於驗證教師資料讀取功能

### ⚠️ KNOWN TECHNICAL DEBT:
- `AIIntelligentMapping.js` 有部分 ESLint 錯誤需要清理
- 部分 undefined 函數引用需要重構
- Current main file: `Code.js` (as per filePushOrder) - 已穩定運作

---

**⚠️ Prevention is better than consolidation - build clean from the start.**  
**🎯 Focus on single source of truth and extending existing functionality.**  
**📈 Each task should maintain clean architecture and prevent technical debt.**

---

## 📜 執行歷史（AI 自動更新）

### 2024-12-22

| 時間 | 操作 | 目標 | 結果 |
|------|------|------|------|
| 14:09 | 新增老師 | KCFS 全部 (84 課程) | ✅ 84 成功 |
| 13:53 | 移除老師 | 舊 KCFS 課程 (19 課程) | ✅ 19 成功 |
| 13:19 | 快速測試 | KCFS-G6 Inventors | ✅ 權限正常 |

### 常用操作快速參考

| 需求 | 執行函數 | 備註 |
|------|----------|------|
| 預覽 KCFS 課程 | `previewKCFSCourses` | 約 2-3 分鐘 |
| 新增老師到 KCFS | `addTeacherToKCFSCourses` | 需指定老師 email |
| 快速測試權限 | `quickTestAddTeacher` | 3-5 秒 |
| 建立 myPal 課程 | `createMyPalCourse` | 需填寫 sheets |

---

*🤖 AI Agent 為核心 | Google Classroom Manager Pro | 2024*  
*Powered by Cursor + Claude | 對話即開發*