#!/bin/bash
# GitHub Backup Verification Script
# This script verifies GitHub connection and performs backup

set -e

echo "🔍 Checking GitHub connection..."
git remote -v

echo "📊 Checking git status..."
git status

echo "📋 Recent commits:"
git log --oneline -5

echo "🔄 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ GitHub backup successful!"
    echo "🌐 Repository: $(git remote get-url origin)"
else
    echo "❌ GitHub backup failed!"
    exit 1
fi

echo "🔍 Verifying remote sync..."
git fetch origin
local_commit=$(git rev-parse HEAD)
remote_commit=$(git rev-parse origin/main)

if [ "$local_commit" = "$remote_commit" ]; then
    echo "✅ Local and remote are synchronized"
else
    echo "⚠️ Local and remote may be out of sync"
    echo "Local:  $local_commit"
    echo "Remote: $remote_commit"
fi