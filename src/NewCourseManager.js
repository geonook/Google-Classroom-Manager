/**
 * 新課程成員管理系統
 * 專門處理新創建課程的教師和學生批次新增
 * 支援各種課程 ID 格式（Base64、數字、名稱）
 */

/**
 * 智慧型課程 ID 處理器
 * 自動識別並驗證各種格式的課程 ID
 */
function smartCourseIdHandler(courseIdOrName) {
  console.log(`\n🔍 處理課程識別碼：${courseIdOrName}`);

  // 1. 檢查是否為 Base64 格式（如 ODA3MTE4MjE1MzU1）
  if (/^[A-Za-z0-9]{10,20}$/.test(courseIdOrName)) {
    console.log(`✅ 識別為 Base64 格式課程 ID`);
    return {
      success: true,
      courseId: courseIdOrName,
      format: 'base64',
      originalInput: courseIdOrName,
    };
  }

  // 2. 檢查是否為純數字 ID
  if (/^\d{10,15}$/.test(courseIdOrName)) {
    console.log(`✅ 識別為數字格式課程 ID`);
    return {
      success: true,
      courseId: courseIdOrName,
      format: 'numeric',
      originalInput: courseIdOrName,
    };
  }

  // 3. 如果都不是，嘗試從 course_mapping 查找
  console.log(`🔄 嘗試從課程映射表查找...`);
  const mappingResult = getCourseIdFromName(courseIdOrName);

  if (mappingResult.success) {
    console.log(`✅ 從映射表找到課程 ID：${mappingResult.courseId}`);
    return {
      success: true,
      courseId: mappingResult.courseId,
      format: 'mapped',
      originalInput: courseIdOrName,
      mappedName: mappingResult.originalName,
    };
  }

  // 4. 如果都失敗，返回錯誤
  return {
    success: false,
    error: `無法識別課程：${courseIdOrName}`,
    originalInput: courseIdOrName,
  };
}

/**
 * 驗證課程存取權限
 * 確認課程存在且用戶有適當權限
 */
function validateCourseAccess(courseId) {
  console.log(`\n🔐 驗證課程權限：${courseId}`);

  try {
    // 嘗試獲取課程資訊
    const course = Classroom.Courses.get(courseId);
    const currentUser = Session.getActiveUser().getEmail();

    console.log(`✅ 課程存在：${course.name}`);
    console.log(`📚 課程 ID：${course.id}`);
    console.log(`👤 課程擁有者：${course.ownerId}`);
    console.log(`🔑 當前用戶：${currentUser}`);

    // 檢查教師權限
    let hasTeacherAccess = false;
    try {
      const teachers = Classroom.Courses.Teachers.list(courseId);
      if (teachers.teachers) {
        hasTeacherAccess = teachers.teachers.some((t) => t.profile.emailAddress === currentUser);
      }
    } catch (e) {
      console.log(`⚠️ 無法檢查教師權限：${e.message}`);
    }

    return {
      success: true,
      course: course,
      currentUser: currentUser,
      isOwner: course.ownerId === currentUser,
      isTeacher: hasTeacherAccess,
      canManageStudents: true, // 假設有權限，實際操作時會驗證
      canManageTeachers: course.ownerId === currentUser,
    };
  } catch (error) {
    console.error(`❌ 課程驗證失敗：${error.message}`);
    return {
      success: false,
      error: error.message,
      courseId: courseId,
    };
  }
}

/**
 * 批次新增教師到新課程
 * @param {string} courseId - 課程 ID（支援各種格式）
 * @param {string} sheetName - 工作表名稱（預設 'course_teacher'）
 */
