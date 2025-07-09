# CLAUDE.md - Google Classroom Manager Pro

> **Documentation Version**: 2.0.1  
> **Last Updated**: 2025-07-09  
> **Project**: Google Classroom Manager Pro v2.0.0  
> **Description**: 基於 Google Apps Script 的批次處理工具，用於課程與成員管理  
> **Features**: GitHub auto-backup, Task agents, technical debt prevention, SuperClaude integration

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
clasp logs              # View execution logs

# GitHub backup (MANDATORY after commits)
git push origin main
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

### ⚠️ KNOWN TECHNICAL DEBT:
- `OptimizedCode.js` duplicates functionality from `Code.js`
- Future refactoring should consolidate these into single source of truth
- Current main file: `Code.js` (as per filePushOrder)
- Consider merging optimizations into main file

---

**⚠️ Prevention is better than consolidation - build clean from the start.**  
**🎯 Focus on single source of truth and extending existing functionality.**  
**📈 Each task should maintain clean architecture and prevent technical debt.**

---

*SuperClaude v2.0.1 | Google Classroom Manager Pro | 教育管理工具*  
*Template by Chang Ho Chien | HC AI 說人話channel | Enhanced with Claude Code best practices*