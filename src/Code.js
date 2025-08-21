/**
 * @OnlyCurrentDoc
 */

/**
 * 🎓 Google Classroom Manager Pro v2.0.0
 *
 * ⚠️ 權限問題故障排除指南 ⚠️
 *
 * 🚨 常見問題：403 權限錯誤 "The caller does not have permission"
 * 📋 原因：只有課程擁有者才能新增老師到課程中
 *
 * 🔧 解決方案（按順序嘗試）：
 *
 * 1️⃣ 【診斷權限問題】
 *    • 執行 enhancedPermissionDiagnosis() 獲得詳細診斷
 *    • 執行 lookupUserById('110732085101506554189') 查詢課程擁有者
 *
 * 2️⃣ 【聯絡課程擁有者】
 *    • 請課程擁有者登入並執行 addTeachersFromExternalSheet()
 *    • 或請課程擁有者將您加為共同擁有者
 *
 * 3️⃣ 【聯絡管理員】
 *    • 請 Google Workspace 域管理員協助執行
 *    • 或請管理員修改組織權限政策
 *
 * 📋 主要功能：
 * • addTeachersFromExternalSheet() - 從外部試算表批次新增老師
 * • enhancedPermissionDiagnosis() - 權限診斷工具
 * • lookupUserById() - 用戶ID查詢工具
 * • onOpen() - 建立操作選單
 *
 * 💡 使用提示：
 * - 開啟試算表時會自動建立操作選單
 * - 遇到問題時先使用診斷工具
 * - 所有操作都會在控制台顯示詳細日誌
 */

/**
 * 建立選單 - 當試算表開啟時自動執行
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🎓 Classroom 管理工具')
    .addItem('📋 1. 列出所有課程', 'listCoursesUI')
    .addSeparator()
    .addItem('🔍 2. 查詢課程師生', 'listMembersUI')
    .addSeparator()
    .addItem('📚 3. 建立新課程', 'createCoursesUI')
    .addSeparator()
    .addItem('👨‍🏫 4. 新增老師', 'addTeachersUI')
    .addItem('👨‍🎓 5. 新增學生', 'addStudentsUI')
    .addSeparator()
    .addItem('✏️ 6. 更新課程名稱', 'updateCoursesUI')
    .addItem('📦 7. 封存課程', 'archiveCoursesUI')
    .addSeparator()
    .addItem('➕ 8. 新增單一學生到課程', 'addSingleStudentToCourseUI')
    .addItem('➖ 9. 從課程移除單一學生', 'removeSingleStudentFromCourseUI')
    .addSeparator()
    .addItem('⚙️ 10. 設定預設工作表名稱', 'configureDefaultSheetsUI')
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu('🔧 診斷工具')
        .addItem('🔍 用戶 ID 查詢', 'lookupUserById')
        .addItem('🔧 權限診斷', 'enhancedPermissionDiagnosis')
        .addItem('📊 系統狀態', 'showSystemStatusUI')
        .addItem('🗑️ 清除快取', 'clearCacheUI')
    )
    .addSeparator()
    .addItem('🚀 執行外部表單老師新增', 'addTeachersFromExternalSheet')
    .addToUi();
}

async function addTeachersWithCheck(spreadsheetId = null) {
  const sheetName = 'course_teacher';

  // 如果提供了 spreadsheetId，使用外部試算表；否則使用當前開啟的試算表
  const ss = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();

  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    console.log(`錯誤：找不到名為 "${sheetName}" 的工作表。`);
    return;
  }

  console.log(`📧 當前執行者: ${Session.getActiveUser().getEmail()}`);
  console.log(`📊 開始處理外部試算表的老師新增作業...`);

  const dataRange = sheet.getRange('A2:H' + sheet.getLastRow());
  const data = dataRange.getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const teacherEmail = row[5]; // F 欄
    const courseId = row[6]; // G 欄
    const statusCell = sheet.getRange(i + 2, 8); // H 欄

    if (!teacherEmail || !courseId || statusCell.isChecked()) {
      continue;
    }

    console.log(`正在處理課程 ${courseId} 中的老師 ${teacherEmail}...`);
    const result = await classroomService.addTeacherIfNotExists(courseId, teacherEmail);

    if (result.success) {
      if (result.status === 'ADDED') {
        console.log(`  ✅ 成功新增老師 ${teacherEmail} 到課程 ${courseId}。`);
      } else if (result.status === 'ALREADY_EXISTS') {
        console.log(`  ☑️ 老師 ${teacherEmail} 已存在於課程 ${courseId}。`);
      }
      statusCell.check();
    } else {
      // 🔧 增強版錯誤處理與解決建議
      if (result.error && result.error.details && result.error.details.code === 403) {
        console.log(`  🚫 權限錯誤：無法新增老師 ${teacherEmail} 到課程 ${courseId}`);
        console.log(`  📋 錯誤分析：只有課程擁有者才能新增老師`);
        console.log(`  \n🔧 解決方案（請選擇其中一種）：`);
        console.log(`     1. 📞 聯絡課程擁有者執行新增作業`);
        console.log(`     2. 🔍 使用 lookupUserById('課程擁有者ID') 查詢擁有者Email`);
        console.log(`     3. 🛠️ 使用 enhancedPermissionDiagnosis('${courseId}') 獲得詳細診斷`);
        console.log(`     4. 👨‍💼 請 Google Workspace 管理員協助執行`);
        console.log(`     5. 📧 發送操作請求給課程擁有者：addTeachersFromExternalSheet()`);
      } else if (
        result.error &&
        result.error.message &&
        result.error.message.includes('not found')
      ) {
        console.log(`  ❌ 找不到老師或課程：${teacherEmail} -> 課程 ${courseId}`);
        console.log(`  🔧 解決方案：`);
        console.log(`     1. 檢查老師 Email 格式是否正確`);
        console.log(`     2. 確認課程 ID 是否有效`);
        console.log(`     3. 確認老師是否為 Google Workspace 用戶`);
      } else {
        console.log(`  ❌ 新增老師失敗：${teacherEmail} -> 課程 ${courseId}`);
        console.log(`  📋 錯誤詳情: ${JSON.stringify(result.error, null, 2)}`);
        console.log(`  🔧 建議：使用 enhancedPermissionDiagnosis() 進行詳細診斷`);
      }
    }

    Utilities.sleep(1000);
  }

  console.log('--- 所有老師處理完畢 ---');
}

/**
 * 🚀 從指定的外部試算表執行老師新增作業
 *
 * ⚠️ 重要提示：此功能需要課程擁有者權限
 *
 * 🔧 使用前檢查清單：
 * 1. 確認您是所有目標課程的擁有者
 * 2. 如果不是擁有者，請使用 enhancedPermissionDiagnosis() 查詢擁有者
 * 3. 請課程擁有者執行此函數
 *
 * 📋 故障排除：
 * - 如遇權限錯誤，使用 lookupUserById() 查詢課程擁有者
 * - 使用 enhancedPermissionDiagnosis() 進行詳細診斷
 */
async function addTeachersFromExternalSheet() {
  const EXTERNAL_SPREADSHEET_ID = '1GWbn5qIKCikvLV_frTeIjDcTbi8wWxwCQR6S0NIEAp8';

  console.log(`=== 🚀 外部試算表老師新增作業 ===`);
  console.log(`📊 試算表ID: ${EXTERNAL_SPREADSHEET_ID}`);
  console.log(`⏰ 開始時間: ${new Date().toLocaleString()}`);

  // 預先檢查當前用戶
  let currentUser = 'unknown';
  try {
    currentUser = Session.getActiveUser().getEmail();
    console.log(`👤 執行者: ${currentUser}`);
  } catch (e) {
    console.log(`⚠️ 無法取得執行者資訊: ${e.message}`);
  }

  console.log(`\n💡 提示：如遇權限問題，請使用以下診斷工具：`);
  console.log(`   • enhancedPermissionDiagnosis() - 詳細權限診斷`);
  console.log(`   • lookupUserById('課程擁有者ID') - 查詢擁有者身份`);
  console.log(``);

  try {
    await addTeachersWithCheck(EXTERNAL_SPREADSHEET_ID);
    console.log(`\n✅ 外部試算表老師新增作業完成`);
    console.log(`⏰ 完成時間: ${new Date().toLocaleString()}`);
  } catch (error) {
    console.log(`\n❌ 執行過程發生錯誤: ${error.message}`);
    console.log(`🔧 建議解決方案：`);
    console.log(`   1. 檢查網路連線`);
    console.log(`   2. 確認試算表存取權限`);
    console.log(`   3. 使用 enhancedPermissionDiagnosis() 診斷權限問題`);
    console.log(`   4. 聯絡系統管理員協助`);
    throw error; // 重新拋出錯誤以便追蹤
  }
}

