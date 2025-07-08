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
      Logger.debug('使用快取的課程清單');
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
    Logger.info(`載入完成，共 ${courses.length} 個課程`);

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

      Logger.info(`課程建立成功：${courseName} (ID: ${course.id})`);
      return course;
    }, `建立課程：${courseName}`);
  }

  /**
   * 批次新增成員
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
    Logger.debug('快取已清除');
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

// 全域服務實例
const classroomService = new ClassroomService();
