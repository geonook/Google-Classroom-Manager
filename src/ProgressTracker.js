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
   * 記錄成功項目
   */
  addSuccess(item, details = '') {
    this.successes.push({
      item,
      details,
      timestamp: new Date().toISOString(),
    });
    this.update();
  }

  /**
   * 記錄錯誤項目
   */
  addError(item, error, details = '') {
    this.errors.push({
      item,
      error: error.message || error.toString(),
      details,
      timestamp: new Date().toISOString(),
    });
    console.log(`[ERROR] ${this.operation} 錯誤: ${item} - ${error.message || error}`);
    this.update();
  }

  /**
   * 顯示進度
   */
  showProgress(message = '') {
    const percentage = Math.round((this.current / this.total) * 100);
    const elapsed = Date.now() - this.startTime;
    const estimated = this.current > 0 ? (elapsed / this.current) * this.total : 0;
    const remaining = Math.max(0, estimated - elapsed);

    const progressBar = this.createProgressBar(percentage);
    const timeInfo = this.formatTime(remaining);

    let status = `${this.operation} ${progressBar} ${percentage}%\n`;
    status += `進度：${this.current}/${this.total}`;

    if (this.current > 0 && this.current < this.total) {
      status += ` | 預估剩餘：${timeInfo}`;
    }

    if (this.errors.length > 0) {
      status += ` | 錯誤：${this.errors.length}`;
    }

    if (message) {
      status += `\n${message}`;
    }

    console.log(`[INFO] ${status}`);

    // 只在重要節點顯示 Toast 通知，避免干擾使用者
    if (percentage % 25 === 0 || this.current === this.total) {
      SpreadsheetApp.getActiveSpreadsheet().toast(status, '進度更新', 3);
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
   * 完成處理並顯示摘要
   */
  complete() {
    const duration = Date.now() - this.startTime;
    const summary = this.generateSummary(duration);

    console.log(`[INFO] ${this.operation} 完成`);

    // 顯示結果對話框
    const ui = SpreadsheetApp.getUi();
    const title = this.errors.length === 0 ? '處理完成' : '處理完成（有錯誤）';

    ui.alert(title, summary.userMessage, ui.ButtonSet.OK);

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

    SpreadsheetApp.getUi().alert(
      '處理中斷',
      summary.userMessage,
      SpreadsheetApp.getUi().ButtonSet.OK
    );

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