function addTeachersDirectly() {
  const sheetName = 'course_teacher';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    console.log(`錯誤：找不到名為 "${sheetName}" 的工作表。`);
    return;
  }

  const dataRange = sheet.getRange('A2:H' + sheet.getLastRow());
  const data = dataRange.getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const teacherEmail = row[5]; // F 欄
    const courseId = row[6]; // G 欄
    const status = row[7]; // H 欄 (checkbox value)

    if (!teacherEmail || !courseId || status === true) {
      continue;
    }

    try {
      console.log(`正在處理課程 ${courseId} 中的老師 ${teacherEmail}...`);

      // 檢查老師是否已存在
      const teachers = Classroom.Courses.Teachers.list(courseId).teachers || [];
      const teacherExists = teachers.some(
        (teacher) =>
          teacher &&
          teacher.profile &&
          teacher.profile.emailAddress &&
          teacher.profile.emailAddress.toLowerCase() === teacherEmail.toLowerCase()
      );

      if (teacherExists) {
        console.log(`  ☑️ 老師 ${teacherEmail} 已存在於課程 ${courseId}。`);
        sheet.getRange(i + 2, 8).check();
        continue;
      }

      // 新增老師
      console.log(`  ➕ 正在新增老師 ${teacherEmail} 到課程 ${courseId}...`);
      const teacher = { userId: teacherEmail };
      Classroom.Courses.Teachers.create(teacher, courseId);

      console.log(`  ✅ 成功新增老師。`);
      sheet.getRange(i + 2, 8).check();
    } catch (e) {
      console.log(`  ❌ 處理課程 ${courseId} 中的老師 ${teacherEmail} 時發生錯誤: ${e.message}`);
    }

    Utilities.sleep(1000); // To avoid rate limits
  }

  console.log('--- 所有老師處理完畢 ---');
}

function listCourses(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`找不到名為 "${sheetName}" 的工作表。`);
  sheet.getRange('A3:E').clearContent();
  let allCourses = [];
  let pageToken = null;
  do {
    const response = Classroom.Courses.list({ courseStates: ['ACTIVE'], pageToken: pageToken });
    if (response.courses) {
      const courses = response.courses.map((course) => [course.id, course.name]);
      allCourses = allCourses.concat(courses);
    }
    pageToken = response.nextPageToken;
  } while (pageToken);
  if (allCourses.length > 0) {
    sheet.getRange(3, 2, allCourses.length, 2).setValues(allCourses);
  }
}

function listCourseMembers(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`找不到名為 "${sheetName}" 的工作表。`);
  const dataRange = sheet.getRange('A3:C' + sheet.getLastRow());
  const data = dataRange.getValues();
  const results = [];
  data.forEach((row, index) => {
    const isChecked = row[0];
    const courseId = row[2];
    if (isChecked === true && courseId) {
      let teachers = '';
      let students = '';
      try {
        const teacherResponse = Classroom.Courses.Teachers.list(courseId);
        if (teacherResponse.teachers)
          teachers = teacherResponse.teachers.map((t) => t.profile.name.fullName).join(', ');
      } catch (e) {
        teachers = `查詢失敗: ${e.message}`;
      }
      try {
        const studentResponse = Classroom.Courses.Students.list(courseId);
        if (studentResponse.students)
          students = studentResponse.students.map((s) => s.profile.name.fullName).join(', ');
      } catch (e) {
        students = `查詢失敗: ${e.message}`;
      }
      results.push([teachers, students]);
    } else {
      results.push(['', '']);
    }
  });
  if (results.length > 0) {
    sheet.getRange('D3:E' + (results.length + 2)).setValues(results);
  }
}

function createCourses(sheetName, ownerId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`找不到名為 "${sheetName}" 的工作表。`);
  const dataRange = sheet.getRange('A3:C' + sheet.getLastRow());
  const data = dataRange.getValues();
  const results = [];
  data.forEach((row) => {
    const courseName = row[0];
    const isProcessed = row[2];
    if (courseName && !isProcessed) {
      try {
        const newCourse = Classroom.Courses.create({
          name: courseName,
          ownerId: ownerId,
          courseState: 'ACTIVE',
        });
        results.push([newCourse.id, true]);
      } catch (e) {
        results.push([`建立失敗: ${e.message}`, false]);
      }
    } else {
      results.push([row[1], row[2]]);
    }
  });
  if (results.length > 0) {
    sheet.getRange(3, 2, results.length, 2).setValues(results);
  }
}

function updateCourses(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error(`找不到工作表 "${sheetName}"`);
  const range = sheet.getRange('B4:D' + sheet.getLastRow());
  const data = range.getValues();
  const results = [];
  data.forEach((row) => {
    const courseId = row[0];
    const newName = row[1];
    const isProcessed = row[2];
    if (courseId && newName && !isProcessed) {
      try {
        Classroom.Courses.update({ name: newName }, courseId);
        results.push([true]);
      } catch (e) {
        results.push([`更新失敗: ${e.message}`]);
      }
    } else {
      results.push([isProcessed]);
    }
  });
  sheet.getRange(4, 4, results.length, 1).setValues(results);
}

function archiveCourses(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error(`找不到工作表 "${sheetName}"`);
  const range = sheet.getRange('B4:D' + sheet.getLastRow());
  const data = range.getValues();
  const results = [];
  data.forEach((row) => {
    const courseId = row[0];
    const isProcessed = row[2];
    if (courseId && !isProcessed) {
      try {
        Classroom.Courses.update({ courseState: 'ARCHIVED' }, courseId);
        results.push([true]);
      } catch (e) {
        results.push([`封存失敗: ${e.message}`]);
      }
    } else {
      results.push([isProcessed]);
    }
  });
  sheet.getRange(4, 4, results.length, 1).setValues(results);
}

function processSingleStudentTransfer(studentEmail, courseId, action) {
  if (action === 'ADD') {
    Classroom.Courses.Students.create({ userId: studentEmail }, courseId);
  } else if (action === 'REMOVE') {
    Classroom.Courses.Students.remove(courseId, studentEmail);
  } else {
    throw new Error('無效的操作類型。');
  }
}

function getScriptProperty(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

function setScriptProperty(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, value);
}

/**
 * 檢查當前用戶權限和課程資訊的診斷工具
 */
function diagnosePermissions() {
  console.log('=== 權限診斷工具 ===');

  // 檢查當前執行者
  let currentUserEmail = 'unknown';
  try {
    currentUserEmail = Session.getActiveUser().getEmail();
    console.log(`📧 當前執行者: ${currentUserEmail}`);
  } catch (e) {
    console.log(`⚠️ 無法取得執行者Email: ${e.message}`);
    console.log(`💡 建議: 需要在 appsscript.json 中新增 userinfo.email 權限並重新授權`);
  }

  // 檢查指定課程資訊
  const testCourseId = '779922029471';
  console.log(`\n🔍 檢查課程: ${testCourseId}`);

  try {
    const course = Classroom.Courses.get(testCourseId);
    console.log(`📚 課程名稱: ${course.name}`);
    console.log(`👤 課程擁有者ID: ${course.ownerId}`);
    console.log(`📊 課程狀態: ${course.courseState}`);
    console.log(`🔗 課程連結: ${course.alternateLink}`);

    // 嘗試透過 Admin Directory API 解析擁有者email
    try {
      const ownerInfo = AdminDirectory.Users.get(course.ownerId);
      console.log(`📧 擁有者Email: ${ownerInfo.primaryEmail}`);

      if (currentUserEmail !== 'unknown' && currentUserEmail === ownerInfo.primaryEmail) {
        console.log(`✅ 您是課程擁有者，有完整權限！`);
      } else {
        console.log(`⚠️ 您不是課程擁有者`);
      }
    } catch (e) {
      console.log(`⚠️ 無法取得擁有者Email詳細資訊: ${e.message}`);
    }
  } catch (e) {
    console.log(`❌ 無法取得課程資訊: ${e.message}`);
  }

  // 檢查是否能列出課程老師
  try {
    const teachers = Classroom.Courses.Teachers.list(testCourseId);
    console.log(`\n👥 當前老師數量: ${teachers.teachers ? teachers.teachers.length : 0}`);
    if (teachers.teachers) {
      teachers.teachers.forEach((teacher, index) => {
        const email = teacher.profile.emailAddress || 'Email未顯示';
        console.log(`  ${index + 1}. ${teacher.profile.name.fullName} (${email})`);
      });
    }
  } catch (e) {
    console.log(`❌ 無法列出課程老師: ${e.message}`);
  }

  console.log('\n=== 診斷完成 ===');
  console.log('\nℹ️ 升級提示: 請使用 enhancedPermissionDiagnosis() 獲得更詳細的診斷和解決方案');
  console.log('\n🔧 下一步建議:');
  console.log('1. 推送更新的權限設定到 Google Apps Script');
  console.log('2. 重新授權應用程式');
  console.log('3. 使用 enhancedPermissionDiagnosis() 獲得詳細分析');
  console.log('4. 使用 lookupUserById() 查詢課程擁有者身份');
}