function addTeachersToNewCourse(courseId, sheetName = 'course_teacher') {
  console.log(`\n👨‍🏫 ========== 開始批次新增教師 ==========`);

  // 處理課程 ID
  const courseResult = smartCourseIdHandler(courseId);
  if (!courseResult.success) {
    console.error(`❌ ${courseResult.error}`);
    return { success: false, error: courseResult.error };
  }

  const actualCourseId = courseResult.courseId;
  console.log(`📚 使用課程 ID：${actualCourseId}`);

  // 驗證課程權限
  const validation = validateCourseAccess(actualCourseId);
  if (!validation.success) {
    console.error(`❌ 課程驗證失敗：${validation.error}`);
    return { success: false, error: validation.error };
  }

  if (!validation.canManageTeachers) {
    console.error(`❌ 您沒有管理此課程教師的權限`);
    return { success: false, error: '權限不足：只有課程擁有者可以新增教師' };
  }

  // 讀取教師清單
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    console.error(`❌ 找不到工作表：${sheetName}`);
    return { success: false, error: `工作表 ${sheetName} 不存在` };
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIndex = headers.indexOf('email');

  if (emailIndex === -1) {
    console.error(`❌ 工作表缺少 email 欄位`);
    return { success: false, error: '工作表必須包含 email 欄位' };
  }

  // 處理每位教師
  const results = {
    success: [],
    failed: [],
    skipped: [],
  };

  const teachers = data.slice(1).filter((row) => row[emailIndex]);
  console.log(`📊 準備新增 ${teachers.length} 位教師`);

  teachers.forEach((row, index) => {
    const email = row[emailIndex].toString().trim();
    console.log(`\n[${index + 1}/${teachers.length}] 處理教師：${email}`);

    try {
      // 檢查是否已經是教師
      const existingTeachers = Classroom.Courses.Teachers.list(actualCourseId);
      const alreadyTeacher = existingTeachers.teachers?.some(
        (t) => t.profile.emailAddress === email
      );

      if (alreadyTeacher) {
        console.log(`⏭️ 已是教師，跳過`);
        results.skipped.push(email);
        return;
      }

      // 新增教師
      const teacher = Classroom.Courses.Teachers.create({ userId: email }, actualCourseId);

      console.log(`✅ 成功新增教師：${email}`);
      results.success.push(email);

      // 更新工作表狀態
      sheet.getRange(index + 2, headers.indexOf('status') + 1).setValue('✅ 已新增');
      sheet.getRange(index + 2, headers.indexOf('timestamp') + 1).setValue(new Date());

      // 限速處理
      Utilities.sleep(200);
    } catch (error) {
      console.error(`❌ 新增失敗：${error.message}`);
      results.failed.push({ email: email, error: error.message });

      // 更新錯誤狀態
      sheet.getRange(index + 2, headers.indexOf('status') + 1).setValue('❌ 失敗');
      sheet.getRange(index + 2, headers.indexOf('error') + 1).setValue(error.message);
    }
  });

  // 生成報告
  console.log(`\n📊 ========== 教師新增報告 ==========`);
  console.log(`✅ 成功：${results.success.length} 位`);
  console.log(`❌ 失敗：${results.failed.length} 位`);
  console.log(`⏭️ 跳過：${results.skipped.length} 位`);

  return {
    success: true,
    courseId: actualCourseId,
    courseName: validation.course.name,
    results: results,
  };
}

/**
 * 批次新增學生到新課程
 * @param {string} courseId - 課程 ID（支援各種格式）
 * @param {string} sheetName - 工作表名稱（預設 'stu_course'）
 */
