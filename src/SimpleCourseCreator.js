/**
 * 簡化課程創建和管理系統
 * 使用現有的穩定功能，避免複雜的權限問題
 */

/**
 * 一鍵創建課程並新增成員
 * 使用現有的穩定功能，無需處理複雜的權限問題
 */
async function createCourseWithMembers(courseName, options = {}) {
  console.log(`\n🚀 ========== 開始創建課程並新增成員 ==========`);
  console.log(`📚 課程名稱：${courseName}`);

  const {
    ownerId = 'lkclassle114@kcislk.ntpc.edu.tw', // 預設擁有者
    teacherSheet = 'course_teacher',
    studentSheet = 'stu_course',
  } = options;

  const report = {
    courseName: courseName,
    courseId: null,
    courseCreation: null,
    teacherAddition: null,
    studentAddition: null,
    totalTime: 0,
  };

  const startTime = Date.now();

  try {
    // 步驟 1：創建課程
    console.log(`\n📝 步驟 1/3：創建課程`);
    console.log(`👤 課程擁有者：${ownerId}`);

    const courseResult = await createSingleCourseWithRetry(courseName, ownerId);
    report.courseCreation = courseResult;

    if (!courseResult.success) {
      console.error(`❌ 課程創建失敗：${courseResult.error}`);
      return report;
    }

    const courseId = courseResult.courseId;
    report.courseId = courseId;
    console.log(`✅ 課程創建成功！課程 ID：${courseId}`);

    // 步驟 2：新增教師
    console.log(`\n👨‍🏫 步驟 2/3：新增教師`);
    try {
      const teacherResult = await addTeachersFromSheet(courseId, teacherSheet);
      report.teacherAddition = teacherResult;
      console.log(
        `✅ 教師新增完成：成功 ${teacherResult.success} 位，失敗 ${teacherResult.failed} 位`
      );
    } catch (error) {
      console.log(`⚠️ 教師新增過程出錯：${error.message}`);
      report.teacherAddition = { success: 0, failed: 0, error: error.message };
    }

    // 步驟 3：新增學生
    console.log(`\n👨‍🎓 步驟 3/3：新增學生`);
    try {
      const studentResult = await addStudentsFromSheet(courseId, studentSheet);
      report.studentAddition = studentResult;
      console.log(
        `✅ 學生新增完成：成功 ${studentResult.success} 位，失敗 ${studentResult.failed} 位`
      );
    } catch (error) {
      console.log(`⚠️ 學生新增過程出錯：${error.message}`);
      report.studentAddition = { success: 0, failed: 0, error: error.message };
    }

    // 計算總時間
    report.totalTime = Math.round((Date.now() - startTime) / 1000);

    // 生成最終報告
    console.log(`\n\n🎉 ========== 執行完成總報告 ==========`);
    console.log(`📚 課程名稱：${courseName}`);
    console.log(`🆔 課程 ID：${courseId}`);
    console.log(`⏱️ 總耗時：${report.totalTime} 秒`);
    console.log(`👤 課程擁有者：${ownerId}`);

    if (report.teacherAddition) {
      console.log(
        `👨‍🏫 教師：成功 ${report.teacherAddition.success} 位，失敗 ${report.teacherAddition.failed} 位`
      );
    }

    if (report.studentAddition) {
      console.log(
        `👨‍🎓 學生：成功 ${report.studentAddition.success} 位，失敗 ${report.studentAddition.failed} 位`
      );
    }

    console.log(`\n🔗 課程連結：https://classroom.google.com/c/${courseId}`);
    console.log(`✅ 所有操作完成！`);

    return report;
  } catch (error) {
    console.error(`❌ 執行過程中發生錯誤：${error.message}`);
    report.totalTime = Math.round((Date.now() - startTime) / 1000);
    return { ...report, error: error.message };
  }
}

/**
 * 創建單一課程（含重試機制）
 */
