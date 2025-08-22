/**
 * 統一錯誤處理系統
 * 提供一致的錯誤處理、日誌記錄和使用者通知
 */
class ErrorHandler {
  /**
   * 處理一般錯誤
   */
  static handle(error, operation = '操作', showToUser = true) {
    const errorInfo = this.parseError(error);
    const message = `${operation}失敗：${errorInfo.userMessage}`;

    // 記錄詳細錯誤
    console.log(`[ERROR] [${operation}] ${errorInfo.technicalMessage}`);
    if (error.stack) {
      console.log(`[ERROR] Stack: ${error.stack}`);
    }

    // 通知使用者（避免在非UI環境中呼叫）
    if (showToUser) {
      try {
        SpreadsheetApp.getUi().alert('錯誤', message, SpreadsheetApp.getUi().ButtonSet.OK);
      } catch (uiError) {
        console.log(`[WARN] 無法顯示UI錯誤訊息（可能在Apps Script編輯器中執行）: ${message}`);
      }
    }

    return {
      success: false,
      error: errorInfo,
      userMessage: message,
    };
  }

  /**
   * 處理 API 錯誤
   */
  static handleApiError(error, operation = 'API 呼叫') {
    const errorInfo = this.parseApiError(error);

    console.log(`[ERROR] [API錯誤] ${operation}: ${errorInfo.technicalMessage}`);

    // 根據錯誤類型決定是否重試
    if (errorInfo.shouldRetry) {
      console.log(`[INFO] ${operation} 將自動重試`);
      return { shouldRetry: true, delay: errorInfo.retryDelay };
    }

    const message = `${operation}失敗：${errorInfo.userMessage}`;
    try {
      SpreadsheetApp.getUi().alert('API 錯誤', message, SpreadsheetApp.getUi().ButtonSet.OK);
    } catch (uiError) {
      console.log(`[WARN] 無法顯示API錯誤訊息（可能在Apps Script編輯器中執行）: ${message}`);
    }

    return {
      success: false,
      error: errorInfo,
      userMessage: message,
    };
  }

  /**
   * 解析一般錯誤
   */
  static parseError(error) {
    if (!error) {
      return {
        userMessage: '未知錯誤',
        technicalMessage: 'Undefined error',
      };
    }

    const message = error.message || error.toString();

    // 權限錯誤
    if (message.includes('permission') || message.includes('access')) {
      return {
        userMessage: '權限不足，請檢查存取權限',
        technicalMessage: message,
      };
    }

    // 網路錯誤
    if (message.includes('network') || message.includes('timeout')) {
      return {
        userMessage: '網路連線問題，請稍後再試',
        technicalMessage: message,
      };
    }

    // 資料錯誤
    if (message.includes('Invalid') || message.includes('not found')) {
      return {
        userMessage: '資料格式錯誤或找不到指定項目',
        technicalMessage: message,
      };
    }

    return {
      userMessage: '系統發生錯誤，請聯繫管理員',
      technicalMessage: message,
    };
  }

  /**
   * 解析 API 錯誤
   */
  static parseApiError(error) {
    const message = error.message || error.toString();

    // 配額超限
    if (message.includes('quota') || message.includes('rate limit')) {
      return {
        type: 'QUOTA_EXCEEDED',
        userMessage: 'API 使用量超限，請稍後再試',
        technicalMessage: message,
        shouldRetry: true,
        retryDelay: 60000, // 1 分鐘
      };
    }

    // 暫時性錯誤
    if (message.includes('503') || message.includes('502')) {
      return {
        type: 'SERVICE_UNAVAILABLE',
        userMessage: '服務暫時無法使用，正在重試',
        technicalMessage: message,
        shouldRetry: true,
        retryDelay: 5000, // 5 秒
      };
    }

    // 認證錯誤
    if (message.includes('401') || message.includes('unauthorized')) {
      return {
        type: 'UNAUTHORIZED',
        userMessage: '認證失敗，請重新授權',
        technicalMessage: message,
        shouldRetry: false,
      };
    }

    // 找不到資源
    if (message.includes('404') || message.includes('not found')) {
      return {
        type: 'NOT_FOUND',
        userMessage: '找不到指定的課程或使用者',
        technicalMessage: message,
        shouldRetry: false,
      };
    }

    return {
      type: 'UNKNOWN_API_ERROR',
      userMessage: 'API 呼叫失敗，請稍後再試',
      technicalMessage: message,
      shouldRetry: false,
    };
  }

  /**
   * 執行帶錯誤處理的操作
   */
  static async executeWithRetry(operation, operationName, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[DEBUG] 執行 ${operationName}，第 ${attempt} 次嘗試`);
        const result = await operation();

        if (attempt > 1) {
          console.log(`[INFO] ${operationName} 重試成功`);
        }

        return { success: true, result };
      } catch (error) {
        lastError = error;
        const errorInfo = this.handleApiError(error, operationName);

        if (!errorInfo.shouldRetry || attempt === maxRetries) {
          console.log(`[ERROR] ${operationName} 最終失敗，已嘗試 ${attempt} 次`);
          break;
        }

        console.log(`[WARN] ${operationName} 第 ${attempt} 次失敗，等待重試`);
        await Utilities.sleep(errorInfo.delay || 1000);
      }
    }

    return this.handle(lastError, operationName);
  }

  /**
   * 驗證必要參數
   */
  static validateRequired(params, requiredFields) {
    const missing = [];

    for (const field of requiredFields) {
      if (!params[field] || params[field].toString().trim() === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      const message = `缺少必要參數：${missing.join(', ')}`;
      console.log(`[ERROR] 參數驗證失敗: 缺少 ${missing.join(', ')}`);
      try {
        SpreadsheetApp.getUi().alert('參數錯誤', message, SpreadsheetApp.getUi().ButtonSet.OK);
      } catch (uiError) {
        console.log(`[WARN] 無法顯示參數錯誤訊息（可能在Apps Script編輯器中執行）: ${message}`);
      }
      return false;
    }

    return true;
  }
}
