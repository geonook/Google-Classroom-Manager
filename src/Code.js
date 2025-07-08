/**
 * @OnlyCurrentDoc
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Classroom 管理工具')
    .addItem('1. 列出所有課程', 'listCoursesUI')
    .addSeparator()
    .addItem('2. 查詢課程師生', 'listMembersUI')
    .addSeparator()
    .addItem('3. 建立新課程', 'createCoursesUI')
    .addSeparator()
    .addItem('4. 新增老師', 'addTeachersUI')
    .addItem('5. 新增學生', 'addStudentsUI')
    .addSeparator()
    .addItem('6. 更新課程名稱', 'updateCoursesUI')
    .addItem('7. 封存課程', 'archiveCoursesUI')
    .addSeparator()
    .addItem('8. 新增單一學生到課程', 'addSingleStudentToCourseUI')
    .addItem('9. 從課程移除單一學生', 'removeSingleStudentFromCourseUI')
    .addSeparator()
    .addItem('10. 設定預設工作表名稱', 'configureDefaultSheetsUI')
    .addToUi();
}

// =============================================
// UI Functions
// =============================================

function listCoursesUI() {
  const ui = SpreadsheetApp.getUi();
  const defaultSheetName = getScriptProperty('defaultSheet_listCourses') || '搜尋課程與老師';
  const result = ui.prompt(
    '請輸入工作表名稱',
    `請輸入要寫入課程清單的工作表名稱（預設：${defaultSheetName}）`,
    ui.ButtonSet.OK_CANCEL
  );
  const button = result.getSelectedButton();
  const sheetName = result.getResponseText();
  if (button == ui.Button.OK && sheetName) {
    try {
      listCourses(sheetName);
      ui.alert('成功', `課程清單已成功寫入 "${sheetName}" 工作表。`, ui.ButtonSet.OK);
    } catch (e) {
      ui.alert('錯誤', `操作失敗：${e.message}`, ui.ButtonSet.OK);
    }
  }
}

function listMembersUI() {
  const ui = SpreadsheetApp.getUi();
  const defaultSheetName = getScriptProperty('defaultSheet_listMembers') || '搜尋課程與老師';
  const result = ui.prompt(
    '請輸入工作表名稱',
    `請輸入要查詢師生的工作表名稱（預設：${defaultSheetName}）`,
    ui.ButtonSet.OK_CANCEL
  );
  const button = result.getSelectedButton();
  const sheetName = result.getResponseText();
  if (button == ui.Button.OK && sheetName) {
    try {
      listCourseMembers(sheetName);
      ui.alert('成功', `師生清單已成功更新於 "${sheetName}" 工作表。`, ui.ButtonSet.OK);
    } catch (e) {
      ui.alert('錯誤', `操作失敗：${e.message}`, ui.ButtonSet.OK);
    }
  }
}

function createCoursesUI() {
  const ui = SpreadsheetApp.getUi();
  const defaultSheetName = getScriptProperty('defaultSheet_createCourses') || '全部課程';
  const sheetNameResult = ui.prompt(
    '步驟 1/2: 請輸入工作表名稱',
    `請輸入包含課程名稱的工作表（預設：${defaultSheetName}）`,
    ui.ButtonSet.OK_CANCEL
  );
  if (sheetNameResult.getSelectedButton() !== ui.Button.OK || !sheetNameResult.getResponseText())
    return;
  const sheetName = sheetNameResult.getResponseText();

  const defaultOwnerId = getScriptProperty('defaultOwnerId_createCourses') || 'me';
  const ownerIdResult = ui.prompt(
    '步驟 2/2: 請輸入課程擁有者 ID',
    `請輸入新課程的擁有者 ID (Owner ID)。留空則預設為您自己 (me)。(預設：${defaultOwnerId})`,
    ui.ButtonSet.OK_CANCEL
  );
  if (ownerIdResult.getSelectedButton() !== ui.Button.OK) return;
  const ownerId = ownerIdResult.getResponseText() || 'me';

  try {
    createCourses(sheetName, ownerId);
    ui.alert('成功', `新課程已成功建立，詳情請見 "${sheetName}" 工作表。`, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('錯誤', `操作失敗：${e.message}`, ui.ButtonSet.OK);
  }
}

function addTeachersUI() {
  addMembersUI('TEACHER');
}

function addStudentsUI() {
  addMembersUI('STUDENT');
}

function addMembersUI(role) {
  const ui = SpreadsheetApp.getUi();
  const roleText = role === 'TEACHER' ? '老師' : '學生';
  const defaultSheetName =
    getScriptProperty(`defaultSheet_add${role}s`) ||
    (role === 'TEACHER' ? '新增課程與老師' : '新增課程與學生');
  const result = ui.prompt(
    `新增${roleText}`,
    `請輸入要處理新增${roleText}的工作表名稱（預設：${defaultSheetName}）`,
    ui.ButtonSet.OK_CANCEL
  );
  const button = result.getSelectedButton();
  const sheetName = result.getResponseText();

  if (button == ui.Button.OK && sheetName) {
    try {
      addMembers(sheetName, role);
      ui.alert('成功', `${roleText}已成功新增，詳情請見 "${sheetName}" 工作表。`, ui.ButtonSet.OK);
    } catch (e) {
      ui.alert('錯誤', `操作失敗：${e.message}`, ui.ButtonSet.OK);
    }
  }
}

function updateCoursesUI() {
  const ui = SpreadsheetApp.getUi();
  const defaultSheetName = getScriptProperty('defaultSheet_updateCourses') || '課程名稱修改';
  const result = ui.prompt(
    '更新課程名稱',
    `請輸入要處理課程名稱更新的工作表名稱（預設：${defaultSheetName}）`,
    ui.ButtonSet.OK_CANCEL
  );
  const button = result.getSelectedButton();
  const sheetName = result.getResponseText();
  if (button == ui.Button.OK && sheetName) {
    try {
      updateCourses(sheetName);
      ui.alert('成功', '課程名稱已成功更新。', ui.ButtonSet.OK);
    } catch (e) {
      ui.alert('錯誤', `操作失敗：${e.message}`, ui.ButtonSet.OK);
    }
  }
}

function archiveCoursesUI() {
  const ui = SpreadsheetApp.getUi();
  const defaultSheetName = getScriptProperty('defaultSheet_archiveCourses') || '課程名稱修改';
  const result = ui.prompt(
    '封存課程',
    `請輸入要處理課程封存的工作表名稱（預設：${defaultSheetName}）`,
    ui.ButtonSet.OK_CANCEL
  );
  const button = result.getSelectedButton();
  const sheetName = result.getResponseText();
  if (button == ui.Button.OK && sheetName) {
    const confirm = ui.alert(
      '確認操作',
      '您確定要封存此工作表中所有已勾選的課程嗎？此操作無法復原。',
      ui.ButtonSet.YES_NO
    );
    if (confirm === ui.Button.YES) {
      try {
        archiveCourses(sheetName);
        ui.alert('成功', '所選課程已成功封存。', ui.ButtonSet.OK);
      } catch (e) {
        ui.alert('錯誤', `操作失敗：${e.message}`, ui.ButtonSet.OK);
      }
    }
  }
}

function addSingleStudentToCourseUI() {
  const ui = SpreadsheetApp.getUi();
  const studentEmailResult = ui.prompt('新增學生', '請輸入學生 Email：', ui.ButtonSet.OK_CANCEL);
  if (
    studentEmailResult.getSelectedButton() !== ui.Button.OK ||
    !studentEmailResult.getResponseText()
  )
    return;
  const studentEmail = studentEmailResult.getResponseText();

  const courseIdResult = ui.prompt('新增學生', '請輸入課程 ID：', ui.ButtonSet.OK_CANCEL);
  if (courseIdResult.getSelectedButton() !== ui.Button.OK || !courseIdResult.getResponseText())
    return;
  const courseId = courseIdResult.getResponseText();

  try {
    processSingleStudentTransfer(studentEmail, courseId, 'ADD');
    ui.alert('成功', `學生 ${studentEmail} 已成功新增到課程 ${courseId}。`, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('錯誤', `操作失敗：${e.message}`, ui.ButtonSet.OK);
  }
}

function removeSingleStudentFromCourseUI() {
  const ui = SpreadsheetApp.getUi();
  const studentEmailResult = ui.prompt('移除學生', '請輸入學生 Email：', ui.ButtonSet.OK_CANCEL);
  if (
    studentEmailResult.getSelectedButton() !== ui.Button.OK ||
    !studentEmailResult.getResponseText()
  )
    return;
  const studentEmail = studentEmailResult.getResponseText();

  const courseIdResult = ui.prompt('移除學生', '請輸入課程 ID：', ui.ButtonSet.OK_CANCEL);
  if (courseIdResult.getSelectedButton() !== ui.Button.OK || !courseIdResult.getResponseText())
    return;
  const courseId = courseIdResult.getResponseText();

  const confirm = ui.alert(
    '確認操作',
    `您確定要從課程 ${courseId} 移除學生 ${studentEmail} 嗎？此操作無法復原。`,
    ui.ButtonSet.YES_NO
  );
  if (confirm === ui.Button.YES) {
    try {
      processSingleStudentTransfer(studentEmail, courseId, 'REMOVE');
      ui.alert('成功', `學生 ${studentEmail} 已成功從課程 ${courseId} 移除。`, ui.ButtonSet.OK);
    } catch (e) {
      ui.alert('錯誤', `操作失敗：${e.message}`, ui.ButtonSet.OK);
    }
  }
}

function configureDefaultSheetsUI() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    '設定預設工作表名稱',
    '接下來將引導您設定各功能的預設工作表名稱。若不需設定，請留空。',
    ui.ButtonSet.OK
  );

  let input;

  input = ui.prompt(
    '預設工作表名稱',
    '1. 列出所有課程 (預設：搜尋課程與老師)',
    getScriptProperty('defaultSheet_listCourses') || '搜尋課程與老師'
  );
  setScriptProperty('defaultSheet_listCourses', input === null ? '' : input);

  input = ui.prompt(
    '預設工作表名稱',
    '2. 查詢課程師生 (預設：搜尋課程與老師)',
    getScriptProperty('defaultSheet_listMembers') || '搜尋課程與老師'
  );
  setScriptProperty('defaultSheet_listMembers', input === null ? '' : input);

  input = ui.prompt(
    '預設工作表名稱',
    '3. 建立新課程 (預設：全部課程)',
    getScriptProperty('defaultSheet_createCourses') || '全部課程'
  );
  setScriptProperty('defaultSheet_createCourses', input === null ? '' : input);

  input = ui.prompt(
    '預設工作表名稱',
    '4. 新增老師 (預設：新增課程與老師)',
    getScriptProperty('defaultSheet_addTEACHERs') || '新增課程與老師'
  );
  setScriptProperty('defaultSheet_addTEACHERs', input === null ? '' : input);

  input = ui.prompt(
    '預設工作表名稱',
    '5. 新增學生 (預設：新增課程與學生)',
    getScriptProperty('defaultSheet_addSTUDENTs') || '新增課程與學生'
  );
  setScriptProperty('defaultSheet_addSTUDENTs', input === null ? '' : input);

  input = ui.prompt(
    '預設工作表名稱',
    '6. 更新課程名稱 (預設：課程名稱修改)',
    getScriptProperty('defaultSheet_updateCourses') || '課程名稱修改'
  );
  setScriptProperty('defaultSheet_updateCourses', input === null ? '' : input);

  input = ui.prompt(
    '預設工作表名稱',
    '7. 封存課程 (預設：課程名稱修改)',
    getScriptProperty('defaultSheet_archiveCourses') || '課程名稱修改'
  );
  setScriptProperty('defaultSheet_archiveCourses', input === null ? '' : input);

  const defaultOwnerId = ui.prompt(
    '預設課程擁有者 ID',
    '3. 建立新課程的預設擁有者 ID (預設：me)',
    getScriptProperty('defaultOwnerId_createCourses') || 'me'
  );
  setScriptProperty('defaultOwnerId_createCourses', defaultOwnerId === null ? '' : defaultOwnerId);

  ui.alert('設定完成', '預設工作表名稱已儲存。下次使用時將自動填入。', ui.ButtonSet.OK);
}

// =============================================
// Core Functions
// =============================================

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

function addMembers(sheetName, role) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`找不到名為 "${sheetName}" 的工作表。`);

  const dataRange = sheet.getRange('D4:I' + sheet.getLastRow());
  const data = dataRange.getValues();
  const results = [];

  data.forEach((row) => {
    const courseId = row[1]; // Column E
    const userEmail = row[4]; // Column H
    const isProcessed = row[5]; // Column I

    if (courseId && userEmail && !isProcessed) {
      try {
        const member = { userId: userEmail };
        if (role === 'TEACHER') {
          Classroom.Courses.Teachers.create(member, courseId);
        } else {
          Classroom.Courses.Students.create(member, courseId);
        }
        results.push([true]);
      } catch (e) {
        results.push([`新增失敗: ${e.message}`]);
      }
    } else {
      results.push([isProcessed]);
    }
  });

  if (results.length > 0) {
    sheet.getRange(4, 9, results.length, 1).setValues(results);
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
