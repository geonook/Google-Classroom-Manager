/**
 * API 限速器 - 控制 Classroom API 呼叫頻率
 * 避免超過 Google API 配額限制
 * 
 * v2.0 優化版：智能限速，支援突發請求
 */
class RateLimiter {
  constructor() {
    this.lastCallTime = 0;
    this.callCount = 0;
    this.resetTime = Date.now();

    // API 限制設定（Google Classroom API 限制）
    this.REQUESTS_PER_MINUTE = 50;
    this.REQUESTS_PER_DAY = 50000;
    
    // 智能限速設定
    this.MIN_DELAY_MS = 100;       // 最小間隔：100ms（快速連續呼叫）
    this.BURST_LIMIT = 10;         // 允許連續 10 個快速呼叫
    this.COOLDOWN_DELAY_MS = 2000; // 超過突發限制後等待 2 秒
    this.burstCount = 0;
    this.lastBurstReset = Date.now();
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
   * 智能等待 - 支援突發請求
   */
  async waitIfNeeded() {
    const now = Date.now();
    
    // 每分鐘重置突發計數
    if (now - this.lastBurstReset > 60000) {
      this.burstCount = 0;
      this.lastBurstReset = now;
      this.callCount = 0;
      this.resetTime = now;
    }
    
    // 檢查是否接近每分鐘限制
    if (this.callCount >= this.REQUESTS_PER_MINUTE - 5) {
      const waitTime = 60000 - (now - this.resetTime);
      if (waitTime > 0) {
        console.log(`[WARN] 接近 API 限制，等待 ${Math.round(waitTime / 1000)} 秒`);
        await Utilities.sleep(waitTime);
        this.callCount = 0;
        this.resetTime = Date.now();
      }
      return;
    }
    
    // 突發模式：允許快速連續呼叫
    if (this.burstCount < this.BURST_LIMIT) {
      const timeSinceLastCall = now - this.lastCallTime;
      if (timeSinceLastCall < this.MIN_DELAY_MS) {
        await Utilities.sleep(this.MIN_DELAY_MS - timeSinceLastCall);
      }
      this.burstCount++;
      return;
    }
    
    // 超過突發限制，進入冷卻
    console.log(`[DEBUG] 突發冷卻 ${this.COOLDOWN_DELAY_MS}ms`);
    await Utilities.sleep(this.COOLDOWN_DELAY_MS);
    this.burstCount = 0;
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