function addStudentsToNewCourse(courseId, sheetName = 'stu_course') {
  console.log(`\n👨‍🎓 ========== 開始批次新增學生 ==========`);

  // 處理課程 ID
  const courseResult = smartCourseIdHandler(courseId);
  if (!courseResult.success) {
    console.error(`❌ ${courseResult.error}`);
    return { success: false, error: courseResult.error };
  }

  const actualCourseId = courseResult.courseId;
  console.log(`📚 使用課程 ID：${actualCourseId}`);

  // 驗證課程權限
  const validation = validateCourseAccess(actualCourseId);
  if (!validation.success) {
    console.error(`❌ 課程驗證失敗：${validation.error}`);
    return { success: false, error: validation.error };
  }

  // 讀取學生清單
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    console.error(`❌ 找不到工作表：${sheetName}`);
    return { success: false, error: `工作表 ${sheetName} 不存在` };
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIndex = headers.indexOf('email');

  if (emailIndex === -1) {
    console.error(`❌ 工作表缺少 email 欄位`);
    return { success: false, error: '工作表必須包含 email 欄位' };
  }

  // 批次處理設定
  const BATCH_SIZE = 50; // 每批次處理數量
  const results = {
    success: [],
    failed: [],
    skipped: [],
  };

  const students = data.slice(1).filter((row) => row[emailIndex]);
  console.log(`📊 準備新增 ${students.length} 位學生`);

  // 分批處理
  for (let i = 0; i < students.length; i += BATCH_SIZE) {
    const batch = students.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(students.length / BATCH_SIZE);

    console.log(`\n📦 處理批次 ${batchNum}/${totalBatches}`);

    batch.forEach((row, batchIndex) => {
      const globalIndex = i + batchIndex;
      const email = row[emailIndex].toString().trim();
      console.log(`[${globalIndex + 1}/${students.length}] 處理學生：${email}`);

      try {
        // 檢查是否已經是學生
        let alreadyStudent = false;
        try {
          const existingStudents = Classroom.Courses.Students.list(actualCourseId);
          alreadyStudent = existingStudents.students?.some((s) => s.profile.emailAddress === email);
        } catch (e) {
          // 可能沒有權限檢查，繼續嘗試新增
        }

        if (alreadyStudent) {
          console.log(`⏭️ 已是學生，跳過`);
          results.skipped.push(email);

          // 更新狀態
          sheet.getRange(globalIndex + 2, headers.indexOf('status') + 1).setValue('⏭️ 已存在');
          return; // 在 forEach 中使用 return 而不是 continue
        }

        // 新增學生
        const student = Classroom.Courses.Students.create({ userId: email }, actualCourseId);

        console.log(`✅ 成功新增學生：${email}`);
        results.success.push(email);

        // 更新工作表狀態
        sheet.getRange(globalIndex + 2, headers.indexOf('status') + 1).setValue('✅ 已新增');
        sheet.getRange(globalIndex + 2, headers.indexOf('timestamp') + 1).setValue(new Date());

        // 限速處理
        Utilities.sleep(100);
      } catch (error) {
        console.error(`❌ 新增失敗：${error.message}`);
        results.failed.push({ email: email, error: error.message });

        // 更新錯誤狀態
        sheet.getRange(globalIndex + 2, headers.indexOf('status') + 1).setValue('❌ 失敗');
        sheet.getRange(globalIndex + 2, headers.indexOf('error') + 1).setValue(error.message);
      }
    });

    // 批次間暫停
    if (i + BATCH_SIZE < students.length) {
      console.log(`⏸️ 批次完成，暫停 2 秒...`);
      Utilities.sleep(2000);
    }
  }

  // 生成報告
  console.log(`\n📊 ========== 學生新增報告 ==========`);
  console.log(`✅ 成功：${results.success.length} 位`);
  console.log(`❌ 失敗：${results.failed.length} 位`);
  console.log(`⏭️ 跳過：${results.skipped.length} 位`);

  return {
    success: true,
    courseId: actualCourseId,
    courseName: validation.course.name,
    results: results,
  };
}

/**
 * 一鍵執行：新增所有教師和學生
 * @param {string} courseId - 課程 ID（支援各種格式）
 */
function quickAddMembersToNewCourse(courseId) {
  console.log(`\n🚀 ========== 一鍵批次新增成員 ==========`);
  console.log(`📚 目標課程：${courseId}`);
  console.log(`⏰ 開始時間：${new Date().toLocaleString()}`);

  const startTime = Date.now();
  const report = {
    courseId: courseId,
    teachers: null,
    students: null,
    totalTime: 0,
  };

  // 步驟 1：新增教師
  console.log(`\n步驟 1/2：新增教師`);
  const teacherResult = addTeachersToNewCourse(courseId);
  report.teachers = teacherResult;

  if (!teacherResult.success) {
    console.error(`❌ 教師新增失敗，中止執行`);
    return report;
  }

  // 步驟 2：新增學生
  console.log(`\n步驟 2/2：新增學生`);
  const studentResult = addStudentsToNewCourse(courseId);
  report.students = studentResult;

  // 計算總執行時間
  report.totalTime = Math.round((Date.now() - startTime) / 1000);

  // 生成最終報告
  console.log(`\n\n🎉 ========== 執行完成總報告 ==========`);
  console.log(`📚 課程：${teacherResult.courseName || courseId}`);
  console.log(`⏱️ 總耗時：${report.totalTime} 秒`);

  console.log(`\n👨‍🏫 教師新增結果：`);
  if (teacherResult.success) {
    console.log(`   ✅ 成功：${teacherResult.results.success.length} 位`);
    console.log(`   ❌ 失敗：${teacherResult.results.failed.length} 位`);
    console.log(`   ⏭️ 跳過：${teacherResult.results.skipped.length} 位`);
  } else {
    console.log(`   ❌ 執行失敗：${teacherResult.error}`);
  }

  console.log(`\n👨‍🎓 學生新增結果：`);
  if (studentResult.success) {
    console.log(`   ✅ 成功：${studentResult.results.success.length} 位`);
    console.log(`   ❌ 失敗：${studentResult.results.failed.length} 位`);
    console.log(`   ⏭️ 跳過：${studentResult.results.skipped.length} 位`);
  } else {
    console.log(`   ❌ 執行失敗：${studentResult.error}`);
  }

  console.log(`\n✅ 所有操作完成！`);

  return report;
}