/**
 * 檢查用戶是否有權限修改指定課程
 */
function checkCoursePermission(courseId) {
  try {
    // 嘗試列出課程老師（這個操作需要讀取權限）
    const teachers = Classroom.Courses.Teachers.list(courseId);
    console.log(`✅ 有讀取課程 ${courseId} 的權限`);

    // 嘗試取得課程詳細資訊
    const course = Classroom.Courses.get(courseId);

    // 嘗試取得當前用戶資訊
    let currentUserEmail = 'unknown';
    let currentUserId = 'unknown';

    try {
      currentUserEmail = Session.getActiveUser().getEmail();
      // 嘗試透過Admin Directory API取得用戶ID
      const userInfo = AdminDirectory.Users.get(currentUserEmail);
      currentUserId = userInfo.id;
    } catch (e) {
      console.log(`⚠️ 無法取得完整用戶資訊，將使用基本檢查`);
    }

    // 檢查是否為課程擁有者 (比較ID或email)
    let isOwner = false;
    let ownerEmail = 'unknown';

    try {
      // 嘗試取得擁有者email
      const ownerInfo = AdminDirectory.Users.get(course.ownerId);
      ownerEmail = ownerInfo.primaryEmail;

      // 比較email或ID
      isOwner =
        (currentUserEmail !== 'unknown' && currentUserEmail === ownerEmail) ||
        (currentUserId !== 'unknown' && currentUserId === course.ownerId);
    } catch (e) {
      console.log(`⚠️ 無法解析課程擁有者資訊: ${e.message}`);
    }

    if (isOwner) {
      console.log(`✅ 您是課程擁有者，有完整權限`);
      return { hasPermission: true, reason: 'OWNER' };
    } else {
      console.log(`⚠️ 您不是課程擁有者`);
      console.log(`  課程擁有者ID: ${course.ownerId}`);
      console.log(`  課程擁有者Email: ${ownerEmail}`);
      console.log(`  當前執行者: ${currentUserEmail}`);
      return {
        hasPermission: false,
        reason: 'NOT_OWNER',
        ownerId: course.ownerId,
        ownerEmail: ownerEmail,
      };
    }
  } catch (e) {
    console.log(`❌ 檢查課程權限時發生錯誤: ${e.message}`);
    return { hasPermission: false, reason: 'ERROR', error: e.message };
  }
}

/**
 * 取得課程擁有者的詳細資訊
 */
function getCourseOwnerInfo(courseId) {
  try {
    const course = Classroom.Courses.get(courseId);
    console.log(`📚 課程: ${course.name}`);
    console.log(`👤 擁有者ID: ${course.ownerId}`);

    try {
      const ownerInfo = AdminDirectory.Users.get(course.ownerId);
      console.log(`📧 擁有者Email: ${ownerInfo.primaryEmail}`);
      console.log(`👤 擁有者姓名: ${ownerInfo.name.fullName}`);
      return {
        success: true,
        ownerId: course.ownerId,
        ownerEmail: ownerInfo.primaryEmail,
        ownerName: ownerInfo.name.fullName,
        courseName: course.name,
      };
    } catch (e) {
      console.log(`⚠️ 無法取得擁有者詳細資訊: ${e.message}`);
      return {
        success: false,
        ownerId: course.ownerId,
        error: e.message,
      };
    }
  } catch (e) {
    console.log(`❌ 無法取得課程資訊: ${e.message}`);
    return { success: false, error: e.message };
  }
}

/**
 * 批次轉移課程擁有權工具
 * 將所有課程的擁有權轉移給指定用戶
 */
async function transferCourseOwnership(newOwnerId, spreadsheetId = null) {
  const sheetName = 'course_teacher';
  console.log(`--- 開始批次轉移課程擁有權 ---`);
  console.log(`新擁有者: ${newOwnerId}`);

  const ss = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();

  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    console.log(`錯誤：找不到名為 "${sheetName}" 的工作表。`);
    return;
  }

  const dataRange = sheet.getRange('A2:H' + sheet.getLastRow());
  const data = dataRange.getValues();

  const uniqueCourseIds = [...new Set(data.map((row) => row[6]).filter((id) => id))];
  console.log(`發現 ${uniqueCourseIds.length} 個唯一課程需要轉移擁有權`);

  let successCount = 0;
  let failCount = 0;

  for (const courseId of uniqueCourseIds) {
    try {
      console.log(`正在轉移課程 ${courseId} 的擁有權...`);

      // 檢查當前擁有者
      const course = Classroom.Courses.get(courseId);
      if (course.ownerId === newOwnerId) {
        console.log(`  ☑️ 課程 ${courseId} 已經是 ${newOwnerId} 擁有`);
        successCount++;
        continue;
      }

      // 轉移擁有權 - 必須包含課程名稱
      const updatedCourse = Classroom.Courses.update(
        {
          name: course.name,
          ownerId: newOwnerId,
          courseState: course.courseState,
        },
        courseId
      );

      console.log(`  ✅ 成功轉移課程 ${courseId} (${course.name}) 給 ${newOwnerId}`);
      successCount++;
    } catch (e) {
      console.log(`  ❌ 轉移課程 ${courseId} 失敗: ${e.message}`);
      failCount++;
    }

    Utilities.sleep(1000); // 避免API限速
  }

  console.log(`--- 擁有權轉移完成 ---`);
  console.log(`成功: ${successCount}, 失敗: ${failCount}`);
}

/**
 * 轉移外部試算表中所有課程的擁有權給當前執行者
 */
async function transferExternalSheetCourseOwnership() {
  const currentUser = Session.getActiveUser().getEmail();
  const EXTERNAL_SPREADSHEET_ID = '1GWbn5qIKCikvLV_frTeIjDcTbi8wWxwCQR6S0NIEAp8';

  console.log(`--- 轉移外部試算表課程擁有權 ---`);
  console.log(`目標擁有者: ${currentUser}`);
  console.log(`試算表ID: ${EXTERNAL_SPREADSHEET_ID}`);

  await transferCourseOwnership(currentUser, EXTERNAL_SPREADSHEET_ID);

  console.log(`--- 擁有權轉移完成，現在可以新增老師了 ---`);
}

// =============================================
// Direct Batch Execution Function
// =============================================

/**
 * 直接從 Apps Script 編輯器執行，批次建立所有年級的課程，並將結果記錄到指定的 Google Sheet。
 */
