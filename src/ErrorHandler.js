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

    // 如果有診斷資訊，記錄到控制台
    if (errorInfo.diagnosticInfo) {
      console.log(`[診斷] 可能原因：`);
      errorInfo.diagnosticInfo.possibleCauses.forEach((cause, index) => {
        console.log(`  ${index + 1}. ${cause}`);
      });
      console.log(`[診斷] 建議解決方案：`);
      errorInfo.diagnosticInfo.solutions.forEach((solution, index) => {
        console.log(`  ${index + 1}. ${solution}`);
      });
    }

    // 通知使用者（避免在非UI環境中呼叫）
    if (showToUser) {
      try {
        // 如果有診斷資訊，顯示詳細診斷
        if (errorInfo.diagnosticInfo && (errorInfo.type === 'CANNOT_DIRECT_ADD_USER' || errorInfo.type === 'PERMISSION_DENIED')) {
          this.showDetailedErrorDialog(operation, errorInfo);
        } else {
          SpreadsheetApp.getUi().alert('錯誤', message, SpreadsheetApp.getUi().ButtonSet.OK);
        }
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

    // 無法直接新增用戶錯誤
    if (message.includes('CannotDirectAddUser') || message.includes('Unable to directly add the user')) {
      return {
        type: 'CANNOT_DIRECT_ADD_USER',
        userMessage: '無法直接新增此用戶到課程',
        technicalMessage: message,
        shouldRetry: false,
        diagnosticInfo: {
          possibleCauses: [
            '學生 Email 域與課程管理員域不匹配',
            '學生帳戶不存在或未啟用',
            '缺少域管理員權限',
            '課程設定不允許直接新增學生'
          ],
          solutions: [
            '檢查學生 Email 是否正確',
            '確認學生帳戶已在 Google Workspace 中啟用',
            '使用具備域管理員權限的帳戶',
            '聯絡 IT 管理員檢查域設定'
          ]
        }
      };
    }

    // 權限相關錯誤
    if (message.includes('403') || message.includes('Forbidden') || message.includes('permission denied')) {
      return {
        type: 'PERMISSION_DENIED',
        userMessage: '權限不足，無法執行此操作',
        technicalMessage: message,
        shouldRetry: false,
        diagnosticInfo: {
          possibleCauses: [
            '缺少 Google Classroom 權限',
            '不是課程擁有者或協同老師',
            '缺少域管理員權限',
            'OAuth 範圍設定不完整'
          ],
          solutions: [
            '檢查 Google Classroom 存取權限',
            '確認是課程擁有者或已被授權管理',
            '使用域管理員帳戶執行操作',
            '重新授權應用程式權限'
          ]
        }
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

  /**
   * 顯示詳細的錯誤診斷對話框
   */
  static showDetailedErrorDialog(operation, errorInfo) {
    const ui = SpreadsheetApp.getUi();
    
    let dialogMessage = `${operation}失敗：${errorInfo.userMessage}\n\n`;
    
    if (errorInfo.diagnosticInfo) {
      dialogMessage += '🔍 可能原因：\n';
      errorInfo.diagnosticInfo.possibleCauses.forEach((cause, index) => {
        dialogMessage += `${index + 1}. ${cause}\n`;
      });
      
      dialogMessage += '\n💡 建議解決方案：\n';
      errorInfo.diagnosticInfo.solutions.forEach((solution, index) => {
        dialogMessage += `${index + 1}. ${solution}\n`;
      });
      
      if (errorInfo.type === 'CANNOT_DIRECT_ADD_USER') {
        dialogMessage += '\n⚠️ 特別說明：\n';
        dialogMessage += '• 此錯誤通常表示學生 Email 域與課程管理員域不匹配\n';
        dialogMessage += '• 建議檢查學生 Email 是否為學校域名（如 @school.edu）\n';
        dialogMessage += '• 或聯絡 IT 管理員確認域設定';
      }
    }
    
    ui.alert('❌ 操作失敗', dialogMessage, ui.ButtonSet.OK);
  }

  /**
   * 驗證用戶 Email 域是否匹配
   */
  static validateUserDomain(userEmail, allowedDomains = []) {
    if (!userEmail || !userEmail.includes('@')) {
      return {
        valid: false,
        reason: 'Email 格式無效'
      };
    }
    
    const domain = userEmail.split('@')[1].toLowerCase();
    
    // 如果沒有指定允許的域，嘗試檢測當前用戶域
    if (allowedDomains.length === 0) {
      try {
        const currentUserEmail = Session.getActiveUser().getEmail();
        const currentDomain = currentUserEmail.split('@')[1].toLowerCase();
        allowedDomains = [currentDomain];
      } catch (error) {
        console.log('無法獲取當前用戶域，跳過域驗證');
        return { valid: true }; // 無法驗證則假設有效
      }
    }
    
    const isValidDomain = allowedDomains.includes(domain);
    
    return {
      valid: isValidDomain,
      userDomain: domain,
      allowedDomains: allowedDomains,
      reason: isValidDomain ? null : `Email 域 ${domain} 不在允許的域清單中: ${allowedDomains.join(', ')}`
    };
  }

  /**
   * 預檢用戶新增條件
   */
  static async validateUserAddition(userEmail, courseId) {
    console.log(`🔍 預檢用戶新增條件：${userEmail} → 課程 ${courseId}`);
    
    const validations = [];
    
    // 1. Email 格式檢查
    if (!userEmail || !userEmail.includes('@')) {
      validations.push({
        type: 'EMAIL_FORMAT',
        valid: false,
        message: 'Email 格式無效'
      });
    } else {
      validations.push({
        type: 'EMAIL_FORMAT',
        valid: true,
        message: 'Email 格式正確'
      });
    }
    
    // 2. 域名匹配檢查
    const domainCheck = this.validateUserDomain(userEmail);
    validations.push({
      type: 'DOMAIN_MATCH',
      valid: domainCheck.valid,
      message: domainCheck.reason || '域名匹配',
      details: domainCheck
    });
    
    // 3. 課程ID檢查
    if (!courseId || !/^\d{10,15}$/.test(courseId)) {
      validations.push({
        type: 'COURSE_ID',
        valid: false,
        message: '課程 ID 格式無效'
      });
    } else {
      validations.push({
        type: 'COURSE_ID',
        valid: true,
        message: '課程 ID 格式正確'
      });
    }
    
    const allValid = validations.every(v => v.valid);
    const failedValidations = validations.filter(v => !v.valid);
    
    console.log(`📊 預檢結果：${allValid ? '✅ 通過' : '❌ 失敗'}`);
    if (!allValid) {
      failedValidations.forEach(v => {
        console.log(`  ❌ ${v.type}: ${v.message}`);
      });
    }
    
    return {
      valid: allValid,
      validations: validations,
      failedValidations: failedValidations
    };
  }
}