/**
 * 測試功能：驗證特定課程
 */
function testNewCourseAccess() {
  const testCourseId = 'ODA3MTE4MjE1MzU1'; // 你的新課程 ID

  console.log(`\n🧪 ========== 測試課程存取 ==========`);

  // 測試 1：智慧 ID 處理
  console.log(`\n測試 1：課程 ID 識別`);
  const idResult = smartCourseIdHandler(testCourseId);
  console.log(`結果：`, idResult);

  // 測試 2：課程權限驗證
  console.log(`\n測試 2：課程權限驗證`);
  const validation = validateCourseAccess(testCourseId);
  console.log(`結果：`, validation);

  // 測試 3：嘗試列出現有成員
  if (validation.success) {
    console.log(`\n測試 3：列出現有成員`);

    try {
      const teachers = Classroom.Courses.Teachers.list(testCourseId);
      console.log(`現有教師數：${teachers.teachers?.length || 0}`);
    } catch (e) {
      console.log(`無法列出教師：${e.message}`);
    }

    try {
      const students = Classroom.Courses.Students.list(testCourseId);
      console.log(`現有學生數：${students.students?.length || 0}`);
    } catch (e) {
      console.log(`無法列出學生：${e.message}`);
    }
  }

  console.log(`\n✅ 測試完成`);
}

/**
 * 準備工作表結構
 * 為新課程成員管理創建必要的欄位
 */
function prepareNewCourseSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 準備教師工作表
  let teacherSheet = ss.getSheetByName('course_teacher');
  if (teacherSheet) {
    const headers = teacherSheet.getRange(1, 1, 1, 10).getValues()[0];
    if (!headers.includes('status')) {
      const lastCol = headers.filter((h) => h).length + 1;
      teacherSheet.getRange(1, lastCol).setValue('status');
      teacherSheet.getRange(1, lastCol + 1).setValue('timestamp');
      teacherSheet.getRange(1, lastCol + 2).setValue('error');
      console.log('✅ 已為 course_teacher 工作表新增狀態欄位');
    }
  }

  // 準備學生工作表
  let studentSheet = ss.getSheetByName('stu_course');
  if (studentSheet) {
    const headers = studentSheet.getRange(1, 1, 1, 10).getValues()[0];
    if (!headers.includes('status')) {
      const lastCol = headers.filter((h) => h).length + 1;
      studentSheet.getRange(1, lastCol).setValue('status');
      studentSheet.getRange(1, lastCol + 1).setValue('timestamp');
      studentSheet.getRange(1, lastCol + 2).setValue('error');
      console.log('✅ 已為 stu_course 工作表新增狀態欄位');
    }
  }

  console.log('✅ 工作表準備完成');
}

/**
 * 清除處理狀態
 * 重置工作表的狀態欄位，準備重新執行
 */
function clearProcessingStatus(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    console.error(`找不到工作表：${sheetName}`);
    return;
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusCol = headers.indexOf('status') + 1;
  const timestampCol = headers.indexOf('timestamp') + 1;
  const errorCol = headers.indexOf('error') + 1;

  if (statusCol > 0) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, statusCol, lastRow - 1, 1).clearContent();
    }
  }

  if (timestampCol > 0) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, timestampCol, lastRow - 1, 1).clearContent();
    }
  }

  if (errorCol > 0) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, errorCol, lastRow - 1, 1).clearContent();
    }
  }

  console.log(`✅ 已清除 ${sheetName} 的處理狀態`);
}