async function batchCreateAllGradeCourses() {
  // --- 設定 ---
  const GRADES = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
  const CLASS_NAMES = [
    'Achievers',
    'Discoverers',
    'Voyagers',
    'Explorers',
    'Navigators',
    'Adventurers',
    'Guardians',
    'Pioneers',
    'Innovators',
    'Visionaries',
    'Pathfinders',
    'Seekers',
    'Trailblazers',
    'Inventors',
  ];
  const SUBJECTS = [
    { code: 'LT', teacher: 'Ms. Kate' },
    { code: 'IT', teacher: 'Mr. Perry' },
    { code: 'KCFS', teacher: 'Mr. Louw' },
  ];
  const OWNER_ID = 'lkclassle114@kcislk.ntpc.edu.tw';
  const LOG_SPREADSHEET_ID = '1GWbn5qIKCikvLV_frTeIjDcTbi8wWxwCQR6S0NIEAp8';
  const LOG_SHEET_NAME = 'course_teacher';
  // --- 結束設定 ---

  // --- 初始化工作表 ---
  let logSheet;
  try {
    const ss = SpreadsheetApp.openById(LOG_SPREADSHEET_ID);
    logSheet = ss.getSheetByName(LOG_SHEET_NAME);
    if (!logSheet) {
      throw new Error(`找不到名為 "${LOG_SHEET_NAME}" 的工作表。請檢查名稱是否正確。`);
    }
  } catch (e) {
    console.log(`❌ 無法存取紀錄用的工作表: ${e.toString()}`);
    return; // 無法記錄，終止執行
  }
  // --- 結束初始化 ---

  console.log(`--- 開始批次建立所有課程 ---`);
  console.log(`預計建立 ${GRADES.length * CLASS_NAMES.length * SUBJECTS.length} 門課程。`);
  console.log(`結果將記錄至工作表: "${LOG_SHEET_NAME}"`);

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const grade of GRADES) {
    for (const className of CLASS_NAMES) {
      for (const subject of SUBJECTS) {
        const courseName = `${subject.code}-${grade} ${className}`;
        console.log(`[處理中] 正在建立課程: ${courseName}`);

        try {
          const result = await classroomService.createSingleCourse(courseName, OWNER_ID);
          if (result.success) {
            totalSuccess++;
            const newCourse = result.result;
            console.log(`  ✅ 成功: ${courseName} (ID: ${newCourse.id})`);

            // 將成功結果寫入 Google Sheet
            const newRow = [
              subject.code,
              grade,
              className,
              subject.teacher,
              newCourse.id,
              newCourse.alternateLink,
            ];
            logSheet.appendRow(newRow);
            SpreadsheetApp.flush(); // 強制儲存變更
            console.log('  ✍️  紀錄已寫入工作表。');
          } else {
            totalFailed++;
            console.log(`  ❌ 失敗: ${courseName} - ${result.error}`);
          }
        } catch (e) {
          totalFailed++;
          console.log(`  ❌ 發生嚴重錯誤: ${courseName} - ${e.toString()}`);
        }
        // 短暫延遲以避免觸發更嚴格的速率限制
        Utilities.sleep(1000);
      }
    }
  }

  console.log(`--- 批次建立課程結束 ---`);
  console.log(`總計: ${totalSuccess} 門課程成功建立，${totalFailed} 門課程失敗。`);
  console.log(`✍️ 所有紀錄已寫入 "${LOG_SHEET_NAME}" 工作表。`);
}

// =============================================
// Utility Function to Populate Sheet from Log
// =============================================

/**
 * (一次性工具)
 * 從給定的執行日誌中解析資料，並補登到 Google Sheet 中。
 * 這只在需要手動恢復資料時使用。
 */
