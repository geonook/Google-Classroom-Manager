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
    studentSheet = 'stu_course'
  } = options;

  const report = {
    courseName: courseName,
    courseId: null,
    courseCreation: null,
    teacherAddition: null,
    studentAddition: null,
    totalTime: 0
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
      console.log(`✅ 教師新增完成：成功 ${teacherResult.success} 位，失敗 ${teacherResult.failed} 位`);
    } catch (error) {
      console.log(`⚠️ 教師新增過程出錯：${error.message}`);
      report.teacherAddition = { success: 0, failed: 0, error: error.message };
    }

    // 步驟 3：新增學生
    console.log(`\n👨‍🎓 步驟 3/3：新增學生`);
    try {
      const studentResult = await addStudentsFromSheet(courseId, studentSheet);
      report.studentAddition = studentResult;
      console.log(`✅ 學生新增完成：成功 ${studentResult.success} 位，失敗 ${studentResult.failed} 位`);
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
      console.log(`👨‍🏫 教師：成功 ${report.teacherAddition.success} 位，失敗 ${report.teacherAddition.failed} 位`);
    }

    if (report.studentAddition) {
      console.log(`👨‍🎓 學生：成功 ${report.studentAddition.success} 位，失敗 ${report.studentAddition.failed} 位`);
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
          ownerId: result.result.ownerId
        };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.log(`❌ 第 ${attempt} 次嘗試失敗：${error.message}`);

      if (attempt === maxRetries) {
        return {
          success: false,
          error: `創建課程失敗 (${maxRetries} 次嘗試)：${error.message}`
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
  const courseIndex = headers.indexOf('courseId') >= 0 ? headers.indexOf('courseId') : headers.indexOf('course');

  if (emailIndex === -1) {
    throw new Error(`工作表 ${sheetName} 缺少 email 欄位`);
  }

  const teachers = data.slice(1).filter(row => row[emailIndex]);
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
      results.details.push({ email: email, status: 'failed', error: error.message });

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
  const courseIndex = headers.indexOf('courseId') >= 0 ? headers.indexOf('courseId') : headers.indexOf('course');

  if (emailIndex === -1) {
    throw new Error(`工作表 ${sheetName} 缺少 email 欄位`);
  }

  const students = data.slice(1).filter(row => row[emailIndex]);
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
    ownerId: 'lkclassle114@kcislk.ntpc.edu.tw'
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
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

  if (missingHeaders.length > 0) {
    const startCol = headers.filter(h => h).length + 1;
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
 * 執行此函數即可建立課程
 */
async function createMyPalCourse() {
  const courseName = '2025-2026 myPal International Exchange';
  console.log(`準備建立課程: ${courseName}`);
  
  // 使用 'me' 作為擁有者，即當前執行腳本的使用者
  // 若要使用預設管理員，請移除 ownerId 參數
  return await createCourseWithMembers(courseName, {
    ownerId: 'me' 
  });
}