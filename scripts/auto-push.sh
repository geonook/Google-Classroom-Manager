#!/bin/bash

# Google Apps Script 自動推送腳本
# 使用方法: ./scripts/auto-push.sh [watch]

set -e

echo "🚀 Google Apps Script 自動推送開始..."

# 檢查 CLASP 是否已安裝
if ! command -v clasp &> /dev/null; then
    echo "❌ CLASP 未安裝，正在安裝..."
    npm install -g @google/clasp
fi

# 檢查是否已登入
if [ ! -f ~/.clasprc.json ]; then
    echo "❌ CLASP 未登入，請先執行: clasp login"
    exit 1
fi

# 檢查專案設定
if [ ! -f .clasp.json ]; then
    echo "❌ 找不到 .clasp.json 檔案"
    echo "請先執行: clasp create 或設定 Script ID"
    exit 1
fi

# 格式化程式碼
echo "📝 格式化程式碼..."
npm run format

# 檢查程式碼品質
echo "🔍 檢查程式碼品質..."
npm run lint:fix

# 推送到 Google Apps Script
echo "📤 推送到 Google Apps Script..."
clasp push

echo "✅ 推送完成！"

# 如果是 watch 模式
if [ "$1" = "watch" ]; then
    echo "👀 開始監控檔案變更..."
    npm run watch
fi

# 顯示專案資訊
echo ""
echo "📊 專案資訊:"
clasp status

# 選擇性開啟編輯器
read -p "是否要開啟 Google Apps Script 編輯器？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    clasp open
fi