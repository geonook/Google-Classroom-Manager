/**
 * API 限速器 - 控制 Classroom API 呼叫頻率
 * 避免超過 Google API 配額限制
 */
class RateLimiter {
  constructor() {
    this.lastCallTime = 0;
    this.callCount = 0;
    this.resetTime = 0;

    // API 限制設定
    this.REQUESTS_PER_MINUTE = 50;
    this.REQUESTS_PER_DAY = 50000;
    this.MIN_DELAY_MS = 1200; // 每次呼叫最小間隔
  }

  /**
   * 等待適當時間後執行 API 呼叫
   */
  async execute(apiFunction, ...args) {
    await this.waitIfNeeded();

    try {
      const result = apiFunction.apply(null, args);
      this.recordCall();
      return result;
    } catch (error) {
      if (this.isQuotaError(error)) {
        console.log('[WARN] API 配額超限，等待重試');
        await this.handleQuotaExceeded();
        return this.execute(apiFunction, ...args);
      }
      throw error;
    }
  }

  /**
   * 檢查是否需要等待
   */
  async waitIfNeeded() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;

    if (timeSinceLastCall < this.MIN_DELAY_MS) {
      const waitTime = this.MIN_DELAY_MS - timeSinceLastCall;
      console.log(`[DEBUG] API 限速等待 ${waitTime}ms`);
      await Utilities.sleep(waitTime);
    }
  }

  /**
   * 記錄 API 呼叫
   */
  recordCall() {
    this.lastCallTime = Date.now();
    this.callCount++;

    // 每分鐘重置計數
    if (Date.now() - this.resetTime > 60000) {
      this.callCount = 0;
      this.resetTime = Date.now();
    }
  }

  /**
   * 檢查是否為配額錯誤
   */
  isQuotaError(error) {
    return (
      error.message &&
      (error.message.includes('quota') ||
        error.message.includes('rate limit') ||
        error.message.includes('429'))
    );
  }

  /**
   * 處理配額超限
   */
  async handleQuotaExceeded() {
    const waitTime = 60000; // 等待 1 分鐘
    console.log(`[WARN] API 配額超限，等待 ${waitTime / 1000} 秒`);
    await Utilities.sleep(waitTime);
  }

  /**
   * 獲取當前狀態
   */
  getStatus() {
    return {
      callCount: this.callCount,
      lastCallTime: this.lastCallTime,
      isHealthy: this.callCount < this.REQUESTS_PER_MINUTE * 0.8,
    };
  }
}

// 全域實例
const rateLimiter = new RateLimiter();