async function createSingleCourseWithRetry(courseName, ownerId, maxRetries = 3) {
  console.log(`📝 正在創建課程：${courseName}`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 第 ${attempt} 次嘗試...`);

      // 使用現有的 ClassroomService
      const classroomService = new ClassroomService();
      const result = await classroomService.createSingleCourse(courseName, ownerId);

      if (result.success) {
        console.log(`✅ 課程創建成功！`);
        return {
          success: true,
          courseId: result.result.id,
          courseName: result.result.name,
          ownerId: result.result.ownerId,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.log(`❌ 第 ${attempt} 次嘗試失敗：${error.message}`);

      if (attempt === maxRetries) {
        return {
          success: false,
          error: `創建課程失敗 (${maxRetries} 次嘗試)：${error.message}`,
        };
      }

      // 等待後重試
      console.log(`⏳ 等待 2 秒後重試...`);
      Utilities.sleep(2000);
    }
  }
}

/**
 * 從工作表新增教師
 */
async function addTeachersFromSheet(courseId, sheetName = 'course_teacher') {
  console.log(`👨‍🏫 從工作表 "${sheetName}" 新增教師到課程 ${courseId}`);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`找不到工作表：${sheetName}`);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIndex = headers.indexOf('email');
  const courseIndex =
    headers.indexOf('courseId') >= 0 ? headers.indexOf('courseId') : headers.indexOf('course');

  if (emailIndex === -1) {
    throw new Error(`工作表 ${sheetName} 缺少 email 欄位`);
  }

  const teachers = data.slice(1).filter((row) => row[emailIndex]);
  const results = { success: 0, failed: 0, details: [] };

  console.log(`📊 準備新增 ${teachers.length} 位教師`);

  for (let i = 0; i < teachers.length; i++) {
    const row = teachers[i];
    const email = row[emailIndex].toString().trim();

    // 如果有課程欄位，檢查是否匹配
    if (courseIndex >= 0 && row[courseIndex] && row[courseIndex].toString().trim() !== courseId) {
      continue; // 跳過不匹配的課程
    }

    console.log(`[${i + 1}/${teachers.length}] 新增教師：${email}`);

    try {
      const teacher = { userId: email };
      await rateLimiter.execute(() => {
        return Classroom.Courses.Teachers.create(teacher, courseId);
      });

      console.log(`  ✅ 成功`);
      results.success++;
      results.details.push({ email: email, status: 'success' });

      // 更新工作表狀態
      if (headers.indexOf('status') >= 0) {
        sheet.getRange(i + 2, headers.indexOf('status') + 1).setValue('✅ 已新增');
      }

      // 限速
      Utilities.sleep(200);
    } catch (error) {
      console.log(`  ❌ 失敗：${error.message}`);
      results.failed++;

      let errorMessage = error.message;
      // 處理 "The caller does not have permission" 錯誤
      if (errorMessage.includes('The caller does not have permission')) {
        errorMessage += ' (原因：跨網域限制或 Scopes 不足)';

        try {
          const currentUser = Session.getActiveUser().getEmail();
          console.log(`  🔍 診斷 - 當前使用者: ${currentUser}, 目標: ${email}`);
        } catch (e) {}
      }

      results.details.push({ email: email, status: 'failed', error: errorMessage });

      // 更新錯誤狀態
      if (headers.indexOf('status') >= 0) {
        sheet.getRange(i + 2, headers.indexOf('status') + 1).setValue('❌ 失敗');
      }
      if (headers.indexOf('error') >= 0) {
        sheet.getRange(i + 2, headers.indexOf('error') + 1).setValue(error.message);
      }
    }
  }

  console.log(`📊 教師新增結果：成功 ${results.success} 位，失敗 ${results.failed} 位`);
  return results;
}

/**
 * 從工作表新增學生
 */
async function addStudentsFromSheet(courseId, sheetName = 'stu_course') {
  console.log(`👨‍🎓 從工作表 "${sheetName}" 新增學生到課程 ${courseId}`);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`找不到工作表：${sheetName}`);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIndex = headers.indexOf('email');
  const courseIndex =
    headers.indexOf('courseId') >= 0 ? headers.indexOf('courseId') : headers.indexOf('course');

  if (emailIndex === -1) {
    throw new Error(`工作表 ${sheetName} 缺少 email 欄位`);
  }

  const students = data.slice(1).filter((row) => row[emailIndex]);
  const results = { success: 0, failed: 0, details: [] };

  console.log(`📊 準備新增 ${students.length} 位學生`);

  // 批次處理
  const BATCH_SIZE = 50;
  for (let i = 0; i < students.length; i += BATCH_SIZE) {
    const batch = students.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(students.length / BATCH_SIZE);

    console.log(`📦 處理批次 ${batchNum}/${totalBatches}`);

    for (let j = 0; j < batch.length; j++) {
      const globalIndex = i + j;
      const row = batch[j];
      const email = row[emailIndex].toString().trim();

      // 如果有課程欄位，檢查是否匹配
      if (courseIndex >= 0 && row[courseIndex] && row[courseIndex].toString().trim() !== courseId) {
        continue; // 跳過不匹配的課程
      }

      console.log(`[${globalIndex + 1}/${students.length}] 新增學生：${email}`);

      try {
        const student = { userId: email };
        await rateLimiter.execute(() => {
          return Classroom.Courses.Students.create(student, courseId);
        });

        console.log(`  ✅ 成功`);
        results.success++;
        results.details.push({ email: email, status: 'success' });

        // 更新工作表狀態
        if (headers.indexOf('status') >= 0) {
          sheet.getRange(globalIndex + 2, headers.indexOf('status') + 1).setValue('✅ 已新增');
        }

        // 限速
        Utilities.sleep(100);
      } catch (error) {
        console.log(`  ❌ 失敗：${error.message}`);
        results.failed++;
        results.details.push({ email: email, status: 'failed', error: error.message });

        // 更新錯誤狀態
        if (headers.indexOf('status') >= 0) {
          sheet.getRange(globalIndex + 2, headers.indexOf('status') + 1).setValue('❌ 失敗');
        }
        if (headers.indexOf('error') >= 0) {
          sheet.getRange(globalIndex + 2, headers.indexOf('error') + 1).setValue(error.message);
        }
      }
    }

    // 批次間暫停
    if (i + BATCH_SIZE < students.length) {
      console.log(`⏸️ 批次完成，暫停 2 秒...`);
      Utilities.sleep(2000);
    }
  }

  console.log(`📊 學生新增結果：成功 ${results.success} 位，失敗 ${results.failed} 位`);
  return results;
}

/**
 * 快速創建測試課程
 * 用於快速測試和驗證
 */
async function createTestCourse() {
  const testCourseName = `測試課程 ${new Date().toLocaleString()}`;
  return createCourseWithMembers(testCourseName, {
    ownerId: 'lkclassle114@kcislk.ntpc.edu.tw',
  });
}

/**
 * 準備工作表結構
 * 確保必要的欄位存在
 */
function prepareCourseMemberSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 準備教師工作表
  prepareSheet(ss, 'course_teacher', ['email', 'name', 'courseId', 'status', 'timestamp', 'error']);

  // 準備學生工作表
  prepareSheet(ss, 'stu_course', ['email', 'name', 'courseId', 'status', 'timestamp', 'error']);

  console.log('✅ 工作表準備完成');
}

/**
 * 準備單個工作表
 */
function prepareSheet(spreadsheet, sheetName, requiredHeaders) {
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    // 創建新工作表
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    sheet.getRange(1, 1, 1, requiredHeaders.length).setFontWeight('bold').setBackground('#E8F5E8');
    console.log(`✅ 已創建工作表：${sheetName}`);
    return;
  }

  // 檢查並添加缺失的欄位
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

  if (missingHeaders.length > 0) {
    const startCol = headers.filter((h) => h).length + 1;
    sheet.getRange(1, startCol, 1, missingHeaders.length).setValues([missingHeaders]);
    console.log(`✅ 已為 ${sheetName} 新增欄位：${missingHeaders.join(', ')}`);
  }
}

/**
 * 示範使用方式
 */
function demonstrateUsage() {
  console.log(`
🚀 簡化課程創建系統使用方式：

1. 準備工作表：
   prepareCourseMemberSheets()

2. 創建課程並新增成員：
   createCourseWithMembers("我的新課程", {
     ownerId: "lkclassle114@kcislk.ntpc.edu.tw",
     teacherSheet: "course_teacher",
     studentSheet: "stu_course"
   })

3. 快速測試：
   createTestCourse()

4. 建立 myPal 課程：
   createMyPalCourse()

這個系統使用現有的穩定功能，避免權限問題！
  `);
}

/**
 * 快速建置 "2025-2026 myPal International Exchange" 課程
 * 執行此函數即可建立課程，並從專用工作表加入成員
 */
async function createMyPalCourse() {
  const courseName = '2025-2026 myPal International Exchange';
  console.log(`準備建立課程: ${courseName}`);

  // 定義專用的成員工作表名稱
  const teacherSheetName = 'myPal_teachers';
  const studentSheetName = 'myPal_students';
  const targetOwnerId = 'lkclassle114@kcislk.ntpc.edu.tw';

  console.log(`提示：系統將從工作表 "${teacherSheetName}" 和 "${studentSheetName}" 讀取成員`);

  // 檢查工作表是否存在，若不存在則自動建立範本
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (!ss.getSheetByName(teacherSheetName)) {
    console.log(`正在建立範本工作表: ${teacherSheetName}`);
    const sheet = ss.insertSheet(teacherSheetName);
    sheet.getRange('A1').setValue('email');
    console.log(`請在 ${teacherSheetName} 的 A 欄填入老師 Email`);
  }

  if (!ss.getSheetByName(studentSheetName)) {
    console.log(`正在建立範本工作表: ${studentSheetName}`);
    const sheet = ss.insertSheet(studentSheetName);
    sheet.getRange('A1').setValue('email');
    console.log(`請在 ${studentSheetName} 的 A 欄填入學生 Email`);
  }

  // 嘗試使用指定擁有者建立課程
  // 注意：如果當前執行者不是網域管理員，這可能會失敗
  // 如果失敗，請改用管理員帳號執行，或者手動在 Classroom 轉移擁有權
  return await createCourseWithMembers(courseName, {
    ownerId: targetOwnerId,
    teacherSheet: teacherSheetName,
    studentSheet: studentSheetName,
  });
}

// =============================================
// 課程資訊查詢功能
// =============================================

/**
 * 查詢指定課程的擁有者資訊
 * @param {string} courseId - 課程 ID
 */
async function getCourseOwnerInfo(courseId) {
  console.log(`\n🔍 ========== 查詢課程擁有者資訊 ==========`);
  console.log(`📚 課程 ID：${courseId}`);

  try {
    // 使用 Classroom API 取得課程詳細資訊
    const course = await rateLimiter.execute(() => {
      return Classroom.Courses.get(courseId);
    });

    console.log(`\n📋 課程資訊：`);
    console.log(`   課程名稱：${course.name}`);
    console.log(`   課程 ID：${course.id}`);
    console.log(`   擁有者 ID：${course.ownerId}`);
    console.log(`   課程狀態：${course.courseState}`);
    console.log(`   建立時間：${course.creationTime}`);

    // 嘗試取得擁有者的老師資訊
    try {
      const teachersResult = await classroomService.getCourseTeachers(courseId);
      if (teachersResult.success && teachersResult.result) {
        const owner = teachersResult.result.find((t) => t.userId === course.ownerId);
        if (owner && owner.profile) {
          console.log(`\n👤 擁有者詳細資訊：`);
          console.log(`   名稱：${owner.profile.name?.fullName || 'N/A'}`);
          console.log(`   Email：${owner.profile.emailAddress || 'N/A'}`);
        }
      }
    } catch (e) {
      console.log(`   無法取得擁有者詳細資訊：${e.message}`);
    }

    console.log(`\n🔗 課程連結：https://classroom.google.com/c/${courseId}`);
    console.log(`✅ 查詢完成！`);

    return {
      success: true,
      courseId: course.id,
      courseName: course.name,
      ownerId: course.ownerId,
      courseState: course.courseState,
      creationTime: course.creationTime,
      courseLink: `https://classroom.google.com/c/${courseId}`,
    };
  } catch (error) {
    console.error(`❌ 無法取得課程資訊：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 快速查詢：KCFS-G6 Inventors 課程擁有者
 * 課程 ID: 779922054673
 */
async function checkFirstKCFSCourseOwner() {
  return await getCourseOwnerInfo('779922054673');
}

/**
 * ⚡ 快速移除：從指定的舊課程移除老師
 * 使用已知的課程 ID，不需要載入全部課程清單
 * 執行時間：約 30 秒
 */
async function quickRemoveTeacherFromOldCourses() {
  console.log(`\n⚡ ========== 快速移除老師（使用已知課程 ID）==========`);
  console.log(`👤 執行帳號：${Session.getActiveUser().getEmail()}\n`);

  const teacherEmail = 'carolegodfrey@kcislk.ntpc.edu.tw';
  
  // 從執行記錄中提取的舊課程 ID（課程 85-103）
  const oldCourseIds = [
    { id: '468929579233', name: 'KCFS-Mr.Woomer (G6pm-Mr.Malefetse 110)' },
    { id: '468932432934', name: 'KCFS-Mr.Woomer (G6pm-Mr.Van Niekerk 110)' },
    { id: '468921308763', name: 'KCFS-Mr.Woomer (G6pm-Ms.Greeff 110)' },
    { id: '468921430849', name: 'KCFS-Mr.Woomer (G6am-Mr.Van Niekerk 110)' },
    { id: '468933925832', name: 'KCFS-Mr.Woomer (G6am-Ms.Greeff 110)' },
    { id: '468933925818', name: 'KCFS-Mr.Woomer (G5pm-Mr.Hurd 110)' },
    { id: '468933925806', name: 'KCFS-Mr.Woomer (G5pm-Mr.Van Niekerk 110)' },
    { id: '468930615218', name: 'KCFS-Mr.Woomer (G5pm-Ms.Greeff 110)' },
    { id: '461027648910', name: 'KCFS-Mr.Woomer (G5am-Mr.Guynn 110)' },
    { id: '461027655386', name: 'KCFS-Mr.Woomer (G5am-Mr.Van Niekerk 110)' },
    { id: '468933925791', name: 'KCFS-Mr.Woomer (G5am-Ms.Greeff 110)' },
    { id: '392275236101', name: 'KCFS-Mr.Guynn (G6pm-Mr.Van Niekerk 110)' },
    { id: '392156556417', name: 'KCFS-Mr.Guynn (G6pm-Mr.Hurd 110)' },
    { id: '392286269833', name: 'KCFS-Mr.Guynn (G6pm-Mr.Zabinski 110)' },
    { id: '392281060041', name: 'KCFS-Mr.Guynn (G5am-Mr.Hurd 110)' },
    { id: '392232912059', name: 'KCFS-Mr.Guynn (G5am-Mr.Zabinski 110)' },
    { id: '392281061051', name: 'KCFS-Mr.Guynn (G5am-Mr.Malefetse 110)' },
    { id: '386967861127', name: 'KCFS-G1I 110' },
    { id: '386964105897', name: 'KCFS-G1B 110' },
  ];

  console.log(`🎯 準備移除 ${oldCourseIds.length} 個課程的老師\n`);

  const results = { success: [], failed: [], skipped: [] };
  const startTime = Date.now();

  for (let i = 0; i < oldCourseIds.length; i++) {
    const course = oldCourseIds[i];
    
    try {
      await rateLimiter.execute(() => {
        return Classroom.Courses.Teachers.remove(course.id, teacherEmail);
      });
      console.log(`[${i + 1}/${oldCourseIds.length}] ${course.name} ✅ 已移除`);
      results.success.push(course);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('404')) {
        console.log(`[${i + 1}/${oldCourseIds.length}] ${course.name} ⏭️ 老師不存在`);
        results.skipped.push(course);
      } else {
        console.log(`[${i + 1}/${oldCourseIds.length}] ${course.name} ❌ ${error.message}`);
        results.failed.push({ ...course, error: error.message });
      }
    }
    
    Utilities.sleep(100);
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000);

  console.log(`\n\n🎉 ========== 移除完成報告 ==========`);
  console.log(`👨‍🏫 目標老師：${teacherEmail}`);
  console.log(`📚 處理課程數：${oldCourseIds.length}`);
  console.log(`⏱️ 總耗時：${totalTime} 秒`);
  console.log(`✅ 成功移除：${results.success.length} 個`);
  console.log(`⏭️ 跳過（老師不存在）：${results.skipped.length} 個`);
  console.log(`❌ 失敗：${results.failed.length} 個`);

  return { success: true, totalTime, results };
}

/**
 * 🗑️ 從舊的 KCFS 課程移除老師（完整版，需載入課程清單）
 * 只移除包含 "110" 或 "107" 或老師名字的課程
 */
async function removeTeacherFromOldKCFSCourses() {
  console.log(`\n🗑️ ========== 從舊 KCFS 課程移除老師 ==========`);
  console.log(`👤 執行帳號：${Session.getActiveUser().getEmail()}\n`);

  const teacherEmail = 'carolegodfrey@kcislk.ntpc.edu.tw';
  
  // 舊課程的特徵：包含 "110"、"107"、"Mr." 或 "Ms."
  const isOldCourse = (name) => {
    return name.includes('110') || 
           name.includes('107') || 
           name.includes('Mr.') || 
           name.includes('Ms.');
  };

  const results = {
    success: [],
    failed: [],
    skipped: [],
  };

  const startTime = Date.now();

  try {
    console.log(`📡 正在取得課程清單...`);
    const coursesResult = await classroomService.listAllCourses({ forceRefresh: true });

    if (!coursesResult.success) {
      console.error(`❌ 無法取得課程清單：${coursesResult.error}`);
      return { success: false, error: coursesResult.error };
    }

    const allCourses = coursesResult.data;
    
    // 篩選舊的 KCFS 課程
    const oldKCFSCourses = allCourses.filter(
      (course) => course.name && 
                  course.name.startsWith('KCFS') && 
                  isOldCourse(course.name)
    );

    console.log(`🎯 找到 ${oldKCFSCourses.length} 個舊 KCFS 課程\n`);

    for (let i = 0; i < oldKCFSCourses.length; i++) {
      const course = oldKCFSCourses[i];

      try {
        // 先檢查老師是否存在
        const teachersResult = await classroomService.getCourseTeachers(course.id);
        
        if (!teachersResult.success) {
          console.log(`[${i + 1}] ${course.name} ⚠️ 無法取得老師清單`);
          results.skipped.push({ courseId: course.id, courseName: course.name });
          continue;
        }

        const teachers = teachersResult.result || [];
        const teacherExists = teachers.some(
          (t) => t.profile?.emailAddress?.toLowerCase() === teacherEmail.toLowerCase()
        );

        if (!teacherExists) {
          console.log(`[${i + 1}] ${course.name} ⏭️ 老師不存在`);
          results.skipped.push({ courseId: course.id, courseName: course.name });
          continue;
        }

        // 移除老師
        await rateLimiter.execute(() => {
          return Classroom.Courses.Teachers.remove(course.id, teacherEmail);
        });

        console.log(`[${i + 1}] ${course.name} ✅ 已移除`);
        results.success.push({ courseId: course.id, courseName: course.name });

      } catch (error) {
        console.log(`[${i + 1}] ${course.name} ❌ ${error.message}`);
        results.failed.push({ courseId: course.id, courseName: course.name, error: error.message });
      }

      Utilities.sleep(50);
    }

    const totalTime = Math.round((Date.now() - startTime) / 1000);

    console.log(`\n\n🎉 ========== 移除完成報告 ==========`);
    console.log(`👨‍🏫 目標老師：${teacherEmail}`);
    console.log(`📚 處理課程數：${oldKCFSCourses.length}`);
    console.log(`⏱️ 總耗時：${totalTime} 秒`);
    console.log(`✅ 成功移除：${results.success.length} 個課程`);
    console.log(`⏭️ 跳過（老師不存在）：${results.skipped.length} 個課程`);
    console.log(`❌ 失敗：${results.failed.length} 個課程`);

    return {
      success: results.failed.length === 0,
      totalProcessed: oldKCFSCourses.length,
      totalTime: totalTime,
      results: results,
    };
  } catch (error) {
    console.error(`❌ 發生錯誤：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * ⚡ 極速測試：直接測試新增老師到單一課程
 * 不載入課程清單，直接用已知的課程 ID 測試
 * 執行時間：約 3-5 秒
 */
async function quickTestAddTeacher() {
  console.log(`\n⚡ ========== 極速測試：新增老師 ==========`);
  console.log(`⏱️ 預計執行時間：3-5 秒\n`);

  const testCourseId = '779922054673'; // KCFS-G6 Inventors
  const testCourseName = 'KCFS-G6 Inventors';
  const teacherEmail = 'carolegodfrey@kcislk.ntpc.edu.tw';

  console.log(`📚 測試課程：${testCourseName}`);
  console.log(`🆔 課程 ID：${testCourseId}`);
  console.log(`👨‍🏫 目標老師：${teacherEmail}`);
  console.log(`👤 執行帳號：${Session.getActiveUser().getEmail()}`);
  console.log(`\n正在嘗試新增老師...`);

  try {
    const result = await classroomService.addTeacherIfNotExists(testCourseId, teacherEmail);

    if (result.success) {
      if (result.status === 'ALREADY_EXISTS') {
        console.log(`\n✅ 成功！老師已存在於課程中`);
      } else {
        console.log(`\n🎉 成功！老師已新增到課程`);
      }
      console.log(`\n💡 權限確認：此帳號可以新增老師到 KCFS 課程！`);
      console.log(`💡 請執行 addTeacherToKCFSCourses() 處理全部 84 個課程`);
      return { success: true, status: result.status };
    } else {
      console.log(`\n❌ 失敗：${result.error}`);
      console.log(`\n⚠️ 此帳號沒有權限新增老師到此課程`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`\n❌ 發生錯誤：${error.message}`);
    return { success: false, error: error.message };
  }
}

// =============================================
// KCFS 課程批次新增老師功能
// =============================================

/**
 * 預覽所有 KCFS 開頭的課程（唯讀模式，不做任何修改）
 * 用於確認課程清單是否正確
 */
async function previewKCFSCourses() {
  console.log(`\n🔍 ========== 預覽 KCFS 課程清單 ==========`);
  console.log(`⚠️ 這是唯讀模式，不會做任何修改\n`);

  const coursePrefix = 'KCFS';

  try {
    // 取得所有課程
    console.log(`📡 正在從 Google Classroom 取得課程清單...`);
    const coursesResult = await classroomService.listAllCourses({ forceRefresh: true });

    if (!coursesResult.success) {
      console.error(`❌ 無法取得課程清單：${coursesResult.error}`);
      return { success: false, error: coursesResult.error };
    }

    const allCourses = coursesResult.data;
    console.log(`📚 共取得 ${allCourses.length} 個活動課程\n`);

    // 篩選 KCFS 開頭的課程
    const kcfsCourses = allCourses.filter(
      (course) => course.name && course.name.startsWith(coursePrefix)
    );

    console.log(`🎯 找到 ${kcfsCourses.length} 個 ${coursePrefix} 開頭的課程：\n`);
    console.log(`${'編號'.padEnd(6)}${'課程名稱'.padEnd(40)}${'課程 ID'}`);
    console.log(`${'─'.repeat(80)}`);

    kcfsCourses.forEach((course, index) => {
      console.log(
        `${String(index + 1).padEnd(6)}${course.name.substring(0, 38).padEnd(40)}${course.id}`
      );
    });

    console.log(`\n✅ 預覽完成！共 ${kcfsCourses.length} 個 KCFS 課程`);
    console.log(`💡 如果清單正確，請執行 addTeacherToKCFSCourses_TEST() 進行測試`);

    return {
      success: true,
      totalCourses: allCourses.length,
      kcfsCourses: kcfsCourses.length,
      courses: kcfsCourses.map((c) => ({ id: c.id, name: c.name })),
    };
  } catch (error) {
    console.error(`❌ 發生錯誤：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 測試版：將老師加入 KCFS 課程（僅處理前 3 個課程）
 * 用於測試功能是否正常運作
 */
async function addTeacherToKCFSCourses_TEST() {
  console.log(`\n🧪 ========== 測試模式：新增老師到 KCFS 課程 ==========`);
  console.log(`⚠️ 測試模式：僅處理前 3 個課程\n`);

  const teacherEmail = 'carolegodfrey@kcislk.ntpc.edu.tw';
  const coursePrefix = 'KCFS';
  const TEST_LIMIT = 3;

  const results = {
    success: [],
    failed: [],
    skipped: [],
  };

  try {
    // 取得所有課程
    console.log(`📡 正在取得課程清單...`);
    const coursesResult = await classroomService.listAllCourses({ forceRefresh: true });

    if (!coursesResult.success) {
      console.error(`❌ 無法取得課程清單：${coursesResult.error}`);
      return { success: false, error: coursesResult.error };
    }

    // 篩選 KCFS 課程
    const allCourses = coursesResult.data;
    const kcfsCourses = allCourses.filter(
      (course) => course.name && course.name.startsWith(coursePrefix)
    );

    console.log(`🎯 找到 ${kcfsCourses.length} 個 KCFS 課程`);
    console.log(`🧪 測試模式：只處理前 ${TEST_LIMIT} 個\n`);

    // 只處理前 N 個課程
    const testCourses = kcfsCourses.slice(0, TEST_LIMIT);

    for (let i = 0; i < testCourses.length; i++) {
      const course = testCourses[i];
      console.log(`\n[${i + 1}/${testCourses.length}] 處理課程：${course.name}`);
      console.log(`   課程 ID：${course.id}`);

      try {
        const result = await classroomService.addTeacherIfNotExists(course.id, teacherEmail);

        if (result.success) {
          if (result.status === 'ALREADY_EXISTS') {
            console.log(`   ⏭️ 老師已存在，跳過`);
            results.skipped.push({ courseId: course.id, courseName: course.name });
          } else {
            console.log(`   ✅ 成功新增老師`);
            results.success.push({ courseId: course.id, courseName: course.name });
          }
        } else {
          console.log(`   ❌ 失敗：${result.error}`);
          results.failed.push({
            courseId: course.id,
            courseName: course.name,
            error: result.error,
          });
        }
      } catch (error) {
        console.log(`   ❌ 發生錯誤：${error.message}`);
        results.failed.push({ courseId: course.id, courseName: course.name, error: error.message });
      }

      // 限速
      Utilities.sleep(500);
    }

    // 輸出報告
    console.log(`\n\n🧪 ========== 測試結果報告 ==========`);
    console.log(`👨‍🏫 目標老師：${teacherEmail}`);
    console.log(`📚 處理課程數：${testCourses.length} / ${kcfsCourses.length} (測試模式)`);
    console.log(`✅ 成功新增：${results.success.length} 個課程`);
    console.log(`⏭️ 已存在跳過：${results.skipped.length} 個課程`);
    console.log(`❌ 失敗：${results.failed.length} 個課程`);

    if (results.failed.length > 0) {
      console.log(`\n❌ 失敗清單：`);
      results.failed.forEach((f) => console.log(`   - ${f.courseName}: ${f.error}`));
    }

    console.log(`\n💡 如果測試成功，請執行 addTeacherToKCFSCourses() 處理所有課程`);

    return {
      success: results.failed.length === 0,
      testMode: true,
      processed: testCourses.length,
      totalKCFS: kcfsCourses.length,
      results: results,
    };
  } catch (error) {
    console.error(`❌ 發生錯誤：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * ⚡ 優化版：將老師加入所有 KCFS 課程
 * 使用智能限速，預計執行時間：1-2 分鐘
 */
async function addTeacherToKCFSCourses() {
  console.log(`\n🚀 ========== 新增老師到所有 KCFS 課程 ==========`);
  console.log(`⚡ 優化版：預計執行時間 1-2 分鐘`);
  console.log(`👤 執行帳號：${Session.getActiveUser().getEmail()}\n`);

  const teacherEmail = 'carolegodfrey@kcislk.ntpc.edu.tw';
  const coursePrefix = 'KCFS';

  const results = {
    success: [],
    failed: [],
    skipped: [],
  };

  const startTime = Date.now();

  try {
    // 取得所有課程
    console.log(`📡 正在取得課程清單...`);
    const coursesResult = await classroomService.listAllCourses({ forceRefresh: true });

    if (!coursesResult.success) {
      console.error(`❌ 無法取得課程清單：${coursesResult.error}`);
      return { success: false, error: coursesResult.error };
    }

    // 篩選 KCFS 課程
    const allCourses = coursesResult.data;
    const kcfsCourses = allCourses.filter(
      (course) => course.name && course.name.startsWith(coursePrefix)
    );

    const loadTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`✅ 課程清單載入完成（${loadTime} 秒）`);
    console.log(`🎯 找到 ${kcfsCourses.length} 個 KCFS 課程，開始處理...\n`);

    for (let i = 0; i < kcfsCourses.length; i++) {
      const course = kcfsCourses[i];
      
      // 每 10 個課程顯示進度
      if (i % 10 === 0 && i > 0) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const remaining = Math.round((elapsed / i) * (kcfsCourses.length - i));
        console.log(`\n📊 進度：${i}/${kcfsCourses.length}（預計剩餘 ${remaining} 秒）\n`);
      }

      try {
        const result = await classroomService.addTeacherIfNotExists(course.id, teacherEmail);

        if (result.success) {
          if (result.status === 'ALREADY_EXISTS') {
            console.log(`[${i + 1}] ${course.name} ⏭️`);
            results.skipped.push({ courseId: course.id, courseName: course.name });
          } else {
            console.log(`[${i + 1}] ${course.name} ✅`);
            results.success.push({ courseId: course.id, courseName: course.name });
          }
        } else {
          console.log(`[${i + 1}] ${course.name} ❌`);
          results.failed.push({
            courseId: course.id,
            courseName: course.name,
            error: result.error,
          });
        }
      } catch (error) {
        console.log(`[${i + 1}] ${course.name} ❌ ${error.message}`);
        results.failed.push({ courseId: course.id, courseName: course.name, error: error.message });
      }

      // 極短延遲（限速器會處理 API 限制）
      Utilities.sleep(50);
    }

    const totalTime = Math.round((Date.now() - startTime) / 1000);

    // 輸出報告
    console.log(`\n\n🎉 ========== 執行完成報告 ==========`);
    console.log(`👨‍🏫 目標老師：${teacherEmail}`);
    console.log(`📚 處理課程數：${kcfsCourses.length}`);
    console.log(`⏱️ 總耗時：${totalTime} 秒`);
    console.log(`✅ 成功新增：${results.success.length} 個課程`);
    console.log(`⏭️ 已存在跳過：${results.skipped.length} 個課程`);
    console.log(`❌ 失敗：${results.failed.length} 個課程`);

    if (results.failed.length > 0) {
      console.log(`\n❌ 失敗清單：`);
      results.failed.forEach((f) => console.log(`   - ${f.courseName}: ${f.error}`));
    }

    return {
      success: results.failed.length === 0,
      totalProcessed: kcfsCourses.length,
      totalTime: totalTime,
      results: results,
    };
  } catch (error) {
    console.error(`❌ 發生錯誤：${error.message}`);
    return { success: false, error: error.message };
  }
}
