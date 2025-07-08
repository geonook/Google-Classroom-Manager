# CLAUDE.md - Google Classroom Manager Pro SuperClaude Configuration

## 專案概述
Google Classroom Manager Pro v2.0.0 - 企業級課程管理自動化工具
基於 Google Apps Script 的批次處理引擎，支援大規模課程與成員管理

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
- 批次處理優先
- 5分鐘智能快取
- 企業級錯誤恢復

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

## 效能基準
- API 效率提升: +60%
- 錯誤恢復率: 95%+
- 處理速度: 1000+ 課程/小時
- 記憶體使用: <50MB
- 執行時間: <6分鐘

## SuperClaude 整合

### 智能功能
- 自動代碼優化
- 批次處理效率提升
- 智能錯誤診斷
- 性能瓶頸識別

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

---
*SuperClaude v2.0.1 | Google Classroom Manager Pro | 企業級教育自動化解決方案*