/**
 * 進度追蹤系統
 * 為批次操作提供進度顯示和使用者回饋
 */
class ProgressTracker {
  constructor(total, operation = '處理中') {
    this.total = total;
    this.current = 0;
    this.operation = operation;
    this.startTime = Date.now();
    this.errors = [];
    this.successes = [];

    this.updateInterval = Math.max(1, Math.floor(total / 20)); // 每 5% 更新一次
    this.lastUpdate = 0;
  }

  /**
   * 更新進度
   */
  update(increment = 1, message = '') {
    this.current += increment;

    // 控制更新頻率，避免過於頻繁的 UI 更新
    if (this.current - this.lastUpdate >= this.updateInterval || this.current === this.total) {
      this.showProgress(message);
      this.lastUpdate = this.current;
    }
  }

  /**
   * 記錄成功項目 - Apps Script 編輯器優化版
   */
  addSuccess(item, details = '') {
    this.successes.push({
      item,
      details,
      timestamp: new Date().toISOString(),
    });

    // Apps Script 編輯器即時反饋
    if (this.successes.length % 50 === 0 || this.successes.length <= 10) {
      console.log(`✅ [${this.successes.length}] 成功: ${item} ${details ? `| ${details}` : ''}`);
    }

    this.update();
  }

  /**
   * 記錄錯誤項目 - Apps Script 編輯器優化版
   */
  addError(item, error, details = '') {
    const errorMessage = error.message || error.toString();
    this.errors.push({
      item,
      error: errorMessage,
      details,
      timestamp: new Date().toISOString(),
    });

    // Apps Script 編輯器詳細錯誤日誌
    console.log(`❌ [錯誤 ${this.errors.length}] ${this.operation} 失敗: ${item}`);
    console.log(`   🔍 錯誤詳情: ${errorMessage}`);
    if (details) {
      console.log(`   📝 額外資訊: ${details}`);
    }
    console.log(`   ⏰ 發生時間: ${new Date().toLocaleString()}`);

    // 如果是特定的 API 錯誤，提供更多診斷資訊
    if (errorMessage.includes('CannotDirectAddUser')) {
      console.log(`   💡 診斷: 可能是學生域名不匹配或帳戶權限問題`);
    } else if (errorMessage.includes('403') || errorMessage.includes('permission')) {
      console.log(`   💡 診斷: 權限不足，檢查是否為課程管理員或域管理員`);
    } else if (errorMessage.includes('quota') || errorMessage.includes('rate')) {
      console.log(`   💡 診斷: API 配額超限，系統將自動重試`);
    }

    this.update();
  }

  /**
   * 顯示進度 - 優化版本，提供更好的實時反饋
   * 針對 Apps Script 編輯器直接執行優化
   */
  showProgress(message = '') {
    const percentage = Math.round((this.current / this.total) * 100);
    const elapsed = Date.now() - this.startTime;
    const estimated = this.current > 0 ? (elapsed / this.current) * this.total : 0;
    const remaining = Math.max(0, estimated - elapsed);

    const progressBar = this.createProgressBar(percentage);
    const timeInfo = this.formatTime(remaining);

    // 成功和錯誤統計
    const successCount = this.successes.length;
    const errorCount = this.errors.length;

    // 🚀 Apps Script 編輯器專用 - 詳細分行輸出
    if (this.current === 1 || percentage % 10 === 0 || this.current === this.total) {
      console.log(''); // 空行分隔
      console.log(`📊 ============== 進度報告 ${percentage}% ==============`);
      console.log(`🎯 操作: ${this.operation}`);
      console.log(`${progressBar} ${percentage}%`);
      console.log(`📈 進度: ${this.current}/${this.total} 項`);

      if (this.current > 0 && this.current < this.total) {
        console.log(`⏱️  預估剩餘時間: ${timeInfo}`);
      }

      if (successCount > 0 || errorCount > 0) {
        console.log(`✅ 成功: ${successCount} 項`);
        if (errorCount > 0) {
          console.log(`❌ 錯誤: ${errorCount} 項`);
        }
      }

      // 顯示處理速度
      if (this.current > 0) {
        const itemsPerSecond = Math.round((this.current / (elapsed / 1000)) * 10) / 10;
        const itemsPerMinute = Math.round(itemsPerSecond * 60);
        console.log(`🚄 處理速度: ${itemsPerSecond}/秒 (${itemsPerMinute}/分鐘)`);

        // 詳細時間統計
        const avgTimePerItem = Math.round(elapsed / this.current);
        console.log(`⏲️  平均每項耗時: ${avgTimePerItem}毫秒`);
      }

      if (message) {
        console.log(`💡 訊息: ${message}`);
      }

      console.log(`⏰ 已執行時間: ${this.formatTime(elapsed)}`);

      // 如果有最近的錯誤，顯示最新的3個
      if (errorCount > 0) {
        console.log(`📋 最新錯誤 (最近 ${Math.min(3, errorCount)} 項):`);
        this.errors.slice(-3).forEach((error, index) => {
          console.log(
            `  ${index + 1}. ${error.item}: ${error.error.substring(0, 100)}${error.error.length > 100 ? '...' : ''}`
          );
        });
      }

      // 如果有成功項目，顯示最新的3個
      if (successCount > 0 && percentage % 25 === 0) {
        console.log(`📋 最新成功 (最近 ${Math.min(3, successCount)} 項):`);
        this.successes.slice(-3).forEach((success, index) => {
          console.log(
            `  ${index + 1}. ${success.item} ${success.details ? `(${success.details})` : ''}`
          );
        });
      }

      console.log(`================================================`);
    } else {
      // 簡化版本 - 每次更新
      console.log(
        `[${percentage.toString().padStart(3)}%] ${this.operation} | ${this.current}/${this.total} | ✅${successCount} | ❌${errorCount}`
      );
    }

    // 原有的 Google Sheets Toast 功能 (如果在 Sheets 環境中)
    const shouldShowToast =
      percentage === 0 || // 開始
      percentage >= 100 || // 完成
      percentage % 20 === 0 || // 每20%更新
      errorCount > 0 || // 有錯誤時
      this.current % Math.max(1, Math.floor(this.total / 10)) === 0; // 每10%進度

    if (shouldShowToast) {
      try {
        // 縮短 Toast 訊息以避免過長
        let toastMessage = `${this.operation} ${percentage}%`;
        if (this.current < this.total) {
          toastMessage += ` (${this.current}/${this.total})`;
        }
        if (errorCount > 0) {
          toastMessage += ` ❌${errorCount}`;
        }

        SpreadsheetApp.getActiveSpreadsheet().toast(
          toastMessage,
          percentage >= 100 ? '✅ 完成' : '⏳ 執行中',
          percentage >= 100 ? 5 : 3
        );
      } catch (toastError) {
        console.log(
          `[WARN] Toast 顯示失敗: ${toastError.message} (可能在 Apps Script 編輯器中執行)`
        );
      }
    }
  }

