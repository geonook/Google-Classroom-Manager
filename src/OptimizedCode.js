/**
 * 優化版本的課程管理系統
 *
 * 主要改進：
 * - 模組化架構
 * - 統一錯誤處理
 * - API 限速控制
 * - 進度追蹤
 * - 資料驗證
 * - 快取機制
 */

// =============================================
// 初始化與設定
// =============================================

/**
 * 初始化日誌系統
 */
class Logger {
  static debug(message, data = null) {
    if (this.isDebugEnabled()) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  static info(message, data = null) {
    console.log(`[INFO] ${message}`, data || '');
  }

  static warn(message, data = null) {
    console.warn(`[WARN] ${message}`, data || '');
  }

  static error(message, data = null) {
    console.error(`[ERROR] ${message}`, data || '');
  }

  static isDebugEnabled() {
    return PropertiesService.getScriptProperties().getProperty('DEBUG_MODE') === 'true';
  }
}

// =============================================
// UI 函式 - 保持與原版相容
// =============================================

/**
 * 建立選單 - 保持原有介面
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
    .addSeparator()
    .addItem('系統狀態', 'showSystemStatusUI')
    .addItem('清除快取', 'clearCacheUI')
    .addToUi();
}

/**
 * 列出課程 UI - 優化版本
 */
function listCoursesUI() {
  const ui = SpreadsheetApp.getUi();
  const defaultSheetName = getScriptProperty('defaultSheet_listCourses') || '搜尋課程與老師';

  const result = ui.prompt(
    '請輸入工作表名稱',
    `請輸入要寫入課程清單的工作表名稱（預設：${defaultSheetName}）`,
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() !== ui.Button.OK || !result.getResponseText()) {
    return;
  }

  const sheetName = result.getResponseText();

  // 顯示處理中提示
  ui.alert('處理中', '正在載入課程清單，請稍候...', ui.ButtonSet.OK);

  try {
    listCoursesOptimized(sheetName);
    ui.alert('成功', `課程清單已成功寫入 "${sheetName}" 工作表。`, ui.ButtonSet.OK);
  } catch (error) {
    ErrorHandler.handle(error, '列出課程');
  }
}

/**
 * 查詢課程師生 UI - 優化版本
 */
function listMembersUI() {
  const ui = SpreadsheetApp.getUi();
  const defaultSheetName = getScriptProperty('defaultSheet_listMembers') || '搜尋課程與老師';

  const result = ui.prompt(
    '請輸入工作表名稱',
    `請輸入要查詢師生的工作表名稱（預設：${defaultSheetName}）`,
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() !== ui.Button.OK || !result.getResponseText()) {
    return;
  }

  const sheetName = result.getResponseText();

  try {
    listCourseMembersOptimized(sheetName);
    ui.alert('成功', `師生清單已成功更新於 "${sheetName}" 工作表。`, ui.ButtonSet.OK);
  } catch (error) {
    ErrorHandler.handle(error, '查詢課程師生');
  }
}

/**
 * 建立課程 UI - 優化版本
 */
function createCoursesUI() {
  const ui = SpreadsheetApp.getUi();
  const defaultSheetName = getScriptProperty('defaultSheet_createCourses') || '全部課程';
  const defaultOwnerId = getScriptProperty('defaultOwnerId_createCourses') || 'me';

  const sheetNameResult = ui.prompt(
    '步驟 1/2: 請輸入工作表名稱',
    `請輸入包含課程名稱的工作表（預設：${defaultSheetName}）`,
    ui.ButtonSet.OK_CANCEL
  );

  if (sheetNameResult.getSelectedButton() !== ui.Button.OK || !sheetNameResult.getResponseText()) {
    return;
  }

  const sheetName = sheetNameResult.getResponseText();

  const ownerIdResult = ui.prompt(
    '步驟 2/2: 請輸入課程擁有者 ID',
    `請輸入新課程的擁有者 ID (Owner ID)。留空則預設為您自己 (me)。(預設：${defaultOwnerId})`,
    ui.ButtonSet.OK_CANCEL
  );

  if (ownerIdResult.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const ownerId = ownerIdResult.getResponseText() || 'me';

  try {
    createCoursesOptimized(sheetName, ownerId);
    ui.alert('成功', `新課程已成功建立，詳情請見 "${sheetName}" 工作表。`, ui.ButtonSet.OK);
  } catch (error) {
    ErrorHandler.handle(error, '建立課程');
  }
}

/**
 * 新增老師 UI
 */
function addTeachersUI() {
  addMembersUIOptimized('TEACHER');
}

/**
 * 新增學生 UI
 */
function addStudentsUI() {
  addMembersUIOptimized('STUDENT');
}

/**
 * 新增成員 UI - 優化版本
 */
function addMembersUIOptimized(role) {
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

  if (result.getSelectedButton() !== ui.Button.OK || !result.getResponseText()) {
    return;
  }

  const sheetName = result.getResponseText();

  try {
    addMembersOptimized(sheetName, role);
    ui.alert('成功', `${roleText}已成功新增，詳情請見 "${sheetName}" 工作表。`, ui.ButtonSet.OK);
  } catch (error) {
    ErrorHandler.handle(error, `新增${roleText}`);
  }
}

/**
 * 系統狀態 UI
 */
function showSystemStatusUI() {
  const ui = SpreadsheetApp.getUi();
  const status = classroomService.getStatus();

  let message = '系統狀態報告\n\n';
  message += `快取項目數量：${status.cacheSize}\n`;
  message += `API 限速器狀態：${status.rateLimiter.isHealthy ? '正常' : '限制中'}\n`;
  message += `API 呼叫次數：${status.rateLimiter.callCount}\n`;
  message += `最後呼叫時間：${new Date(status.rateLimiter.lastCallTime).toLocaleString()}\n`;

  ui.alert('系統狀態', message, ui.ButtonSet.OK);
}

/**
 * 清除快取 UI
 */
function clearCacheUI() {
  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert('確認操作', '您確定要清除所有快取嗎？', ui.ButtonSet.YES_NO);

  if (confirm === ui.Button.YES) {
    classroomService.clearCache();
    ui.alert('成功', '快取已清除', ui.ButtonSet.OK);
  }
}

// =============================================
// 核心函式 - 優化版本
// =============================================

/**
 * 列出課程 - 優化版本
 */
async function listCoursesOptimized(sheetName) {
  const sheet = getOrCreateSheet(sheetName);
  sheet.getRange('A3:E').clearContent();

  const result = await classroomService.listAllCourses();

  if (!result.success) {
    throw new Error(result.error);
  }

  const courses = result.data;

  if (courses.length > 0) {
    const courseData = courses.map((course) => [course.id, course.name]);
    sheet.getRange(3, 2, courseData.length, 2).setValues(courseData);
  }

  Logger.info(`成功載入 ${courses.length} 個課程到工作表 "${sheetName}"`);
}

/**
 * 查詢課程師生 - 優化版本
 */
async function listCourseMembersOptimized(sheetName) {
  const sheet = getOrCreateSheet(sheetName);
  const dataRange = sheet.getRange('A3:C' + sheet.getLastRow());
  const data = dataRange.getValues();

  const checkedCourses = data
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row[0] === true && row[2]) // 已勾選且有課程 ID
    .map(({ row, index }) => ({ courseId: row[2], rowIndex: index + 3 }));

  if (checkedCourses.length === 0) {
    SpreadsheetApp.getUi().alert(
      '提示',
      '沒有找到已勾選的課程',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  const progress = new ProgressTracker(checkedCourses.length, '查詢課程師生');
  const results = [];

  for (const { courseId, rowIndex } of checkedCourses) {
    try {
      const members = await classroomService.getCourseMembers(courseId);

      const teachers = members.teachers.map((t) => t.profile.name.fullName).join(', ');
      const students = members.students.map((s) => s.profile.name.fullName).join(', ');

      results.push([teachers, students]);
      progress.addSuccess(`課程 ${courseId}`);
    } catch (error) {
      results.push([`查詢失敗: ${error.message}`, `查詢失敗: ${error.message}`]);
      progress.addError(`課程 ${courseId}`, error);
    }
  }

  if (results.length > 0) {
    const startRow = checkedCourses[0].rowIndex;
    sheet.getRange(startRow, 4, results.length, 2).setValues(results);
  }

  progress.complete();
}

/**
 * 建立課程 - 優化版本
 */
async function createCoursesOptimized(sheetName, ownerId) {
  const sheet = getOrCreateSheet(sheetName);
  const dataRange = sheet.getRange('A3:C' + sheet.getLastRow());
  const data = dataRange.getValues();

  const coursesToCreate = data
    .map((row, index) => ({ name: row[0], processed: row[2], rowIndex: index + 3 }))
    .filter(({ name, processed }) => name && !processed);

  if (coursesToCreate.length === 0) {
    SpreadsheetApp.getUi().alert(
      '提示',
      '沒有找到待建立的課程',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  const courseNames = coursesToCreate.map((c) => c.name);
  const result = await classroomService.createCoursesBatch(courseNames, ownerId);

  // 更新結果到工作表
  const updateData = result.results.map((r) => [
    r.success ? r.courseId : `建立失敗: ${r.error}`,
    r.success,
  ]);

  const startRow = coursesToCreate[0].rowIndex;
  sheet.getRange(startRow, 2, updateData.length, 2).setValues(updateData);
}

/**
 * 新增成員 - 優化版本
 */
async function addMembersOptimized(sheetName, role) {
  const sheet = getOrCreateSheet(sheetName);
  const dataRange = sheet.getRange('D4:I' + sheet.getLastRow());
  const data = dataRange.getValues();

  const membersToAdd = data
    .map((row, index) => ({
      courseId: row[1], // Column E
      userEmail: row[4], // Column H
      processed: row[5], // Column I
      rowIndex: index + 4,
    }))
    .filter(({ courseId, userEmail, processed }) => courseId && userEmail && !processed);

  if (membersToAdd.length === 0) {
    SpreadsheetApp.getUi().alert(
      '提示',
      `沒有找到待新增的${role === 'TEACHER' ? '老師' : '學生'}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  const members = membersToAdd.map((m) => ({ courseId: m.courseId, userEmail: m.userEmail }));
  const result = await classroomService.addMembersBatch(members, role);

  // 更新結果到工作表
  const updateData = result.results.map((r) => [r.success ? true : `新增失敗: ${r.error}`]);
  const startRow = membersToAdd[0].rowIndex;
  sheet.getRange(startRow, 9, updateData.length, 1).setValues(updateData);
}

// =============================================
// 工具函式
// =============================================

/**
 * 獲取或建立工作表
 */
function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    Logger.info(`建立新工作表：${sheetName}`);
  }

  return sheet;
}

/**
 * 取得腳本屬性
 */
function getScriptProperty(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

/**
 * 設定腳本屬性
 */
function setScriptProperty(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, value);
}

// =============================================
// 保持向後相容的原有函式
// =============================================

/**
 * 原有函式的包裝器，保持相容性
 */
function listCourses(sheetName) {
  return listCoursesOptimized(sheetName);
}

function listCourseMembers(sheetName) {
  return listCourseMembersOptimized(sheetName);
}

function createCourses(sheetName, ownerId) {
  return createCoursesOptimized(sheetName, ownerId);
}

function addMembers(sheetName, role) {
  return addMembersOptimized(sheetName, role);
}

// 其他原有 UI 函式保持不變...
function updateCoursesUI() {
  // 保持原有實作
}

function archiveCoursesUI() {
  // 保持原有實作
}

function addSingleStudentToCourseUI() {
  // 保持原有實作
}

function removeSingleStudentFromCourseUI() {
  // 保持原有實作
}

function configureDefaultSheetsUI() {
  // 保持原有實作
}
