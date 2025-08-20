
const fs = require('fs');
const path = require('path');

// Google Apps Script 的程式碼不是標準的 Node.js 模組，
// 所以我們需要讀取文件內容並使用 eval() 來讓它在測試環境中可用。
const scriptPath = path.resolve(__dirname, '../src/ErrorHandler.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// 透過 new Function() 的方式將 class 載入到全域範圍，使其在測試中可用
global.ErrorHandler = new Function(`${scriptContent}; return ErrorHandler;`)();

// 測試 ErrorHandler.parseError 方法
describe('ErrorHandler.parseError', () => {
  it('應該能處理權限錯誤', () => {
    const error = new Error('User does not have permission to access this resource.');
    const result = ErrorHandler.parseError(error);
    expect(result.userMessage).toBe('權限不足，請檢查存取權限');
    expect(result.technicalMessage).toContain('permission');
  });

  it('應該能處理網路錯誤', () => {
    const error = new Error('Network request failed due to a timeout.');
    const result = ErrorHandler.parseError(error);
    expect(result.userMessage).toBe('網路連線問題，請稍後再試');
    expect(result.technicalMessage).toContain('timeout');
  });

  it('應該能處理資料無效錯誤', () => {
    const error = new Error('Invalid data format provided.');
    const result = ErrorHandler.parseError(error);
    expect(result.userMessage).toBe('資料格式錯誤或找不到指定項目');
    expect(result.technicalMessage).toContain('Invalid data');
  });

  it('應該能處理未定義的一般錯誤', () => {
    const error = new Error('Something unexpected happened.');
    const result = ErrorHandler.parseError(error);
    expect(result.userMessage).toBe('系統發生錯誤，請聯繫管理員');
    expect(result.technicalMessage).toBe('Something unexpected happened.');
  });

  it('應該能處理 null 或 undefined 的錯誤輸入', () => {
    const result = ErrorHandler.parseError(null);
    expect(result.userMessage).toBe('未知錯誤');
    expect(result.technicalMessage).toBe('Undefined error');
  });
});