function populateSheetFromLog() {
  // --- 設定 ---
  const LOG_SPREADSHEET_ID = '1GWbn5qIKCikvLV_frTeIjDcTbi8wWxwCQR6S0NIEAp8';
  const LOG_SHEET_NAME = 'course_teacher';
  const SUBJECTS_MAP = {
    LT: 'Ms. Kate',
    IT: 'Mr. Perry',
    KCFS: 'Mr. Louw',
  };
  // --- 結束設定 ---

  // --- 將你提供的日誌貼在這裡 ---
  const logData = `
[INFO]   ✅ 成功: LT-G1 Achievers (ID: 779922029471)
[INFO]   ✅ 成功: IT-G1 Achievers (ID: 779921968089)
[INFO]   ✅ 成功: KCFS-G1 Achievers (ID: 779922003016)
[INFO]   ✅ 成功: LT-G1 Discoverers (ID: 779922024070)
[INFO]   ✅ 成功: IT-G1 Discoverers (ID: 779922045964)
[INFO]   ✅ 成功: KCFS-G1 Discoverers (ID: 779922047333)
[INFO]   ✅ 成功: LT-G1 Voyagers (ID: 779922000504)
[INFO]   ✅ 成功: IT-G1 Voyagers (ID: 779921963954)
[INFO]   ✅ 成功: KCFS-G1 Voyagers (ID: 779922050446)
[INFO]   ✅ 成功: LT-G1 Explorers (ID: 779922034354)
[INFO]   ✅ 成功: IT-G1 Explorers (ID: 779921930383)
[INFO]   ✅ 成功: KCFS-G1 Explorers (ID: 779922065235)
[INFO]   ✅ 成功: LT-G1 Navigators (ID: 779922057508)
[INFO]   ✅ 成功: IT-G1 Navigators (ID: 779921999359)
[INFO]   ✅ 成功: KCFS-G1 Navigators (ID: 779921986009)
[INFO]   ✅ 成功: LT-G1 Adventurers (ID: 779921948860)
[INFO]   ✅ 成功: IT-G1 Adventurers (ID: 779921980356)
[INFO]   ✅ 成功: KCFS-G1 Adventurers (ID: 779921972429)
[INFO]   ✅ 成功: LT-G1 Guardians (ID: 779922003082)
[INFO]   ✅ 成功: IT-G1 Guardians (ID: 779921980390)
[INFO]   ✅ 成功: KCFS-G1 Guardians (ID: 779922046054)
[INFO]   ✅ 成功: LT-G1 Pioneers (ID: 779922021273)
[INFO]   ✅ 成功: IT-G1 Pioneers (ID: 779922050570)
[INFO]   ✅ 成功: KCFS-G1 Pioneers (ID: 779922046073)
[INFO]   ✅ 成功: LT-G1 Innovators (ID: 779922008329)
[INFO]   ✅ 成功: IT-G1 Innovators (ID: 779922021811)
[INFO]   ✅ 成功: KCFS-G1 Innovators (ID: 779922057889)
[INFO]   ✅ 成功: LT-G1 Visionaries (ID: 779922034584)
[INFO]   ✅ 成功: IT-G1 Visionaries (ID: 779921968221)
[INFO]   ✅ 成功: KCFS-G1 Visionaries (ID: 779922011931)
[INFO]   ✅ 成功: LT-G1 Pathfinders (ID: 779922007326)
[INFO]   ✅ 成功: IT-G1 Pathfinders (ID: 779921921745)
[INFO]   ✅ 成功: KCFS-G1 Pathfinders (ID: 779922000731)
[INFO]   ✅ 成功: LT-G1 Seekers (ID: 779922037880)
[INFO]   ✅ 成功: IT-G1 Seekers (ID: 779922007364)
[INFO]   ✅ 成功: KCFS-G1 Seekers (ID: 779922014522)
[INFO]   ✅ 成功: LT-G1 Trailblazers (ID: 779922044405)
[INFO]   ✅ 成功: IT-G1 Trailblazers (ID: 779922002217)
[INFO]   ✅ 成功: KCFS-G1 Trailblazers (ID: 779922034657)
[INFO]   ✅ 成功: LT-G1 Inventors (ID: 779922048392)
[INFO]   ✅ 成功: IT-G1 Inventors (ID: 779922040087)
[INFO]   ✅ 成功: KCFS-G1 Inventors (ID: 779921999592)
[INFO]   ✅ 成功: LT-G2 Achievers (ID: 779921948991)
[INFO]   ✅ 成功: IT-G2 Achievers (ID: 779922014568)
[INFO]   ✅ 成功: KCFS-G2 Achievers (ID: 779922012472)
[INFO]   ✅ 成功: LT-G2 Discoverers (ID: 779922046211)
[INFO]   ✅ 成功: IT-G2 Discoverers (ID: 779922018036)
[INFO]   ✅ 成功: KCFS-G2 Discoverers (ID: 779922005259)
[INFO]   ✅ 成功: LT-G2 Voyagers (ID: 779921921851)
[INFO]   ✅ 成功: IT-G2 Voyagers (ID: 779922034749)
[INFO]   ✅ 成功: KCFS-G2 Voyagers (ID: 779922005284)
[INFO]   ✅ 成功: LT-G2 Explorers (ID: 779922026952)
[INFO]   ✅ 成功: IT-G2 Explorers (ID: 779922044545)
[INFO]   ✅ 成功: KCFS-G2 Explorers (ID: 779922081094)
[INFO]   ✅ 成功: LT-G2 Navigators (ID: 779922038996)
[INFO]   ✅ 成功: IT-G2 Navigators (ID: 779922046276)
[INFO]   ✅ 成功: KCFS-G2 Navigators (ID: 779921985590)
[INFO]   ✅ 成功: LT-G2 Adventurers (ID: 779922074842)
[INFO]   ✅ 成功: IT-G2 Adventurers (ID: 779922065624)
[INFO]   ✅ 成功: KCFS-G2 Adventurers (ID: 779922075985)
[INFO]   ✅ 成功: LT-G2 Guardians (ID: 779922003336)
[INFO]   ✅ 成功: IT-G2 Guardians (ID: 779922024530)
[INFO]   ✅ 成功: KCFS-G2 Guardians (ID: 779922035489)
[INFO]   ✅ 成功: LT-G2 Pioneers (ID: 779922014736)
[INFO]   ✅ 成功: IT-G2 Pioneers (ID: 779922021999)
[INFO]   ✅ 成功: KCFS-G2 Pioneers (ID: 779921964337)
[INFO]   ✅ 成功: LT-G2 Innovators (ID: 779922016609)
[INFO]   ✅ 成功: IT-G2 Innovators (ID: 779922047733)
[INFO]   ✅ 成功: KCFS-G2 Innovators (ID: 779922035521)
[INFO]   ✅ 成功: LT-G2 Visionaries (ID: 779921978592)
[INFO]   ✅ 成功: IT-G2 Visionaries (ID: 779922013496)
[INFO]   ✅ 成功: KCFS-G2 Visionaries (ID: 779922048583)
[INFO]   ✅ 成功: LT-G2 Pathfinders (ID: 779922049004)
[INFO]   ✅ 成功: IT-G2 Pathfinders (ID: 779922049019)
[INFO]   ✅ 成功: KCFS-G2 Pathfinders (ID: 779922016672)
[INFO]   ✅ 成功: LT-G2 Seekers (ID: 779922065744)
[INFO]   ✅ 成功: IT-G2 Seekers (ID: 779922013559)
[INFO]   ✅ 成功: KCFS-G2 Seekers (ID: 779922035577)
[INFO]   ✅ 成功: LT-G2 Trailblazers (ID: 779922012668)
[INFO]   ✅ 成功: IT-G2 Trailblazers (ID: 779921930880)
[INFO]   ✅ 成功: KCFS-G2 Trailblazers (ID: 779922070707)
[INFO]   ✅ 成功: LT-G2 Inventors (ID: 779921987442)
[INFO]   ✅ 成功: IT-G2 Inventors (ID: 779921986411)
[INFO]   ✅ 成功: KCFS-G2 Inventors (ID: 779922047855)
[INFO]   ✅ 成功: LT-G3 Achievers (ID: 779922075128)
[INFO]   ✅ 成功: IT-G3 Achievers (ID: 779922073859)
[INFO]   ✅ 成功: KCFS-G3 Achievers (ID: 779922001163)
[INFO]   ✅ 成功: LT-G3 Discoverers (ID: 779922084538)
[INFO]   ✅ 成功: IT-G3 Discoverers (ID: 779921999845)
[INFO]   ✅ 成功: KCFS-G3 Discoverers (ID: 779922035255)
[INFO]   ✅ 成功: LT-G3 Voyagers (ID: 779921955583)
[INFO]   ✅ 成功: IT-G3 Voyagers (ID: 779922018332)
[INFO]   ✅ 成功: KCFS-G3 Voyagers (ID: 779922065856)
[INFO]   ✅ 成功: LT-G3 Explorers (ID: 779921985920)
[INFO]   ✅ 成功: IT-G3 Explorers (ID: 779922084573)
[INFO]   ✅ 成功: KCFS-G3 Explorers (ID: 779922072945)
[INFO]   ✅ 成功: LT-G3 Navigators (ID: 779922028593)
[INFO]   ✅ 成功: IT-G3 Navigators (ID: 779922022149)
[INFO]   ✅ 成功: KCFS-G3 Navigators (ID: 779922047961)
[INFO]   ✅ 成功: LT-G3 Adventurers (ID: 779922036661)
[INFO]   ✅ 成功: IT-G3 Adventurers (ID: 779922047983)
[INFO]   ✅ 成功: KCFS-G3 Adventurers (ID: 779922074011)
[INFO]   ✅ 成功: LT-G3 Guardians (ID: 779922084207)
[INFO]   ✅ 成功: IT-G3 Guardians (ID: 779922060904)
[INFO]   ✅ 成功: KCFS-G3 Guardians (ID: 779922033349)
[INFO]   ✅ 成功: LT-G3 Pioneers (ID: 779922015538)
[INFO]   ✅ 成功: IT-G3 Pioneers (ID: 779921931059)
[INFO]   ✅ 成功: KCFS-G3 Pioneers (ID: 779922001293)
[INFO]   ✅ 成功: LT-G3 Innovators (ID: 779922081422)
[INFO]   ✅ 成功: IT-G3 Innovators (ID: 779921931088)
[INFO]   ✅ 成功: KCFS-G3 Innovators (ID: 779922066519)
[INFO]   ✅ 成功: LT-G3 Visionaries (ID: 779922069179)
[INFO]   ✅ 成功: IT-G3 Visionaries (ID: 779921931113)
[INFO]   ✅ 成功: KCFS-G3 Visionaries (ID: 779922083299)
[INFO]   ✅ 成功: LT-G3 Pathfinders (ID: 779922010084)
[INFO]   ✅ 成功: IT-G3 Pathfinders (ID: 779922040641)
[INFO]   ✅ 成功: KCFS-G3 Pathfinders (ID: 779922072684)
[INFO]   ✅ 成功: LT-G3 Seekers (ID: 779922061523)
[INFO]   ✅ 成功: IT-G3 Seekers (ID: 779922074147)
[INFO]   ✅ 成功: KCFS-G3 Seekers (ID: 779922063726)
[INFO]   ✅ 成功: LT-G3 Trailblazers (ID: 779922010127)
[INFO]   ✅ 成功: IT-G3 Trailblazers (ID: 779922090717)
[INFO]   ✅ 成功: KCFS-G3 Trailblazers (ID: 779922027509)
[INFO]   ✅ 成功: LT-G3 Inventors (ID: 779922025875)
[INFO]   ✅ 成功: IT-G3 Inventors (ID: 779921976606)
[INFO]   ✅ 成功: KCFS-G3 Inventors (ID: 779922036847)
[INFO]   ✅ 成功: LT-G4 Achievers (ID: 779922000137)
[INFO]   ✅ 成功: IT-G4 Achievers (ID: 779922025914)
[INFO]   ✅ 成功: KCFS-G4 Achievers (ID: 779922088094)
[INFO]   ✅ 成功: LT-G4 Discoverers (ID: 779922052946)
[INFO]   ✅ 成功: IT-G4 Discoverers (ID: 779922066706)
[INFO]   ✅ 成功: KCFS-G4 Discoverers (ID: 779922084754)
[INFO]   ✅ 成功: LT-G4 Voyagers (ID: 779922056194)
[INFO]   ✅ 成功: IT-G4 Voyagers (ID: 779922086834)
[INFO]   ✅ 成功: KCFS-G4 Voyagers (ID: 779922089490)
[INFO]   ✅ 成功: LT-G4 Explorers (ID: 779922013975)
[INFO]   ✅ 成功: IT-G4 Explorers (ID: 779922066775)
[INFO]   ✅ 成功: KCFS-G4 Explorers (ID: 779922089512)
[INFO]   ✅ 成功: LT-G4 Navigators (ID: 779922063870)
[INFO]   ✅ 成功: IT-G4 Navigators (ID: 779922085853)
[INFO]   ✅ 成功: KCFS-G4 Navigators (ID: 779922094010)
[INFO]   ✅ 成功: LT-G4 Adventurers (ID: 779922086926)
[INFO]   ✅ 成功: IT-G4 Adventurers (ID: 779922099328)
[INFO]   ✅ 成功: KCFS-G4 Adventurers (ID: 779922106185)
[INFO]   ✅ 成功: LT-G4 Guardians (ID: 779922076793)
[INFO]   ✅ 成功: IT-G4 Guardians (ID: 779922097960)
[INFO]   ✅ 成功: KCFS-G4 Guardians (ID: 779921964848)
[INFO]   ✅ 成功: LT-G4 Pioneers (ID: 779922087000)
[INFO]   ✅ 成功: IT-G4 Pioneers (ID: 779922053075)
[INFO]   ✅ 成功: KCFS-G4 Pioneers (ID: 779922005683)
[INFO]   ✅ 成功: LT-G4 Innovators (ID: 779921931362)
[INFO]   ✅ 成功: IT-G4 Innovators (ID: 779922046575)
[INFO]   ✅ 成功: KCFS-G4 Innovators (ID: 779922010296)
[INFO]   ✅ 成功: LT-G4 Visionaries (ID: 779922061743)
[INFO]   ✅ 成功: IT-G4 Visionaries (ID: 779921957489)
[INFO]   ✅ 成功: KCFS-G4 Visionaries (ID: 779922082747)
[INFO]   ✅ 成功: LT-G4 Pathfinders (ID: 779921964917)
[INFO]   ✅ 成功: IT-G4 Pathfinders (ID: 779922045224)
[INFO]   ✅ 成功: KCFS-G4 Pathfinders (ID: 779922037087)
[INFO]   ✅ 成功: LT-G4 Seekers (ID: 779922118116)
[INFO]   ✅ 成功: IT-G4 Seekers (ID: 779922087091)
[INFO]   ✅ 成功: KCFS-G4 Seekers (ID: 779922000366)
[INFO]   ✅ 成功: LT-G4 Trailblazers (ID: 779921976893)
[INFO]   ✅ 成功: IT-G4 Trailblazers (ID: 779922087126)
[INFO]   ✅ 成功: KCFS-G4 Trailblazers (ID: 779922022554)
[INFO]   ✅ 成功: LT-G4 Inventors (ID: 779922066935)
[INFO]   ✅ 成功: IT-G4 Inventors (ID: 779922083645)
[INFO]   ✅ 成功: KCFS-G4 Inventors (ID: 779922109730)
[INFO]   ✅ 成功: LT-G5 Achievers (ID: 779922074546)
[INFO]   ✅ 成功: IT-G5 Achievers (ID: 779922099574)
[INFO]   ✅ 成功: KCFS-G5 Achievers (ID: 779922073457)
[INFO]   ✅ 成功: LT-G5 Discoverers (ID: 779921931563)
[INFO]   ✅ 成功: IT-G5 Discoverers (ID: 779922096914)
[INFO]   ✅ 成功: KCFS-G5 Discoverers (ID: 779922005836)
[INFO]   ✅ 成功: LT-G5 Voyagers (ID: 779922106393)
[INFO]   ✅ 成功: IT-G5 Voyagers (ID: 779922071283)
[INFO]   ✅ 成功: KCFS-G5 Voyagers (ID: 779922104191)
[INFO]   ✅ 成功: LT-G5 Explorers (ID: 779922015982)
[INFO]   ✅ 成功: IT-G5 Explorers (ID: 779922089793)
[INFO]   ✅ 成功: KCFS-G5 Explorers (ID: 779922121004)
[INFO]   ✅ 成功: LT-G5 Navigators (ID: 779922106948)
[INFO]   ✅ 成功: IT-G5 Navigators (ID: 779922088900)
[INFO]   ✅ 成功: KCFS-G5 Navigators (ID: 779922010480)
[INFO]   ✅ 成功: LT-G5 Adventurers (ID: 779922074692)
[INFO]   ✅ 成功: IT-G5 Adventurers (ID: 779922087247)
[INFO]   ✅ 成功: KCFS-G5 Adventurers (ID: 779922118257)
[INFO]   ✅ 成功: LT-G5 Guardians (ID: 779922118268)
[INFO]   ✅ 成功: IT-G5 Guardians (ID: 779922122756)
[INFO]   ✅ 成功: KCFS-G5 Guardians (ID: 779922098229)
[INFO]   ✅ 成功: LT-G5 Pioneers (ID: 779921977048)
[INFO]   ✅ 成功: IT-G5 Pioneers (ID: 779922088558)
[INFO]   ✅ 成功: KCFS-G5 Pioneers (ID: 779922089900)
[INFO]   ✅ 成功: LT-G5 Innovators (ID: 779922016083)
[INFO]   ✅ 成功: IT-G5 Innovators (ID: 779922010543)
[INFO]   ✅ 成功: KCFS-G5 Innovators (ID: 779921931734)
[INFO]   ✅ 成功: LT-G5 Visionaries (ID: 779922052460)
[INFO]   ✅ 成功: IT-G5 Visionaries (ID: 779922037396)
[INFO]   ✅ 成功: KCFS-G5 Visionaries (ID: 779922098837)
[INFO]   ✅ 成功: LT-G5 Pathfinders (ID: 779922111472)
[INFO]   ✅ 成功: IT-G5 Pathfinders (ID: 779922118345)
[INFO]   ✅ 成功: KCFS-G5 Pathfinders (ID: 779922073728)
[INFO]   ✅ 成功: LT-G5 Seekers (ID: 779922132564)
[INFO]   ✅ 成功: IT-G5 Seekers (ID: 779922095056)
[INFO]   ✅ 成功: KCFS-G5 Seekers (ID: 779922118448)
[INFO]   ✅ 成功: LT-G5 Trailblazers (ID: 779922046886)
[INFO]   ✅ 成功: IT-G5 Trailblazers (ID: 779922141268)
[INFO]   ✅ 成功: KCFS-G5 Trailblazers (ID: 779922028036)
[INFO]   ✅ 成功: LT-G5 Inventors (ID: 779922037459)
[INFO]   ✅ 成功: IT-G5 Inventors (ID: 779922121234)
[INFO]   ✅ 成功: KCFS-G5 Inventors (ID: 779922104556)
[INFO]   ✅ 成功: LT-G6 Achievers (ID: 779922124589)
[INFO]   ✅ 成功: IT-G6 Achievers (ID: 779922110229)
[INFO]   ✅ 成功: KCFS-G6 Achievers (ID: 779922107986)
[INFO]   ✅ 成功: LT-G6 Discoverers (ID: 779922128862)
[INFO]   ✅ 成功: IT-G6 Discoverers (ID: 779922092838)
[INFO]   ✅ 成功: KCFS-G6 Discoverers (ID: 779922131945)
[INFO]   ✅ 成功: LT-G6 Voyagers (ID: 779922102231)
[INFO]   ✅ 成功: IT-G6 Voyagers (ID: 779922132705)
[INFO]   ✅ 成功: KCFS-G6 Voyagers (ID: 779922020009)
[INFO]   ✅ 成功: LT-G6 Explorers (ID: 779922081809)
[INFO]   ✅ 成功: IT-G6 Explorers (ID: 779922093224)
[INFO]   ✅ 成功: KCFS-G6 Explorers (ID: 779922107364)
[INFO]   ✅ 成功: LT-G6 Navigators (ID: 779922121362)
[INFO]   ✅ 成功: IT-G6 Navigators (ID: 779922053606)
[INFO]   ✅ 成功: KCFS-G6 Navigators (ID: 779921957996)
[INFO]   ✅ 成功: LT-G6 Adventurers (ID: 779922135025)
[INFO]   ✅ 成功: IT-G6 Adventurers (ID: 779922068481)
[INFO]   ✅ 成功: KCFS-G6 Adventurers (ID: 779922135536)
[INFO]   ✅ 成功: LT-G6 Guardians (ID: 779922054467)
[INFO]   ✅ 成功: IT-G6 Guardians (ID: 779922097338)
[INFO]   ✅ 成功: KCFS-G6 Guardians (ID: 779922020130)
[INFO]   ✅ 成功: LT-G6 Pioneers (ID: 779922059888)
[INFO]   ✅ 成功: IT-G6 Pioneers (ID: 779922147963)
[INFO]   ✅ 成功: KCFS-G6 Pioneers (ID: 779922006256)
[INFO]   ✅ 成功: LT-G6 Innovators (ID: 779922135094)
[INFO]   ✅ 成功: IT-G6 Innovators (ID: 779922093290)
[INFO]   ✅ 成功: KCFS-G6 Innovators (ID: 779922056967)
[INFO]   ✅ 成功: LT-G6 Visionaries (ID: 779922131171)
[INFO]   ✅ 成功: IT-G6 Visionaries (ID: 779922087726)
[INFO]   ✅ 成功: KCFS-G6 Visionaries (ID: 779922132903)
[INFO]   ✅ 成功: LT-G6 Pathfinders (ID: 779922107477)
[INFO]   ✅ 成功: IT-G6 Pathfinders (ID: 779922081950)
[INFO]   ✅ 成功: KCFS-G6 Pathfinders (ID: 779922126500)
[INFO]   ✅ 成功: LT-G6 Seekers (ID: 779922129063)
[INFO]   ✅ 成功: IT-G6 Seekers (ID: 779922135162)
[INFO]   ✅ 成功: KCFS-G6 Seekers (ID: 779922102469)
[INFO]   ✅ 成功: LT-G6 Trailblazers (ID: 779922143433)
[INFO]   ✅ 成功: IT-G6 Trailblazers (ID: 779922097560)
[INFO]   ✅ 成功: KCFS-G6 Trailblazers (ID: 779922136269)
[INFO]   ✅ 成功: LT-G6 Inventors (ID: 779922129101)
[INFO]   ✅ 成功: IT-G6 Inventors (ID: 779922124838)
[INFO]   ✅ 成功: KCFS-G6 Inventors (ID: 779922054673)  
  `;

  // --- 開始解析與寫入 ---
  console.log('--- 開始從日誌補登資料 ---');
  const lines = logData.split('\n').filter((line) => line.includes('✅ 成功:'));
  console.log(`在日誌中找到 ${lines.length} 筆成功紀錄。`);

  // --- 初始化工作表 ---
  let logSheet;
  try {
    const ss = SpreadsheetApp.openById(LOG_SPREADSHEET_ID);
    logSheet = ss.getSheetByName(LOG_SHEET_NAME);
    if (!logSheet) {
      throw new Error(`找不到名為 "${LOG_SHEET_NAME}" 的工作表。`);
    }
    // 清空工作表並寫入標頭
    logSheet.clear();
    const headers = [
      'Subject',
      'Grade',
      'Class Name',
      'Teacher',
      'Email',
      'Course ID',
      'Course Link',
      'Status',
    ];
    logSheet.appendRow(headers);
  } catch (e) {
    console.log(`❌ 無法存取紀錄用的工作表: ${e.toString()}`);
    return;
  }
  // --- 結束初始化 ---

  let writeSuccess = 0;
  let writeFailed = 0;

  for (const line of lines) {
    try {
      const courseNameMatch = line.match(/✅ 成功: (.*) \(ID:/);
      const courseIdMatch = line.match(/\(ID: (\d+)\)/);

      if (courseNameMatch && courseIdMatch) {
        const fullCourseName = courseNameMatch[1];
        const courseId = courseIdMatch[1];

        const parts = fullCourseName.split('-');
        const subjectCode = parts[0];
        const gradeAndClass = parts[1].split(' ');
        const grade = gradeAndClass[0];
        const className = gradeAndClass[1];
        const teacher = SUBJECTS_MAP[subjectCode] || '未知';
        const courseLink = `https://classroom.google.com/c/${courseId}`;

        const newRow = [subjectCode, grade, className, teacher, '', courseId, courseLink, false];
        logSheet.appendRow(newRow);
        writeSuccess++;
      } else {
        writeFailed++;
        console.log(`  ⚠️ 無法解析此行: ${line}`);
      }
    } catch (e) {
      writeFailed++;
      console.log(`  ❌ 寫入時發生錯誤: ${line} - ${e.toString()}`);
    }
  }

  SpreadsheetApp.flush(); // 強制儲存所有變更
  console.log(`--- 資料補登結束 ---`);
  console.log(`總計: ${writeSuccess} 筆資料成功寫入，${writeFailed} 筆失敗。`);
}

/**
 * 從 course_teacher 工作表讀取資料，並將老師加入課程。
 */
function addTeachersFromCourseTeacherSheet() {
  addTeachersDirectly();
}

function testAddTeacher() {
  const courseId = '779922029471'; // 根據你的日誌
  const teacherEmail = 'wendyyen@kcislk.ntpc.edu.tw'; // 根據你的日誌

  try {
    console.log('--- 開始執行 testAddTeacher ---');
    console.log(`正在嘗試將老師 ${teacherEmail} 加入課程 ${courseId}`);

    const teacher = { userId: teacherEmail };
    const response = Classroom.Courses.Teachers.create(teacher, courseId);

    console.log('✅ 測試成功！API 呼叫已完成。');
    console.log(JSON.stringify(response, null, 2));
  } catch (e) {
    console.log('--- ❌ 測試失敗 ---');
    console.log('錯誤名稱: ' + e.name);
    console.log('錯誤訊息: ' + e.message);
    console.log('完整錯誤物件:');
    console.log(JSON.stringify(e, null, 2));
  }
}

/**
 * 🔍 用戶 ID 查詢工具
 * 查詢指定用戶 ID 對應的 Email 地址和詳細資訊
 */
function lookupUserById(userId = '110732085101506554189') {
  console.log('=== 🔍 用戶 ID 查詢工具 ===');
  console.log(`正在查詢用戶 ID: ${userId}`);

  try {
    // 方法1: 嘗試透過 Admin Directory API 查詢
    try {
      console.log('\n📋 方法1: Admin Directory API 查詢...');
      const userInfo = AdminDirectory.Users.get(userId);
      console.log(`✅ 找到用戶!`);
      console.log(`📧 Email: ${userInfo.primaryEmail}`);
      console.log(`👤 姓名: ${userInfo.name ? userInfo.name.fullName : '未提供'}`);
      console.log(`🏢 組織: ${userInfo.orgUnitPath || '未提供'}`);
      console.log(`📊 狀態: ${userInfo.suspended ? '已停用' : '活躍'}`);
      console.log(`🆔 用戶類型: ${userInfo.customerType || '未知'}`);
      return {
        success: true,
        email: userInfo.primaryEmail,
        name: userInfo.name ? userInfo.name.fullName : null,
        orgUnit: userInfo.orgUnitPath,
        suspended: userInfo.suspended,
        method: 'AdminDirectory',
      };
    } catch (adminError) {
      console.log(`⚠️ Admin Directory API 查詢失敗: ${adminError.message}`);
    }

    // 方法2: 嘗試透過課程擁有者身份查詢
    try {
      console.log('\n📋 方法2: 透過課程擁有者查詢...');
      const courses = Classroom.Courses.list({
        courseStates: ['ACTIVE', 'ARCHIVED', 'PROVISIONED', 'DECLINED'],
        pageSize: 100,
      });

      if (courses.courses) {
        const ownedCourses = courses.courses.filter((course) => course.ownerId === userId);
        if (ownedCourses.length > 0) {
          console.log(`✅ 找到該用戶擁有的課程: ${ownedCourses.length} 個`);
          console.log(`📚 範例課程: ${ownedCourses[0].name} (ID: ${ownedCourses[0].id})`);

          // 嘗試查詢該課程的老師列表來獲取用戶資訊
          try {
            const teachers = Classroom.Courses.Teachers.list(ownedCourses[0].id);
            if (teachers.teachers) {
              const ownerAsTeacher = teachers.teachers.find(
                (teacher) => teacher.userId === userId || teacher.profile.id === userId
              );
              if (ownerAsTeacher) {
                console.log(`📧 Email: ${ownerAsTeacher.profile.emailAddress}`);
                console.log(`👤 姓名: ${ownerAsTeacher.profile.name.fullName}`);
                return {
                  success: true,
                  email: ownerAsTeacher.profile.emailAddress,
                  name: ownerAsTeacher.profile.name.fullName,
                  courseCount: ownedCourses.length,
                  method: 'CourseOwner',
                };
              }
            }
          } catch (teacherError) {
            console.log(`⚠️ 無法查詢課程老師列表: ${teacherError.message}`);
          }

          return {
            success: true,
            email: '無法取得',
            courseCount: ownedCourses.length,
            sampleCourse: ownedCourses[0].name,
            method: 'CourseOwner',
          };
        }
      }
      console.log(`❌ 沒有找到該用戶擁有的課程`);
    } catch (courseError) {
      console.log(`⚠️ 課程查詢失敗: ${courseError.message}`);
    }

    // 方法3: 建議替代方案
    console.log('\n💡 替代方案建議:');
    console.log('1. 請 Google Workspace 管理員查詢此用戶 ID');
    console.log('2. 聯絡組織的 IT 部門協助識別');
    console.log('3. 檢查 Google Admin Console 的用戶列表');
    console.log(`4. 在 Admin Console 搜尋: ${userId}`);

    return {
      success: false,
      message: '無法透過現有 API 查詢到用戶資訊',
      suggestions: [
        '聯絡 Google Workspace 管理員',
        '檢查 Google Admin Console',
        '確認用戶 ID 是否正確',
      ],
    };
  } catch (error) {
    console.log(`❌ 查詢過程發生錯誤: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 🔧 增強版權限診斷工具
 * 提供更詳細的權限狀態和解決建議
 */
function enhancedPermissionDiagnosis(courseId = '779922029471') {
  console.log('=== 🔧 增強版權限診斷工具 ===');

  // 步驟1: 檢查當前執行者
  let currentUser = null;
  try {
    currentUser = Session.getActiveUser().getEmail();
    console.log(`📧 當前執行者: ${currentUser}`);
  } catch (e) {
    console.log(`⚠️ 無法取得執行者 Email: ${e.message}`);
    console.log(`💡 解決方案: 在 appsscript.json 添加 userinfo.email 權限`);
  }

  // 步驟2: 檢查課程詳細資訊
  console.log(`\n🔍 檢查課程: ${courseId}`);
  try {
    const course = Classroom.Courses.get(courseId);
    console.log(`📚 課程名稱: ${course.name}`);
    console.log(`👤 課程擁有者 ID: ${course.ownerId}`);
    console.log(`📊 課程狀態: ${course.courseState}`);

    // 步驟3: 查詢課程擁有者資訊
    console.log(`\n🔍 查詢課程擁有者詳細資訊...`);
    const ownerInfo = lookupUserById(course.ownerId);

    if (ownerInfo.success && ownerInfo.email) {
      console.log(`📧 課程擁有者 Email: ${ownerInfo.email}`);
      console.log(`👤 擁有者姓名: ${ownerInfo.name || '未知'}`);

      // 步驟4: 權限分析
      if (currentUser && currentUser === ownerInfo.email) {
        console.log(`\n✅ 權限狀態: 您是課程擁有者，擁有完整權限！`);
        return {
          hasPermission: true,
          role: 'OWNER',
          recommendation: '可以直接執行 addTeachersFromExternalSheet()',
        };
      } else {
        console.log(`\n⚠️ 權限狀態: 您不是課程擁有者`);
        console.log(`\n💡 解決方案選項:`);
        console.log(`1. 請 ${ownerInfo.email} 執行 addTeachersFromExternalSheet()`);
        console.log(`2. 請課程擁有者將您設為共同擁有者`);
        console.log(`3. 聯絡 Google Workspace 管理員協助`);

        return {
          hasPermission: false,
          role: 'TEACHER_OR_OTHER',
          currentUser: currentUser,
          ownerEmail: ownerInfo.email,
          ownerName: ownerInfo.name,
          recommendations: [
            `請 ${ownerInfo.email} 執行老師新增功能`,
            '請課程擁有者授予更高權限',
            '聯絡 Google Workspace 管理員',
          ],
        };
      }
    } else {
      console.log(`❌ 無法查詢擁有者詳細資訊`);
      console.log(`\n💡 解決方案:`);
      console.log(`1. 聯絡 Google Workspace 管理員查詢用戶 ID: ${course.ownerId}`);
      console.log(`2. 請管理員直接執行老師新增作業`);

      return {
        hasPermission: false,
        role: 'UNKNOWN',
        ownerUserId: course.ownerId,
        recommendations: [
          '聯絡 Google Workspace 管理員',
          '請管理員查詢擁有者身份',
          '請管理員執行批次操作',
        ],
      };
    }
  } catch (error) {
    console.log(`❌ 課程查詢失敗: ${error.message}`);
    return {
      hasPermission: false,
      error: error.message,
      recommendations: [
        '檢查課程 ID 是否正確',
        '確認您有課程存取權限',
        '聯絡 Google Workspace 管理員',
      ],
    };
  }
}

// =============================================
// UI 介面函數 - 為選單項目提供用戶界面
// =============================================

/**
 * 列出課程 UI
 */
function listCoursesUI() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '📋 列出所有課程',
    '請輸入要寫入課程清單的工作表名稱（預設：課程清單）',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const sheetName = result.getResponseText() || '課程清單';

  try {
    ui.alert('處理中', '正在載入課程清單，請稍候...', ui.ButtonSet.OK);
    listCourses(sheetName);
    ui.alert('✅ 成功', `課程清單已成功寫入 "${sheetName}" 工作表。`, ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('❌ 錯誤', `操作失敗：${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * 查詢課程師生 UI
 */
function listMembersUI() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '🔍 查詢課程師生',
    '請輸入要查詢師生的工作表名稱（預設：課程清單）',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const sheetName = result.getResponseText() || '課程清單';

  try {
    listCourseMembers(sheetName);
    ui.alert('✅ 成功', `師生清單已成功更新於 "${sheetName}" 工作表。`, ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('❌ 錯誤', `操作失敗：${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * 建立課程 UI
 */
function createCoursesUI() {
  const ui = SpreadsheetApp.getUi();

  const sheetNameResult = ui.prompt(
    '📚 建立新課程 - 步驟 1/2',
    '請輸入包含課程名稱的工作表名稱（預設：新課程）',
    ui.ButtonSet.OK_CANCEL
  );

  if (sheetNameResult.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const sheetName = sheetNameResult.getResponseText() || '新課程';

  const ownerIdResult = ui.prompt(
    '📚 建立新課程 - 步驟 2/2',
    '請輸入新課程的擁有者 ID。留空則預設為您自己 (me)',
    ui.ButtonSet.OK_CANCEL
  );

  if (ownerIdResult.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const ownerId = ownerIdResult.getResponseText() || 'me';

  try {
    createCourses(sheetName, ownerId);
    ui.alert('✅ 成功', `新課程已成功建立，詳情請見 "${sheetName}" 工作表。`, ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('❌ 錯誤', `操作失敗：${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * 新增老師 UI
 */
function addTeachersUI() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '👨‍🏫 新增老師',
    '請輸入要處理新增老師的工作表名稱（預設：新增老師）',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const sheetName = result.getResponseText() || '新增老師';

  try {
    // 這裡可以添加批次新增老師的邏輯
    ui.alert(
      '🚧 功能開發中',
      '批次新增老師功能正在開發中，請使用 addTeachersFromExternalSheet() 功能。',
      ui.ButtonSet.OK
    );
  } catch (error) {
    ui.alert('❌ 錯誤', `操作失敗：${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * 新增學生 UI
 */
function addStudentsUI() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '👨‍🎓 新增學生',
    '請輸入要處理新增學生的工作表名稱（預設：新增學生）',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const sheetName = result.getResponseText() || '新增學生';

  try {
    ui.alert('🚧 功能開發中', '批次新增學生功能正在開發中。', ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('❌ 錯誤', `操作失敗：${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * 更新課程名稱 UI
 */
function updateCoursesUI() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '✏️ 更新課程名稱',
    '請輸入包含課程名稱更新資料的工作表名稱（預設：更新課程）',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const sheetName = result.getResponseText() || '更新課程';

  try {
    updateCourses(sheetName);
    ui.alert('✅ 成功', `課程名稱已成功更新，詳情請見 "${sheetName}" 工作表。`, ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('❌ 錯誤', `操作失敗：${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * 封存課程 UI
 */
function archiveCoursesUI() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '📦 封存課程',
    '請輸入包含要封存課程資料的工作表名稱（預設：封存課程）',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const sheetName = result.getResponseText() || '封存課程';

  try {
    archiveCourses(sheetName);
    ui.alert('✅ 成功', `課程已成功封存，詳情請見 "${sheetName}" 工作表。`, ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('❌ 錯誤', `操作失敗：${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * 新增單一學生到課程 UI
 */
function addSingleStudentToCourseUI() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('🚧 功能開發中', '此功能正在開發中。', ui.ButtonSet.OK);
}

/**
 * 從課程移除單一學生 UI
 */
function removeSingleStudentFromCourseUI() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('🚧 功能開發中', '此功能正在開發中。', ui.ButtonSet.OK);
}

/**
 * 設定預設工作表名稱 UI
 */
function configureDefaultSheetsUI() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('🚧 功能開發中', '此功能正在開發中。', ui.ButtonSet.OK);
}

/**
 * 系統狀態 UI
 */
function showSystemStatusUI() {
  const ui = SpreadsheetApp.getUi();

  let statusMessage = '📊 系統狀態報告\n\n';

  try {
    // 檢查當前用戶
    const currentUser = Session.getActiveUser().getEmail();
    statusMessage += `👤 當前用戶: ${currentUser}\n`;
  } catch (e) {
    statusMessage += `👤 當前用戶: 無法獲取\n`;
  }

  try {
    // 檢查課程數量
    const courses = Classroom.Courses.list({ courseStates: ['ACTIVE'] });
    const courseCount = courses.courses ? courses.courses.length : 0;
    statusMessage += `📚 可存取課程數: ${courseCount}\n`;
  } catch (e) {
    statusMessage += `📚 課程檢查: 失敗 (${e.message})\n`;
  }

  statusMessage += `\n⏰ 檢查時間: ${new Date().toLocaleString()}`;

  ui.alert('📊 系統狀態', statusMessage, ui.ButtonSet.OK);
}

/**
 * 清除快取 UI
 */
function clearCacheUI() {
  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert(
    '🗑️ 清除快取',
    '您確定要清除所有快取嗎？\n\n注意：這會清除腳本儲存的所有設定值。',
    ui.ButtonSet.YES_NO
  );

  if (confirm === ui.Button.YES) {
    try {
      PropertiesService.getScriptProperties().deleteAll();
      ui.alert('✅ 成功', '快取已清除', ui.ButtonSet.OK);
    } catch (error) {
      ui.alert('❌ 錯誤', `清除失敗：${error.message}`, ui.ButtonSet.OK);
    }
  }
}
