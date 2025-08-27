/**
 * Classroom API 服務層
 * 封裝所有 Classroom API 呼叫，提供統一的錯誤處理和限速控制
 */
class ClassroomService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 分鐘快取
  }

  /**
   * 列出所有活動課程（帶分頁處理）
   */
  async listAllCourses(options = {}) {
    const cacheKey = 'all_courses';

    // 檢查快取
    if (this.isCacheValid(cacheKey) && !options.forceRefresh) {
      console.log('使用快取的課程清單');
      return this.cache.get(cacheKey).data;
    }

    const courses = [];
    let pageToken = null;
    const progress = new ProgressTracker(1, '載入課程清單');

    do {
      const result = await ErrorHandler.executeWithRetry(async () => {
        return await rateLimiter.execute(() => {
          return Classroom.Courses.list({
            courseStates: ['ACTIVE'],
            pageToken: pageToken,
            pageSize: 50, // 增加每頁數量以減少請求次數
          });
        });
      }, '列出課程');

      if (!result.success) {
        progress.addError('課程清單', result.error);
        return result;
      }

      const response = result.result;

      if (response.courses) {
        courses.push(...response.courses);
        progress.update(0, `已載入 ${courses.length} 個課程`);
      }

      pageToken = response.nextPageToken;
    } while (pageToken);

    // 更新快取
    this.updateCache(cacheKey, courses);

    progress.complete();
    console.log(`載入完成，共 ${courses.length} 個課程`);

    return {
      success: true,
      data: courses,
      count: courses.length,
    };
  }

  /**
   * 獲取課程成員（老師和學生）
   */
  async getCourseMembers(courseId) {
    const cacheKey = `members_${courseId}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    const [teachersResult, studentsResult] = await Promise.allSettled([
      this.getCourseTeachers(courseId),
      this.getCourseStudents(courseId),
    ]);

    const teachers = teachersResult.status === 'fulfilled' ? teachersResult.value : [];
    const students = studentsResult.status === 'fulfilled' ? studentsResult.value : [];

    const members = { teachers, students };
    this.updateCache(cacheKey, members);

    return members;
  }

  /**
   * 獲取課程老師
   */
  async getCourseTeachers(courseId) {
    return await ErrorHandler.executeWithRetry(async () => {
      const response = await rateLimiter.execute(() => {
        return Classroom.Courses.Teachers.list(courseId);
      });

      return response.teachers || [];
    }, `獲取課程 ${courseId} 的老師清單`);
  }

  /**
   * 獲取課程學生
   */
  async getCourseStudents(courseId) {
    return await ErrorHandler.executeWithRetry(async () => {
      const response = await rateLimiter.execute(() => {
        return Classroom.Courses.Students.list(courseId);
      });

      return response.students || [];
    }, `獲取課程 ${courseId} 的學生清單`);
  }

  /**
   * 批次建立課程
   */
  async createCoursesBatch(courseNames, ownerId = 'me', options = {}) {
    if (!ErrorHandler.validateRequired({ courseNames, ownerId }, ['courseNames', 'ownerId'])) {
      return { success: false, error: '參數驗證失敗' };
    }

    const progress = new ProgressTracker(courseNames.length, '建立課程');
    const results = [];

    for (const courseName of courseNames) {
      const result = await this.createSingleCourse(courseName, ownerId);

      if (result.success) {
        progress.addSuccess(courseName, `課程 ID: ${result.data.id}`);
        results.push({
          name: courseName,
          success: true,
          courseId: result.data.id,
          course: result.data,
        });
      } else {
        progress.addError(courseName, result.error);
        results.push({
          name: courseName,
          success: false,
          error: result.error,
        });
      }

      // 提供取消機制
      if (options.checkCancellation && options.checkCancellation()) {
        progress.abort('使用者取消操作');
        break;
      }
    }

    const summary = progress.complete();

    return {
      success: summary.statistics.failed === 0,
      results,
      summary,
    };
  }

  /**
   * 建立單一課程
   */
  async createSingleCourse(courseName, ownerId = 'me') {
    return await ErrorHandler.executeWithRetry(async () => {
      const course = await rateLimiter.execute(() => {
        return Classroom.Courses.create({
          name: courseName,
          ownerId: ownerId,
          courseState: 'ACTIVE',
        });
      });

      console.log(`課程建立成功：${courseName} (ID: ${course.id})`);
      return course;
    }, `建立課程：${courseName}`);
  }

  /**
   * 批次新增成員 (原版 - 適用於小量資料)
   */
  async addMembersBatch(members, role = 'STUDENT') {
    if (!ErrorHandler.validateRequired({ members, role }, ['members', 'role'])) {
      return { success: false, error: '參數驗證失敗' };
    }

    const progress = new ProgressTracker(
      members.length,
      `新增${role === 'TEACHER' ? '老師' : '學生'}`
    );
    const results = [];

    for (const member of members) {
      const { courseId, userEmail } = member;

      if (!courseId || !userEmail) {
        progress.addError(`${userEmail || 'unknown'}`, new Error('缺少課程 ID 或使用者 Email'));
        continue;
      }

      const result = await this.addSingleMember(courseId, userEmail, role);

      if (result.success) {
        progress.addSuccess(`${userEmail} → 課程 ${courseId}`);
        results.push({
          courseId,
          userEmail,
          role,
          success: true,
        });
      } else {
        progress.addError(`${userEmail} → 課程 ${courseId}`, result.error);
        results.push({
          courseId,
          userEmail,
          role,
          success: false,
          error: result.error,
        });
      }
    }

    const summary = progress.complete();

    return {
      success: summary.statistics.failed === 0,
      results,
      summary,
    };
  }

  /**
   * 進階批次新增成員 - 支援大量資料處理
   * 特點: 斷點續傳、時間管理、自動重試、觸發器支援
   */
  async addMembersBatchAdvanced(members, role = 'STUDENT', options = {}) {
    console.log(
      `🚀 啟動進階批次新增: ${members.length} 項 ${role === 'TEACHER' ? '老師' : '學生'}`
    );

    if (!ErrorHandler.validateRequired({ members, role }, ['members', 'role'])) {
      return { success: false, error: '參數驗證失敗' };
    }

    // 如果資料量小於100，使用原版函數
    if (members.length < 100 && !options.forceAdvanced) {
      console.log('📊 資料量較小，使用原版批次處理');
      return await this.addMembersBatch(members, role);
    }

    // 使用批次管理器處理大量資料
    try {
      const result = await batchManager.processMembersInBatches(members, role, options);

      // 如果是部分完成，提供使用者友善的訊息
      if (result.partial) {
        console.log(
          `⏸️ 部分完成: ${result.processedCount}/${result.totalItems} (${((result.processedCount / result.totalItems) * 100).toFixed(1)}%)`
        );

        // 可選：發送通知或記錄到工作表
        this.recordPartialCompletion(result);
      }

      return result;
    } catch (error) {
      console.log(`❌ 進階批次處理失敗: ${error.message}`);
      return ErrorHandler.handle(error, '進階批次新增成員');
    }
  }

  /**
   * 記錄部分完成狀態
   */
  recordPartialCompletion(result) {
    try {
      const message =
        `批次處理 ${result.jobId} 部分完成：\n` +
        `• 已處理：${result.processedCount}/${result.totalItems}\n` +
        `• 進度：${((result.processedCount / result.totalItems) * 100).toFixed(1)}%\n` +
        `• 狀態：${result.message}\n` +
        `• 時間：${new Date().toLocaleString()}`;

      console.log(`📝 ${message}`);

      // 可選：保存到工作表或發送通知
      // 這裡可以添加將進度寫入特定工作表的邏輯
    } catch (error) {
      console.log(`[WARN] 無法記錄部分完成狀態: ${error.message}`);
    }
  }

  /**
   * 檢查批次處理狀態
   */
  checkBatchStatus(jobId) {
    try {
      const state = batchManager.loadBatchState(jobId);
      if (state) {
        return {
          found: true,
          processed: state.lastProcessedIndex,
          total: state.totalItems,
          progress: ((state.lastProcessedIndex / state.totalItems) * 100).toFixed(1),
          lastUpdate: new Date(state.timestamp).toLocaleString(),
          hasError: !!state.error,
          error: state.error,
        };
      }
      return { found: false };
    } catch (error) {
      return { found: false, error: error.message };
    }
  }

  /**
   * 取消批次處理
   */
  cancelBatchProcessing(jobId) {
    try {
      // 清除狀態
      batchManager.clearBatchState(jobId);

      // 嘗試刪除相關觸發器
      const triggers = ScriptApp.getProjectTriggers();
      for (const trigger of triggers) {
        if (trigger.getHandlerFunction() === 'continueAdvancedBatchProcessing') {
          ScriptApp.deleteTrigger(trigger);
        }
      }

      return { success: true, message: `批次處理 ${jobId} 已取消` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 新增單一成員
   */
  async addSingleMember(courseId, userEmail, role = 'STUDENT') {
    const member = { userId: userEmail };

    return await ErrorHandler.executeWithRetry(
      async () => {
        if (role === 'TEACHER') {
          return await rateLimiter.execute(() => {
            return Classroom.Courses.Teachers.create(member, courseId);
          });
        } else {
          return await rateLimiter.execute(() => {
            return Classroom.Courses.Students.create(member, courseId);
          });
        }
      },
      `新增${role === 'TEACHER' ? '老師' : '學生'}：${userEmail} 到課程 ${courseId}`
    );
  }

  /**
   * 新增老師 (如果不存在)
   */
  async addTeacherIfNotExists(courseId, teacherEmail) {
    // 首先，獲取該課程的所有老師
    const teachersResult = await this.getCourseTeachers(courseId);
    if (!teachersResult.success) {
      return { success: false, error: `無法獲取課程 ${courseId} 的老師列表。` };
    }

    // 檢查老師是否已經存在
    const teachers = teachersResult.result || [];
    const teacherExists = teachers.some(
      (teacher) =>
        teacher &&
        teacher.profile &&
        teacher.profile.emailAddress &&
        teacher.profile.emailAddress.toLowerCase() === teacherEmail.toLowerCase()
    );

    if (teacherExists) {
      console.log(`老師 ${teacherEmail} 已存在於課程 ${courseId} 中，無需新增。`);
      return { success: true, status: 'ALREADY_EXISTS' };
    }

    // 如果老師不存在，則新增老師
    console.log(`正在將老師 ${teacherEmail} 新增到課程 ${courseId}...`);
    const addResult = await this.addSingleMember(courseId, teacherEmail, 'TEACHER');
    if (addResult.success) {
      return { success: true, status: 'ADDED' };
    } else {
      return { success: false, error: addResult.error };
    }
  }

  /**
   * 新增學生 (如果不存在)
   */
  async addStudentIfNotExists(courseId, studentEmail) {
    // 首先，獲取該課程的所有學生
    const studentsResult = await this.getCourseStudents(courseId);
    if (!studentsResult.success) {
      return { success: false, error: `無法獲取課程 ${courseId} 的學生列表。` };
    }

    // 檢查學生是否已經存在
    const students = studentsResult.result || [];
    const studentExists = students.some(
      (student) =>
        student &&
        student.profile &&
        student.profile.emailAddress &&
        student.profile.emailAddress.toLowerCase() === studentEmail.toLowerCase()
    );

    if (studentExists) {
      console.log(`學生 ${studentEmail} 已存在於課程 ${courseId} 中，無需新增。`);
      return { success: true, status: 'ALREADY_EXISTS' };
    }

    // 如果學生不存在，則新增學生
    console.log(`正在將學生 ${studentEmail} 新增到課程 ${courseId}...`);
    const addResult = await this.addSingleMember(courseId, studentEmail, 'STUDENT');
    if (addResult.success) {
      return { success: true, status: 'ADDED' };
    } else {
      return { success: false, error: addResult.error };
    }
  }

  /**
   * 更新課程
   */
  async updateCourse(courseId, updates) {
    return await ErrorHandler.executeWithRetry(async () => {
      const course = await rateLimiter.execute(() => {
        return Classroom.Courses.update(updates, courseId);
      });

      // 清除相關快取
      this.clearCacheByPattern(`course_${courseId}`);

      return course;
    }, `更新課程：${courseId}`);
  }

  /**
   * 封存課程
   */
  async archiveCourse(courseId) {
    return await this.updateCourse(courseId, { courseState: 'ARCHIVED' });
  }

  /**
   * 移除成員
   */
  async removeMember(courseId, userEmail) {
    return await ErrorHandler.executeWithRetry(async () => {
      return await rateLimiter.execute(() => {
        return Classroom.Courses.Students.remove(courseId, userEmail);
      });
    }, `移除學生：${userEmail} 從課程 ${courseId}`);
  }

  /**
   * 快取管理
   */
  isCacheValid(key) {
    const cached = this.cache.get(key);
    return cached && Date.now() - cached.timestamp < this.cacheTimeout;
  }

  updateCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache() {
    this.cache.clear();
    console.log('快取已清除');
  }

  clearCacheByPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 獲取 API 狀態
   */
  getStatus() {
    return {
      cacheSize: this.cache.size,
      rateLimiter: rateLimiter.getStatus(),
    };
  }
}

/**
 * 批次管理器 - 專門處理大量資料的分批執行
 * 支援斷點續傳、時間管理和自動恢復
 */
class BatchManager {
  constructor() {
    this.EXECUTION_LIMIT = 5.5 * 60 * 1000; // 5.5分鐘限制，留0.5分鐘緩衝
    this.DEFAULT_BATCH_SIZE = 50; // 預設批次大小
    this.MIN_BATCH_SIZE = 10; // 最小批次大小
    this.MAX_BATCH_SIZE = 100; // 最大批次大小
    this.SAFETY_BUFFER = 30000; // 30秒安全緩衝
  }

  /**
   * 智能批次處理 - 支援大量資料分批執行
   */
  async processMembersInBatches(members, role = 'STUDENT', options = {}) {
    const jobId = options.jobId || this.generateJobId();
    const startTime = Date.now();

    console.log(`🚀 開始批次處理任務 [${jobId}]: ${members.length} 項目`);

    // 恢復之前的進度（如果存在）
    const savedState = this.loadBatchState(jobId);
    const startIndex = savedState ? savedState.lastProcessedIndex : 0;
    const previousResults = savedState ? savedState.results : [];

    if (startIndex > 0) {
      console.log(`📂 恢復之前進度: 從第 ${startIndex + 1} 項開始`);
    }

    const totalItems = members.length;
    const remainingItems = members.slice(startIndex);
    const results = [...previousResults];
    let processedCount = startIndex;

    // 動態調整批次大小
    let batchSize = this.calculateOptimalBatchSize(remainingItems.length);
    const progress = new ProgressTracker(
      totalItems,
      `批次${role === 'TEACHER' ? '老師' : '學生'}處理`
    );

    try {
      // 分批處理剩餘項目
      for (let i = 0; i < remainingItems.length; i += batchSize) {
        // 檢查執行時間
        const elapsed = Date.now() - startTime;
        if (elapsed > this.EXECUTION_LIMIT - this.SAFETY_BUFFER) {
          console.log(`⏰ 接近時間限制，安全停止。已處理 ${processedCount}/${totalItems}`);
          this.saveBatchState(jobId, {
            lastProcessedIndex: processedCount,
            results: results,
            totalItems: totalItems,
            role: role,
            timestamp: Date.now(),
          });

          // 設定觸發器繼續執行
          this.scheduleNextBatch(jobId, members, role, options);

          return {
            success: false,
            partial: true,
            processedCount: processedCount,
            totalItems: totalItems,
            message: '部分處理完成，已安排下一批次執行',
            jobId: jobId,
            results: results,
          };
        }

        const batch = remainingItems.slice(i, i + batchSize);
        console.log(`📦 處理批次 ${Math.floor(i / batchSize) + 1}: ${batch.length} 項目`);

        // 處理當前批次
        const batchResult = await this.processSingleBatch(batch, role, progress);
        results.push(...batchResult.results);
        processedCount += batch.length;

        // 即時保存進度
        this.saveBatchState(jobId, {
          lastProcessedIndex: processedCount,
          results: results,
          totalItems: totalItems,
          role: role,
          timestamp: Date.now(),
        });

        // 動態調整批次大小（根據處理時間）
        batchSize = this.adjustBatchSize(batchSize, batchResult.processingTime);

        // 批次間短暫休息
        if (i + batchSize < remainingItems.length) {
          await Utilities.sleep(1000);
        }
      }

      // 完成處理
      this.clearBatchState(jobId);
      const summary = progress.complete();

      console.log(`✅ 批次處理完成 [${jobId}]: ${processedCount}/${totalItems}`);

      return {
        success: true,
        processedCount: processedCount,
        totalItems: totalItems,
        results: results,
        summary: summary,
        jobId: jobId,
      };
    } catch (error) {
      console.log(`❌ 批次處理錯誤 [${jobId}]: ${error.message}`);

      // 保存錯誤狀態
      this.saveBatchState(jobId, {
        lastProcessedIndex: processedCount,
        results: results,
        totalItems: totalItems,
        role: role,
        timestamp: Date.now(),
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        processedCount: processedCount,
        totalItems: totalItems,
        results: results,
        jobId: jobId,
      };
    }
  }

  /**
   * 處理單一批次
   */
  async processSingleBatch(batch, role, progress) {
    const startTime = Date.now();
    const results = [];

    for (const member of batch) {
      const { courseId, userEmail } = member;

      if (!courseId || !userEmail) {
        progress.addError(`${userEmail || 'unknown'}`, new Error('缺少課程 ID 或使用者 Email'));
        results.push({
          courseId,
          userEmail,
          role,
          success: false,
          error: '缺少必要參數',
        });
        continue;
      }

      try {
        // 使用智能重複檢查
        const result =
          role === 'TEACHER'
            ? await classroomService.addTeacherIfNotExists(courseId, userEmail)
            : await classroomService.addStudentIfNotExists(courseId, userEmail);

        if (result.success) {
          progress.addSuccess(`${userEmail} → 課程 ${courseId}`);
          results.push({
            courseId,
            userEmail,
            role,
            success: true,
            status: result.status || 'ADDED',
          });
        } else {
          progress.addError(`${userEmail} → 課程 ${courseId}`, result.error);
          results.push({
            courseId,
            userEmail,
            role,
            success: false,
            error: result.error,
          });
        }
      } catch (error) {
        progress.addError(`${userEmail} → 課程 ${courseId}`, error);
        results.push({
          courseId,
          userEmail,
          role,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      results: results,
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * 計算最佳批次大小
   */
  calculateOptimalBatchSize(remainingItems) {
    // 根據剩餘項目數量調整批次大小
    if (remainingItems <= 100) return Math.min(this.MIN_BATCH_SIZE, remainingItems);
    if (remainingItems <= 500) return Math.min(this.DEFAULT_BATCH_SIZE, remainingItems);
    return Math.min(this.MAX_BATCH_SIZE, remainingItems);
  }

  /**
   * 根據處理時間動態調整批次大小
   */
  adjustBatchSize(currentSize, processingTime) {
    const timePerItem = processingTime / currentSize;

    // 如果處理太快，增加批次大小
    if (timePerItem < 1000 && currentSize < this.MAX_BATCH_SIZE) {
      return Math.min(currentSize + 10, this.MAX_BATCH_SIZE);
    }

    // 如果處理太慢，減少批次大小
    if (timePerItem > 3000 && currentSize > this.MIN_BATCH_SIZE) {
      return Math.max(currentSize - 10, this.MIN_BATCH_SIZE);
    }

    return currentSize;
  }

  /**
   * 生成任務ID
   */
  generateJobId() {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 保存批次狀態
   */
  saveBatchState(jobId, state) {
    try {
      const stateKey = `batch_state_${jobId}`;
      PropertiesService.getScriptProperties().setProperty(stateKey, JSON.stringify(state));
      console.log(`💾 狀態已保存: ${stateKey}`);
    } catch (error) {
      console.log(`[WARN] 無法保存批次狀態: ${error.message}`);
    }
  }

  /**
   * 讀取批次狀態
   */
  loadBatchState(jobId) {
    try {
      const stateKey = `batch_state_${jobId}`;
      const stateStr = PropertiesService.getScriptProperties().getProperty(stateKey);
      return stateStr ? JSON.parse(stateStr) : null;
    } catch (error) {
      console.log(`[WARN] 無法讀取批次狀態: ${error.message}`);
      return null;
    }
  }

  /**
   * 清除批次狀態
   */
  clearBatchState(jobId) {
    try {
      const stateKey = `batch_state_${jobId}`;
      PropertiesService.getScriptProperties().deleteProperty(stateKey);
      console.log(`🗑️ 狀態已清除: ${stateKey}`);
    } catch (error) {
      console.log(`[WARN] 無法清除批次狀態: ${error.message}`);
    }
  }

  /**
   * 安排下一批次執行
   */
  scheduleNextBatch(jobId, members, role, options) {
    try {
      // 創建時間觸發器，2分鐘後繼續執行
      const trigger = ScriptApp.newTrigger('continueAdvancedBatchProcessing')
        .timeBased()
        .after(2 * 60 * 1000) // 2分鐘後
        .create();

      // 保存觸發器資訊
      this.saveTriggerInfo(jobId, trigger.getUniqueId(), { members, role, options });

      console.log(`⏰ 已安排下一批次執行: 觸發器ID ${trigger.getUniqueId()}`);
    } catch (error) {
      console.log(`[ERROR] 無法安排下一批次: ${error.message}`);
    }
  }

  /**
   * 保存觸發器資訊
   */
  saveTriggerInfo(jobId, triggerId, data) {
    try {
      const triggerKey = `trigger_${jobId}`;
      PropertiesService.getScriptProperties().setProperty(
        triggerKey,
        JSON.stringify({
          triggerId: triggerId,
          data: data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.log(`[WARN] 無法保存觸發器資訊: ${error.message}`);
    }
  }
}

// 全域批次管理器實例
const batchManager = new BatchManager();

// 全域服務實例
const classroomService = new ClassroomService();