  /**
   * 創建進度條
   */
  createProgressBar(percentage) {
    const barLength = 20;
    const filled = Math.round((percentage / 100) * barLength);
    const empty = barLength - filled;

    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  }

  /**
   * 格式化時間
   */
  formatTime(ms) {
    if (ms < 60000) {
      return `${Math.round(ms / 1000)}秒`;
    } else if (ms < 3600000) {
      return `${Math.round(ms / 60000)}分鐘`;
    } else {
      return `${Math.round(ms / 3600000)}小時`;
    }
  }

  /**
   * 完成處理並顯示摘要 - 優化版本，移除重複 UI alert
   */
  complete() {
    const duration = Date.now() - this.startTime;
    const summary = this.generateSummary(duration);

    const successCount = this.successes.length;
    const errorCount = this.errors.length;
    const completionRate = Math.round((successCount / Math.max(this.total, 1)) * 100);

    // 詳細的控制台日誌
    console.log(`[COMPLETE] ${this.operation} 執行完成:`);
    console.log(`  📊 總任務: ${this.total}`);
    console.log(`  ✅ 成功: ${successCount} (${completionRate}%)`);
    console.log(`  ❌ 失敗: ${errorCount}`);
    console.log(`  ⏱️ 耗時: ${this.formatTime(duration)}`);

    if (this.total > 0) {
      const avgTime = Math.round(duration / this.total);
      console.log(`  🚄 平均: ${avgTime}ms/任務`);
    }

    // 最終 Toast 通知
    try {
      let finalMessage = `${this.operation} 完成`;
      if (errorCount === 0) {
        finalMessage += ` ✅ 全部成功 (${successCount})`;
      } else {
        finalMessage += ` ⚠️ ${successCount} 成功, ${errorCount} 失敗`;
      }

      SpreadsheetApp.getActiveSpreadsheet().toast(finalMessage, '🎉 執行完成', 8);
    } catch (toastError) {
      console.log(`[WARN] 完成 Toast 顯示失敗: ${toastError.message}`);
    }

    // 記錄錯誤詳情（如果有的話）
    if (errorCount > 0) {
      console.log(`[ERRORS] 錯誤詳情:`);
      this.errors.slice(0, 10).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.item}: ${error.error}`);
      });
      if (errorCount > 10) {
        console.log(`  ... 以及其他 ${errorCount - 10} 個錯誤`);
      }
    }

    return summary;
  }

  /**
   * 生成處理摘要
   */
  generateSummary(duration) {
    const successCount = this.successes.length;
    const errorCount = this.errors.length;
    const totalProcessed = successCount + errorCount;

    let userMessage = `處理完成！\n\n`;
    userMessage += `總計：${this.total} 項\n`;
    userMessage += `成功：${successCount} 項\n`;
    userMessage += `失敗：${errorCount} 項\n`;
    userMessage += `耗時：${this.formatTime(duration)}\n`;

    if (errorCount > 0) {
      userMessage += `\n錯誤詳情：\n`;
      this.errors.slice(0, 5).forEach((error) => {
        userMessage += `• ${error.item}：${error.error}\n`;
      });

      if (errorCount > 5) {
        userMessage += `• 以及其他 ${errorCount - 5} 個錯誤...\n`;
      }
    }

    return {
      userMessage,
      statistics: {
        total: this.total,
        processed: totalProcessed,
        successful: successCount,
        failed: errorCount,
        duration,
        averageTime: totalProcessed > 0 ? duration / totalProcessed : 0,
      },
      errors: this.errors,
      successes: this.successes,
    };
  }

  /**
   * 中斷處理
   */
  abort(reason = '使用者中斷') {
    console.log(`[WARN] ${this.operation} 被中斷：${reason}`);

    const summary = this.generateSummary(Date.now() - this.startTime);
    summary.userMessage = `處理被中斷：${reason}\n\n` + summary.userMessage;

    try {
      SpreadsheetApp.getUi().alert(
        '處理中斷',
        summary.userMessage,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } catch (uiError) {
      console.log(
        `[WARN] 無法顯示中斷訊息UI（可能在Apps Script編輯器中執行）: ${summary.userMessage}`
      );
    }

    return summary;
  }

  /**
   * 獲取當前狀態
   */
  getStatus() {
    return {
      operation: this.operation,
      total: this.total,
      current: this.current,
      percentage: Math.round((this.current / this.total) * 100),
      errors: this.errors.length,
      successes: this.successes.length,
      isComplete: this.current >= this.total,
    };
  }
}
