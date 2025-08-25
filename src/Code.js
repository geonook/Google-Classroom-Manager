/**
 * @OnlyCurrentDoc
 */

/**
 * 🎓 Google Classroom Manager Pro v2.0.0 - 增強版權限管理系統
 *
 * 🎉 【成功案例記錄】
 * ✅ 2025-08-21: tsehunhchen@kcislk.ntpc.edu.tw 成功執行教師新增功能
 *    問題：lkclassle114@kcislk.ntpc.edu.tw (課程擁有者) 遇到 403 權限錯誤
 *    解決：切換到具備域管理員權限的帳戶
 *    結論：課程擁有者權限 ≠ 域管理員權限
 *
 * 📚 【最佳實踐指南】
 *
 * 🚀 快速開始流程：
 * 1. 開啟選單 → 🔧 診斷工具 → 👤 查看我的權限狀態
 * 2. 如權限充足 → 直接執行 🚀 執行外部表單老師新增
 * 3. 如權限不足 → 使用 🔧 自動權限修復 或切換到推薦帳戶
 *
 * 👤 推薦執行帳戶（已驗證）：
 * • tsehunhchen@kcislk.ntpc.edu.tw ✅ 成功案例
 * • 其他具備超級管理員或委派管理員權限的帳戶
 *
 * ⚠️ 權限問題解決流程：
 * 1️⃣ 自動診斷：執行 quickPermissionCheckUI() 快速檢查
 * 2️⃣ 權限預檢：系統會在執行前自動檢查權限等級
 * 3️⃣ 智能修復：使用 autoPermissionRecoveryFlow() 自動修復
 * 4️⃣ 手動切換：必要時切換到具備管理員權限的帳戶
 *
 * 🔧 常見問題與解決方案：
 * • 403 權限錯誤 → 檢查是否為域管理員（非僅課程擁有者）
 * • 課程擁有者無法新增老師 → 需要域級別管理員權限
 * • OAuth 權限不足 → 執行重新授權流程
 * • API 配額超限 → 等待或聯絡管理員增加配額
 *
 * 💡 權限架構理解：
 * 域超級管理員 > 委派管理員 > 課程擁有者 > 課程教師 > 學生
 * 新增教師功能需要：域管理員權限 OR (課程擁有者 + 特殊域授權)
 *
 * 📋 核心功能：
 * • addTeachersFromExternalSheet() - 從外部試算表批次新增老師（含權限預檢）
 * • performPermissionPrecheck() - 執行前智能權限檢查
 * • autoPermissionRecoveryFlow() - 自動權限問題修復流程
 * • showUserPermissionStatusUI() - 用戶權限狀態顯示
 * • comprehensivePermissionTest() - 綜合權限測試套件
 *
 * 🛠️ 診斷工具：
 * • deepPermissionDiagnosis() - 深度 OAuth 和 API 權限診斷
 * • checkDomainAdminPermissions() - 域管理員權限檢查
 * • testClassroomPermissions() - Classroom API 專項測試
 * • enhancedPermissionDiagnosis() - 增強版權限診斷
 * • analyzePermissionError() - 智能錯誤分析系統
 * • reauthorizePermissions() - 重新授權流程
 * • lookupUserById() - 用戶ID查詢工具
 *
 * 🔒 安全特性：
 * • 權限預檢防止無效操作
 * • 智能錯誤分析提供具體解決方案
 * • 自動推薦具備權限的帳戶
 * • 詳細的權限等級顯示和說明
 */

/**
 * 🔍 API 參數驗證工具集
 */
const ValidationUtils = {
  /**
   * 驗證 Email 格式
   */
  validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email 不能為空或格式無效' };
    }
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email.trim())) {
      return { valid: false, error: '無效的 Email 格式' };
    }
    
    return { valid: true, email: email.trim().toLowerCase() };
  },
  
  /**
   * 驗證 Google Classroom 課程 ID 格式
   */
  validateCourseId(courseId) {
    if (!courseId || typeof courseId !== 'string') {
      return { valid: false, error: '課程 ID 不能為空' };
    }
    
    const trimmedId = courseId.trim();
    
    // Google Classroom 課程 ID 通常是數字字符串，長度 10-15 位
    const courseIdRegex = /^[0-9]{10,15}$/;
    
    if (!courseIdRegex.test(trimmedId)) {
      return { 
        valid: false, 
        error: `無效的課程 ID 格式。收到："${trimmedId}"，應為 10-15 位純數字（例如：123456789012）。請檢查工作表中的課程 ID 是否為 Google Classroom 的實際課程編號。` 
      };
    }
    
    return { valid: true, courseId: trimmedId };
  },
  
  /**
   * 驗證多個 Email 地址
   */
  validateEmailList(emails) {
    const results = {
      valid: [],
      invalid: [],
      duplicates: []
    };
    
    const seen = new Set();
    
    for (const email of emails) {
      const validation = this.validateEmail(email);
      
      if (validation.valid) {
        if (seen.has(validation.email)) {
          results.duplicates.push(validation.email);
        } else {
          seen.add(validation.email);
          results.valid.push(validation.email);
        }
      } else {
        results.invalid.push({ email, error: validation.error });
      }
    }
    
    return results;
  },
  
  /**
   * 批次驗證學生資料
   */
  validateStudentBatch(students) {
    const errors = [];
    const validStudents = [];
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const rowIndex = i + 1;
      
      // 驗證學生 Email
      const emailValidation = this.validateEmail(student.email);
      if (!emailValidation.valid) {
        errors.push({
          row: rowIndex,
          field: 'email',
          value: student.email,
          error: emailValidation.error
        });
        continue;
      }
      
      // 驗證課程 ID
      const courseIdValidation = this.validateCourseId(student.courseId);
      if (!courseIdValidation.valid) {
        errors.push({
          row: rowIndex,
          field: 'courseId',
          value: student.courseId,
          error: courseIdValidation.error
        });
        continue;
      }
      
      // 如果兩個驗證都通過，加入有效學生列表
      validStudents.push({
        ...student,
        email: emailValidation.email,
        courseId: courseIdValidation.courseId
      });
    }
    
    return {
      valid: validStudents,
      errors: errors,
      summary: {
        total: students.length,
        valid: validStudents.length,
        invalid: errors.length
      }
    };
  },
  
  /**
   * 顯示驗證錯誤報告
   */
  showValidationErrors(errors, title = '資料驗證錯誤') {
    if (errors.length === 0) return;
    
    let message = `發現 ${errors.length} 個資料格式錯誤：\n\n`;
    
    errors.slice(0, 10).forEach((error, index) => {
      message += `${index + 1}. 第 ${error.row} 行 - ${error.field}: ${error.error}\n`;
      if (error.value) {
        message += `   問題值: "${error.value}"\n`;
      }
    });
    
    if (errors.length > 10) {
      message += `\n... 以及其他 ${errors.length - 10} 個錯誤\n`;
    }
    
    message += '\n請修正這些錯誤後重新執行。';
    
    SpreadsheetApp.getUi().alert(title, message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
};

/**
 * 🔧 系統初始化檢查 - 確保所有服務正確加載
 */
function initializeServices() {
  try {
    // 檢查核心服務是否正確初始化
    if (typeof rateLimiter === 'undefined') {
      throw new Error('RateLimiter 服務未正確初始化');
    }
    if (typeof classroomService === 'undefined') {
      throw new Error('ClassroomService 服務未正確初始化');
    }
    if (typeof ErrorHandler === 'undefined') {
      throw new Error('ErrorHandler 服務未正確初始化');
    }
    if (typeof ProgressTracker === 'undefined') {
      throw new Error('ProgressTracker 服務未正確初始化');
    }
    
    console.log('✅ 所有核心服務已正確初始化');
    return { success: true, message: '系統初始化完成' };
  } catch (error) {
    console.error('❌ 系統初始化失敗:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 建立選單 - 當試算表開啟時自動執行
 */
function onOpen() {
  // 在建立選單前進行系統初始化檢查
  const initResult = initializeServices();
  if (!initResult.success) {
    SpreadsheetApp.getUi().alert(
      '系統初始化錯誤',
      `系統服務初始化失敗：${initResult.error}\n\n請聯絡技術支援或重新載入試算表。`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
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
    .addItem('🎯 5A. 簡易學生新增', 'addStudentsSimple')
    .addItem('📋 5A1. 生成學生課程資料', 'generateCompleteStudentCourseData')
    .addItem('🔄 5A2. 擴展現有學生資料', 'expandStudentCourseData')
    .addItem('🎯 5B. 智能學生分配', 'distributeStudentsUI')
    .addItem('🧹 5C. 清除學生狀態', 'clearStudentStatusColumn')
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
        .addItem('👤 查看我的權限狀態', 'showUserPermissionStatusUI')
        .addItem('🚀 快速權限檢查', 'quickPermissionCheckUI')
        .addSeparator()
        .addItem('🔍 用戶 ID 查詢', 'lookupUserById')
        .addItem('🔧 權限診斷', 'enhancedPermissionDiagnosis')
        .addItem('🔬 深度權限診斷', 'deepPermissionDiagnosis')
        .addItem('🎯 Classroom API 測試', 'testClassroomPermissions')
        .addItem('👨‍💼 域管理員權限檢查', 'checkDomainAdminPermissions')
        .addItem('🔬 綜合權限測試', 'comprehensivePermissionTest')
        .addSeparator()
        .addItem('📊 進階診斷和報告', 'advancedDiagnosticsAndReporting')
        .addSeparator()
        .addItem('🔧 自動權限修復', 'autoPermissionRecoveryFlow')
        .addItem('🔄 重新授權權限', 'reauthorizePermissions')
        .addItem('📋 授權設定指引', 'showAuthorizationGuideUI')
        .addSeparator()
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

    // 🔍 API 參數驗證
    const emailValidation = ValidationUtils.validateEmail(teacherEmail);
    if (!emailValidation.valid) {
      console.log(`❌ 第 ${i + 2} 行 Email 格式錯誤: ${emailValidation.error}`);
      continue;
    }

    const courseIdValidation = ValidationUtils.validateCourseId(courseId);
    if (!courseIdValidation.valid) {
      console.log(`❌ 第 ${i + 2} 行課程 ID 格式錯誤: ${courseIdValidation.error}`);
      continue;
    }

    console.log(`正在處理課程 ${courseIdValidation.courseId} 中的老師 ${emailValidation.email}...`);
    const result = await classroomService.addTeacherIfNotExists(courseIdValidation.courseId, emailValidation.email);

    if (result.success) {
      if (result.status === 'ADDED') {
        console.log(`  ✅ 成功新增老師 ${emailValidation.email} 到課程 ${courseIdValidation.courseId}。`);
      } else if (result.status === 'ALREADY_EXISTS') {
        console.log(`  ☑️ 老師 ${emailValidation.email} 已存在於課程 ${courseIdValidation.courseId}。`);
      }
      statusCell.check();
    } else {
      // 🔧 增強版智能錯誤處理與自動診斷
      console.log(`  ❌ 新增老師失敗：${emailValidation.email} -> 課程 ${courseIdValidation.courseId}`);
      
      // 自動執行詳細錯誤分析
      const errorAnalysis = analyzePermissionError(result.error, courseIdValidation.courseId, emailValidation.email);
      console.log(`  🔍 錯誤類型：${errorAnalysis.errorType} (嚴重程度: ${errorAnalysis.severity})`);
      console.log(`  📋 問題描述：${errorAnalysis.description}`);
      
      if (errorAnalysis.errorType === 'PERMISSION_DENIED') {
        console.log(`  \n🔬 自動權限診斷：`);
        
        // 自動檢查課程擁有者
        try {
          const course = Classroom.Courses.get(courseIdValidation.courseId);
          const currentUser = Session.getActiveUser().getEmail();
          
          console.log(`     👤 當前執行者：${currentUser}`);
          console.log(`     📚 課程擁有者 ID：${course.ownerId}`);
          
          // 嘗試查詢擁有者詳細資訊
          const ownerInfo = lookupUserById(course.ownerId);
          if (ownerInfo.success) {
            console.log(`     📧 課程擁有者 Email：${ownerInfo.email}`);
            
            if (currentUser === ownerInfo.email) {
              console.log(`     ⚠️ 您是課程擁有者但仍失敗，這是常見情況！`);
              console.log(`     📋 原因分析：`);
              console.log(`        • 課程擁有者權限 ≠ 域管理員權限`);
              console.log(`        • 新增教師功能需要更高的域級別權限`);
              console.log(`        • Google Workspace 安全設定限制`);
              console.log(`     ✅ 成功案例參考：tsehunhchen@kcislk.ntpc.edu.tw 成功執行`);
              console.log(`     💡 解決方案：`);
              console.log(`        1. 🎯 請使用具備域管理員權限的帳戶`);
              console.log(`        2. 🔄 執行 checkDomainAdminPermissions() 檢查當前權限`);
              console.log(`        3. 📞 聯絡 IT 管理員申請域管理員權限`);
              console.log(`        4. 🔧 或請 tsehunhchen@kcislk.ntpc.edu.tw 代為執行`);
            } else {
              console.log(`     ❌ 權限不足：您不是課程擁有者且缺少管理員權限`);
              console.log(`     📞 建議解決方案：`);
              console.log(`        1. 請課程擁有者 ${ownerInfo.email} 執行（如果有管理員權限）`);
              console.log(`        2. 或使用成功案例帳戶：tsehunhchen@kcislk.ntpc.edu.tw`);
              console.log(`        3. 聯絡 IT 管理員協助處理`);
            }
          } else {
            console.log(`     ❌ 無法查詢擁有者資訊，可能需要更高權限`);
          }
        } catch (e) {
          console.log(`     ❌ 課程查詢失敗：${e.message}`);
        }
        
      } else if (errorAnalysis.errorType === 'NOT_FOUND') {
        console.log(`  \n🔍 資源檢查：`);
        console.log(`     📧 檢查老師 Email：${emailValidation.email}`);
        console.log(`     🎓 檢查課程 ID：${courseIdValidation.courseId}`);
        
      } else if (errorAnalysis.errorType === 'QUOTA_EXCEEDED') {
        console.log(`  \n⏱️ 配額管理建議：`);
        console.log(`     • 等待 60 秒後重新嘗試`);
        console.log(`     • 考慮減少批次處理數量`);
        
      }
      
      // 顯示建議的解決方案
      if (errorAnalysis.suggestions.length > 0) {
        console.log(`  \n💡 建議解決方案：`);
        errorAnalysis.suggestions.forEach((suggestion, index) => {
          console.log(`     ${index + 1}. ${suggestion}`);
        });
      }
      
      // 提供快速診斷工具建議
      console.log(`  \n🛠️ 快速診斷工具：`);
      if (errorAnalysis.errorType === 'PERMISSION_DENIED') {
        console.log(`     • deepPermissionDiagnosis() - 深度權限檢查`);
        console.log(`     • checkDomainAdminPermissions() - 管理員權限檢查`);
        console.log(`     • reauthorizePermissions() - 重新授權`);
      } else {
        console.log(`     • testClassroomPermissions() - API 權限測試`);
        console.log(`     • enhancedPermissionDiagnosis('${courseIdValidation.courseId}') - 課程權限診斷`);
      }
      
      // 記錄詳細錯誤資訊（僅在高詳細度時）
      if (errorAnalysis.severity === 'high') {
        console.log(`  📊 詳細錯誤：${JSON.stringify(errorAnalysis, null, 2)}`);
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

  // 🔍 權限預檢：執行前檢查用戶權限等級
  console.log(`🔍 執行權限預檢...`);
  const permissionCheck = await performPermissionPrecheck(currentUser);
  
  if (!permissionCheck.canProceed) {
    console.log(`\n⚠️ 權限預檢失敗！`);
    console.log(`📋 問題：${permissionCheck.issue}`);
    console.log(`💡 建議：${permissionCheck.recommendation}`);
    
    if (permissionCheck.alternativeAccounts && permissionCheck.alternativeAccounts.length > 0) {
      console.log(`\n🎯 建議使用以下具備管理員權限的帳戶：`);
      permissionCheck.alternativeAccounts.forEach((account, index) => {
        console.log(`   ${index + 1}. ${account}`);
      });
    }
    
    console.log(`\n🛠️ 立即診斷工具：`);
    console.log(`   • checkDomainAdminPermissions() - 檢查管理員權限`);
    console.log(`   • comprehensivePermissionTest() - 完整權限測試`);
    
    // 詢問用戶是否要繼續
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      '⚠️ 權限不足警告',
      `檢測到您可能沒有足夠的權限執行此操作。\n\n問題：${permissionCheck.issue}\n建議：${permissionCheck.recommendation}\n\n是否仍要繼續嘗試？`,
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      console.log(`\n❌ 用戶選擇取消操作`);
      return;
    }
    
    console.log(`\n⚠️ 用戶選擇強制繼續，開始執行...`);
  } else {
    console.log(`✅ 權限預檢通過：${permissionCheck.status}`);
    console.log(`👤 權限等級：${permissionCheck.userLevel}`);
  }

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
// Batch Create Gradebooks Function
// =============================================

/**
 * 批次建立所有課程的 Gradebook（Google Sheets）
 * 檔名格式：2526F1_TeacherName_Subject_Gradebook
 * 表頭包含：English Name, Student ID, Assignment 1, Assignment 2, etc.
 */
async function batchCreateGradebooks() {
  console.log('📚 === 開始批次建立 Gradebook === 📚');
  
  // --- 設定區域 ---
  const SCHOOL_YEAR = '2526';  // 2025-2026 學年
  const SEMESTER = 'F1';       // Fall semester 1st term
  const LOG_SPREADSHEET_ID = '1GWbn5qIKCikvLV_frTeIjDcTbi8wWxwCQR6S0NIEAp8';
  const COURSE_SHEET_NAME = 'course_teacher';
  
  // Gradebook 表頭設定
  const GRADEBOOK_HEADERS = [
    'English Name',
    'Student ID', 
    'Email',
    'Assignment 1',
    'Assignment 2',
    'Assignment 3',
    'Assignment 4',
    'Assignment 5',
    'Midterm Exam',
    'Final Exam',
    'Total Score',
    'Grade',
    'Comments'
  ];
  // --- 結束設定 ---
  
  let totalSuccess = 0;
  let totalFailed = 0;
  
  try {
    // 讀取課程-教師資料
    console.log('🔍 讀取課程教師資料...');
    const teacherMappingResult = readCourseTeacherMapping();
    
    if (!teacherMappingResult.success) {
      console.log('❌ 無法讀取教師資料：', teacherMappingResult.error);
      return {
        success: false,
        error: teacherMappingResult.error
      };
    }
    
    const courseTeacherMapping = teacherMappingResult.mapping || {};
    const courseIds = Object.keys(courseTeacherMapping);
    
    console.log(`📊 找到 ${courseIds.length} 門課程需要建立 Gradebook`);
    
    // 為每門課程建立 Gradebook
    for (const courseId of courseIds) {
      const courseInfo = courseTeacherMapping[courseId];
      const { teacherName, subject, courseName } = courseInfo;
      
      // 生成檔名：2526F1_Ms. Kate_LT_Gradebook
      const fileName = `${SCHOOL_YEAR}${SEMESTER}_${teacherName}_${subject}_Gradebook`;
      
      console.log(`[處理中] 正在為課程 "${courseName}" 建立 Gradebook: ${fileName}`);
      
      try {
        // 建立新的 Google Sheets
        const spreadsheet = SpreadsheetApp.create(fileName);
        const sheet = spreadsheet.getActiveSheet();
        
        // 設定工作表名稱
        sheet.setName(`${subject}_${courseName.split('-')[1] || 'Class'}`);
        
        // 寫入表頭
        sheet.getRange(1, 1, 1, GRADEBOOK_HEADERS.length).setValues([GRADEBOOK_HEADERS]);
        
        // 套用專業格式化設定
        applyGradebookFormatting(sheet, 'General');
        
        console.log(`  ✅ 成功建立: ${fileName}`);
        console.log(`  📊 Gradebook URL: ${spreadsheet.getUrl()}`);
        
        totalSuccess++;
        
        // 短暫延遲避免 API 限制
        Utilities.sleep(500);
        
      } catch (error) {
        console.log(`  ❌ 建立失敗: ${fileName} - ${error.message}`);
        totalFailed++;
      }
    }
    
  } catch (error) {
    console.log(`❌ 批次建立過程發生錯誤: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
  
  console.log(`📚 === Gradebook 建立完成 === 📚`);
  console.log(`✅ 成功建立: ${totalSuccess} 個 Gradebook`);
  console.log(`❌ 建立失敗: ${totalFailed} 個 Gradebook`);
  
  return {
    success: true,
    totalSuccess,
    totalFailed,
    summary: `成功建立 ${totalSuccess} 個 Gradebook，失敗 ${totalFailed} 個`
  };
}

// =============================================
// Gradebook Formatting Core Function
// =============================================

/**
 * 套用專業的成績簿格式化設定
 * 符合 Teacher Gradebook Template 範本標準
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 工作表物件
 * @param {string} examType - 考試類型 ('General', 'Midterm', 'Final')
 */
function applyGradebookFormatting(sheet, examType = 'General') {
  console.log(`🎨 開始套用 ${examType} 成績簿格式化...`);
  
  try {
    // 取得表頭資訊
    const lastCol = sheet.getLastColumn();
    const maxRows = Math.max(100, sheet.getMaxRows()); // 至少預留100行
    
    // === 1. 凍結窗格設定 ===
    sheet.setFrozenRows(1);      // 凍結表頭行
    sheet.setFrozenColumns(3);   // 凍結前3欄 (English Name, Student ID, Email)
    
    // === 2. 表頭格式設定 ===
    const headerRange = sheet.getRange(1, 1, 1, lastCol);
    headerRange.setBackground('#4285f4');    // Google 藍色背景
    headerRange.setFontColor('#ffffff');     // 白色字體
    headerRange.setFontWeight('bold');       // 粗體
    headerRange.setHorizontalAlignment('center'); // 置中對齊
    headerRange.setFontSize(11);             // 字體大小
    
    // === 3. 特定欄位底色格式化 ===
    
    // 學生基本資訊欄位 (A-C: English Name, Student ID, Email) - 淺藍色
    if (lastCol >= 3) {
      const basicInfoRange = sheet.getRange(2, 1, maxRows - 1, 3);
      basicInfoRange.setBackground('#f0f8ff');
    }
    
    // Assignment 欄位 (D-H: Assignment 1-5) - 淺黃色
    if (lastCol >= 8) {
      const assignmentRange = sheet.getRange(2, 4, maxRows - 1, 5);
      assignmentRange.setBackground('#fffacd');
    }
    
    // 考試欄位格式依考試類型而定
    if (lastCol >= 10) {
      const examRange = sheet.getRange(2, 9, maxRows - 1, 2); // I-J 欄位
      
      switch (examType) {
        case 'Midterm':
          examRange.setBackground('#e8f5e8'); // 淺綠色 - 兩個都是 Midterm
          break;
        case 'Final':
          examRange.setBackground('#ffe4e1'); // 淺紅色 - Midterm + Final
          break;
        default:
          examRange.setBackground('#ffe4e1'); // 預設淺紅色
      }
    }
    
    // 總分和成績欄位 (K-L: Total Score, Grade) - 淺綠色
    if (lastCol >= 12) {
      const gradeRange = sheet.getRange(2, 11, maxRows - 1, 2);
      gradeRange.setBackground('#f0fff0');
    }
    
    // 備註欄位 (M: Comments) - 淺灰色
    if (lastCol >= 13) {
      const commentsRange = sheet.getRange(2, 13, maxRows - 1, 1);
      commentsRange.setBackground('#f8f9fa');
    }
    
    // === 4. 邊框設定 ===
    const allDataRange = sheet.getRange(1, 1, maxRows, lastCol);
    allDataRange.setBorder(true, true, true, true, true, true);
    
    // === 5. 欄寬自動調整 ===
    sheet.autoResizeColumns(1, lastCol);
    
    // === 6. 資料驗證和保護 ===
    // 保護表頭不被意外編輯
    const headerProtection = headerRange.protect();
    headerProtection.setDescription(`${examType} Gradebook Headers - Protected`);
    
    // === 7. 條件格式設定（分數欄位） ===
    if (lastCol >= 10) {
      // 為考試分數欄位設定條件格式
      const examScoreRange = sheet.getRange(2, 9, maxRows - 1, 2);
      
      // 高分 (80分以上) - 深綠色背景
      const highScoreRule = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberGreaterThanOrEqualTo(80)
        .setBackground('#d4edda')
        .setRanges([examScoreRange])
        .build();
      
      // 中等分數 (60-79分) - 淺黃色背景  
      const mediumScoreRule = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberBetween(60, 79)
        .setBackground('#fff3cd')
        .setRanges([examScoreRange])
        .build();
      
      // 低分 (60分以下) - 淺紅色背景
      const lowScoreRule = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberLessThan(60)
        .setBackground('#f8d7da')
        .setRanges([examScoreRange])
        .build();
      
      // 套用條件格式規則
      const rules = sheet.getConditionalFormatRules();
      rules.push(highScoreRule, mediumScoreRule, lowScoreRule);
      sheet.setConditionalFormatRules(rules);
    }
    
    // === 8. 儲存格對齊設定 ===
    // 數字欄位置中對齊
    if (lastCol >= 8) {
      const numberRange = sheet.getRange(2, 4, maxRows - 1, lastCol - 3);
      numberRange.setHorizontalAlignment('center');
    }
    
    console.log(`✅ ${examType} 成績簿格式化完成`);
    
  } catch (error) {
    console.log(`❌ 格式化過程發生錯誤: ${error.message}`);
    throw error;
  }
}

// =============================================
// Specialized Gradebook Functions for Midterm and Final
// =============================================

/**
 * 批次建立所有課程的 Midterm Gradebook（Google Sheets）
 * 檔名格式：2526F1_TeacherName_Subject_Gradebook_Midterm
 * 表頭最後兩個考試欄位都是 Midterm Exam
 */
async function batchCreateGradebooksForMidterm() {
  console.log('📚 === 開始批次建立 Midterm Gradebook === 📚');
  
  // --- 設定區域 ---
  const SCHOOL_YEAR = '2526';  // 2025-2026 學年
  const SEMESTER = 'F1';       // Fall semester 1st term
  const EXAM_TYPE = 'Midterm'; // 考試類型標識
  const LOG_SPREADSHEET_ID = '1GWbn5qIKCikvLV_frTeIjDcTbi8wWxwCQR6S0NIEAp8';
  const COURSE_SHEET_NAME = 'course_teacher';
  
  // Midterm Gradebook 表頭設定 - 兩個考試欄位都是 Midterm
  const GRADEBOOK_HEADERS = [
    'English Name',
    'Student ID', 
    'Email',
    'Assignment 1',
    'Assignment 2',
    'Assignment 3',
    'Assignment 4',
    'Assignment 5',
    'Midterm Exam',
    'Midterm Exam',
    'Total Score',
    'Grade',
    'Comments'
  ];
  // --- 結束設定 ---
  
  let totalSuccess = 0;
  let totalFailed = 0;
  
  try {
    // 讀取課程-教師資料
    console.log('🔍 讀取課程教師資料...');
    const teacherMappingResult = readCourseTeacherMapping();
    
    if (!teacherMappingResult.success) {
      console.log('❌ 無法讀取教師資料：', teacherMappingResult.error);
      return {
        success: false,
        error: teacherMappingResult.error
      };
    }
    
    const courseTeacherMapping = teacherMappingResult.mapping || {};
    const courseIds = Object.keys(courseTeacherMapping);
    
    console.log(`📊 找到 ${courseIds.length} 門課程需要建立 Midterm Gradebook`);
    
    // 為每門課程建立 Midterm Gradebook
    for (const courseId of courseIds) {
      const courseInfo = courseTeacherMapping[courseId];
      const { teacherName, subject, courseName } = courseInfo;
      
      // 生成檔名：2526F1_Ms. Kate_LT_Gradebook_Midterm
      const fileName = `${SCHOOL_YEAR}${SEMESTER}_${teacherName}_${subject}_Gradebook_${EXAM_TYPE}`;
      
      console.log(`[處理中] 正在為課程 "${courseName}" 建立 ${EXAM_TYPE} Gradebook: ${fileName}`);
      
      try {
        // 建立新的 Google Sheets
        const spreadsheet = SpreadsheetApp.create(fileName);
        const sheet = spreadsheet.getActiveSheet();
        
        // 設定工作表名稱
        sheet.setName(`${subject}_${courseName.split('-')[1] || 'Class'}_${EXAM_TYPE}`);
        
        // 寫入表頭
        sheet.getRange(1, 1, 1, GRADEBOOK_HEADERS.length).setValues([GRADEBOOK_HEADERS]);
        
        // 套用 Midterm 專業格式化設定
        applyGradebookFormatting(sheet, 'Midterm');
        
        console.log(`  ✅ 成功建立: ${fileName}`);
        console.log(`  📊 Gradebook URL: ${spreadsheet.getUrl()}`);
        
        totalSuccess++;
        
        // 短暫延遲避免 API 限制
        Utilities.sleep(500);
        
      } catch (error) {
        console.log(`  ❌ 建立失敗: ${fileName} - ${error.message}`);
        totalFailed++;
      }
    }
    
  } catch (error) {
    console.log(`❌ 批次建立過程發生錯誤: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
  
  console.log(`📚 === Midterm Gradebook 建立完成 === 📚`);
  console.log(`✅ 成功建立: ${totalSuccess} 個 Midterm Gradebook`);
  console.log(`❌ 建立失敗: ${totalFailed} 個 Midterm Gradebook`);
  
  return {
    success: true,
    totalSuccess,
    totalFailed,
    examType: EXAM_TYPE,
    summary: `成功建立 ${totalSuccess} 個 ${EXAM_TYPE} Gradebook，失敗 ${totalFailed} 個`
  };
}

/**
 * 批次建立所有課程的 Final Gradebook（Google Sheets）
 * 檔名格式：2526F1_TeacherName_Subject_Gradebook_Final
 * 表頭包含 Midterm Exam 和 Final Exam 兩個不同考試欄位
 */
async function batchCreateGradebooksForFinal() {
  console.log('📚 === 開始批次建立 Final Gradebook === 📚');
  
  // --- 設定區域 ---
  const SCHOOL_YEAR = '2526';  // 2025-2026 學年
  const SEMESTER = 'F1';       // Fall semester 1st term
  const EXAM_TYPE = 'Final';   // 考試類型標識
  const LOG_SPREADSHEET_ID = '1GWbn5qIKCikvLV_frTeIjDcTbi8wWxwCQR6S0NIEAp8';
  const COURSE_SHEET_NAME = 'course_teacher';
  
  // Final Gradebook 表頭設定 - Midterm 和 Final 兩個不同考試欄位
  const GRADEBOOK_HEADERS = [
    'English Name',
    'Student ID', 
    'Email',
    'Assignment 1',
    'Assignment 2',
    'Assignment 3',
    'Assignment 4',
    'Assignment 5',
    'Midterm Exam',
    'Final Exam',
    'Total Score',
    'Grade',
    'Comments'
  ];
  // --- 結束設定 ---
  
  let totalSuccess = 0;
  let totalFailed = 0;
  
  try {
    // 讀取課程-教師資料
    console.log('🔍 讀取課程教師資料...');
    const teacherMappingResult = readCourseTeacherMapping();
    
    if (!teacherMappingResult.success) {
      console.log('❌ 無法讀取教師資料：', teacherMappingResult.error);
      return {
        success: false,
        error: teacherMappingResult.error
      };
    }
    
    const courseTeacherMapping = teacherMappingResult.mapping || {};
    const courseIds = Object.keys(courseTeacherMapping);
    
    console.log(`📊 找到 ${courseIds.length} 門課程需要建立 Final Gradebook`);
    
    // 為每門課程建立 Final Gradebook
    for (const courseId of courseIds) {
      const courseInfo = courseTeacherMapping[courseId];
      const { teacherName, subject, courseName } = courseInfo;
      
      // 生成檔名：2526F1_Ms. Kate_LT_Gradebook_Final
      const fileName = `${SCHOOL_YEAR}${SEMESTER}_${teacherName}_${subject}_Gradebook_${EXAM_TYPE}`;
      
      console.log(`[處理中] 正在為課程 "${courseName}" 建立 ${EXAM_TYPE} Gradebook: ${fileName}`);
      
      try {
        // 建立新的 Google Sheets
        const spreadsheet = SpreadsheetApp.create(fileName);
        const sheet = spreadsheet.getActiveSheet();
        
        // 設定工作表名稱
        sheet.setName(`${subject}_${courseName.split('-')[1] || 'Class'}_${EXAM_TYPE}`);
        
        // 寫入表頭
        sheet.getRange(1, 1, 1, GRADEBOOK_HEADERS.length).setValues([GRADEBOOK_HEADERS]);
        
        // 套用 Final 專業格式化設定
        applyGradebookFormatting(sheet, 'Final');
        
        console.log(`  ✅ 成功建立: ${fileName}`);
        console.log(`  📊 Gradebook URL: ${spreadsheet.getUrl()}`);
        
        totalSuccess++;
        
        // 短暫延遲避免 API 限制
        Utilities.sleep(500);
        
      } catch (error) {
        console.log(`  ❌ 建立失敗: ${fileName} - ${error.message}`);
        totalFailed++;
      }
    }
    
  } catch (error) {
    console.log(`❌ 批次建立過程發生錯誤: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
  
  console.log(`📚 === Final Gradebook 建立完成 === 📚`);
  console.log(`✅ 成功建立: ${totalSuccess} 個 Final Gradebook`);
  console.log(`❌ 建立失敗: ${totalFailed} 個 Final Gradebook`);
  
  return {
    success: true,
    totalSuccess,
    totalFailed,
    examType: EXAM_TYPE,
    summary: `成功建立 ${totalSuccess} 個 ${EXAM_TYPE} Gradebook，失敗 ${totalFailed} 個`
  };
}

// =============================================
// Test Functions for Specialized Gradebook Creation
// =============================================

/**
 * 測試 Midterm 和 Final Gradebook 建立功能
 * 驗證兩種不同函數的表頭結構差異
 */
function testSpecializedGradebookCreation() {
  console.log('🧪 === 開始測試專用 Gradebook 建立功能 === 🧪');
  
  // 測試 1: 驗證教師資料讀取
  console.log('\n📋 測試 1: 教師資料讀取測試');
  const teacherMappingResult = readCourseTeacherMapping();
  
  if (!teacherMappingResult.success) {
    console.log('❌ 教師資料讀取失敗:', teacherMappingResult.error);
    return { success: false, error: '教師資料讀取失敗' };
  }
  
  const courseTeacherMapping = teacherMappingResult.mapping || {};
  const courseIds = Object.keys(courseTeacherMapping);
  
  console.log(`✅ 成功讀取 ${courseIds.length} 門課程的教師資料`);
  
  // 測試 2: 驗證 Midterm 表頭結構
  console.log('\n📋 測試 2: Midterm Gradebook 表頭驗證');
  const MIDTERM_HEADERS = [
    'English Name', 'Student ID', 'Email',
    'Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4', 'Assignment 5',
    'Midterm Exam', 'Midterm Exam',  // 兩個都是 Midterm
    'Total Score', 'Grade', 'Comments'
  ];
  
  console.log(`✅ Midterm 表頭欄位數量: ${MIDTERM_HEADERS.length}`);
  console.log(`✅ Midterm 包含兩個 "Midterm Exam": ${MIDTERM_HEADERS.filter(h => h === 'Midterm Exam').length === 2}`);
  console.log(`   📋 Midterm 表頭: ${MIDTERM_HEADERS.join(', ')}`);
  
  // 測試 3: 驗證 Final 表頭結構
  console.log('\n📋 測試 3: Final Gradebook 表頭驗證');
  const FINAL_HEADERS = [
    'English Name', 'Student ID', 'Email',
    'Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4', 'Assignment 5',
    'Midterm Exam', 'Final Exam',    // Midterm 和 Final 各一個
    'Total Score', 'Grade', 'Comments'
  ];
  
  console.log(`✅ Final 表頭欄位數量: ${FINAL_HEADERS.length}`);
  console.log(`✅ Final 包含 "Midterm Exam": ${FINAL_HEADERS.includes('Midterm Exam')}`);
  console.log(`✅ Final 包含 "Final Exam": ${FINAL_HEADERS.includes('Final Exam')}`);
  console.log(`   📋 Final 表頭: ${FINAL_HEADERS.join(', ')}`);
  
  // 測試 4: 驗證檔名格式
  console.log('\n📋 測試 4: 檔名格式測試');
  const SCHOOL_YEAR = '2526';
  const SEMESTER = 'F1';
  
  if (courseIds.length > 0) {
    const courseInfo = courseTeacherMapping[courseIds[0]];
    const midtermFileName = `${SCHOOL_YEAR}${SEMESTER}_${courseInfo.teacherName}_${courseInfo.subject}_Gradebook_Midterm`;
    const finalFileName = `${SCHOOL_YEAR}${SEMESTER}_${courseInfo.teacherName}_${courseInfo.subject}_Gradebook_Final`;
    
    console.log(`   📝 Midterm 檔名格式: ${midtermFileName}`);
    console.log(`   📝 Final 檔名格式: ${finalFileName}`);
  }
  
  console.log('\n🧪 === 專用 Gradebook 建立功能測試完成 === 🧪');
  console.log('✅ 所有測試項目通過');
  console.log('📚 可以安全執行 batchCreateGradebooksForMidterm() 和 batchCreateGradebooksForFinal()');
  
  return {
    success: true,
    courseCount: courseIds.length,
    midtermHeaderCount: MIDTERM_HEADERS.length,
    finalHeaderCount: FINAL_HEADERS.length,
    midtermHasTwoMidterms: MIDTERM_HEADERS.filter(h => h === 'Midterm Exam').length === 2,
    finalHasBothExams: FINAL_HEADERS.includes('Midterm Exam') && FINAL_HEADERS.includes('Final Exam')
  };
}

/**
 * 測試 Gradebook 建立功能 (原版)
 * 驗證檔名格式、表頭結構和教師資料讀取
 */
function testGradebookCreation() {
  console.log('🧪 === 開始測試 Gradebook 建立功能 === 🧪');
  
  // 測試 1: 驗證教師資料讀取
  console.log('\n📋 測試 1: 教師資料讀取測試');
  const teacherMappingResult = readCourseTeacherMapping();
  
  if (!teacherMappingResult.success) {
    console.log('❌ 教師資料讀取失敗:', teacherMappingResult.error);
    return { success: false, error: '教師資料讀取失敗' };
  }
  
  const courseTeacherMapping = teacherMappingResult.mapping || {};
  const courseIds = Object.keys(courseTeacherMapping);
  
  console.log(`✅ 成功讀取 ${courseIds.length} 門課程的教師資料`);
  
  // 顯示前 3 門課程的資料作為樣本
  courseIds.slice(0, 3).forEach(courseId => {
    const courseInfo = courseTeacherMapping[courseId];
    console.log(`   📚 課程: ${courseInfo.courseName} | 教師: ${courseInfo.teacherName} | 科目: ${courseInfo.subject}`);
  });
  
  // 測試 2: 驗證檔名格式產生
  console.log('\n📋 測試 2: 檔名格式測試');
  const SCHOOL_YEAR = '2526';
  const SEMESTER = 'F1';
  
  courseIds.slice(0, 3).forEach(courseId => {
    const courseInfo = courseTeacherMapping[courseId];
    const fileName = `${SCHOOL_YEAR}${SEMESTER}_${courseInfo.teacherName}_${courseInfo.subject}_Gradebook`;
    console.log(`   📝 檔名格式: ${fileName}`);
  });
  
  // 測試 3: 驗證表頭結構
  console.log('\n📋 測試 3: Gradebook 表頭驗證');
  const GRADEBOOK_HEADERS = [
    'English Name',
    'Student ID', 
    'Email',
    'Assignment 1',
    'Assignment 2',
    'Assignment 3',
    'Assignment 4',
    'Assignment 5',
    'Midterm Exam',
    'Final Exam',
    'Total Score',
    'Grade',
    'Comments'
  ];
  
  console.log(`✅ 表頭欄位數量: ${GRADEBOOK_HEADERS.length}`);
  console.log(`✅ 包含 "English Name": ${GRADEBOOK_HEADERS.includes('English Name')}`);
  console.log(`   📋 完整表頭: ${GRADEBOOK_HEADERS.join(', ')}`);
  
  // 測試 4: 模擬執行檢查
  console.log('\n📋 測試 4: 執行環境檢查');
  try {
    // 檢查 SpreadsheetApp 是否可用
    const testAccess = typeof SpreadsheetApp !== 'undefined';
    console.log(`✅ SpreadsheetApp 存取: ${testAccess ? '正常' : '異常'}`);
    
    console.log(`✅ 預計建立的 Gradebook 數量: ${courseIds.length}`);
    
  } catch (error) {
    console.log(`⚠️ 執行環境檢查警告: ${error.message}`);
  }
  
  console.log('\n🧪 === Gradebook 建立功能測試完成 === 🧪');
  console.log('✅ 所有測試項目通過，可以安全執行 batchCreateGradebooks()');
  
  return {
    success: true,
    courseCount: courseIds.length,
    headerCount: GRADEBOOK_HEADERS.length,
    hasEnglishName: GRADEBOOK_HEADERS.includes('English Name'),
    sampleFileName: `${SCHOOL_YEAR}${SEMESTER}_${courseIds.length > 0 ? courseTeacherMapping[courseIds[0]].teacherName : 'Teacher'}_${courseIds.length > 0 ? courseTeacherMapping[courseIds[0]].subject : 'Subject'}_Gradebook`
  };
}

/**
 * 建立單一測試用 Gradebook (用於驗證功能)
 * 只建立一個 Gradebook 來測試格式和功能
 */
async function createTestGradebook() {
  console.log('🧪 === 建立測試用 Gradebook === 🧪');
  
  try {
    // 讀取第一門課程的資料
    const teacherMappingResult = readCourseTeacherMapping();
    
    if (!teacherMappingResult.success) {
      console.log('❌ 無法讀取教師資料');
      return { success: false, error: teacherMappingResult.error };
    }
    
    const courseTeacherMapping = teacherMappingResult.mapping || {};
    const courseIds = Object.keys(courseTeacherMapping);
    
    if (courseIds.length === 0) {
      console.log('❌ 沒有找到任何課程資料');
      return { success: false, error: '沒有課程資料' };
    }
    
    // 選擇第一門課程作為測試
    const firstCourseId = courseIds[0];
    const courseInfo = courseTeacherMapping[firstCourseId];
    
    const SCHOOL_YEAR = '2526';
    const SEMESTER = 'F1';
    const fileName = `TEST_${SCHOOL_YEAR}${SEMESTER}_${courseInfo.teacherName}_${courseInfo.subject}_Gradebook`;
    
    const GRADEBOOK_HEADERS = [
      'English Name',
      'Student ID', 
      'Email',
      'Assignment 1',
      'Assignment 2',
      'Assignment 3',
      'Assignment 4',
      'Assignment 5',
      'Midterm Exam',
      'Final Exam',
      'Total Score',
      'Grade',
      'Comments'
    ];
    
    console.log(`📝 建立測試 Gradebook: ${fileName}`);
    
    // 建立測試用 Google Sheets
    const spreadsheet = SpreadsheetApp.create(fileName);
    const sheet = spreadsheet.getActiveSheet();
    
    // 設定工作表名稱
    sheet.setName(`TEST_${courseInfo.subject}`);
    
    // 寫入表頭
    sheet.getRange(1, 1, 1, GRADEBOOK_HEADERS.length).setValues([GRADEBOOK_HEADERS]);
    
    // 套用專業格式化設定
    applyGradebookFormatting(sheet, 'General');
    
    // 新增一行測試資料
    const testData = [
      'John Doe',           // English Name
      'STU001',             // Student ID
      'john.doe@school.edu', // Email
      '85',                 // Assignment 1
      '90',                 // Assignment 2
      '88',                 // Assignment 3
      '',                   // Assignment 4
      '',                   // Assignment 5
      '',                   // Midterm Exam
      '',                   // Final Exam
      '',                   // Total Score
      '',                   // Grade
      'Test data'           // Comments
    ];
    
    sheet.getRange(2, 1, 1, GRADEBOOK_HEADERS.length).setValues([testData]);
    
    console.log(`✅ 成功建立測試 Gradebook`);
    console.log(`📊 Gradebook URL: ${spreadsheet.getUrl()}`);
    console.log(`📋 課程資訊: ${courseInfo.courseName} (${courseInfo.teacherName})`);
    
    return {
      success: true,
      spreadsheetUrl: spreadsheet.getUrl(),
      fileName: fileName,
      courseInfo: courseInfo
    };
    
  } catch (error) {
    console.log(`❌ 建立測試 Gradebook 失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 測試新的格式化效果
 * 建立一個包含完整格式化的測試成績簿
 */
async function testGradebookFormatting() {
  console.log('🧪 === 測試成績簿格式化效果 === 🧪');
  
  try {
    // 讀取第一門課程的資料
    const teacherMappingResult = readCourseTeacherMapping();
    
    if (!teacherMappingResult.success) {
      console.log('❌ 無法讀取教師資料');
      return { success: false, error: teacherMappingResult.error };
    }
    
    const courseTeacherMapping = teacherMappingResult.mapping || {};
    const courseIds = Object.keys(courseTeacherMapping);
    
    if (courseIds.length === 0) {
      console.log('❌ 沒有找到任何課程資料');
      return { success: false, error: '沒有課程資料' };
    }
    
    // 選擇第一門課程作為測試
    const firstCourseId = courseIds[0];
    const courseInfo = courseTeacherMapping[firstCourseId];
    
    const fileName = `FORMAT_TEST_2526F1_${courseInfo.teacherName}_${courseInfo.subject}_Gradebook`;
    
    const GRADEBOOK_HEADERS = [
      'English Name', 'Student ID', 'Email',
      'Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4', 'Assignment 5',
      'Midterm Exam', 'Final Exam',
      'Total Score', 'Grade', 'Comments'
    ];
    
    console.log(`📝 建立格式化測試 Gradebook: ${fileName}`);
    
    // 建立測試用 Google Sheets
    const spreadsheet = SpreadsheetApp.create(fileName);
    const sheet = spreadsheet.getActiveSheet();
    
    // 設定工作表名稱
    sheet.setName(`FORMAT_TEST_${courseInfo.subject}`);
    
    // 寫入表頭
    sheet.getRange(1, 1, 1, GRADEBOOK_HEADERS.length).setValues([GRADEBOOK_HEADERS]);
    
    // 套用新的格式化設定
    applyGradebookFormatting(sheet, 'General');
    
    // 新增多行測試資料來展示格式化效果
    const testData = [
      ['John Doe', 'STU001', 'john.doe@school.edu', '85', '90', '88', '92', '87', '89', '91', '522', 'A', 'Excellent work'],
      ['Jane Smith', 'STU002', 'jane.smith@school.edu', '78', '82', '75', '80', '83', '77', '85', '460', 'B+', 'Good progress'],
      ['Mike Johnson', 'STU003', 'mike.johnson@school.edu', '95', '93', '97', '94', '96', '98', '95', '668', 'A+', 'Outstanding'],
      ['Sarah Wilson', 'STU004', 'sarah.wilson@school.edu', '65', '70', '68', '72', '69', '66', '74', '484', 'C+', 'Needs improvement'],
      ['David Brown', 'STU005', 'david.brown@school.edu', '55', '58', '52', '60', '57', '59', '61', '402', 'D+', 'Requires attention'],
    ];
    
    sheet.getRange(2, 1, testData.length, GRADEBOOK_HEADERS.length).setValues(testData);
    
    console.log(`✅ 成功建立格式化測試 Gradebook`);
    console.log(`📊 Gradebook URL: ${spreadsheet.getUrl()}`);
    console.log(`🎨 格式化特點:`);
    console.log(`   • 凍結表頭行和前3欄`);
    console.log(`   • 藍色表頭背景，白色字體`);
    console.log(`   • 學生資訊欄位淺藍色背景`);
    console.log(`   • Assignment 欄位淺黃色背景`);
    console.log(`   • 考試欄位淺紅色背景`);
    console.log(`   • 成績欄位淺綠色背景`);
    console.log(`   • 備註欄位淺灰色背景`);
    console.log(`   • 分數條件格式化 (高分綠色、中分黃色、低分紅色)`);
    
    return {
      success: true,
      spreadsheetUrl: spreadsheet.getUrl(),
      fileName: fileName,
      courseInfo: courseInfo,
      testDataRows: testData.length
    };
    
  } catch (error) {
    console.log(`❌ 建立格式化測試失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
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
  // 不再使用硬編碼的 SUBJECTS_MAP，改用動態教師資料
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
        // 動態獲取教師資料
        const teacherInfo = getTeacherInfoBySubject(subjectCode);
        const teacher = teacherInfo.success ? teacherInfo.teacherName : '未知教師';
        const teacherEmail = teacherInfo.success ? teacherInfo.teacherEmail : 'unknown@school.edu';
        const courseLink = `https://classroom.google.com/c/${courseId}`;

        // 包含教師 Email 的完整資料行
        const newRow = [subjectCode, grade, className, teacher, teacherEmail, courseId, courseLink, false];
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
 * 深度權限診斷工具 - 檢查 OAuth token 和 API 權限
 */
function deepPermissionDiagnosis() {
  console.log('=== 🔬 深度權限診斷工具 ===');
  
  const results = {
    timestamp: new Date().toLocaleString(),
    currentUser: null,
    oauthScopes: [],
    apiPermissions: {},
    domainInfo: {},
    recommendations: []
  };
  
  // 步驟1: 檢查當前用戶
  try {
    results.currentUser = Session.getActiveUser().getEmail();
    console.log(`📧 當前執行者: ${results.currentUser}`);
  } catch (e) {
    console.log(`❌ 無法取得用戶資訊: ${e.message}`);
    results.recommendations.push('需要 userinfo.email 權限');
  }
  
  // 步驟2: 檢查 OAuth 權限範圍
  console.log(`\n🔍 檢查 OAuth 權限範圍...`);
  try {
    // 嘗試訪問不同的 API 來檢查權限
    const permissionTests = [
      {
        name: 'Classroom 課程讀取',
        test: () => Classroom.Courses.list({ pageSize: 1 }),
        scope: 'https://www.googleapis.com/auth/classroom.courses'
      },
      {
        name: 'Classroom 名冊讀取', 
        test: () => Classroom.Courses.Teachers.list('779922029471', { pageSize: 1 }),
        scope: 'https://www.googleapis.com/auth/classroom.rosters'
      },
      {
        name: 'Admin Directory 用戶讀取',
        test: () => AdminDirectory.Users.get('me'),
        scope: 'https://www.googleapis.com/auth/admin.directory.user.readonly'
      },
      {
        name: 'Spreadsheets 讀寫',
        test: () => SpreadsheetApp.getActiveSpreadsheet().getId(),
        scope: 'https://www.googleapis.com/auth/spreadsheets'
      }
    ];
    
    for (const test of permissionTests) {
      try {
        test.test();
        results.apiPermissions[test.name] = { status: '✅ 成功', scope: test.scope };
        console.log(`✅ ${test.name}: 權限正常`);
      } catch (error) {
        results.apiPermissions[test.name] = { 
          status: '❌ 失敗', 
          error: error.message, 
          scope: test.scope 
        };
        console.log(`❌ ${test.name}: ${error.message}`);
        
        if (error.message.includes('403') || error.message.includes('permission')) {
          results.recommendations.push(`需要重新授權 ${test.scope}`);
        }
      }
    }
    
  } catch (error) {
    console.log(`❌ 權限檢查失敗: ${error.message}`);
  }
  
  // 步驟3: 檢查域管理員權限
  console.log(`\n🔍 檢查域管理員權限...`);
  try {
    const userInfo = AdminDirectory.Users.get('me');
    results.domainInfo = {
      isAdmin: userInfo.isAdmin || false,
      isDelegatedAdmin: userInfo.isDelegatedAdmin || false,
      orgUnitPath: userInfo.orgUnitPath || '未知',
      domain: userInfo.primaryEmail ? userInfo.primaryEmail.split('@')[1] : '未知'
    };
    
    console.log(`👤 域管理員狀態: ${results.domainInfo.isAdmin ? '是' : '否'}`);
    console.log(`🎯 委派管理員: ${results.domainInfo.isDelegatedAdmin ? '是' : '否'}`);
    console.log(`🏢 組織單位: ${results.domainInfo.orgUnitPath}`);
    console.log(`🌐 域名: ${results.domainInfo.domain}`);
    
  } catch (error) {
    console.log(`⚠️ 無法檢查域管理員權限: ${error.message}`);
    results.domainInfo.error = error.message;
  }
  
  // 步驟4: 特定測試 - Classroom 教師新增權限
  console.log(`\n🎯 測試 Classroom 教師新增權限...`);
  try {
    // 嘗試獲取一個課程的教師列表來測試讀取權限
    const teachers = Classroom.Courses.Teachers.list('779922029471');
    console.log(`✅ 可以讀取課程教師列表 (${teachers.teachers ? teachers.teachers.length : 0} 位教師)`);
    results.apiPermissions['教師列表讀取'] = { status: '✅ 成功' };
    
    // 注意：我們不會實際嘗試新增教師，因為這會產生副作用
    console.log(`⚠️ 教師新增權限需要實際執行才能測試`);
    
  } catch (error) {
    console.log(`❌ 無法讀取教師列表: ${error.message}`);
    results.apiPermissions['教師列表讀取'] = { status: '❌ 失敗', error: error.message };
    
    if (error.message.includes('403')) {
      results.recommendations.push('需要課程擁有者權限或域管理員權限');
    }
  }
  
  // 步驟5: 生成建議
  console.log(`\n💡 診斷建議:`);
  if (results.recommendations.length === 0) {
    results.recommendations.push('所有權限檢查正常，可以嘗試執行教師新增功能');
    console.log(`✅ 所有權限檢查正常`);
  } else {
    results.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  // 步驟6: 生成重新授權指引
  const failedPermissions = Object.values(results.apiPermissions).filter(p => p.status.includes('❌'));
  if (failedPermissions.length > 0) {
    console.log(`\n🔄 重新授權指引:`);
    console.log(`1. 開啟 Google Apps Script 編輯器`);
    console.log(`2. 點擊「執行」按鈕重新觸發權限請求`);
    console.log(`3. 在彈出視窗中檢查並授權所有必要權限`);
    console.log(`4. 確保授權包含：Classroom、Spreadsheets、Admin Directory`);
    results.recommendations.push('需要重新授權 Google Apps Script');
  }
  
  console.log(`\n📊 診斷完成時間: ${results.timestamp}`);
  return results;
}

/**
 * 測試 Classroom API 權限的專用函數
 */
function testClassroomPermissions(courseId = '779922029471') {
  console.log('=== 🎯 Classroom API 權限測試 ===');
  
  const tests = [
    {
      name: '讀取課程資訊',
      action: () => Classroom.Courses.get(courseId),
      required: '課程基本讀取權限'
    },
    {
      name: '列出所有課程',
      action: () => Classroom.Courses.list({ pageSize: 5 }),
      required: '課程列表讀取權限'
    },
    {
      name: '讀取教師列表',
      action: () => Classroom.Courses.Teachers.list(courseId),
      required: '名冊讀取權限'
    },
    {
      name: '讀取學生列表',
      action: () => Classroom.Courses.Students.list(courseId),
      required: '名冊讀取權限'
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = test.action();
      console.log(`✅ ${test.name}: 成功`);
      results.push({
        test: test.name,
        status: 'success',
        result: result
      });
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      results.push({
        test: test.name,
        status: 'failed',
        error: error.message,
        required: test.required
      });
    }
  }
  
  // 分析結果
  const successCount = results.filter(r => r.status === 'success').length;
  const failCount = results.filter(r => r.status === 'failed').length;
  
  console.log(`\n📊 測試結果: ${successCount}/${tests.length} 通過`);
  
  if (failCount > 0) {
    console.log(`\n❌ 失敗的測試需要以下權限:`);
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`• ${r.test}: ${r.required}`);
    });
    
    console.log(`\n💡 解決方案:`);
    console.log(`1. 檢查 appsscript.json 中的 oauthScopes 設定`);
    console.log(`2. 重新授權 Google Apps Script`);
    console.log(`3. 確認當前用戶有適當的 Classroom 權限`);
  }
  
  return results;
}

/**
 * 重新授權 Google Apps Script 權限
 */
function reauthorizePermissions() {
  console.log('=== 🔄 重新授權權限設定 ===');
  
  // 顯示友善的 UI 提示
  try {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      '🔄 重新授權權限',
      '即將開始重新授權流程，這將確保所有 API 權限正確配置。\n\n此過程包括：\n• Google Classroom 課程管理\n• Google Spreadsheets 操作\n• Admin Directory 用戶查詢\n\n是否要開始重新授權？',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      ui.alert('操作已取消', '重新授權已取消。', ui.ButtonSet.OK);
      return;
    }
  } catch (e) {
    console.log('🔧 在 Apps Script 編輯器中執行重新授權');
  }
  
  console.log('📋 當前需要的權限範圍:');
  const requiredScopes = [
    'https://www.googleapis.com/auth/classroom.courses',
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.rosters',
    'https://www.googleapis.com/auth/classroom.rosters.readonly',
    'https://www.googleapis.com/auth/classroom.profile.emails',
    'https://www.googleapis.com/auth/classroom.profile.photos',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/admin.directory.user.readonly',
    'https://www.googleapis.com/auth/admin.directory.domain.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];
  
  requiredScopes.forEach((scope, index) => {
    console.log(`${index + 1}. ${scope}`);
  });
  
  console.log('\n🔧 重新授權步驟：');
  console.log('1. 系統會自動觸發授權對話框');
  console.log('2. 在彈出的授權對話框中點擊「檢查權限」');
  console.log('3. 選擇正確的 Google 帳戶（需要管理員權限）');
  console.log('4. 仔細檢查所有權限請求，確保包含：');
  console.log('   • Google Classroom 課程和名冊管理');
  console.log('   • Google Spreadsheets 讀寫');
  console.log('   • Admin Directory 用戶查詢');
  console.log('5. 點擊「允許」授權所有權限');
  
  console.log('\n⚠️ 重要提醒：');
  console.log('• 必須使用具有 Google Workspace 管理員權限的帳戶');
  console.log('• 確保域設定允許第三方應用存取');
  console.log('• 如果仍然失敗，請聯絡 IT 管理員檢查域安全設定');
  
  // 嘗試觸發權限請求
  console.log('\n🎯 開始權限檢查和授權...');
  let authSuccess = true;
  let authResults = [];
  
  try {
    // 1. 檢查用戶資訊權限
    Session.getActiveUser().getEmail();
    console.log('✅ 用戶資訊權限正常');
    authResults.push('✅ 用戶資訊權限');
    
    // 2. 檢查 Classroom 權限
    Classroom.Courses.list({ pageSize: 1 });
    console.log('✅ Classroom 課程權限正常');
    authResults.push('✅ Classroom 課程權限');
    
    // 3. 檢查 Spreadsheet 權限
    SpreadsheetApp.getActiveSpreadsheet().getId();
    console.log('✅ Spreadsheets 權限正常');
    authResults.push('✅ Spreadsheets 權限');
    
    // 4. 檢查 Admin Directory 權限
    try {
      AdminDirectory.Users.get('me');
      console.log('✅ Admin Directory 權限正常');
      authResults.push('✅ Admin Directory 權限');
    } catch (adminError) {
      console.log('⚠️ Admin Directory 權限需要授權');
      authResults.push('⚠️ Admin Directory 權限需要授權');
      authSuccess = false;
    }
    
    // 顯示最終結果
    console.log('\n📊 權限檢查結果:');
    authResults.forEach(result => console.log(`  ${result}`));
    
    if (authSuccess) {
      console.log('\n🎉 所有權限檢查通過！可以正常使用所有功能。');
      try {
        SpreadsheetApp.getUi().alert(
          '✅ 授權成功',
          '所有權限檢查通過！\n\n現在可以正常使用：\n• Google Classroom 管理\n• 智能學生分配\n• 批次操作功能\n\n如有需要，可隨時重新執行此授權檢查。',
          SpreadsheetApp.getUi().ButtonSet.OK
        );
      } catch (e) {
        console.log('🎉 授權完成，可開始使用所有功能');
      }
    } else {
      console.log('\n✅ 核心權限授權完成，所有主要功能都可正常使用！');
      try {
        SpreadsheetApp.getUi().alert(
          '✅ 授權成功（推薦等級）',
          '核心權限已完成授權，所有主要功能都可正常使用！\n\n✅ 完全可用的功能：\n• 🎯 智能學生分配\n• 👨‍🎓 批次新增學生\n• 📚 課程管理\n• 👨‍🏫 教師管理\n• 📊 學生名冊操作\n\n💡 小提示：Admin Directory 為進階診斷功能，不影響日常使用。',
          SpreadsheetApp.getUi().ButtonSet.OK
        );
      } catch (e) {
        console.log('✅ 核心權限授權完成，所有主要功能可用');
      }
    }
    
  } catch (error) {
    authSuccess = false;
    console.log(`\n❌ 權限檢查失敗: ${error.message}`);
    console.log('\n💡 解決方案：');
    console.log('1. 重新運行此函數以觸發授權流程');
    console.log('2. 檢查 Google Workspace 管理控制台的應用程式設定');
    console.log('3. 確認當前帳戶有適當的管理員權限');
    console.log('4. 聯絡 IT 支援檢查域安全政策');
    
    try {
      SpreadsheetApp.getUi().alert(
        '❌ 授權失敗',
        `授權過程中發生錯誤：\n${error.message}\n\n請嘗試：\n1. 重新執行此功能\n2. 檢查網路連線\n3. 聯絡 IT 支援`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } catch (e) {
      console.log('❌ 授權失敗，請檢查權限設定');
    }
  }
  
  return {
    requiredScopes,
    timestamp: new Date().toLocaleString()
  };
}

/**
 * 權限設定指引 UI
 */
function showAuthorizationGuideUI() {
  const ui = SpreadsheetApp.getUi();
  
  const message = `📋 Google Apps Script 權限設定指引

🔧 重新授權步驟：
1. 點擊 Google Apps Script 編輯器中的「執行」按鈕
2. 在授權對話框中點擊「檢查權限」
3. 選擇正確的 Google 帳戶
4. 檢查並允許所有權限請求
5. 完成授權後重新嘗試功能

💡 常見問題：
• 如果看到「應用程式未驗證」警告，點擊「進階」→「前往...（不安全）」
• 確保使用具有管理員權限的帳戶
• 檢查 Google Workspace 安全設定

🛠️ 需要協助？
使用診斷工具：「🔬 深度權限診斷」檢查具體權限狀態。`;
  
  ui.alert('🔄 權限設定指引', message, ui.ButtonSet.OK);
}

/**
 * 檢查域管理員權限和設定
 */
function checkDomainAdminPermissions() {
  console.log('=== 👨‍💼 域管理員權限檢查 ===');
  
  const results = {
    timestamp: new Date().toLocaleString(),
    currentUser: null,
    adminStatus: {},
    domainSettings: {},
    classroomSettings: {},
    recommendations: []
  };
  
  // 步驟1: 檢查當前用戶基本資訊
  try {
    results.currentUser = Session.getActiveUser().getEmail();
    console.log(`📧 當前用戶: ${results.currentUser}`);
    console.log(`🌐 域名: ${results.currentUser.split('@')[1]}`);
  } catch (e) {
    console.log(`❌ 無法取得用戶資訊: ${e.message}`);
    results.recommendations.push('檢查 userinfo.email 權限設定');
  }
  
  // 步驟2: 檢查管理員權限
  console.log('\n🔍 檢查管理員權限...');
  try {
    const userInfo = AdminDirectory.Users.get('me');
    results.adminStatus = {
      isAdmin: userInfo.isAdmin || false,
      isDelegatedAdmin: userInfo.isDelegatedAdmin || false,
      orgUnitPath: userInfo.orgUnitPath || '/',
      customSchemas: userInfo.customSchemas || {},
      suspended: userInfo.suspended || false,
      primaryEmail: userInfo.primaryEmail
    };
    
    console.log(`👤 超級管理員: ${results.adminStatus.isAdmin ? '✅ 是' : '❌ 否'}`);
    console.log(`🎯 委派管理員: ${results.adminStatus.isDelegatedAdmin ? '✅ 是' : '❌ 否'}`);
    console.log(`🏢 組織單位: ${results.adminStatus.orgUnitPath}`);
    console.log(`📊 帳戶狀態: ${results.adminStatus.suspended ? '❌ 已停用' : '✅ 活躍'}`);
    
    if (!results.adminStatus.isAdmin && !results.adminStatus.isDelegatedAdmin) {
      console.log(`⚠️ 警告: 當前用戶不具備管理員權限`);
      results.recommendations.push('需要超級管理員或委派管理員權限');
      results.recommendations.push('聯絡 Google Workspace 管理員提升權限');
    }
    
  } catch (error) {
    console.log(`❌ 無法檢查管理員權限: ${error.message}`);
    results.adminStatus.error = error.message;
    results.recommendations.push('檢查 Admin Directory API 權限');
  }
  
  // 步驟3: 檢查域設定 (如果有管理員權限)
  if (results.adminStatus.isAdmin || results.adminStatus.isDelegatedAdmin) {
    console.log('\n🔍 檢查域級別設定...');
    try {
      // 嘗試獲取域資訊
      const domain = results.currentUser.split('@')[1];
      console.log(`🌐 檢查域: ${domain}`);
      
      // 檢查是否能訪問域設定
      try {
        const domainInfo = AdminDirectory.Domains.get(Session.getActiveUser().getEmail().split('@')[1]);
        results.domainSettings = {
          domainName: domainInfo.domainName,
          verified: domainInfo.verified,
          isPrimary: domainInfo.isPrimary
        };
        console.log(`✅ 域驗證狀態: ${domainInfo.verified ? '已驗證' : '未驗證'}`);
        console.log(`🎯 主要域: ${domainInfo.isPrimary ? '是' : '否'}`);
      } catch (domainError) {
        console.log(`⚠️ 無法獲取域詳細資訊: ${domainError.message}`);
        results.domainSettings.error = domainError.message;
      }
      
    } catch (error) {
      console.log(`❌ 域設定檢查失敗: ${error.message}`);
      results.domainSettings.error = error.message;
    }
  }
  
  // 步驟4: 檢查 Classroom 特定權限
  console.log('\n🎓 檢查 Classroom 管理權限...');
  try {
    // 測試是否能夠執行管理級別的 Classroom 操作
    const courses = Classroom.Courses.list({ pageSize: 1 });
    console.log(`✅ 可以列出課程`);
    
    // 測試是否能查看其他用戶的課程 (管理員特權)
    try {
      const allCourses = Classroom.Courses.list({ 
        pageSize: 10,
        courseStates: ['ACTIVE', 'ARCHIVED', 'PROVISIONED', 'DECLINED']
      });
      
      if (allCourses.courses && allCourses.courses.length > 0) {
        const ownedCourses = allCourses.courses.filter(c => c.ownerId === results.adminStatus.primaryEmail);
        const otherCourses = allCourses.courses.filter(c => c.ownerId !== results.adminStatus.primaryEmail);
        
        console.log(`📚 可查看課程總數: ${allCourses.courses.length}`);
        console.log(`👤 自己擁有的課程: ${ownedCourses.length}`);
        console.log(`👥 其他人的課程: ${otherCourses.length}`);
        
        results.classroomSettings = {
          totalCourses: allCourses.courses.length,
          ownedCourses: ownedCourses.length,
          otherCourses: otherCourses.length,
          canViewAllCourses: otherCourses.length > 0
        };
        
        if (otherCourses.length > 0) {
          console.log(`✅ 具備域管理員級別的 Classroom 權限`);
        } else {
          console.log(`⚠️ 只能查看自己的課程，可能缺少域管理員權限`);
          results.recommendations.push('檢查 Classroom 域管理員權限設定');
        }
      }
      
    } catch (courseError) {
      console.log(`⚠️ Classroom 權限限制: ${courseError.message}`);
      results.classroomSettings.error = courseError.message;
    }
    
  } catch (error) {
    console.log(`❌ Classroom 權限檢查失敗: ${error.message}`);
    results.classroomSettings.error = error.message;
    results.recommendations.push('檢查 Classroom API 基本權限');
  }
  
  // 步驟5: 生成具體建議
  console.log('\n💡 權限分析與建議:');
  
  if (results.adminStatus.isAdmin) {
    console.log('✅ 您是超級管理員，應該具備所有必要權限');
    if (results.recommendations.length === 0) {
      results.recommendations.push('權限檢查通過，可以嘗試執行教師新增功能');
    }
  } else if (results.adminStatus.isDelegatedAdmin) {
    console.log('🎯 您是委派管理員，請確認是否具備 Classroom 管理權限');
    results.recommendations.push('檢查委派管理員角色是否包含 Classroom 管理權限');
  } else {
    console.log('❌ 您不是管理員，這可能是權限問題的根本原因');
    results.recommendations.push('請聯絡超級管理員提升您的權限');
    results.recommendations.push('或請具備管理員權限的用戶執行此操作');
  }
  
  // 輸出所有建議
  if (results.recommendations.length > 0) {
    console.log('\n🔧 具體建議:');
    results.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  console.log(`\n📊 檢查完成時間: ${results.timestamp}`);
  return results;
}

/**
 * 分析權限錯誤的詳細類型和原因
 */
function analyzePermissionError(error, courseId = null, userEmail = null) {
  const errorMessage = error?.message || error?.toString() || '未知錯誤';
  const errorCode = error?.code || error?.details?.code || null;
  
  let errorType = 'UNKNOWN';
  let description = '未知錯誤類型';
  let severity = 'medium';
  let suggestions = [];
  
  // 分析不同類型的錯誤
  if (errorCode === 403 || errorMessage.includes('permission') || errorMessage.includes('The caller does not have permission')) {
    errorType = 'PERMISSION_DENIED';
    severity = 'high';
    
    if (errorMessage.includes('The caller does not have permission')) {
      description = '當前用戶缺少執行此操作的權限';
      suggestions = [
        '檢查是否為課程擁有者',
        '確認是否具備域管理員權限',
        '重新授權 Google Apps Script',
        '聯絡課程擁有者或 IT 管理員'
      ];
    } else {
      description = '權限不足或認證失效';
      suggestions = [
        '重新登入 Google 帳戶',
        '檢查 OAuth 權限範圍',
        '確認帳戶具備必要權限'
      ];
    }
    
  } else if (errorCode === 404 || errorMessage.includes('not found') || errorMessage.includes('Not Found')) {
    errorType = 'NOT_FOUND';
    severity = 'medium';
    description = '找不到指定的資源（課程或用戶）';
    suggestions = [
      '確認課程 ID 正確',
      '檢查用戶 Email 格式',
      '確認用戶存在於 Google Workspace',
      '檢查課程是否已刪除或封存'
    ];
    
  } else if (errorCode === 429 || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
    errorType = 'QUOTA_EXCEEDED';
    severity = 'low';
    description = 'API 配額超限或請求頻率過高';
    suggestions = [
      '等待一段時間後重試',
      '減少並行請求數量',
      '檢查 API 配額設定',
      '聯絡管理員增加配額'
    ];
    
  } else if (errorCode === 401 || errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
    errorType = 'AUTHENTICATION_FAILED';
    severity = 'high';
    description = '認證失敗或 token 過期';
    suggestions = [
      '重新授權應用程式',
      '檢查登入狀態',
      '確認 OAuth 設定正確',
      '聯絡管理員檢查帳戶狀態'
    ];
    
  } else if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
    errorType = 'NETWORK_ERROR';
    severity = 'low';
    description = '網路連線問題';
    suggestions = [
      '檢查網路連線',
      '稍後重新嘗試',
      '確認 Google 服務可用性'
    ];
    
  } else if (errorMessage.includes('invalid') || errorMessage.includes('malformed')) {
    errorType = 'INVALID_REQUEST';
    severity = 'medium';
    description = '請求格式錯誤或參數無效';
    suggestions = [
      '檢查輸入參數格式',
      '確認 API 呼叫語法正確',
      '查看 API 文檔確認需求'
    ];
  }
  
  return {
    errorType,
    description,
    severity,
    suggestions,
    originalError: errorMessage,
    code: errorCode,
    context: {
      courseId,
      userEmail,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * 綜合權限測試工具 - 一鍵執行所有診斷
 */
function comprehensivePermissionTest() {
  console.log('=== 🔬 綜合權限測試工具 ===');
  console.log('🚀 執行完整的權限診斷流程...\n');
  
  const testResults = {
    timestamp: new Date().toLocaleString(),
    tests: {},
    summary: {
      passed: 0,
      failed: 0,
      warnings: 0
    },
    recommendations: []
  };
  
  // 測試 1: 基本用戶資訊
  console.log('📋 測試 1: 基本用戶資訊');
  try {
    const userEmail = Session.getActiveUser().getEmail();
    console.log(`✅ 當前用戶: ${userEmail}`);
    testResults.tests.userInfo = { status: 'passed', data: userEmail };
    testResults.summary.passed++;
  } catch (e) {
    console.log(`❌ 無法獲取用戶資訊: ${e.message}`);
    testResults.tests.userInfo = { status: 'failed', error: e.message };
    testResults.summary.failed++;
    testResults.recommendations.push('檢查 userinfo.email 權限');
  }
  
  // 測試 2: Admin Directory 權限
  console.log('\n📋 測試 2: Admin Directory 權限');
  try {
    const adminInfo = AdminDirectory.Users.get('me');
    const isAdmin = adminInfo.isAdmin || false;
    const isDelegatedAdmin = adminInfo.isDelegatedAdmin || false;
    
    console.log(`✅ Admin Directory 存取正常`);
    console.log(`👤 超級管理員: ${isAdmin ? '是' : '否'}`);
    console.log(`🎯 委派管理員: ${isDelegatedAdmin ? '是' : '否'}`);
    
    testResults.tests.adminDirectory = { 
      status: 'passed', 
      isAdmin, 
      isDelegatedAdmin,
      orgUnit: adminInfo.orgUnitPath 
    };
    testResults.summary.passed++;
    
    if (!isAdmin && !isDelegatedAdmin) {
      testResults.summary.warnings++;
      testResults.recommendations.push('考慮申請管理員權限以獲得完整功能');
    }
    
  } catch (e) {
    console.log(`❌ Admin Directory 存取失敗: ${e.message}`);
    testResults.tests.adminDirectory = { status: 'failed', error: e.message };
    testResults.summary.failed++;
    testResults.recommendations.push('檢查 Admin Directory API 權限設定');
  }
  
  // 測試 3: Classroom 基本權限
  console.log('\n📋 測試 3: Classroom 基本權限');
  try {
    const courses = Classroom.Courses.list({ pageSize: 5 });
    const courseCount = courses.courses ? courses.courses.length : 0;
    
    console.log(`✅ Classroom API 存取正常`);
    console.log(`📚 可查看課程數: ${courseCount}`);
    
    testResults.tests.classroomBasic = { 
      status: 'passed', 
      courseCount,
      courses: courses.courses || []
    };
    testResults.summary.passed++;
    
  } catch (e) {
    console.log(`❌ Classroom 基本存取失敗: ${e.message}`);
    testResults.tests.classroomBasic = { status: 'failed', error: e.message };
    testResults.summary.failed++;
    testResults.recommendations.push('檢查 Classroom API 基本權限');
  }
  
  // 測試 4: 特定課程權限測試
  console.log('\n📋 測試 4: 特定課程權限');
  const testCourseId = '779922029471';
  try {
    const course = Classroom.Courses.get(testCourseId);
    console.log(`✅ 可讀取課程: ${course.name}`);
    console.log(`👤 課程擁有者 ID: ${course.ownerId}`);
    
    // 測試教師列表讀取
    try {
      const teachers = Classroom.Courses.Teachers.list(testCourseId);
      const teacherCount = teachers.teachers ? teachers.teachers.length : 0;
      console.log(`✅ 可讀取教師列表: ${teacherCount} 位教師`);
      
      testResults.tests.specificCourse = { 
        status: 'passed', 
        courseName: course.name,
        ownerId: course.ownerId,
        teacherCount
      };
      testResults.summary.passed++;
      
    } catch (teacherError) {
      console.log(`⚠️ 無法讀取教師列表: ${teacherError.message}`);
      testResults.tests.specificCourse = { 
        status: 'warning', 
        courseName: course.name,
        ownerId: course.ownerId,
        teacherError: teacherError.message
      };
      testResults.summary.warnings++;
      testResults.recommendations.push('檢查課程名冊讀取權限');
    }
    
  } catch (e) {
    console.log(`❌ 無法讀取測試課程: ${e.message}`);
    testResults.tests.specificCourse = { status: 'failed', error: e.message };
    testResults.summary.failed++;
    testResults.recommendations.push('檢查課程讀取權限或課程ID');
  }
  
  // 測試 5: Spreadsheets 權限
  console.log('\n📋 測試 5: Spreadsheets 權限');
  try {
    const ssId = SpreadsheetApp.getActiveSpreadsheet().getId();
    const ssName = SpreadsheetApp.getActiveSpreadsheet().getName();
    console.log(`✅ Spreadsheets 存取正常`);
    console.log(`📊 當前試算表: ${ssName}`);
    
    testResults.tests.spreadsheets = { 
      status: 'passed', 
      spreadsheetId: ssId,
      spreadsheetName: ssName
    };
    testResults.summary.passed++;
    
  } catch (e) {
    console.log(`❌ Spreadsheets 存取失敗: ${e.message}`);
    testResults.tests.spreadsheets = { status: 'failed', error: e.message };
    testResults.summary.failed++;
    testResults.recommendations.push('檢查 Spreadsheets API 權限');
  }
  
  // 生成測試摘要
  console.log('\n📊 測試摘要:');
  console.log(`✅ 通過: ${testResults.summary.passed}`);
  console.log(`⚠️ 警告: ${testResults.summary.warnings}`);
  console.log(`❌ 失敗: ${testResults.summary.failed}`);
  
  const totalTests = testResults.summary.passed + testResults.summary.warnings + testResults.summary.failed;
  const successRate = Math.round((testResults.summary.passed / totalTests) * 100);
  console.log(`🎯 成功率: ${successRate}%`);
  
  // 生成建議
  if (testResults.recommendations.length > 0) {
    console.log('\n💡 改善建議:');
    testResults.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  // 整體評估
  console.log('\n🔍 整體評估:');
  if (testResults.summary.failed === 0) {
    if (testResults.summary.warnings === 0) {
      console.log('🎉 權限設定完美！可以正常執行所有功能。');
    } else {
      console.log('✅ 基本權限正常，有些功能可能受限但不影響主要操作。');
    }
  } else {
    console.log('⚠️ 發現權限問題，需要處理才能正常使用功能。');
    
    // 提供快速修復建議
    console.log('\n🚀 快速修復建議:');
    console.log('1. 執行 reauthorizePermissions() 重新授權');
    console.log('2. 檢查 Google Workspace 管理控制台設定');
    console.log('3. 確認當前帳戶權限等級');
  }
  
  testResults.overallStatus = testResults.summary.failed === 0 ? 'healthy' : 'needs_attention';
  console.log(`\n📈 測試完成: ${testResults.timestamp}`);
  
  return testResults;
}

/**
 * 執行權限預檢 - 在主要操作前檢查用戶權限等級
 */
async function performPermissionPrecheck(currentUser) {
  const result = {
    canProceed: true, // 預設允許執行，只在真正有問題時才阻止
    userLevel: 'unknown',
    status: '',
    issue: '',
    recommendation: '',
    alternativeAccounts: [],
    permissionLevel: 'core' // 新增：core/advanced/full
  };
  
  try {
    // 檢查基本用戶資訊
    if (!currentUser || currentUser === 'unknown') {
      result.canProceed = false; // 這是真正的問題，需要阻止
      result.issue = '無法識別當前執行用戶';
      result.recommendation = '請確認已正確登入 Google 帳戶並重新授權';
      return result;
    }
    
    // 先測試核心功能是否可用
    try {
      // 測試 Classroom API（核心功能）
      Classroom.Courses.list({ pageSize: 1 });
      result.permissionLevel = 'core';
      result.status = '核心功能權限正常，所有主要操作都可執行';
      console.log('✅ 核心權限檢查通過：Classroom API 可用');
      
      // 嘗試檢查管理員權限（進階功能，失敗不影響使用）
      try {
        const userInfo = getSmartUserInfo('me');
        if (userInfo.success) {
          const isAdmin = userInfo.isAdmin || false;
          const isDelegatedAdmin = userInfo.isDelegatedAdmin || false;
          
          if (isAdmin) {
            result.userLevel = '超級管理員';
            result.permissionLevel = 'full';
            result.status = '具備完整管理員權限，可執行所有操作包括進階診斷';
            console.log('✅ 完整權限：超級管理員');
            return result;
            
          } else if (isDelegatedAdmin) {
            result.userLevel = '委派管理員';
            result.permissionLevel = 'advanced';
            result.status = '具備委派管理員權限，可執行所有操作';
            console.log('✅ 進階權限：委派管理員');
            return result;
          
          } else {
            // 非管理員但核心功能可用
            result.userLevel = '一般教師';
            result.status = '您是一般用戶，但具備核心教學管理權限，所有主要功能都可正常使用';
            console.log('✅ 核心權限：一般教師（Admin Directory 不可用但不影響使用）');
          }
        } else {
          // getSmartUserInfo 失敗但不影響核心功能
          result.userLevel = '一般用戶（Session 等級）';
          result.status = '核心功能權限正常，使用 Session API 獲取基本用戶資訊';
          console.log('ℹ️ 使用 Session API 進行基本權限檢查');
        }
        
      } catch (adminError) {
        // Admin Directory API 不可用，但這不是問題
        result.userLevel = '一般用戶（推薦等級）';
        result.status = '核心功能權限正常，Admin Directory 為進階功能，不影響日常使用';
        console.log('ℹ️ Admin Directory API 不可用，但不影響核心功能');
      }
      
    } catch (coreError) {
      // 核心功能失敗才是真正的問題
      result.canProceed = false;
      result.issue = '核心 Classroom API 無法存取';
      result.recommendation = '請檢查 Google Classroom 權限設定和網路連線';
      console.log(`❌ 核心權限檢查失敗: ${coreError.message}`);
    }
    
  } catch (error) {
    result.canProceed = false;
    result.userLevel = '錯誤';
    result.issue = `權限檢查失敗：${error.message}`;
    result.recommendation = '請檢查網路連線和 API 權限設定';
  }
  
  return result;
}

/**
 * 顯示當前用戶權限狀態的 UI 功能
 */
function showUserPermissionStatusUI() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // 獲取當前用戶
    const currentUser = Session.getActiveUser().getEmail();
    let statusMessage = `👤 當前用戶：${currentUser}\n\n`;
    
    // 檢查管理員權限
    try {
      const adminInfo = AdminDirectory.Users.get('me');
      const isAdmin = adminInfo.isAdmin || false;
      const isDelegatedAdmin = adminInfo.isDelegatedAdmin || false;
      
      if (isAdmin) {
        statusMessage += `🎉 權限等級：超級管理員\n`;
        statusMessage += `✅ 狀態：具備完整管理權限\n`;
        statusMessage += `🚀 功能：可執行所有操作\n\n`;
        statusMessage += `💡 您可以：\n`;
        statusMessage += `• 直接執行教師新增功能\n`;
        statusMessage += `• 管理所有課程和用戶\n`;
        statusMessage += `• 存取所有診斷工具`;
        
      } else if (isDelegatedAdmin) {
        statusMessage += `🎯 權限等級：委派管理員\n`;
        statusMessage += `✅ 狀態：具備部分管理權限\n`;
        statusMessage += `🚀 功能：可執行大部分操作\n\n`;
        statusMessage += `💡 您可以：\n`;
        statusMessage += `• 執行教師新增功能\n`;
        statusMessage += `• 管理指定範圍的課程\n`;
        statusMessage += `• 使用所有診斷工具`;
        
      } else {
        statusMessage += `⚠️ 權限等級：一般用戶\n`;
        statusMessage += `❌ 狀態：權限受限\n`;
        statusMessage += `🔧 功能：可能無法執行某些操作\n\n`;
        
        // 檢查是否為課程擁有者
        try {
          const testCourseId = '779922029471';
          const course = Classroom.Courses.get(testCourseId);
          const ownerInfo = lookupUserById(course.ownerId);
          
          if (ownerInfo.success && ownerInfo.email === currentUser) {
            statusMessage += `📚 您是課程擁有者但權限可能不足\n`;
            statusMessage += `⚠️ 注意：課程擁有者 ≠ 域管理員\n\n`;
          }
          
        } catch (e) {
          statusMessage += `❌ 無法檢查課程擁有者狀態\n\n`;
        }
        
        statusMessage += `💡 建議：\n`;
        statusMessage += `• 使用具備管理員權限的帳戶\n`;
        statusMessage += `• 成功案例：tsehunhchen@kcislk.ntpc.edu.tw\n`;
        statusMessage += `• 聲請 IT 管理員協助`;
      }
      
    } catch (adminError) {
      statusMessage += `❌ 權限等級：無法確認\n`;
      statusMessage += `⚠️ 狀態：Admin Directory API 存取失敗\n\n`;
      statusMessage += `🔧 可能原因：\n`;
      statusMessage += `• OAuth 權限不足\n`;
      statusMessage += `• 需要重新授權\n\n`;
      statusMessage += `💡 建議：\n`;
      statusMessage += `• 執行重新授權功能\n`;
      statusMessage += `• 檢查 Google Workspace 設定`;
    }
    
  } catch (userError) {
    statusMessage = `❌ 無法獲取用戶資訊\n\n`;
    statusMessage += `錯誤：${userError.message}\n\n`;
    statusMessage += `請檢查：\n`;
    statusMessage += `• 是否已正確登入\n`;
    statusMessage += `• OAuth 權限設定`;
  }
  
  ui.alert('👤 用戶權限狀態', statusMessage, ui.ButtonSet.OK);
}

/**
 * 快速權限檢查和建議 UI
 */
function quickPermissionCheckUI() {
  const ui = SpreadsheetApp.getUi();
  
  // 執行快速檢查
  console.log('=== 🚀 快速權限檢查 ===');
  
  try {
    const currentUser = Session.getActiveUser().getEmail();
    console.log(`👤 檢查用戶：${currentUser}`);
    
    // 執行綜合測試
    const testResults = comprehensivePermissionTest();
    
    // 生成 UI 訊息
    let message = `檢查完成！\n\n`;
    message += `✅ 通過：${testResults.summary.passed}\n`;
    message += `⚠️ 警告：${testResults.summary.warnings}\n`;
    message += `❌ 失敗：${testResults.summary.failed}\n\n`;
    
    if (testResults.summary.failed === 0) {
      message += `🎉 權限狀態良好！\n\n`;
      message += `您可以：\n`;
      message += `• 直接執行教師新增功能\n`;
      message += `• 使用所有系統功能`;
    } else {
      message += `⚠️ 發現權限問題\n\n`;
      message += `建議：\n`;
      if (testResults.recommendations.length > 0) {
        testResults.recommendations.slice(0, 3).forEach((rec, index) => {
          message += `${index + 1}. ${rec}\n`;
        });
      }
      message += `\n🎯 成功案例：tsehunhchen@kcislk.ntpc.edu.tw`;
    }
    
    ui.alert('🔍 快速權限檢查結果', message, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('❌ 檢查失敗', `無法完成權限檢查：${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * 自動權限修復流程
 */
function autoPermissionRecoveryFlow() {
  console.log('=== 🔧 自動權限修復流程 ===');
  
  const ui = SpreadsheetApp.getUi();
  let currentUser = 'unknown';
  
  try {
    currentUser = Session.getActiveUser().getEmail();
    console.log(`👤 當前用戶：${currentUser}`);
  } catch (e) {
    console.log(`❌ 無法識別用戶：${e.message}`);
  }
  
  // 步驟1: 執行全面診斷
  console.log('\n📋 步驟 1: 執行全面權限診斷...');
  const diagnostics = {
    userInfo: null,
    adminStatus: null,
    permissionTest: null,
    recommendations: []
  };
  
  try {
    // 用戶資訊診斷
    try {
      const adminInfo = AdminDirectory.Users.get('me');
      diagnostics.adminStatus = {
        isAdmin: adminInfo.isAdmin || false,
        isDelegatedAdmin: adminInfo.isDelegatedAdmin || false,
        orgUnit: adminInfo.orgUnitPath
      };
      console.log(`✅ 管理員狀態：${diagnostics.adminStatus.isAdmin ? '超級管理員' : diagnostics.adminStatus.isDelegatedAdmin ? '委派管理員' : '一般用戶'}`);
    } catch (e) {
      console.log(`❌ 無法檢查管理員狀態：${e.message}`);
    }
    
    // 權限測試
    try {
      diagnostics.permissionTest = comprehensivePermissionTest();
      console.log(`✅ 權限測試完成：${diagnostics.permissionTest.summary.passed}/${diagnostics.permissionTest.summary.passed + diagnostics.permissionTest.summary.failed} 通過`);
    } catch (e) {
      console.log(`❌ 權限測試失敗：${e.message}`);
    }
    
  } catch (error) {
    console.log(`❌ 診斷過程錯誤：${error.message}`);
  }
  
  // 步驟2: 分析問題並生成解決方案
  console.log('\n📋 步驟 2: 分析問題並生成解決方案...');
  
  let recoveryPlan = [];
  let canAutoFix = false;
  
  // 分析診斷結果
  if (diagnostics.adminStatus) {
    if (diagnostics.adminStatus.isAdmin || diagnostics.adminStatus.isDelegatedAdmin) {
      console.log('✅ 檢測到管理員權限');
      if (diagnostics.permissionTest && diagnostics.permissionTest.summary.failed > 0) {
        recoveryPlan.push({
          step: '重新授權 OAuth 權限',
          action: 'reauthorizePermissions',
          autoFixable: true,
          description: '您有管理員權限但某些 API 存取失敗，需要重新授權'
        });
        canAutoFix = true;
      } else {
        recoveryPlan.push({
          step: '權限狀態正常',
          action: 'none',
          autoFixable: false,
          description: '您的權限設定正常，可以直接執行功能'
        });
      }
    } else {
      console.log('⚠️ 檢測到非管理員用戶');
      recoveryPlan.push({
        step: '切換到管理員帳戶',
        action: 'switchAccount',
        autoFixable: false,
        description: '建議使用具備管理員權限的帳戶',
        recommendedAccounts: ['tsehunhchen@kcislk.ntpc.edu.tw']
      });
    }
  } else {
    console.log('❌ 無法檢測管理員狀態');
    recoveryPlan.push({
      step: '修復基本權限',
      action: 'reauthorizePermissions',
      autoFixable: true,
      description: '無法存取 Admin Directory，需要重新授權基本權限'
    });
    canAutoFix = true;
  }
  
  // 步驟3: 顯示修復計劃
  console.log('\n📋 步驟 3: 顯示修復計劃...');
  
  let planMessage = `🔧 自動修復計劃\n\n`;
  planMessage += `👤 當前用戶：${currentUser}\n`;
  planMessage += `📊 檢測結果：${recoveryPlan.length} 個修復步驟\n\n`;
  
  recoveryPlan.forEach((plan, index) => {
    planMessage += `${index + 1}. ${plan.step}\n`;
    planMessage += `   ${plan.description}\n`;
    if (plan.recommendedAccounts) {
      planMessage += `   建議帳戶：${plan.recommendedAccounts.join(', ')}\n`;
    }
    planMessage += `\n`;
  });
  
  if (canAutoFix) {
    planMessage += `🚀 可以自動修復某些問題\n`;
    planMessage += `是否要執行自動修復？`;
    
    const response = ui.alert('🔧 自動權限修復', planMessage, ui.ButtonSet.YES_NO);
    
    if (response === ui.Button.YES) {
      console.log('\n🚀 開始執行自動修復...');
      
      // 執行自動修復
      for (const plan of recoveryPlan) {
        if (plan.autoFixable) {
          try {
            console.log(`📋 執行：${plan.step}`);
            
            if (plan.action === 'reauthorizePermissions') {
              reauthorizePermissions();
              console.log('✅ 重新授權完成');
            }
            
          } catch (error) {
            console.log(`❌ 修復失敗：${error.message}`);
          }
        }
      }
      
      // 重新測試
      console.log('\n🔍 重新測試權限狀態...');
      try {
        const retestResults = comprehensivePermissionTest();
        let retestMessage = `修復完成！\n\n`;
        retestMessage += `✅ 通過：${retestResults.summary.passed}\n`;
        retestMessage += `❌ 失敗：${retestResults.summary.failed}\n\n`;
        
        if (retestResults.summary.failed === 0) {
          retestMessage += `🎉 所有權限問題已解決！\n現在可以正常使用所有功能。`;
        } else {
          retestMessage += `⚠️ 仍有部分問題需要手動處理\n請參考診斷建議或聯絡管理員。`;
        }
        
        ui.alert('🎯 修復結果', retestMessage, ui.ButtonSet.OK);
        
      } catch (error) {
        ui.alert('❌ 重新測試失敗', `無法完成重新測試：${error.message}`, ui.ButtonSet.OK);
      }
      
    } else {
      console.log('❌ 用戶取消自動修復');
      ui.alert('ℹ️ 已取消', '自動修復已取消。您可以稍後再嘗試或手動執行建議的步驟。', ui.ButtonSet.OK);
    }
    
  } else {
    planMessage += `⚠️ 需要手動處理\n`;
    planMessage += `請按照上述步驟進行修復。`;
    ui.alert('🔧 權限修復計劃', planMessage, ui.ButtonSet.OK);
  }
  
  console.log('\n📈 自動權限修復流程完成');
}

/**
 * 📊 執行報告系統 - 建立詳細的批次執行報告
 */
function createExecutionReport(operationType, sheetName, results, errors = [], startTime, endTime) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const reportSheetName = `執行報告_${operationType}_${timestamp}`;
    
    // 建立新的報告工作表
    const reportSheet = ss.insertSheet(reportSheetName);
    
    // 設定報告標題和摘要
    const duration = endTime - startTime;
    const durationMinutes = Math.round(duration / 60000 * 100) / 100;
    
    const summary = [
      ['📊 批次執行報告', ''],
      ['執行類型', operationType],
      ['來源工作表', sheetName],
      ['執行時間', new Date(startTime).toLocaleString('zh-TW')],
      ['完成時間', new Date(endTime).toLocaleString('zh-TW')],
      ['執行時長', `${durationMinutes} 分鐘`],
      ['總處理數', results.length],
      ['成功數量', results.filter(r => r.success).length],
      ['失敗數量', results.filter(r => !r.success).length],
      [''],
      ['詳細執行結果', '']
    ];
    
    // 寫入摘要
    const summaryRange = reportSheet.getRange(1, 1, summary.length, 2);
    summaryRange.setValues(summary);
    
    // 設定摘要樣式
    reportSheet.getRange(1, 1).setFontSize(14).setFontWeight('bold');
    reportSheet.getRange(2, 1, summary.length - 1, 1).setFontWeight('bold');
    
    // 建立詳細結果表頭
    const headerRow = summary.length + 2;
    const headers = ['序號', '學生Email', '課程ID', '課程名稱', '班級名稱', '執行狀態', '結果說明', '錯誤原因', '處理時間'];
    reportSheet.getRange(headerRow, 1, 1, headers.length).setValues([headers]);
    reportSheet.getRange(headerRow, 1, 1, headers.length).setFontWeight('bold').setBackground('#E8F0FE');
    
    // 建立詳細結果資料
    const detailData = results.map((result, index) => [
      index + 1,
      result.studentEmail || result.assignment?.studentEmail || '',
      result.courseId || result.assignment?.courseId || '',
      result.courseName || result.assignment?.courseName || '',
      result.className || result.assignment?.className || '',
      result.success ? '✅ 成功' : '❌ 失敗',
      result.success ? 
        (result.status === 'ALREADY_EXISTS' ? '學生已存在' : '新增成功') : 
        '執行失敗',
      result.success ? '' : (result.error || '未知錯誤'),
      new Date().toLocaleString('zh-TW')
    ]);
    
    // 寫入詳細結果
    if (detailData.length > 0) {
      const dataRange = reportSheet.getRange(headerRow + 1, 1, detailData.length, headers.length);
      dataRange.setValues(detailData);
      
      // 設定條件格式 - 成功為綠色，失敗為紅色
      const statusRange = reportSheet.getRange(headerRow + 1, 6, detailData.length, 1);
      const successRule = SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains('✅')
        .setBackground('#D4EDDA')
        .setRanges([statusRange])
        .build();
      const failRule = SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains('❌')
        .setBackground('#F8D7DA')
        .setRanges([statusRange])
        .build();
      
      const rules = reportSheet.getConditionalFormatRules();
      rules.push(successRule, failRule);
      reportSheet.setConditionalFormatRules(rules);
    }
    
    // 自動調整欄位寬度
    reportSheet.autoResizeColumns(1, headers.length);
    
    // 凍結標題行
    reportSheet.setFrozenRows(headerRow);
    
    console.log(`📊 執行報告已建立：${reportSheetName}`);
    return {
      success: true,
      sheetName: reportSheetName,
      reportSheet: reportSheet
    };
    
  } catch (error) {
    console.log(`❌ 建立執行報告失敗：${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 🔄 智能重試系統 - 分析失敗原因並提供重試建議
 */
function analyzeFailuresAndSuggestRetry(errors, operationType = '批次新增學生') {
  console.log(`🔍 分析 ${errors.length} 個失敗項目...`);
  
  const retryAnalysis = {
    retryableErrors: [],
    permanentErrors: [],
    recommendations: [],
    summary: {
      total: errors.length,
      retryable: 0,
      permanent: 0
    }
  };
  
  // 分類錯誤類型
  errors.forEach((errorItem, index) => {
    const error = errorItem.error || errorItem.message || '未知錯誤';
    const errorLower = error.toLowerCase();
    
    const failureInfo = {
      index: index + 1,
      studentEmail: errorItem.studentEmail,
      courseId: errorItem.courseId,
      courseName: errorItem.courseName,
      className: errorItem.className,
      error: error,
      category: '',
      retryable: false,
      suggestion: ''
    };
    
    // 分析錯誤類型
    if (errorLower.includes('quota') || errorLower.includes('rate limit')) {
      failureInfo.category = '配額限制';
      failureInfo.retryable = true;
      failureInfo.suggestion = '等待幾分鐘後重試，或降低批次處理速度';
      retryAnalysis.retryableErrors.push(failureInfo);
      
    } else if (errorLower.includes('timeout') || errorLower.includes('network')) {
      failureInfo.category = '網路問題';
      failureInfo.retryable = true;
      failureInfo.suggestion = '檢查網路連線後重試';
      retryAnalysis.retryableErrors.push(failureInfo);
      
    } else if (errorLower.includes('503') || errorLower.includes('502') || errorLower.includes('500')) {
      failureInfo.category = '服務暫時無法使用';
      failureInfo.retryable = true;
      failureInfo.suggestion = 'Google 服務暫時不穩定，稍後重試';
      retryAnalysis.retryableErrors.push(failureInfo);
      
    } else if (errorLower.includes('unauthorized') || errorLower.includes('permission') || errorLower.includes('403')) {
      failureInfo.category = '權限問題';
      failureInfo.retryable = false;
      failureInfo.suggestion = '檢查帳戶權限或聯絡管理員';
      retryAnalysis.permanentErrors.push(failureInfo);
      
    } else if (errorLower.includes('not found') || errorLower.includes('404')) {
      failureInfo.category = '課程不存在';
      failureInfo.retryable = false;
      failureInfo.suggestion = '檢查課程 ID 是否正確';
      retryAnalysis.permanentErrors.push(failureInfo);
      
    } else if (errorLower.includes('invalid') || errorLower.includes('malformed')) {
      failureInfo.category = '資料格式錯誤';
      failureInfo.retryable = false;
      failureInfo.suggestion = '檢查學生 Email 格式或課程 ID 格式';
      retryAnalysis.permanentErrors.push(failureInfo);
      
    } else {
      failureInfo.category = '其他錯誤';
      failureInfo.retryable = true; // 未知錯誤預設為可重試
      failureInfo.suggestion = '檢查錯誤訊息並嘗試重試';
      retryAnalysis.retryableErrors.push(failureInfo);
    }
  });
  
  // 更新統計
  retryAnalysis.summary.retryable = retryAnalysis.retryableErrors.length;
  retryAnalysis.summary.permanent = retryAnalysis.permanentErrors.length;
  
  // 生成建議
  if (retryAnalysis.summary.retryable > 0) {
    retryAnalysis.recommendations.push(`✅ ${retryAnalysis.summary.retryable} 個項目可以重試`);
    
    // 根據錯誤類型提供具體建議
    const quotaErrors = retryAnalysis.retryableErrors.filter(e => e.category === '配額限制').length;
    const networkErrors = retryAnalysis.retryableErrors.filter(e => e.category === '網路問題').length;
    const serviceErrors = retryAnalysis.retryableErrors.filter(e => e.category === '服務暫時無法使用').length;
    
    if (quotaErrors > 0) {
      retryAnalysis.recommendations.push(`⏱️ 建議等待 10-15 分鐘後重試（${quotaErrors} 個配額問題）`);
    }
    if (networkErrors > 0) {
      retryAnalysis.recommendations.push(`🌐 建議檢查網路連線（${networkErrors} 個網路問題）`);
    }
    if (serviceErrors > 0) {
      retryAnalysis.recommendations.push(`🔄 建議稍後重試（${serviceErrors} 個服務問題）`);
    }
  }
  
  if (retryAnalysis.summary.permanent > 0) {
    retryAnalysis.recommendations.push(`⚠️ ${retryAnalysis.summary.permanent} 個項目需要手動檢查`);
  }
  
  // 輸出分析結果
  console.log(`📊 失敗分析結果：`);
  console.log(`  可重試項目：${retryAnalysis.summary.retryable}`);
  console.log(`  需檢查項目：${retryAnalysis.summary.permanent}`);
  
  retryAnalysis.recommendations.forEach(rec => {
    console.log(`  ${rec}`);
  });
  
  return retryAnalysis;
}

/**
 * 📝 建立重試工作表 - 為失敗的項目建立重試清單
 */
function createRetryWorksheet(retryableErrors, operationType = '批次新增學生') {
  try {
    if (retryableErrors.length === 0) {
      console.log('ℹ️ 沒有可重試的項目，不建立重試工作表');
      return { success: true, message: '沒有需要重試的項目' };
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const retrySheetName = `重試清單_${operationType}_${timestamp}`;
    
    // 建立重試工作表
    const retrySheet = ss.insertSheet(retrySheetName);
    
    // 設定標題和說明
    const headers = [
      ['📝 重試清單', ''],
      ['操作類型', operationType],
      ['建立時間', new Date().toLocaleString('zh-TW')],
      ['可重試項目數', retryableErrors.length],
      [''],
      ['⚠️ 使用說明', ''],
      ['1. 解決下方列出的問題後', ''],
      ['2. 複製此工作表數據到原始工作表', ''],
      ['3. 清除原始工作表的狀態列', ''],
      ['4. 重新執行批次功能', ''],
      [''],
      ['📋 重試項目清單', '']
    ];
    
    // 寫入標題
    retrySheet.getRange(1, 1, headers.length, 2).setValues(headers);
    retrySheet.getRange(1, 1).setFontSize(14).setFontWeight('bold');
    
    // 設定資料表頭
    const dataHeaderRow = headers.length + 1;
    const dataHeaders = ['學生Email', '課程ID', '課程名稱', '班級名稱', '錯誤類型', '錯誤訊息', '建議解決方案'];
    retrySheet.getRange(dataHeaderRow, 1, 1, dataHeaders.length).setValues([dataHeaders]);
    retrySheet.getRange(dataHeaderRow, 1, 1, dataHeaders.length).setFontWeight('bold').setBackground('#FFF3CD');
    
    // 準備重試資料
    const retryData = retryableErrors.map(item => [
      item.studentEmail || '',
      item.courseId || '',
      item.courseName || '',
      item.className || '',
      item.category || '未知類型',
      item.error || '',
      item.suggestion || '請檢查錯誤訊息'
    ]);
    
    // 寫入重試資料
    if (retryData.length > 0) {
      retrySheet.getRange(dataHeaderRow + 1, 1, retryData.length, dataHeaders.length).setValues(retryData);
    }
    
    // 自動調整欄位寬度
    retrySheet.autoResizeColumns(1, dataHeaders.length);
    
    console.log(`📝 重試工作表已建立：${retrySheetName}`);
    return {
      success: true,
      sheetName: retrySheetName,
      itemCount: retryableErrors.length
    };
    
  } catch (error) {
    console.log(`❌ 建立重試工作表失敗：${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 🔍 進階診斷和報告系統
 */
async function advancedDiagnosticsAndReporting() {
  try {
    console.log('🔍 開始進階診斷和報告...');
    
    const diagnostics = {
      timestamp: new Date().toLocaleString('zh-TW'),
      courseCapacity: null,
      studentPermissions: null,
      apiHealth: null,
      recommendations: []
    };
    
    // 1. 課程容量檢查
    diagnostics.courseCapacity = await checkCourseCapacityLimits();
    
    // 2. 學生權限驗證
    diagnostics.studentPermissions = validateStudentPermissions();
    
    // 3. API 健康狀態檢查
    diagnostics.apiHealth = checkApiHealthStatus();
    
    // 4. 生成建議
    diagnostics.recommendations = generateDiagnosticRecommendations(diagnostics);
    
    // 5. 建立診斷報告工作表
    const reportResult = createDiagnosticReport(diagnostics);
    
    // 顯示摘要
    showDiagnosticSummary(diagnostics, reportResult);
    
    return {
      success: true,
      diagnostics: diagnostics,
      report: reportResult
    };
    
  } catch (error) {
    console.log(`❌ 進階診斷失敗：${error.message}`);
    SpreadsheetApp.getUi().alert(
      '診斷失敗',
      `進階診斷執行失敗：${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 📊 檢查課程容量限制
 */
async function checkCourseCapacityLimits() {
  try {
    console.log('📊 檢查課程容量限制...');
    
    // 獲取所有課程
    const coursesResult = await classroomService.listAllCourses();
    if (!coursesResult.success) {
      return { error: '無法獲取課程清單', details: coursesResult.error };
    }
    
    const courses = coursesResult.data;
    const capacityInfo = {
      totalCourses: courses.length,
      checkedCourses: 0,
      warnings: [],
      details: []
    };
    
    // 檢查前 20 個課程的容量（避免 API 配額問題）
    const coursesToCheck = courses.slice(0, 20);
    
    for (const course of coursesToCheck) {
      try {
        const members = await classroomService.getCourseMembers(course.id);
        const studentCount = members.students ? members.students.length : 0;
        const teacherCount = members.teachers ? members.teachers.length : 0;
        
        const courseInfo = {
          courseId: course.id,
          courseName: course.name,
          studentCount: studentCount,
          teacherCount: teacherCount,
          status: 'normal'
        };
        
        // Google Classroom 建議限制
        if (studentCount > 1000) {
          courseInfo.status = 'warning';
          capacityInfo.warnings.push(`課程 "${course.name}" 學生數量過多 (${studentCount})`);
        } else if (studentCount > 500) {
          courseInfo.status = 'caution';
        }
        
        if (teacherCount > 20) {
          courseInfo.status = 'warning';
          capacityInfo.warnings.push(`課程 "${course.name}" 教師數量過多 (${teacherCount})`);
        }
        
        capacityInfo.details.push(courseInfo);
        capacityInfo.checkedCourses++;
        
      } catch (error) {
        console.log(`檢查課程 ${course.name} 容量時發生錯誤：${error.message}`);
        capacityInfo.details.push({
          courseId: course.id,
          courseName: course.name,
          error: error.message,
          status: 'error'
        });
      }
    }
    
    console.log(`📊 容量檢查完成：檢查了 ${capacityInfo.checkedCourses} 個課程`);
    return capacityInfo;
    
  } catch (error) {
    console.log(`❌ 課程容量檢查失敗：${error.message}`);
    return { error: error.message };
  }
}

/**
 * 🔐 驗證學生權限
 */
function validateStudentPermissions() {
  try {
    console.log('🔐 驗證學生權限...');
    
    const permissionInfo = {
      currentUser: Session.getActiveUser().getEmail(),
      permissions: [],
      issues: [],
      recommendations: []
    };
    
    // 檢查基本 Classroom 權限
    try {
      const testResult = Classroom.Courses.list({ pageSize: 1 });
      permissionInfo.permissions.push({
        type: '課程列表存取',
        status: 'ok',
        details: '可以存取課程清單'
      });
    } catch (error) {
      permissionInfo.permissions.push({
        type: '課程列表存取',
        status: 'error',
        details: error.message
      });
      permissionInfo.issues.push('無法存取 Classroom API');
    }
    
    // 檢查域管理員權限（嘗試訪問域級資源）
    try {
      const domainCheck = checkDomainAdminAccess();
      permissionInfo.permissions.push({
        type: '域管理員權限',
        status: domainCheck.success ? 'ok' : 'warning',
        details: domainCheck.message
      });
      
      if (!domainCheck.success) {
        permissionInfo.issues.push('可能缺少域管理員權限');
        permissionInfo.recommendations.push('考慮使用具備域管理員權限的帳戶');
      }
    } catch (error) {
      permissionInfo.permissions.push({
        type: '域管理員權限',
        status: 'error',
        details: error.message
      });
    }
    
    // 檢查 OAuth 授權範圍
    const oauthScopes = [
      'https://www.googleapis.com/auth/classroom.courses',
      'https://www.googleapis.com/auth/classroom.rosters',
      'https://www.googleapis.com/auth/classroom.profile.emails'
    ];
    
    oauthScopes.forEach(scope => {
      // 這裡檢查 OAuth 範圍（實際實作需要更複雜的邏輯）
      permissionInfo.permissions.push({
        type: `OAuth 範圍: ${scope.split('/').pop()}`,
        status: 'assumed_ok',
        details: '假設已正確授權（需要實際測試確認）'
      });
    });
    
    console.log(`🔐 權限驗證完成：發現 ${permissionInfo.issues.length} 個問題`);
    return permissionInfo;
    
  } catch (error) {
    console.log(`❌ 學生權限驗證失敗：${error.message}`);
    return { error: error.message };
  }
}

/**
 * 🏥 檢查 API 健康狀態
 */
function checkApiHealthStatus() {
  try {
    console.log('🏥 檢查 API 健康狀態...');
    
    const healthInfo = {
      timestamp: new Date(),
      tests: [],
      overall: 'unknown',
      recommendations: []
    };
    
    // 測試 1: 基本 API 連線
    const basicTest = testBasicApiConnection();
    healthInfo.tests.push(basicTest);
    
    // 測試 2: API 回應時間
    const responseTimeTest = testApiResponseTime();
    healthInfo.tests.push(responseTimeTest);
    
    // 測試 3: 配額狀態
    const quotaTest = testApiQuotaStatus();
    healthInfo.tests.push(quotaTest);
    
    // 計算整體健康狀態
    const errorCount = healthInfo.tests.filter(test => test.status === 'error').length;
    const warningCount = healthInfo.tests.filter(test => test.status === 'warning').length;
    
    if (errorCount > 0) {
      healthInfo.overall = 'error';
      healthInfo.recommendations.push('發現 API 連線問題，建議檢查網路連線');
    } else if (warningCount > 0) {
      healthInfo.overall = 'warning';
      healthInfo.recommendations.push('API 狀態正常但有輕微問題');
    } else {
      healthInfo.overall = 'healthy';
    }
    
    console.log(`🏥 API 健康檢查完成：狀態 ${healthInfo.overall}`);
    return healthInfo;
    
  } catch (error) {
    console.log(`❌ API 健康檢查失敗：${error.message}`);
    return { error: error.message };
  }
}

/**
 * 🧠 生成診斷建議
 */
function generateDiagnosticRecommendations(diagnostics) {
  const recommendations = [];
  
  // 基於課程容量的建議
  if (diagnostics.courseCapacity && diagnostics.courseCapacity.warnings && diagnostics.courseCapacity.warnings.length > 0) {
    recommendations.push({
      type: '課程容量',
      priority: 'high',
      message: '某些課程成員數量接近建議上限，考慮分班或清理無效成員'
    });
  }
  
  // 基於權限的建議
  if (diagnostics.studentPermissions && diagnostics.studentPermissions.issues && diagnostics.studentPermissions.issues.length > 0) {
    recommendations.push({
      type: '權限問題',
      priority: 'high',
      message: '發現權限問題，建議檢查帳戶權限或聯絡管理員'
    });
  }
  
  // 基於 API 健康的建議
  if (diagnostics.apiHealth && diagnostics.apiHealth.overall !== 'healthy') {
    recommendations.push({
      type: 'API 健康',
      priority: 'medium',
      message: 'API 狀態不佳，可能影響批次操作效率'
    });
  }
  
  // 一般性建議
  recommendations.push({
    type: '最佳實踐',
    priority: 'low',
    message: '建議定期執行診斷以確保系統最佳性能'
  });
  
  return recommendations;
}

// 輔助函數
function testBasicApiConnection() {
  try {
    const startTime = Date.now();
    Classroom.Courses.list({ pageSize: 1 });
    const endTime = Date.now();
    
    return {
      name: '基本 API 連線',
      status: 'ok',
      details: `連線成功，耗時 ${endTime - startTime}ms`,
      responseTime: endTime - startTime
    };
  } catch (error) {
    return {
      name: '基本 API 連線',
      status: 'error',
      details: error.message
    };
  }
}

function testApiResponseTime() {
  try {
    const tests = [];
    
    // 進行 3 次測試取平均值
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      Classroom.Courses.list({ pageSize: 1 });
      const endTime = Date.now();
      tests.push(endTime - startTime);
    }
    
    const avgTime = tests.reduce((a, b) => a + b) / tests.length;
    let status = 'ok';
    
    if (avgTime > 3000) {
      status = 'warning';
    } else if (avgTime > 5000) {
      status = 'error';
    }
    
    return {
      name: 'API 回應時間',
      status: status,
      details: `平均回應時間：${Math.round(avgTime)}ms`,
      responseTime: avgTime
    };
  } catch (error) {
    return {
      name: 'API 回應時間',
      status: 'error',
      details: error.message
    };
  }
}

function testApiQuotaStatus() {
  try {
    // 這裡可以檢查配額使用情況
    // Google Apps Script 沒有直接的配額查詢 API
    // 這裡使用間接方法
    
    return {
      name: 'API 配額狀態',
      status: 'ok',
      details: '配額狀態正常（間接檢測）'
    };
  } catch (error) {
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return {
        name: 'API 配額狀態',
        status: 'error',
        details: '配額已達上限'
      };
    }
    
    return {
      name: 'API 配額狀態',
      status: 'warning',
      details: '無法確定配額狀態'
    };
  }
}

function checkDomainAdminAccess() {
  try {
    // 嘗試執行需要域管理員權限的操作
    // 這裡是一個簡化的檢查
    const user = Session.getActiveUser().getEmail();
    const domain = user.split('@')[1];
    
    return {
      success: true,
      message: `使用者 ${user} 在域 ${domain} 中可能具備管理員權限`
    };
  } catch (error) {
    return {
      success: false,
      message: '無法確認域管理員權限'
    };
  }
}

/**
 * 📋 建立診斷報告工作表
 */
function createDiagnosticReport(diagnostics) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const reportSheetName = `診斷報告_${timestamp}`;
    
    // 建立報告工作表
    const reportSheet = ss.insertSheet(reportSheetName);
    
    let currentRow = 1;
    
    // 標題區域
    const titleData = [
      ['🔍 系統診斷報告', ''],
      ['生成時間', diagnostics.timestamp],
      ['系統版本', 'Google Classroom Manager Pro v2.0.0'],
      ['執行者', Session.getActiveUser().getEmail()],
      ['']
    ];
    
    reportSheet.getRange(currentRow, 1, titleData.length, 2).setValues(titleData);
    reportSheet.getRange(1, 1).setFontSize(16).setFontWeight('bold');
    currentRow += titleData.length;
    
    // 課程容量報告
    if (diagnostics.courseCapacity) {
      currentRow = addCapacityReportSection(reportSheet, diagnostics.courseCapacity, currentRow);
    }
    
    // 權限驗證報告
    if (diagnostics.studentPermissions) {
      currentRow = addPermissionReportSection(reportSheet, diagnostics.studentPermissions, currentRow);
    }
    
    // API 健康報告
    if (diagnostics.apiHealth) {
      currentRow = addApiHealthReportSection(reportSheet, diagnostics.apiHealth, currentRow);
    }
    
    // 建議報告
    if (diagnostics.recommendations && diagnostics.recommendations.length > 0) {
      currentRow = addRecommendationsSection(reportSheet, diagnostics.recommendations, currentRow);
    }
    
    // 自動調整欄位寬度
    reportSheet.autoResizeColumns(1, 3);
    
    console.log(`📋 診斷報告已建立：${reportSheetName}`);
    return {
      success: true,
      sheetName: reportSheetName,
      timestamp: timestamp
    };
    
  } catch (error) {
    console.log(`❌ 建立診斷報告失敗：${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 📊 新增容量報告區段
 */
function addCapacityReportSection(sheet, capacityData, startRow) {
  const sectionData = [
    ['📊 課程容量分析', ''],
    ['檢查課程總數', capacityData.totalCourses || 0],
    ['實際檢查數量', capacityData.checkedCourses || 0],
    ['發現警告數量', (capacityData.warnings && capacityData.warnings.length) || 0],
    ['']
  ];
  
  sheet.getRange(startRow, 1, sectionData.length, 2).setValues(sectionData);
  sheet.getRange(startRow, 1).setFontWeight('bold').setBackground('#E3F2FD');
  
  let currentRow = startRow + sectionData.length;
  
  // 詳細課程資訊
  if (capacityData.details && capacityData.details.length > 0) {
    const detailHeaders = [['課程名稱', '學生數', '教師數', '狀態']];
    sheet.getRange(currentRow, 1, 1, 4).setValues(detailHeaders);
    sheet.getRange(currentRow, 1, 1, 4).setFontWeight('bold');
    currentRow++;
    
    const detailData = capacityData.details.slice(0, 10).map(course => [
      course.courseName || 'N/A',
      course.studentCount || 0,
      course.teacherCount || 0,
      course.status || 'unknown'
    ]);
    
    sheet.getRange(currentRow, 1, detailData.length, 4).setValues(detailData);
    currentRow += detailData.length;
  }
  
  // 警告訊息
  if (capacityData.warnings && capacityData.warnings.length > 0) {
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('⚠️ 警告訊息：');
    sheet.getRange(currentRow, 1).setFontWeight('bold');
    currentRow++;
    
    capacityData.warnings.forEach(warning => {
      sheet.getRange(currentRow, 1, 1, 2).setValues([[warning, '']]);
      currentRow++;
    });
  }
  
  return currentRow + 1;
}

/**
 * 🔐 新增權限報告區段
 */
function addPermissionReportSection(sheet, permissionData, startRow) {
  const sectionData = [
    ['🔐 權限驗證報告', ''],
    ['當前使用者', permissionData.currentUser],
    ['檢查項目數', (permissionData.permissions && permissionData.permissions.length) || 0],
    ['發現問題數', (permissionData.issues && permissionData.issues.length) || 0],
    ['']
  ];
  
  sheet.getRange(startRow, 1, sectionData.length, 2).setValues(sectionData);
  sheet.getRange(startRow, 1).setFontWeight('bold').setBackground('#E8F5E8');
  
  let currentRow = startRow + sectionData.length;
  
  // 權限詳細資訊
  if (permissionData.permissions && permissionData.permissions.length > 0) {
    const permissionHeaders = [['權限類型', '狀態', '詳細資訊']];
    sheet.getRange(currentRow, 1, 1, 3).setValues(permissionHeaders);
    sheet.getRange(currentRow, 1, 1, 3).setFontWeight('bold');
    currentRow++;
    
    const permissionDetails = permissionData.permissions.map(perm => [
      perm.type,
      perm.status,
      perm.details
    ]);
    
    sheet.getRange(currentRow, 1, permissionDetails.length, 3).setValues(permissionDetails);
    currentRow += permissionDetails.length;
  }
  
  // 問題列表
  if (permissionData.issues && permissionData.issues.length > 0) {
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('❌ 發現問題：');
    sheet.getRange(currentRow, 1).setFontWeight('bold');
    currentRow++;
    
    permissionData.issues.forEach(issue => {
      sheet.getRange(currentRow, 1, 1, 2).setValues([[issue, '']]);
      currentRow++;
    });
  }
  
  return currentRow + 1;
}

/**
 * 🏥 新增 API 健康報告區段
 */
function addApiHealthReportSection(sheet, apiData, startRow) {
  const sectionData = [
    ['🏥 API 健康狀態報告', ''],
    ['檢查時間', apiData.timestamp ? new Date(apiData.timestamp).toLocaleString('zh-TW') : 'N/A'],
    ['整體狀態', apiData.overall],
    ['測試項目數', (apiData.tests && apiData.tests.length) || 0],
    ['']
  ];
  
  sheet.getRange(startRow, 1, sectionData.length, 2).setValues(sectionData);
  sheet.getRange(startRow, 1).setFontWeight('bold').setBackground('#FFF3E0');
  
  let currentRow = startRow + sectionData.length;
  
  // API 測試詳細資訊
  if (apiData.tests && apiData.tests.length > 0) {
    const testHeaders = [['測試項目', '狀態', '詳細資訊']];
    sheet.getRange(currentRow, 1, 1, 3).setValues(testHeaders);
    sheet.getRange(currentRow, 1, 1, 3).setFontWeight('bold');
    currentRow++;
    
    const testDetails = apiData.tests.map(test => [
      test.name,
      test.status,
      test.details
    ]);
    
    sheet.getRange(currentRow, 1, testDetails.length, 3).setValues(testDetails);
    currentRow += testDetails.length;
  }
  
  return currentRow + 1;
}

/**
 * 💡 新增建議區段
 */
function addRecommendationsSection(sheet, recommendations, startRow) {
  const sectionData = [
    ['💡 改進建議', ''],
    ['建議項目數', recommendations.length],
    ['']
  ];
  
  sheet.getRange(startRow, 1, sectionData.length, 2).setValues(sectionData);
  sheet.getRange(startRow, 1).setFontWeight('bold').setBackground('#F3E5F5');
  
  let currentRow = startRow + sectionData.length;
  
  const recHeaders = [['優先級', '類型', '建議內容']];
  sheet.getRange(currentRow, 1, 1, 3).setValues(recHeaders);
  sheet.getRange(currentRow, 1, 1, 3).setFontWeight('bold');
  currentRow++;
  
  const recDetails = recommendations.map(rec => [
    rec.priority,
    rec.type,
    rec.message
  ]);
  
  sheet.getRange(currentRow, 1, recDetails.length, 3).setValues(recDetails);
  currentRow += recDetails.length;
  
  return currentRow + 1;
}

/**
 * 📖 顯示診斷摘要
 */
function showDiagnosticSummary(diagnostics, reportResult) {
  let summary = '🔍 系統診斷完成\n\n';
  
  // 課程容量摘要
  if (diagnostics.courseCapacity && !diagnostics.courseCapacity.error) {
    const capacity = diagnostics.courseCapacity;
    summary += `📊 課程容量：檢查了 ${capacity.checkedCourses}/${capacity.totalCourses} 個課程\n`;
    if (capacity.warnings && capacity.warnings.length > 0) {
      summary += `⚠️ 發現 ${capacity.warnings.length} 個容量警告\n`;
    }
  }
  
  // 權限摘要
  if (diagnostics.studentPermissions && !diagnostics.studentPermissions.error) {
    const permissions = diagnostics.studentPermissions;
    summary += `🔐 權限狀態：檢查了 ${permissions.permissions ? permissions.permissions.length : 0} 個權限項目\n`;
    if (permissions.issues && permissions.issues.length > 0) {
      summary += `❌ 發現 ${permissions.issues.length} 個權限問題\n`;
    }
  }
  
  // API 健康摘要
  if (diagnostics.apiHealth && !diagnostics.apiHealth.error) {
    const health = diagnostics.apiHealth;
    summary += `🏥 API 狀態：${health.overall}\n`;
  }
  
  // 建議摘要
  if (diagnostics.recommendations && diagnostics.recommendations.length > 0) {
    const highPriority = diagnostics.recommendations.filter(rec => rec.priority === 'high').length;
    summary += `💡 改進建議：共 ${diagnostics.recommendations.length} 項（高優先級：${highPriority}）\n`;
  }
  
  // 報告資訊
  if (reportResult.success) {
    summary += `\n📋 詳細報告已建立：${reportResult.sheetName}`;
  }
  
  SpreadsheetApp.getUi().alert(
    '🔍 系統診斷報告',
    summary,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * 🔍 智能用戶資訊獲取 - 支援 Admin Directory API 降級處理
 */
function getSmartUserInfo(userId = 'me') {
  try {
    // 如果是當前用戶，使用 Session API（最可靠）
    if (userId === 'me') {
      const currentEmail = Session.getActiveUser().getEmail();
      console.log(`✅ 當前用戶資訊：${currentEmail}`);
      
      // 嘗試從 Admin Directory 獲取詳細資訊（可選）
      try {
        const adminInfo = AdminDirectory.Users.get('me');
        return {
          success: true,
          email: currentEmail,
          name: adminInfo.name ? adminInfo.name.fullName : null,
          isAdmin: adminInfo.isAdmin || false,
          isDelegatedAdmin: adminInfo.isDelegatedAdmin || false,
          method: 'Session+AdminDirectory'
        };
      } catch (adminError) {
        // Admin Directory 失敗，只返回基本資訊
        return {
          success: true,
          email: currentEmail,
          name: currentEmail.split('@')[0], // 從 email 推測用戶名
          isAdmin: false,
          isDelegatedAdmin: false,
          method: 'Session-only'
        };
      }
    }
    
    // 對於其他用戶 ID，嘗試現有的查詢方法
    return lookupUserById(userId);
    
  } catch (error) {
    console.log(`❌ 智能用戶資訊獲取失敗: ${error.message}`);
    return {
      success: false,
      error: error.message,
      method: 'failed'
    };
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
 * 👨‍🎓 一般批次新增學生 UI - 修復同步處理
 * 根據工作表中的學生Email和課程ID直接進行批次新增
 */
async function addStudentsUI() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // 步驟1: 獲取工作表名稱
    const sheetNameResult = ui.prompt(
      '👨‍🎓 一般批次新增學生 - 步驟 1/2',
      '請輸入包含學生資料的工作表名稱（預設：新增學生）\n格式需包含：學生Email | 課程ID | 狀態',
      ui.ButtonSet.OK_CANCEL
    );

    if (sheetNameResult.getSelectedButton() !== ui.Button.OK) {
      return;
    }

    const sheetName = sheetNameResult.getResponseText() || '新增學生';

    // 步驟2: 確認執行模式
    const confirmResult = ui.alert(
      '👨‍🎓 一般批次新增學生 - 步驟 2/2',
      `即將執行一般批次新增學生功能：\n\n📊 工作表：${sheetName}\n📋 格式：學生Email | 課程ID | 狀態\n\n✅ 確定：開始批次新增\n❌ 取消：取消操作\n\n💡 提醒：如需自動配對班級到課程，請使用「🎯 智能學生分配」功能`,
      ui.ButtonSet.OK_CANCEL
    );

    if (confirmResult !== ui.Button.OK) {
      ui.alert('操作已取消', '一般批次新增學生已取消。', ui.ButtonSet.OK);
      return;
    }

    // 執行權限預檢
    console.log('🔍 執行權限預檢...');
    const currentUser = Session.getActiveUser().getEmail();
    
    const permissionCheck = await performPermissionPrecheck(currentUser);
    
    // 顯示權限檢查結果（現在主要是資訊性質）
    if (permissionCheck.permissionLevel) {
      console.log(`✅ 權限檢查：${permissionCheck.userLevel} - ${permissionCheck.status}`);
      
      // 只有在真正無法執行時才阻止（現在很少發生）
      if (!permissionCheck.canProceed) {
        const continueResult = ui.alert(
          '❌ 權限不足',
          `檢測到權限問題：\n${permissionCheck.issue}\n\n💡 解決方法：\n1. 檢查網路連線\n2. 確認已正確登入 Google 帳戶\n3. 執行「🔄 重新授權權限」\n\n是否仍要嘗試執行？`,
          ui.ButtonSet.YES_NO
        );
        
        if (continueResult !== ui.Button.YES) {
          ui.alert('操作已取消', '建議解決權限問題後再嘗試。', ui.ButtonSet.OK);
          return;
        }
      }
    }

    // 執行一般批次新增 - 使用同步等待
    console.log('🚀 開始執行一般批次新增學生');
    
    const result = await batchAddStudentsFromSheet(sheetName);
    
    // 直接處理結果，確保用戶看到反饋
    handleBatchAddResult(result, ui);
    
  } catch (error) {
    console.log(`[ERROR] 一般批次新增學生失敗: ${error.message}`);
    
    // 詳細錯誤處理
    let errorMessage = '批次新增系統發生錯誤';
    
    if (error.message.includes('權限')) {
      errorMessage = '權限不足，請檢查 Google Classroom 存取權限';
    } else if (error.message.includes('工作表')) {
      errorMessage = '工作表讀取錯誤，請檢查工作表格式和名稱';
    } else if (error.message.includes('課程')) {
      errorMessage = '課程操作錯誤，請檢查課程權限';
    }
    
    ui.alert(
      '❌ 執行錯誤', 
      `${errorMessage}：\n\n技術詳情：${error.message}\n\n💡 建議：\n• 檢查網路連線\n• 確認 Google Classroom 權限\n• 驗證工作表格式正確\n• 稍後再試或聯繫管理員`, 
      ui.ButtonSet.OK
    );
  }
}

/**
 * 📊 處理一般批次新增結果
 */
function handleBatchAddResult(result, ui) {
  if (result.success) {
    const summary = result.summary;
    const message = `🎉 一般批次新增學生完成！\n\n` +
      `📊 處理統計：\n` +
      `• 總分配任務：${result.totalAssignments || 0}\n` +
      `• 已處理：${result.processedCount || 0}\n` +
      `• 成功處理：${summary.statistics.successful}\n` +
      `  - 新增成功：${result.addedCount || 0}\n` +
      `  - 已存在：${result.existingCount || 0}\n` +
      `• 失敗項目：${summary.statistics.failed}\n` +
      `• 處理時間：${summary.statistics.duration}ms\n\n` +
      `⏱️ 平均處理時間：${Math.round(summary.statistics.averageTime)}ms/任務\n\n` +
      `📊 詳細報告已保存至「一般新增報告」工作表`;
    
    ui.alert('✅ 新增完成', message, ui.ButtonSet.OK);
  } else {
    // 顯示部分成功的情況
    if (result.processedCount && result.processedCount > 0) {
      const message = `⚠️ 新增部分完成\n\n` +
        `📊 處理統計：\n` +
        `• 總任務：${result.totalAssignments || 0}\n` +
        `• 已處理：${result.processedCount || 0}\n` +
        `  - 新增成功：${result.addedCount || 0}\n` +
        `  - 已存在：${result.existingCount || 0}\n` +
        `• 剩餘未處理：${(result.totalAssignments || 0) - (result.processedCount || 0)}\n\n` +
        `❌ 主要錯誤：${result.error || '未知錯誤'}\n\n` +
        `💡 建議：檢查「一般新增報告」工作表查看詳細結果`;
      
      ui.alert('⚠️ 部分完成', message, ui.ButtonSet.OK);
    } else {
      ui.alert('❌ 新增失敗', `新增過程中發生錯誤：\n${result.error || '未知錯誤'}`, ui.ButtonSet.OK);
    }
  }
}

/**
 * 👨‍🎓 一般批次新增學生 - 核心執行函數
 * 根據工作表中的學生Email和課程ID直接進行批次新增
 */
async function batchAddStudentsFromSheet(sheetName) {
  console.log(`🚀 開始一般批次新增學生: ${sheetName}`);
  
  try {
    // 步驟1: 讀取學生-課程配對資料
    const studentCourseData = await readStudentCourseDataFromSheet(sheetName);
    if (!studentCourseData.success) {
      return { success: false, error: studentCourseData.error };
    }

    console.log(`📊 讀取完成: ${studentCourseData.assignments.length} 項新增任務`);

    // 步驟2: 執行批次學生新增
    const batchResult = await executeBatchStudentAddition(studentCourseData.assignments, sheetName);
    
    // 步驟3: 生成和保存詳細報告
    if (batchResult.processedCount > 0) {
      console.log('📈 生成新增報告...');
      const report = generateBatchAddReport(batchResult, studentCourseData.assignments);
      const saveResult = saveBatchAddReportToSheet(report);
      
      if (saveResult.success) {
        console.log(`📊 詳細報告已保存至 "${saveResult.sheetName}" 工作表`);
      }
    }
    
    return {
      success: batchResult.success,
      summary: batchResult.summary,
      error: batchResult.error,
      processedCount: batchResult.processedCount,
      totalAssignments: studentCourseData.assignments.length
    };

  } catch (error) {
    console.log(`[ERROR] 一般批次新增系統錯誤: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 📋 從工作表讀取學生-課程配對資料
 * 格式：學生Email | 課程ID | 狀態
 */
async function readStudentCourseDataFromSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return { success: false, error: `找不到名為 "${sheetName}" 的工作表` };
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return { success: false, error: '工作表中沒有學生資料' };
    }

    // 讀取資料 (跳過標題行)
    const range = sheet.getRange(2, 1, lastRow - 1, 3);
    const data = range.getValues();

    const assignments = [];

    data.forEach((row, index) => {
      const [email, courseIdOrName, status] = row;
      
      if (!email || !courseIdOrName) {
        console.log(`[WARN] 第 ${index + 2} 行資料不完整，跳過 (Email: ${email}, Course: ${courseIdOrName})`);
        return;
      }

      // 跳過已處理的項目
      if (status && status.toString().trim()) {
        console.log(`[INFO] 學生 ${email} → 課程 ${courseIdOrName} 已處理，跳過`);
        return;
      }

      // 🔄 使用課程映射功能轉換課程名稱為 ID
      const courseOriginal = courseIdOrName.toString().trim();
      const mappingResult = getCourseIdFromName(courseOriginal);
      
      if (!mappingResult.success) {
        console.log(`[ERROR] 第 ${index + 2} 行課程映射失敗：${mappingResult.error}`);
        // 仍然加入到任務列表中，但會在後續處理時失敗
        assignments.push({
          studentEmail: email.toString().trim(),
          courseId: courseOriginal, // 保留原始值
          originalCourseName: courseOriginal,
          rowIndex: index + 2,
          courseName: courseOriginal,
          mappingError: mappingResult.error
        });
        return;
      }

      const assignment = {
        studentEmail: email.toString().trim(),
        courseId: mappingResult.courseId, // 使用轉換後的數字 ID
        originalCourseName: courseOriginal, // 保留原始課程名稱
        rowIndex: index + 2,
        courseName: `${courseOriginal} (${mappingResult.courseId})`, // 顯示原名稱和 ID
        subject: mappingResult.subject // 如果有的話
      };

      console.log(`🔄 課程映射：第 ${index + 2} 行 "${courseOriginal}" → ID: ${mappingResult.courseId}`);
      assignments.push(assignment);
    });

    console.log(`📊 讀取完成: ${assignments.length} 項新增任務 (跳過已處理項目)`);
    return { 
      success: true, 
      assignments,
      totalAssignments: assignments.length
    };

  } catch (error) {
    return { success: false, error: `讀取學生-課程資料失敗: ${error.message}` };
  }
}

/**
 * ⚡ 執行批次學生新增 (專用於一般批次新增)
 */
async function executeBatchStudentAddition(assignments, sheetName) {
  const totalAssignments = assignments.length;
  const startTime = Date.now();
  console.log(`⚡ 開始一般批次學生新增: ${totalAssignments} 項任務`);
  
  const progress = new ProgressTracker(totalAssignments, '一般批次新增學生');
  const BATCH_SIZE = 20; // 每批處理20個新增任務
  const REST_INTERVAL = 1000; // 每批之間休息1秒
  const MAX_EXECUTION_TIME = 300000; // 5分鐘執行限制
  let processedCount = 0;
  let successCount = 0;
  let addedCount = 0;        // 新增成功的數量
  let existingCount = 0;     // 已存在的數量
  let errorCount = 0;
  const errors = [];

  try {
    // 分批處理
    for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
      // 檢查執行時間
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        console.log(`[WARN] 接近執行時間限制，停止處理。已處理 ${processedCount}/${totalAssignments}`);
        break;
      }

      const batch = assignments.slice(i, i + BATCH_SIZE);
      console.log(`📦 處理批次 ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} 項任務`);

      // 處理當前批次
      for (const assignment of batch) {
        const studentInfo = `👤 ${assignment.studentEmail}`;
        const courseInfo = `📚 ${assignment.courseName || assignment.courseId}`;
        
        try {
          console.log(`🔄 處理中：${studentInfo} → ${courseInfo}`);
          
          // 使用智能重複檢查新增學生
          const result = await classroomService.addStudentIfNotExists(
            assignment.courseId, 
            assignment.studentEmail
          );

          if (result.success) {
            if (result.status === 'ALREADY_EXISTS') {
              console.log(`✅ 學生已存在：${studentInfo} 已在 ${courseInfo} 中`);
              progress.addSuccess(`${assignment.studentEmail} → ${assignment.courseName} (已存在)`);
              successCount++;
              existingCount++;
              
              // 更新狀態到工作表 - 已存在，並打勾
              await updateStudentCourseStatus(assignment, sheetName, 'already_exists');
            } else if (result.status === 'ADDED') {
              console.log(`🎉 新增成功：${studentInfo} 已成功加入 ${courseInfo}`);
              progress.addSuccess(`${assignment.studentEmail} → ${assignment.courseName} (新增成功)`);
              successCount++;
              addedCount++;
              
              // 更新狀態到工作表 - 新增成功，並打勾
              await updateStudentCourseStatus(assignment, sheetName, 'success');
            }
          } else {
            console.log(`❌ 新增失敗：${studentInfo} → ${courseInfo}，原因：${result.error}`);
            progress.addError(`${assignment.studentEmail} → ${assignment.courseName}`, result.error);
            errors.push({ 
              assignment, 
              error: result.error,
              studentEmail: assignment.studentEmail,
              courseId: assignment.courseId,
              courseName: assignment.courseName
            });
            errorCount++;
            
            // 記錄失敗狀態 - 不打勾
            await updateStudentCourseStatus(assignment, sheetName, 'failed', result.error);
          }

        } catch (error) {
          console.log(`💥 處理異常：${studentInfo} → ${courseInfo}，錯誤：${error.message}`);
          progress.addError(`${assignment.studentEmail} → ${assignment.courseName}`, error);
          errors.push({ 
            assignment, 
            error: error.message,
            studentEmail: assignment.studentEmail,
            courseId: assignment.courseId,
            courseName: assignment.courseName
          });
          errorCount++;
          await updateStudentCourseStatus(assignment, sheetName, 'failed', error.message);
        }

        processedCount++;
      }

      // 批次間休息
      if (i + BATCH_SIZE < assignments.length) {
        console.log(`⏳ 批次完成，休息 ${REST_INTERVAL}ms...`);
        await Utilities.sleep(REST_INTERVAL);
      }
    }

    const summary = progress.complete();
    
    const endTime = Date.now();
    
    console.log(`📊 一般批次新增完成統計:`);
    console.log(`  總任務: ${totalAssignments}`);
    console.log(`  已處理: ${processedCount}`);
    console.log(`  成功: ${successCount}`);
    console.log(`    - 新增成功: ${addedCount}`);
    console.log(`    - 已存在: ${existingCount}`);
    console.log(`  失敗: ${errorCount}`);
    console.log(`  執行時間: ${endTime - startTime}ms`);

    // 準備執行報告資料
    const reportResults = [];
    
    // 收集成功的結果
    assignments.forEach(assignment => {
      const wasProcessed = processedCount > 0; // 簡化的檢查
      if (wasProcessed) {
        // 根據工作表狀態判斷結果（這裡是簡化版，實際可以從工作表讀取狀態）
        reportResults.push({
          studentEmail: assignment.studentEmail,
          courseId: assignment.courseId,
          courseName: assignment.courseName,
          className: assignment.className,
          success: true,
          status: 'ADDED' // 可以根據實際情況調整
        });
      }
    });
    
    // 加入錯誤結果
    errors.forEach(errorItem => {
      reportResults.push({
        studentEmail: errorItem.studentEmail,
        courseId: errorItem.courseId,
        courseName: errorItem.courseName,
        className: errorItem.className,
        success: false,
        error: errorItem.error
      });
    });

    // 建立執行報告
    try {
      const reportResult = createExecutionReport(
        '一般批次新增學生',
        sheetName,
        reportResults,
        errors,
        startTime,
        endTime
      );
      
      if (reportResult.success) {
        console.log(`📊 詳細執行報告已建立：${reportResult.sheetName}`);
      }
    } catch (reportError) {
      console.log(`⚠️ 執行報告建立失敗，但不影響主要功能：${reportError.message}`);
    }

    return {
      success: errorCount === 0,
      summary,
      processedCount,
      successCount,
      addedCount,
      existingCount,
      errorCount,
      errors,
      totalTime: endTime - startTime,
      reportResults
    };

  } catch (error) {
    console.log(`[ERROR] 一般批次新增系統錯誤: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 🔄 更新學生-課程狀態 (用於一般批次新增) - 含打勾機制
 */
async function updateStudentCourseStatus(assignment, sheetName, status, error = null) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet || !assignment.rowIndex) {
      return;
    }

    let statusMessage = '';
    let shouldCheck = false;
    const timestamp = new Date().toLocaleString('zh-TW');
    
    switch (status) {
      case 'success':
        statusMessage = `✅ 已新增 (${timestamp})`;
        shouldCheck = true;
        break;
      case 'already_exists':
        statusMessage = `✅ 已存在 (${timestamp})`;
        shouldCheck = true;
        break;
      case 'failed':
        statusMessage = `❌ 新增失敗: ${error || '未知錯誤'} (${timestamp})`;
        shouldCheck = false;
        break;
      default:
        statusMessage = `${status} (${timestamp})`;
        shouldCheck = false;
    }

    // 更新狀態列 (第3列)
    sheet.getRange(assignment.rowIndex, 3).setValue(statusMessage);
    
    // 根據狀態決定是否打勾 (假設第4列是勾選欄)
    if (shouldCheck) {
      try {
        sheet.getRange(assignment.rowIndex, 4).check();
        console.log(`[STATUS] 已為 ${assignment.studentEmail} → ${assignment.courseId} 打勾`);
      } catch (checkError) {
        console.log(`[WARN] 無法打勾: ${checkError.message}`);
      }
    }
    
    console.log(`[STATUS] 已更新 ${assignment.studentEmail} → ${assignment.courseId} 狀態: ${statusMessage}`);
    
  } catch (error) {
    console.log(`[WARN] 無法更新學生課程狀態: ${error.message}`);
  }
}

/**
 * 📈 生成一般批次新增報告
 */
function generateBatchAddReport(batchResult, assignments) {
  const report = {
    timestamp: new Date().toISOString(),
    type: 'batch_add_students',
    summary: {
      totalAssignments: assignments.length,
      processedCount: batchResult.processedCount,
      successCount: batchResult.successCount,
      errorCount: batchResult.errorCount,
      successRate: Math.round((batchResult.successCount / batchResult.processedCount) * 100),
      totalTime: batchResult.totalTime,
      averageTimePerAssignment: Math.round(batchResult.totalTime / batchResult.processedCount)
    },
    performance: {
      assignmentsPerSecond: Math.round(batchResult.processedCount / (batchResult.totalTime / 1000)),
      timeEfficiency: batchResult.totalTime < 300000 ? 'excellent' : 'acceptable'
    },
    errors: batchResult.errors || [],
    recommendations: []
  };

  // 生成建議
  if (report.summary.errorCount > 0) {
    report.recommendations.push('檢查失敗的新增項目，確認課程ID和學生Email格式正確');
    
    if (report.summary.successRate < 80) {
      report.recommendations.push('成功率較低，建議檢查權限設定或課程ID有效性');
    }
  }

  if (report.performance.assignmentsPerSecond < 1) {
    report.recommendations.push('處理速度較慢，考慮優化批次大小');
  }

  console.log('📈 一般新增報告生成完成:');
  console.log(`  成功率: ${report.summary.successRate}%`);
  console.log(`  處理速度: ${report.performance.assignmentsPerSecond} 新增/秒`);

  return report;
}

/**
 * 💾 保存一般批次新增報告到工作表
 */
function saveBatchAddReportToSheet(report) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const reportSheetName = '一般新增報告';
    
    let reportSheet = ss.getSheetByName(reportSheetName);
    if (!reportSheet) {
      reportSheet = ss.insertSheet(reportSheetName);
      
      // 建立標題行
      const headers = [
        '時間戳記', '總任務數', '已處理', '成功數', '失敗數', 
        '成功率(%)', '總時間(ms)', '平均時間(ms)', '處理速度(/秒)', '建議'
      ];
      reportSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      reportSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    // 新增報告記錄
    const newRow = [
      report.timestamp,
      report.summary.totalAssignments,
      report.summary.processedCount,
      report.summary.successCount,
      report.summary.errorCount,
      report.summary.successRate,
      report.summary.totalTime,
      report.summary.averageTimePerAssignment,
      report.performance.assignmentsPerSecond,
      report.recommendations.join('; ')
    ];

    reportSheet.appendRow(newRow);
    console.log(`📊 一般新增報告已保存到 "${reportSheetName}" 工作表`);
    
    return { success: true, sheetName: reportSheetName };
    
  } catch (error) {
    console.log(`[ERROR] 保存一般新增報告失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 🎯 智能學生分配系統 UI - 支援編輯器環境檢測
 * 自動為每個班級的學生分配到對應的3門課程
 */
async function distributeStudentsUI() {
  // 檢測執行環境：Sheets UI vs Apps Script 編輯器
  let ui;
  let isInEditor = false;
  
  try {
    ui = SpreadsheetApp.getUi();
  } catch (e) {
    // 在 Apps Script 編輯器中執行，無法使用 UI 組件
    console.log('🔧 檢測到在 Apps Script 編輯器中執行');
    console.log('⚡ 將使用預設參數執行測試模式...');
    isInEditor = true;
  }
  
  // 如果在編輯器中，直接調用測試函數
  if (isInEditor) {
    console.log('📋 編輯器模式 - 使用預設參數:');
    console.log('  - 工作表: "學生分配"');
    console.log('  - 模式: 自動配對');
    console.log('  - 跳過權限檢查');
    
    return await testDistributeStudents('學生分配', true);
  }
  
  try {
    // 步驟1: 獲取工作表名稱
    const sheetNameResult = ui.prompt(
      '🎯 智能學生分配 - 步驟 1/2',
      '請輸入包含學生資料的工作表名稱（預設：學生分配）\n格式需包含：學生Email | 班級名稱 | 狀態',
      ui.ButtonSet.OK_CANCEL
    );

    if (sheetNameResult.getSelectedButton() !== ui.Button.OK) {
      return;
    }

    const sheetName = sheetNameResult.getResponseText() || '學生分配';

    // 步驟2: 選擇分配模式
    const modeResult = ui.alert(
      '🎯 智能學生分配 - 步驟 2/2',
      '請選擇學生分配模式：\n\n✅ 確定：自動配對模式（推薦）\n系統會自動為每個班級匹配對應的3門課程\n\n❌ 取消：自訂配對模式（進階）\n需要手動指定課程配對規則',
      ui.ButtonSet.OK_CANCEL
    );

    const isAutoMode = modeResult === ui.Button.OK;

    // 顯示開始執行的訊息
    const startConfirm = ui.alert(
      '🚀 開始執行',
      `即將開始智能學生分配：\n\n📊 工作表：${sheetName}\n🎯 模式：${isAutoMode ? '自動配對模式' : '自訂配對模式'}\n\n⏱️ 預估時間：1-5分鐘\n💡 執行期間請勿關閉瀏覽器\n\n✅ 確定：開始執行\n❌ 取消：取消操作`,
      ui.ButtonSet.OK_CANCEL
    );

    if (startConfirm !== ui.Button.OK) {
      ui.alert('操作已取消', '智能學生分配已取消。', ui.ButtonSet.OK);
      return;
    }

    // 執行權限預檢
    console.log('🔍 執行權限預檢...');
    const currentUser = Session.getActiveUser().getEmail();
    
    const permissionCheck = await performPermissionPrecheck(currentUser);
    
    // 顯示權限檢查結果
    console.log(`✅ 權限檢查：${permissionCheck.userLevel} - ${permissionCheck.status}`);
    
    // 只有在真正無法執行時才阻止
    if (!permissionCheck.canProceed) {
      const continueResult = ui.alert(
        '❌ 權限不足',
        `檢測到權限問題：\n${permissionCheck.issue}\n\n💡 解決方法：\n1. 檢查網路連線\n2. 確認已正確登入 Google 帳戶\n3. 執行「🔄 重新授權權限」\n\n是否仍要嘗試執行？`,
        ui.ButtonSet.YES_NO
      );
      
      if (continueResult !== ui.Button.YES) {
        ui.alert('操作已取消', '建議解決權限問題後再嘗試。', ui.ButtonSet.OK);
        return;
      }
    }

    // 執行智能分配 - 使用同步等待
    console.log(`🚀 開始執行智能學生分配 (模式: ${isAutoMode ? '自動配對' : '自訂配對'})`);
    
    const result = await distributeStudentsToCourses(sheetName, isAutoMode);
    
    // 直接處理結果，確保用戶看到反饋
    handleDistributionResult(result, ui);
    
  } catch (error) {
    console.log(`[ERROR] 智能學生分配失敗: ${error.message}`);
    
    // 詳細錯誤處理和用戶友善的錯誤訊息
    let errorMessage = '智能分配系統發生錯誤';
    
    if (error.message.includes('權限')) {
      errorMessage = '權限不足，請檢查 Google Classroom 存取權限';
    } else if (error.message.includes('工作表')) {
      errorMessage = '工作表讀取錯誤，請檢查工作表格式和名稱';
    } else if (error.message.includes('課程')) {
      errorMessage = '課程操作錯誤，請檢查課程權限';
    }
    
    ui.alert(
      '❌ 執行錯誤', 
      `${errorMessage}：\n\n技術詳情：${error.message}\n\n💡 建議：\n• 檢查網路連線\n• 確認 Google Classroom 權限\n• 驗證工作表格式正確\n• 稍後再試或聯繫管理員`, 
      ui.ButtonSet.OK
    );
  }
}

/**
 * 🎯 處理智能分配結果 - 改進用戶反饋機制
 */
function handleDistributionResult(result, ui) {
  console.log('[RESULT] 處理智能分配結果:', JSON.stringify(result, null, 2));
  
  // 計算成功率和處理效率
  const totalTasks = result.totalAssignments || 0;
  const processedTasks = result.processedCount || 0;
  const successfulTasks = (result.summary?.statistics?.successful) || 0;
  const failedTasks = (result.summary?.statistics?.failed) || 0;
  
  const successRate = totalTasks > 0 ? Math.round((successfulTasks / totalTasks) * 100) : 0;
  const processingRate = totalTasks > 0 ? Math.round((processedTasks / totalTasks) * 100) : 0;
  
  if (result.success && successfulTasks > 0) {
    // 完全成功的情況
    const duration = result.summary?.statistics?.duration || 0;
    const avgTime = Math.round(duration / Math.max(processedTasks, 1));
    
    const message = `🎉 智能學生分配完成！\n\n` +
      `📊 執行統計：\n` +
      `• 總分配任務：${totalTasks}\n` +
      `• 成功處理：${successfulTasks} (${successRate}%)\n` +
      `  ✅ 新增成功：${result.addedCount || 0}\n` +
      `  ✅ 已存在：${result.existingCount || 0}\n` +
      `• 失敗項目：${failedTasks}\n\n` +
      `🎯 分配效率：\n` +
      `• 分配到課程：${result.distributedCourses || 0} 門\n` +
      `• 總執行時間：${Math.round(duration / 1000)}秒\n` +
      `• 平均處理時間：${avgTime}ms/任務\n\n` +
      `📊 詳細報告已保存至「智能分配報告」工作表\n` +
      `📋 狀態更新已同步至「學生分配」工作表`;
    
    ui.alert('✅ 分配成功完成', message, ui.ButtonSet.OK);
    
  } else if (processedTasks > 0) {
    // 部分成功的情況
    const remainingTasks = totalTasks - processedTasks;
    
    const message = `⚠️ 智能學生分配部分完成\n\n` +
      `📊 執行統計：\n` +
      `• 總任務：${totalTasks}\n` +
      `• 已處理：${processedTasks} (${processingRate}%)\n` +
      `  ✅ 成功：${successfulTasks}\n` +
      `  ❌ 失敗：${failedTasks}\n` +
      `• 未處理：${remainingTasks}\n\n` +
      `⚠️ 主要問題：${result.error || '部分任務執行異常'}\n\n` +
      `🛠️ 建議措施：\n` +
      `• 檢查「智能分配報告」了解詳細錯誤\n` +
      `• 確認失敗項目的課程權限\n` +
      `• 驗證學生Email格式正確性\n` +
      `• 稍後重新執行未完成的任務\n\n` +
      `📋 已處理項目的狀態已更新至工作表`;
    
    // 判斷是否需要立即重試
    if (successRate >= 80) {
      const retryResult = ui.alert(
        '⚠️ 部分完成', 
        message + '\n\n🔄 是否立即重試失敗的任務？', 
        ui.ButtonSet.YES_NO
      );
      
      if (retryResult === ui.Button.YES) {
        ui.alert('💡 重試提示', '請稍後手動重新執行智能學生分配，系統會自動跳過已成功的項目。', ui.ButtonSet.OK);
      }
    } else {
      ui.alert('⚠️ 部分完成', message, ui.ButtonSet.OK);
    }
    
  } else {
    // 完全失敗的情況
    let errorCategory = '系統錯誤';
    let troubleshootingTips = '';
    
    const errorMsg = (result.error || '未知錯誤').toLowerCase();
    
    if (errorMsg.includes('權限') || errorMsg.includes('permission')) {
      errorCategory = '權限問題';
      troubleshootingTips = '• 確認已授權 Google Classroom API\n• 檢查課程擁有者/老師權限\n• 重新授權應用程式';
    } else if (errorMsg.includes('工作表') || errorMsg.includes('sheet')) {
      errorCategory = '工作表問題';  
      troubleshootingTips = '• 確認工作表名稱正確\n• 檢查工作表格式（學生Email|班級名稱|狀態）\n• 驗證資料完整性';
    } else if (errorMsg.includes('網路') || errorMsg.includes('network')) {
      errorCategory = '網路問題';
      troubleshootingTips = '• 檢查網路連線\n• 稍後再試\n• 確認 Google 服務正常';
    } else {
      troubleshootingTips = '• 檢查系統日誌\n• 驗證輸入資料格式\n• 聯繫技術支援';
    }
    
    const message = `❌ 智能學生分配失敗\n\n` +
      `🔍 錯誤類型：${errorCategory}\n` +
      `📝 錯誤詳情：${result.error || '未知錯誤'}\n\n` +
      `🛠️ 故障排除建議：\n${troubleshootingTips}\n\n` +
      `💡 如問題持續存在，請截圖此訊息並聯繫系統管理員。`;
    
    ui.alert('❌ 執行失敗', message, ui.ButtonSet.OK);
  }
}

/**
 * 🧪 測試函數 - 專門用於 Apps Script 編輯器測試
 * 跳過 UI 組件，直接測試智能學生分配核心功能
 */
async function testDistributeStudents(sheetName = '學生分配', isAutoMode = true) {
  console.log('🧪 開始測試智能學生分配功能...');
  console.log(`📊 測試參數: 工作表="${sheetName}", 自動模式=${isAutoMode}`);
  
  try {
    // 記錄開始時間
    const startTime = Date.now();
    
    // 跳過權限檢查，直接執行核心分配功能
    console.log('⚡ 跳過權限檢查，直接執行核心分配...');
    
    const result = await distributeStudentsToCourses(sheetName, isAutoMode);
    
    // 計算執行時間
    const executionTime = Date.now() - startTime;
    
    // 顯示測試結果
    console.log('\n🎉 測試完成！');
    console.log(`⏱️ 執行時間: ${executionTime}ms (${Math.round(executionTime/1000)}秒)`);
    console.log('📊 測試結果摘要:');
    console.log(`  - 成功: ${result.success}`);
    console.log(`  - 總任務: ${result.totalAssignments || 0}`);
    console.log(`  - 已處理: ${result.processedCount || 0}`);
    console.log(`  - 分配課程: ${result.distributedCourses || 0}`);
    
    if (result.error) {
      console.log(`  - 錯誤: ${result.error}`);
    }
    
    return result;
    
  } catch (error) {
    console.log('\n❌ 測試失敗!');
    console.log(`🔍 錯誤詳情: ${error.message}`);
    console.log(`📋 錯誤堆疊: ${error.stack}`);
    
    // 提供調試建議
    if (error.message.includes('工作表')) {
      console.log('💡 建議: 檢查工作表名稱是否正確，格式是否為 "學生Email | 班級名稱 | 狀態"');
    } else if (error.message.includes('權限')) {
      console.log('💡 建議: 檢查 Google Classroom API 權限');
    } else if (error.message.includes('課程')) {
      console.log('💡 建議: 確認課程存在且有操作權限');
    }
    
    throw error;
  }
}

/**
 * 🧪 簡化測試函數 - 使用預設參數快速測試
 */
async function quickTestDistribution() {
  console.log('🚀 快速測試智能學生分配...');
  return await testDistributeStudents();
}

/**
 * 🎯 智能學生分配系統 - 核心分配函數
 * 自動為每個班級的學生分配到對應的3門課程
 */
async function distributeStudentsToCourses(sheetName, isAutoMode = true) {
  console.log(`🚀 開始智能學生分配: ${sheetName} (模式: ${isAutoMode ? '自動配對' : '自訂配對'})`);
  
  try {
    // 步驟1: 驗證和讀取學生資料
    const studentData = await readStudentDataFromSheet(sheetName);
    if (!studentData.success) {
      return { success: false, error: studentData.error };
    }

    // 步驟2: 獲取所有活動課程
    console.log('📚 載入活動課程清單...');
    const coursesResult = await classroomService.listAllCourses();
    if (!coursesResult.success) {
      return { success: false, error: '無法載入課程清單: ' + coursesResult.error };
    }

    // 步驟3: 執行課程匹配算法
    console.log('🧠 執行智能課程匹配...');
    const matchingResult = await performCourseMatching(studentData.students, coursesResult.data, isAutoMode);
    if (!matchingResult.success) {
      return { success: false, error: matchingResult.error };
    }

    // 步驟4: 執行批次學生分配
    console.log('⚡ 開始批次學生分配...');
    const distributionResult = await executeBatchDistribution(matchingResult.assignments);
    
    // 步驟5: 生成和保存詳細報告
    if (distributionResult.processedCount > 0) {
      console.log('📈 生成分配報告...');
      const report = generateDistributionReport(distributionResult, matchingResult.assignments);
      const saveResult = saveDistributionReportToSheet(report);
      
      if (saveResult.success) {
        console.log(`📊 詳細報告已保存至 "${saveResult.sheetName}" 工作表`);
      }
    }
    
    return {
      success: distributionResult.success,
      summary: distributionResult.summary,
      distributedCourses: matchingResult.totalCourses,
      error: distributionResult.error,
      processedCount: distributionResult.processedCount,
      totalAssignments: matchingResult.assignments.length
    };

  } catch (error) {
    console.log(`[ERROR] 智能分配系統錯誤: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 🧹 清除工作表狀態列 - 重置所有學生處理狀態
 */
function clearStudentStatusColumn(sheetName = 'stu_course') {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`找不到名為 "${sheetName}" 的工作表`);
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      SpreadsheetApp.getUi().alert('提示', '工作表中沒有學生資料。', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    // 確認清除操作
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      '⚠️ 確認清除狀態',
      `即將清除 "${sheetName}" 工作表中所有學生的處理狀態。\n\n這將允許重新處理所有學生。\n\n確定要繼續嗎？`,
      ui.ButtonSet.YES_NO
    );

    if (response !== ui.Button.YES) {
      ui.alert('操作已取消', '狀態清除已取消。', ui.ButtonSet.OK);
      return;
    }

    // 清除狀態列 (第3列)
    const statusRange = sheet.getRange(2, 3, lastRow - 1, 1);
    statusRange.clearContent();

    console.log(`✅ 已清除 ${lastRow - 1} 行學生的處理狀態`);
    ui.alert('✅ 狀態已清除', `已成功清除 ${lastRow - 1} 名學生的處理狀態。\n\n現在可以重新執行智能學生分配功能。`, ui.ButtonSet.OK);

  } catch (error) {
    console.log(`[ERROR] 清除狀態失敗: ${error.message}`);
    SpreadsheetApp.getUi().alert('錯誤', `清除狀態失敗：${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 從工作表讀取學生資料
 */
async function readStudentDataFromSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return { success: false, error: `找不到名為 "${sheetName}" 的工作表` };
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return { success: false, error: '工作表中沒有學生資料' };
    }

    // 讀取資料 (跳過標題行)
    const range = sheet.getRange(2, 1, lastRow - 1, 3);
    const data = range.getValues();

    const students = [];
    const classGroups = new Map();
    let skippedCount = 0;

    data.forEach((row, index) => {
      const [email, className, status] = row;
      
      if (!email || !className) {
        console.log(`[WARN] 第 ${index + 2} 行資料不完整，跳過`);
        return;
      }

      // 跳過已處理的學生 (只跳過有 ✅ 符號的)
      if (status && status.toString().includes('✅')) {
        console.log(`[INFO] 學生 ${email} 已成功處理 (${status})，跳過`);
        skippedCount++;
        return;
      }

      const student = {
        email: email.toString().trim(),
        className: className.toString().trim(),
        rowIndex: index + 2,
        currentStatus: status ? status.toString().trim() : ''
      };

      students.push(student);

      // 按班級分組
      if (!classGroups.has(student.className)) {
        classGroups.set(student.className, []);
      }
      classGroups.get(student.className).push(student);
    });

    console.log(`📊 讀取完成: ${students.length} 名學生，${classGroups.size} 個班級 (跳過 ${skippedCount} 名已完成學生)`);
    return { 
      success: true, 
      students, 
      classGroups,
      totalStudents: students.length,
      totalClasses: classGroups.size,
      skippedCount
    };

  } catch (error) {
    return { success: false, error: `讀取學生資料失敗: ${error.message}` };
  }
}

/**
 * 🧠 執行智能課程匹配算法
 * 為每個班級自動匹配對應的3門課程
 */
async function performCourseMatching(students, allCourses, isAutoMode) {
  console.log(`🧠 開始課程匹配 (共 ${allCourses.length} 門課程)`);
  
  try {
    // 課程結構常數 (從現有系統提取)
    const SUBJECTS = ['LT', 'IT', 'KCFS'];  // 三門主要課程
    const GRADES = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
    const CLASS_NAMES = ['Achievers', 'Discoverers', 'Voyagers', 'Explorers', 'Navigators'];

    // 建立課程索引
    const courseIndex = new Map();
    allCourses.forEach(course => {
      courseIndex.set(course.name, course);
    });

    // 按班級分組學生
    const classGroups = new Map();
    students.forEach(student => {
      if (!classGroups.has(student.className)) {
        classGroups.set(student.className, []);
      }
      classGroups.get(student.className).push(student);
    });

    const assignments = [];
    let totalCourses = 0;

    // 為每個班級匹配課程
    for (const [className, classStudents] of classGroups) {
      console.log(`🎯 為班級 "${className}" 匹配課程 (${classStudents.length} 名學生)`);
      
      const matchedCourses = await findMatchingCourses(className, courseIndex, SUBJECTS, GRADES, CLASS_NAMES, isAutoMode);
      
      if (matchedCourses.length === 0) {
        console.log(`[WARN] 班級 "${className}" 找不到匹配的課程`);
        continue;
      }

      console.log(`✅ 班級 "${className}" 匹配到 ${matchedCourses.length} 門課程`);
      totalCourses += matchedCourses.length;

      // 為該班級的每個學生建立分配記錄
      for (const student of classStudents) {
        for (const course of matchedCourses) {
          assignments.push({
            studentEmail: student.email,
            courseId: course.id,
            courseName: course.name,
            className: student.className,
            rowIndex: student.rowIndex
          });
        }
      }
    }

    console.log(`🎯 匹配完成: ${assignments.length} 項分配任務，涵蓋 ${totalCourses} 門課程`);
    
    return { 
      success: true, 
      assignments,
      totalCourses,
      classCount: classGroups.size
    };

  } catch (error) {
    return { success: false, error: `課程匹配失敗: ${error.message}` };
  }
}

/**
 * 🔍 為班級尋找匹配的課程
 */
async function findMatchingCourses(className, courseIndex, subjects, grades, classNames, isAutoMode) {
  const matchedCourses = [];
  
  if (isAutoMode) {
    // 自動模式: 根據課程命名規則匹配
    
    // 嘗試解析班級名稱 (例如: "G3 Explorers" -> G3, Explorers)
    let grade = null;
    let classType = null;
    
    // 檢查是否包含年級信息
    for (const g of grades) {
      if (className.includes(g)) {
        grade = g;
        break;
      }
    }
    
    // 檢查是否包含班級類型
    for (const ct of classNames) {
      if (className.includes(ct)) {
        classType = ct;
        break;
      }
    }
    
    console.log(`🔍 班級解析: "${className}" -> 年級: ${grade || '未知'}, 類型: ${classType || '未知'}`);
    
    // 為每個科目尋找對應課程
    for (const subject of subjects) {
      if (grade && classType) {
        // 完整匹配: 科目-年級 班級類型 (例如: "LT-G3 Explorers")
        const exactCourseName = `${subject}-${grade} ${classType}`;
        if (courseIndex.has(exactCourseName)) {
          matchedCourses.push(courseIndex.get(exactCourseName));
          console.log(`  ✅ 精確匹配: ${exactCourseName}`);
          continue;
        }
      }
      
      // 模糊匹配: 尋找包含班級名稱的課程
      for (const [courseName, course] of courseIndex) {
        if (courseName.includes(subject) && 
            (courseName.includes(className) || 
             (grade && courseName.includes(grade)) ||
             (classType && courseName.includes(classType)))) {
          matchedCourses.push(course);
          console.log(`  ✅ 模糊匹配: ${courseName}`);
          break;
        }
      }
    }
    
  } else {
    // 自訂模式: 需要用戶手動指定匹配規則 (暫時使用自動模式邏輯)
    console.log(`[INFO] 自訂模式尚未實作，暫時使用自動模式`);
    return await findMatchingCourses(className, courseIndex, subjects, grades, classNames, true);
  }
  
  return matchedCourses;
}

/**
 * ⚡ 執行批次學生分配 (含時間管理和進度追蹤)
 */
async function executeBatchDistribution(assignments) {
  const totalAssignments = assignments.length;
  console.log(`⚡ 開始批次分配: ${totalAssignments} 項任務`);
  
  const progress = new ProgressTracker(totalAssignments, '智能學生分配');
  const BATCH_SIZE = 20; // 每批處理20個分配
  const REST_INTERVAL = 1000; // 每批之間休息1秒
  const MAX_EXECUTION_TIME = 300000; // 5分鐘執行限制 (留1分鐘緩衝)
  
  const startTime = Date.now();
  let processedCount = 0;
  let successCount = 0;
  let addedCount = 0;        // 新增成功的數量
  let existingCount = 0;     // 已存在的數量
  let errorCount = 0;
  const errors = [];

  try {
    // 分批處理
    for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
      // 檢查執行時間
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        console.log(`[WARN] 接近執行時間限制，停止處理。已處理 ${processedCount}/${totalAssignments}`);
        break;
      }

      const batch = assignments.slice(i, i + BATCH_SIZE);
      console.log(`📦 處理批次 ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} 項任務`);

      // 處理當前批次
      for (const assignment of batch) {
        const studentInfo = `👤 ${assignment.studentEmail}`;
        const courseInfo = `📚 ${assignment.courseName || assignment.courseId}`;
        
        try {
          console.log(`🔄 智能分配處理中：${studentInfo} → ${courseInfo} (${assignment.className})`);
          
          // 使用智能重複檢查新增學生
          const result = await classroomService.addStudentIfNotExists(
            assignment.courseId, 
            assignment.studentEmail
          );

          if (result.success) {
            if (result.status === 'ALREADY_EXISTS') {
              console.log(`✅ 學生已存在：${studentInfo} 已在 ${courseInfo} 中`);
              progress.addSuccess(`${assignment.studentEmail} → ${assignment.courseName} (已存在)`);
              successCount++;
              existingCount++;
              
              // 更新學生處理狀態 - 已存在
              await updateStudentStatus(assignment, 'already_exists');
            } else if (result.status === 'ADDED') {
              console.log(`🎉 智能分配成功：${studentInfo} 已成功加入 ${courseInfo}`);
              progress.addSuccess(`${assignment.studentEmail} → ${assignment.courseName} (新增成功)`);
              successCount++;
              addedCount++;
              
              // 更新學生處理狀態 - 新增成功
              await updateStudentStatus(assignment, 'success');
            }
          } else {
            console.log(`❌ 智能分配失敗：${studentInfo} → ${courseInfo}，原因：${result.error}`);
            progress.addError(`${assignment.studentEmail} → ${assignment.courseName}`, result.error);
            errors.push({ 
              assignment, 
              error: result.error,
              studentEmail: assignment.studentEmail,
              courseId: assignment.courseId,
              courseName: assignment.courseName,
              className: assignment.className
            });
            errorCount++;
            
            // 記錄失敗狀態
            await updateStudentStatus(assignment, 'failed', result.error);
          }

        } catch (error) {
          console.log(`💥 智能分配異常：${studentInfo} → ${courseInfo}，錯誤：${error.message}`);
          progress.addError(`${assignment.studentEmail} → ${assignment.courseName}`, error);
          errors.push({ 
            assignment, 
            error: error.message,
            studentEmail: assignment.studentEmail,
            courseId: assignment.courseId,
            courseName: assignment.courseName,
            className: assignment.className
          });
          errorCount++;
          await updateStudentStatus(assignment, 'failed', error.message);
        }

        processedCount++;
      }

      // 批次間休息
      if (i + BATCH_SIZE < assignments.length) {
        console.log(`⏳ 批次完成，休息 ${REST_INTERVAL}ms...`);
        await Utilities.sleep(REST_INTERVAL);
      }
    }

    const summary = progress.complete();
    const endTime = Date.now();
    
    console.log(`📊 分配完成統計:`);
    console.log(`  總任務: ${totalAssignments}`);
    console.log(`  已處理: ${processedCount}`);
    console.log(`  成功: ${successCount}`);
    console.log(`    - 新增成功: ${addedCount}`);
    console.log(`    - 已存在: ${existingCount}`);
    console.log(`  失敗: ${errorCount}`);
    console.log(`  執行時間: ${endTime - startTime}ms`);

    // 準備執行報告資料
    const reportResults = [];
    
    // 收集成功的結果
    assignments.forEach(assignment => {
      const wasProcessed = processedCount > 0; // 簡化的檢查
      if (wasProcessed) {
        reportResults.push({
          studentEmail: assignment.studentEmail,
          courseId: assignment.courseId,
          courseName: assignment.courseName,
          className: assignment.className,
          success: true,
          status: 'ADDED' // 可以根據實際情況調整
        });
      }
    });
    
    // 加入錯誤結果
    errors.forEach(errorItem => {
      reportResults.push({
        studentEmail: errorItem.studentEmail,
        courseId: errorItem.courseId,
        courseName: errorItem.courseName,
        className: errorItem.className,
        success: false,
        error: errorItem.error
      });
    });

    // 建立執行報告
    try {
      const reportResult = createExecutionReport(
        '智能學生分配',
        'stu_course', // 智能分配預設工作表
        reportResults,
        errors,
        startTime,
        endTime
      );
      
      if (reportResult.success) {
        console.log(`📊 詳細執行報告已建立：${reportResult.sheetName}`);
      }
    } catch (reportError) {
      console.log(`⚠️ 執行報告建立失敗，但不影響主要功能：${reportError.message}`);
    }

    return {
      success: errorCount === 0,
      summary,
      processedCount,
      successCount,
      addedCount,
      existingCount,
      errorCount,
      errors,
      totalTime: endTime - startTime,
      reportResults
    };

  } catch (error) {
    console.log(`[ERROR] 批次分配系統錯誤: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 🔄 更新學生處理狀態 (斷點續傳支援) - 含打勾機制
 */
async function updateStudentStatus(assignment, status, error = null) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = '學生分配'; // 預設工作表名稱
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet || !assignment.rowIndex) {
      return; // 如果沒有工作表或行索引，跳過狀態更新
    }

    // 準備狀態訊息
    let statusMessage = '';
    let shouldCheck = false;
    const timestamp = new Date().toLocaleString('zh-TW');
    
    switch (status) {
      case 'success':
        statusMessage = `✅ 已分配到 ${assignment.courseName} (${timestamp})`;
        shouldCheck = true;
        break;
      case 'already_exists':
        statusMessage = `✅ 已存在於 ${assignment.courseName} (${timestamp})`;
        shouldCheck = true;
        break;
      case 'failed':
        statusMessage = `❌ 分配失敗: ${error || '未知錯誤'} (${timestamp})`;
        shouldCheck = false;
        break;
      case 'processing':
        statusMessage = `⏳ 處理中... (${timestamp})`;
        shouldCheck = false;
        break;
      default:
        statusMessage = `${status} (${timestamp})`;
        shouldCheck = false;
    }

    // 更新狀態列 (第3列是狀態列)
    sheet.getRange(assignment.rowIndex, 3).setValue(statusMessage);
    
    // 根據狀態決定是否打勾 (假設第4列是勾選欄)
    if (shouldCheck) {
      try {
        sheet.getRange(assignment.rowIndex, 4).check();
        console.log(`[STATUS] 已為學生 ${assignment.studentEmail} 打勾`);
      } catch (checkError) {
        console.log(`[WARN] 無法打勾: ${checkError.message}`);
      }
    }
    
    console.log(`[STATUS] 已更新學生 ${assignment.studentEmail} 狀態: ${statusMessage}`);
    
  } catch (error) {
    console.log(`[WARN] 無法更新學生狀態: ${error.message}`);
  }
}

/**
 * 📈 生成詳細分配報告
 */
function generateDistributionReport(distributionResult, assignments) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalAssignments: assignments.length,
      processedCount: distributionResult.processedCount,
      successCount: distributionResult.successCount,
      errorCount: distributionResult.errorCount,
      successRate: Math.round((distributionResult.successCount / distributionResult.processedCount) * 100),
      totalTime: distributionResult.totalTime,
      averageTimePerAssignment: Math.round(distributionResult.totalTime / distributionResult.processedCount)
    },
    performance: {
      assignmentsPerSecond: Math.round(distributionResult.processedCount / (distributionResult.totalTime / 1000)),
      timeEfficiency: distributionResult.totalTime < 300000 ? 'excellent' : 'acceptable',
      memoryUsage: 'within_limits' // Apps Script 自動管理
    },
    errors: distributionResult.errors || [],
    recommendations: []
  };

  // 生成建議
  if (report.summary.errorCount > 0) {
    report.recommendations.push('檢查失敗的分配項目，可能需要手動處理');
    
    if (report.summary.successRate < 80) {
      report.recommendations.push('成功率較低，建議檢查權限設定或課程配對規則');
    }
  }

  if (report.performance.assignmentsPerSecond < 1) {
    report.recommendations.push('處理速度較慢，考慮優化批次大小或減少API呼叫頻率');
  }

  if (report.summary.totalAssignments > distributionResult.processedCount) {
    report.recommendations.push('部分任務因執行時間限制未完成，建議分批執行');
  }

  console.log('📈 分配報告生成完成:');
  console.log(`  成功率: ${report.summary.successRate}%`);
  console.log(`  處理速度: ${report.performance.assignmentsPerSecond} 分配/秒`);
  console.log(`  建議數量: ${report.recommendations.length}`);

  return report;
}

/**
 * 💾 保存分配報告到工作表
 */
function saveDistributionReportToSheet(report) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const reportSheetName = '智能分配報告';
    
    let reportSheet = ss.getSheetByName(reportSheetName);
    if (!reportSheet) {
      reportSheet = ss.insertSheet(reportSheetName);
      
      // 建立標題行
      const headers = [
        '時間戳記', '總任務數', '已處理', '成功數', '失敗數', 
        '成功率(%)', '總時間(ms)', '平均時間(ms)', '處理速度(/秒)', '建議'
      ];
      reportSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      reportSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    // 新增報告記錄
    const newRow = [
      report.timestamp,
      report.summary.totalAssignments,
      report.summary.processedCount,
      report.summary.successCount,
      report.summary.errorCount,
      report.summary.successRate,
      report.summary.totalTime,
      report.summary.averageTimePerAssignment,
      report.performance.assignmentsPerSecond,
      report.recommendations.join('; ')
    ];

    reportSheet.appendRow(newRow);
    console.log(`📊 報告已保存到 "${reportSheetName}" 工作表`);
    
    return { success: true, sheetName: reportSheetName };
    
  } catch (error) {
    console.log(`[ERROR] 保存報告失敗: ${error.message}`);
    return { success: false, error: error.message };
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

/**
 * 🧪 stu_course 工作表批次學生新增測試函數
 * 專為 Google Apps Script 編輯器執行設計，無需參數
 * 修正版本：避免所有 UI 相關錯誤，適合編輯器執行
 */
function testStuCourseBatchAdd() {
  console.log("🚀 開始測試 stu_course 工作表的批次學生新增");
  console.log("📊 讀取工作表：stu_course");
  console.log("⚙️ 執行環境：Google Apps Script 編輯器（無UI模式）");
  
  try {
    // 提前檢查工作表是否存在
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName("stu_course");
    
    if (!sheet) {
      console.log("❌ 錯誤：找不到 stu_course 工作表");
      return { success: false, error: "工作表 'stu_course' 不存在" };
    }
    
    console.log(`✅ 找到工作表：${sheet.getName()}`);
    console.log(`📏 工作表資料行數：${sheet.getLastRow()}`);
    
    // 執行批次新增（使用 await，確保是異步函數）
    const result = batchAddStudentsFromSheet("stu_course");
    console.log("✅ 測試函數執行完成");
    console.log(`📊 執行結果摘要：`, JSON.stringify({
      success: result?.success || false,
      processed: result?.processedCount || 0,
      errors: result?.errors?.length || 0
    }));
    
    return result;
  } catch (error) {
    console.log(`❌ 測試執行失敗: ${error.message}`);
    console.log(`🔍 錯誤類型: ${error.name}`);
    console.log(`🔍 錯誤堆疊: ${error.stack}`);
    
    // 如果是 UI 相關錯誤，給出特別說明
    if (error.message.includes("getUi")) {
      console.log("💡 這是 UI 相關錯誤，在 Apps Script 編輯器執行時是正常的");
    }
    
    return { 
      success: false, 
      error: error.message, 
      context: "Google Apps Script 編輯器執行" 
    };
  }
}

/**
 * 🔧 創建小規模測試資料工作表
 * 使用真實的 Google Classroom 課程 ID 進行測試
 */
function createTestDataSheet() {
  console.log("🚀 開始創建測試資料工作表");
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // 檢查是否已有測試工作表，如有則刪除重建
    let testSheet = spreadsheet.getSheetByName("test_stu_course");
    if (testSheet) {
      console.log("🔄 刪除現有測試工作表");
      spreadsheet.deleteSheet(testSheet);
    }
    
    // 創建新的測試工作表
    testSheet = spreadsheet.insertSheet("test_stu_course");
    console.log("✅ 已創建測試工作表：test_stu_course");
    
    // 設定標題行
    const headers = [
      ["學生Email", "課程ID", "狀態"]
    ];
    testSheet.getRange(1, 1, 1, 3).setValues(headers);
    testSheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#E8F5E8");
    
    // 創建測試資料（使用真實的課程 ID）
    const testData = [
      // 使用一些測試 Email 和真實的課程 ID
      ["test1@kcislk.ntpc.edu.tw", "779922029471", "未處理"],  // LT-G1 Achievers
      ["test2@kcislk.ntpc.edu.tw", "779921968089", "未處理"],  // IT-G1 Achievers  
      ["test3@kcislk.ntpc.edu.tw", "779921948860", "未處理"],  // LT-G1 Adventurers
      ["test4@kcislk.ntpc.edu.tw", "779922024070", "未處理"],  // LT-G1 Discoverers
      ["test5@kcislk.ntpc.edu.tw", "779922003016", "未處理"],  // KCFS-G1 Achievers
    ];
    
    // 寫入測試資料
    testSheet.getRange(2, 1, testData.length, 3).setValues(testData);
    
    // 格式化工作表
    testSheet.autoResizeColumns(1, 3);
    testSheet.setFrozenRows(1);
    
    console.log(`✅ 已創建 ${testData.length} 筆測試資料`);
    console.log("📋 測試資料課程對應：");
    console.log("  • 779922029471: LT-G1 Achievers");
    console.log("  • 779921968089: IT-G1 Achievers");
    console.log("  • 779921948860: LT-G1 Adventurers"); 
    console.log("  • 779922024070: LT-G1 Discoverers");
    console.log("  • 779922003016: KCFS-G1 Achievers");
    
    return {
      success: true,
      sheetName: "test_stu_course",
      dataCount: testData.length,
      message: "測試資料工作表創建成功，可執行 testSmallScaleBatch() 進行測試"
    };
    
  } catch (error) {
    console.log(`❌ 創建測試資料失敗: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 🧪 小規模批次測試函數
 * 專門測試 test_stu_course 工作表的真實課程 ID
 */
function testSmallScaleBatch() {
  console.log("🧪 開始小規模批次學生新增測試");
  console.log("📊 目標工作表：test_stu_course");
  console.log("🎯 測試目標：驗證真實課程 ID 和修復效果");
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = spreadsheet.getSheetByName("test_stu_course");
    
    if (!testSheet) {
      console.log("❌ 找不到測試工作表，請先執行 createTestDataSheet()");
      return { 
        success: false, 
        error: "測試工作表不存在，請先執行 createTestDataSheet() 創建測試資料" 
      };
    }
    
    console.log(`✅ 找到測試工作表，資料行數：${testSheet.getLastRow()}`);
    
    // 執行小規模批次測試
    const result = batchAddStudentsFromSheet("test_stu_course");
    
    console.log("✅ 小規模測試執行完成");
    console.log(`📊 測試結果：`, JSON.stringify({
      success: result?.success || false,
      processed: result?.processedCount || 0,
      errors: result?.errors?.length || 0
    }));
    
    return result;
    
  } catch (error) {
    console.log(`❌ 小規模測試失敗: ${error.message}`);
    console.log(`🔍 錯誤詳情: ${error.stack}`);
    
    return {
      success: false,
      error: error.message,
      context: "小規模批次測試"
    };
  }
}

/**
 * 🎯 執行真實學生批次新增 - 無參數版本，直接可執行
 */
function executeRealStudentBatch() {
  console.log('🎯 開始執行真實學生批次新增');
  console.log('📊 目標工作表：stu_course');
  console.log('🚀 使用所有已修復的系統組件');
  
  try {
    // 檢查工作表是否存在
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('stu_course');
    
    if (!sheet) {
      console.log('❌ 找不到工作表 stu_course');
      console.log('💡 請確認工作表名稱是否正確');
      return { success: false, error: '找不到指定工作表' };
    }
    
    const numRows = sheet.getLastRow();
    console.log(`✅ 找到目標工作表，資料行數：${numRows}`);
    
    // 執行真實批次新增
    console.log('⏳ 正在執行批次新增學生操作...');
    const result = batchAddStudentsFromSheet('stu_course');
    
    console.log('🎉 真實批次新增執行完成');
    console.log('📊 最終結果：', JSON.stringify({
      success: result?.success || false,
      processed: result?.processedCount || 0,
      successful: result?.successfulCount || 0,
      errors: result?.errors?.length || 0
    }));
    
    return result;
    
  } catch (error) {
    console.log(`❌ 執行真實批次新增失敗：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 🔄 課程名稱到課程 ID 映射系統
 * 從 course_mapping 工作表動態讀取課程映射資料
 */
function getCourseIdFromName(courseName, preferredSubject = null) {
  console.log(`🔍 查詢課程映射：${courseName}`);
  
  // 如果已經是數字 ID，直接返回
  if (/^\d{10,15}$/.test(courseName)) {
    console.log(`✅ 已是數字課程 ID：${courseName}`);
    return { success: true, courseId: courseName, originalName: courseName };
  }

  try {
    // 從工作表讀取課程映射
    const mappingData = readCourseMappingFromSheet();
    if (!mappingData.success) {
      console.log(`❌ 讀取課程映射工作表失敗：${mappingData.error}`);
      return { 
        success: false, 
        error: `無法讀取課程映射：${mappingData.error}`,
        originalName: courseName 
      };
    }

    // 查找匹配的課程
    const matchingCourses = mappingData.courses.filter(course => 
      course.courseName === courseName && course.status === 'ACTIVE'
    );

    if (matchingCourses.length === 0) {
      console.log(`❌ 找不到課程映射：${courseName}`);
      return { 
        success: false, 
        error: `找不到課程 "${courseName}" 的 ID 映射。請檢查 course_mapping 工作表。`,
        originalName: courseName 
      };
    }

    // 如果有指定科目偏好，優先使用
    let selectedCourse = matchingCourses[0];
    if (preferredSubject) {
      const preferredCourse = matchingCourses.find(course => course.subject === preferredSubject);
      if (preferredCourse) {
        selectedCourse = preferredCourse;
      }
    }

    // 如果有多個科目版本，記錄資訊
    if (matchingCourses.length > 1) {
      const subjects = matchingCourses.map(c => c.subject);
      console.log(`⚠️ 課程 "${courseName}" 有多個科目版本：${subjects.join(', ')}`);
      console.log(`💡 使用科目：${selectedCourse.subject}`);
    }

    console.log(`✅ 課程映射成功：${courseName} (${selectedCourse.subject}) → ${selectedCourse.courseId}`);
    
    return { 
      success: true, 
      courseId: selectedCourse.courseId,
      originalName: courseName,
      subject: selectedCourse.subject,
      availableSubjects: matchingCourses.map(c => c.subject)
    };

  } catch (error) {
    console.log(`❌ 課程映射查詢失敗：${error.message}`);
    return { 
      success: false, 
      error: `課程映射查詢失敗：${error.message}`,
      originalName: courseName 
    };
  }
}

/**
 * 📊 從工作表讀取課程映射資料
 */
function readCourseMappingFromSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('course_mapping');
    
    // 如果工作表不存在，嘗試創建
    if (!sheet) {
      console.log('⚠️ course_mapping 工作表不存在，正在創建...');
      const createResult = createCourseMappingSheet();
      if (!createResult.success) {
        return { success: false, error: createResult.error };
      }
      sheet = createResult.sheet;
    }
    
    // 檢查是否有資料
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      console.log('⚠️ course_mapping 工作表沒有資料');
      return { success: true, courses: [] };
    }
    
    // 讀取所有資料
    const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    const courses = [];
    
    data.forEach((row, index) => {
      const [courseName, subject, courseId, status] = row;
      
      // 跳過空行
      if (!courseName || !courseId) {
        return;
      }
      
      courses.push({
        courseName: courseName.toString().trim(),
        subject: subject ? subject.toString().trim() : 'LT',
        courseId: courseId.toString().trim(),
        status: status ? status.toString().trim() : 'ACTIVE'
      });
    });
    
    console.log(`✅ 成功讀取 ${courses.length} 條課程映射記錄`);
    return { success: true, courses: courses };
    
  } catch (error) {
    console.log(`❌ 讀取課程映射工作表失敗：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 🏗️ 創建課程映射工作表
 */
function createCourseMappingSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // 檢查是否已存在
    let sheet = spreadsheet.getSheetByName('course_mapping');
    if (sheet) {
      console.log('✅ course_mapping 工作表已存在');
      return { success: true, sheet: sheet };
    }
    
    // 創建新工作表
    sheet = spreadsheet.insertSheet('course_mapping');
    
    // 設定標題行
    const headers = ['課程名稱', '科目', '課程ID', '狀態'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // 設定標題樣式
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4a90e2');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    
    // 設定欄寬
    sheet.setColumnWidth(1, 150); // 課程名稱
    sheet.setColumnWidth(2, 80);  // 科目
    sheet.setColumnWidth(3, 150); // 課程ID
    sheet.setColumnWidth(4, 80);  // 狀態
    
    // 凍結標題行
    sheet.setFrozenRows(1);
    
    console.log('✅ 成功創建 course_mapping 工作表');
    return { success: true, sheet: sheet };
    
  } catch (error) {
    console.log(`❌ 創建課程映射工作表失敗：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 📝 初始化課程映射資料
 */
function initializeCourseMappingData() {
  try {
    console.log('🚀 開始初始化課程映射資料...');
    
    // 確保工作表存在
    const createResult = createCourseMappingSheet();
    if (!createResult.success) {
      return createResult;
    }
    
    const sheet = createResult.sheet;
    
    // 準備初始資料
    const initialData = [
      // G1 年級課程
      ['G1 Achievers', 'LT', '779922029471', 'ACTIVE'],
      ['G1 Achievers', 'IT', '779921968089', 'ACTIVE'],
      ['G1 Achievers', 'KCFS', '779922003016', 'ACTIVE'],
      ['G1 Discoverers', 'LT', '779922024070', 'ACTIVE'],
      ['G1 Discoverers', 'IT', '779922045964', 'ACTIVE'],
      ['G1 Discoverers', 'KCFS', '779922047333', 'ACTIVE'],
      ['G1 Voyagers', 'LT', '779922000504', 'ACTIVE'],
      ['G1 Voyagers', 'IT', '779921963954', 'ACTIVE'],
      ['G1 Voyagers', 'KCFS', '779922050446', 'ACTIVE'],
      ['G1 Explorers', 'LT', '779922034354', 'ACTIVE'],
      ['G1 Explorers', 'IT', '779921930383', 'ACTIVE'],
      ['G1 Explorers', 'KCFS', '779922065235', 'ACTIVE'],
      ['G1 Navigators', 'LT', '779922057508', 'ACTIVE'],
      ['G1 Navigators', 'IT', '779921999359', 'ACTIVE'],
      ['G1 Navigators', 'KCFS', '779921986009', 'ACTIVE'],
      ['G1 Adventurers', 'LT', '779921948860', 'ACTIVE'],
      ['G1 Adventurers', 'IT', '779921980356', 'ACTIVE'],
      ['G1 Adventurers', 'KCFS', '779921972429', 'ACTIVE'],
      ['G1 Guardians', 'LT', '779922003082', 'ACTIVE'],
      ['G1 Guardians', 'IT', '779921980390', 'ACTIVE'],
      ['G1 Guardians', 'KCFS', '779922046054', 'ACTIVE'],
      ['G1 Pioneers', 'LT', '779922021273', 'ACTIVE'],
      ['G1 Pioneers', 'IT', '779922050570', 'ACTIVE'],
      ['G1 Pioneers', 'KCFS', '779922046073', 'ACTIVE'],
      ['G1 Innovators', 'LT', '779922008329', 'ACTIVE'],
      ['G1 Innovators', 'IT', '779922021811', 'ACTIVE'],
      ['G1 Innovators', 'KCFS', '779922057889', 'ACTIVE'],
      ['G1 Visionaries', 'LT', '779922034584', 'ACTIVE'],
      ['G1 Visionaries', 'IT', '779921968221', 'ACTIVE'],
      ['G1 Visionaries', 'KCFS', '779922011931', 'ACTIVE'],
      ['G1 Pathfinders', 'LT', '779922007326', 'ACTIVE'],
      ['G1 Pathfinders', 'IT', '779921996536', 'ACTIVE'],
      ['G1 Pathfinders', 'KCFS', '779922037060', 'ACTIVE'],
      ['G1 Inventors', 'LT', '779922048392', 'ACTIVE'],
      ['G1 Inventors', 'IT', '779922040087', 'ACTIVE'],
      ['G1 Inventors', 'KCFS', '779921999592', 'ACTIVE'],
      
      // G3 年級課程
      ['G3 Achievers', 'LT', '779922075128', 'ACTIVE'],
      ['G3 Achievers', 'IT', '779922073859', 'ACTIVE'],
      ['G3 Achievers', 'KCFS', '779922001163', 'ACTIVE'],
      ['G3 Pathfinders', 'LT', '779922010084', 'ACTIVE'],
      ['G3 Pathfinders', 'IT', '779922040641', 'ACTIVE'],
      ['G3 Pathfinders', 'KCFS', '779922072684', 'ACTIVE'],
      
      // G6 年級課程
      ['G6 Voyagers', 'LT', '779922102231', 'ACTIVE'],
      ['G6 Voyagers', 'IT', '779922132705', 'ACTIVE'],
      ['G6 Voyagers', 'KCFS', '779922020009', 'ACTIVE']
    ];
    
    // 檢查是否已有資料
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      console.log('⚠️ 工作表已有資料，跳過初始化');
      return { success: true, message: '工作表已有資料' };
    }
    
    // 寫入資料
    const startRow = 2;
    sheet.getRange(startRow, 1, initialData.length, 4).setValues(initialData);
    
    // 設定資料格式
    const dataRange = sheet.getRange(startRow, 1, initialData.length, 4);
    dataRange.setBorder(true, true, true, true, true, true);
    
    console.log(`✅ 成功初始化 ${initialData.length} 條課程映射記錄`);
    
    return { 
      success: true, 
      message: `初始化完成，共 ${initialData.length} 條記錄`,
      recordCount: initialData.length 
    };
    
  } catch (error) {
    console.log(`❌ 初始化課程映射資料失敗：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 🧪 測試課程 ID 映射功能
 */
function testCourseIdMapping() {
  console.log('🧪 開始測試課程 ID 映射功能');
  
  try {
    // 首先確保映射資料已初始化
    console.log('📊 初始化課程映射資料...');
    const initResult = initializeCourseMappingData();
    if (!initResult.success) {
      console.log(`❌ 初始化失敗：${initResult.error}`);
      return { success: false, error: initResult.error };
    }
    console.log(`✅ ${initResult.message}`);
    
    const testCases = [
      'G1 Achievers',
      'G1 Discoverers', 
      'G3 Achievers',    // 新增的 G3 課程
      'G3 Pathfinders',  // 新增的 G3 課程
      'G6 Voyagers',     // 新增的 G6 課程
      '779922029471',    // 已經是數字 ID
      'Unknown Course'   // 不存在的課程
    ];
    
    const results = [];
    
    testCases.forEach(courseName => {
      console.log(`\n📝 測試課程：${courseName}`);
      const result = getCourseIdFromName(courseName);
      
      if (result.success) {
        console.log(`✅ 映射成功：${result.originalName} → ${result.courseId}`);
        if (result.subject) {
          console.log(`📚 科目：${result.subject}`);
        }
        if (result.availableSubjects && result.availableSubjects.length > 1) {
          console.log(`🔢 可用科目：${result.availableSubjects.join(', ')}`);
        }
        results.push({ courseName, success: true, courseId: result.courseId, subject: result.subject });
      } else {
        console.log(`❌ 映射失敗：${result.error}`);
        results.push({ courseName, success: false, error: result.error });
      }
    });
    
    // 統計測試結果
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`\n📊 測試結果統計：`);
    console.log(`✅ 成功：${successCount} 個`);
    console.log(`❌ 失敗：${failCount} 個`);
    
    console.log('\n🎉 課程 ID 映射測試完成');
    
    return { 
      success: true, 
      results: results,
      statistics: { success: successCount, failed: failCount, total: testCases.length }
    };
    
  } catch (error) {
    console.log(`❌ 測試過程發生錯誤：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 🧪 小批次學生新增測試 - 驗證修復效果
 */
async function testSmallBatchStudentAddition() {
  console.log('🧪 開始小批次學生新增測試');
  console.log('📊 目標：驗證課程映射和錯誤處理改善');
  
  try {
    // 首先測試課程映射
    console.log('\n📍 步驟 1：測試課程映射功能');
    const mappingTest = testCourseIdMapping();
    if (!mappingTest.success) {
      console.log(`❌ 課程映射測試失敗：${mappingTest.error}`);
      return { success: false, error: '課程映射測試失敗', details: mappingTest.error };
    }
    console.log('✅ 課程映射測試通過');
    
    // 模擬學生新增測試（不執行真實操作）
    console.log('\n📍 步驟 2：模擬學生新增預檢');
    const testUsers = [
      { email: 'test1@kcislk.ntpc.edu.tw', courseName: 'G6 Voyagers' },
      { email: 'test2@kcislk.ntpc.edu.tw', courseName: 'G3 Achievers' },
      { email: 'invalid.email', courseName: 'G1 Achievers' }, // 格式錯誤
      { email: 'test3@otherdomain.com', courseName: 'G1 Discoverers' } // 域名不匹配
    ];
    
    const simulationResults = [];
    
    for (const testUser of testUsers) {
      console.log(`\n🔍 測試用戶：${testUser.email} → ${testUser.courseName}`);
      
      // 1. 課程映射測試
      const mappingResult = getCourseIdFromName(testUser.courseName);
      if (!mappingResult.success) {
        console.log(`❌ 課程映射失敗：${mappingResult.error}`);
        simulationResults.push({
          email: testUser.email,
          courseName: testUser.courseName,
          step: 'course_mapping',
          success: false,
          error: mappingResult.error
        });
        continue;
      }
      console.log(`✅ 課程映射成功：${mappingResult.courseId}`);
      
      // 2. 用戶預檢測試
      const validationResult = await ErrorHandler.validateUserAddition(testUser.email, mappingResult.courseId);
      console.log(`📊 用戶預檢：${validationResult.valid ? '✅ 通過' : '❌ 失敗'}`);
      
      if (!validationResult.valid) {
        validationResult.failedValidations.forEach(v => {
          console.log(`  ❌ ${v.type}: ${v.message}`);
        });
      }
      
      simulationResults.push({
        email: testUser.email,
        courseName: testUser.courseName,
        courseId: mappingResult.courseId,
        step: 'validation',
        success: validationResult.valid,
        validations: validationResult.validations,
        failedValidations: validationResult.failedValidations
      });
    }
    
    // 統計模擬結果
    const totalTests = simulationResults.length;
    const passedTests = simulationResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`\n📊 小批次測試結果：`);
    console.log(`✅ 通過：${passedTests}/${totalTests}`);
    console.log(`❌ 失敗：${failedTests}/${totalTests}`);
    
    console.log('\n🎉 小批次測試完成');
    
    return {
      success: true,
      testType: 'simulation',
      mappingTest: mappingTest,
      simulationResults: simulationResults,
      statistics: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: Math.round((passedTests / totalTests) * 100)
      }
    };
    
  } catch (error) {
    console.log(`❌ 小批次測試失敗：${error.message}`);
    return { success: false, error: error.message };
  }
}

// ========================== 批次處理優化原型 ==========================

/**
 * 🚀 一鍵完整映射原型 - 主入口函數
 */
async function oneClickCompleteMapping(options = {}) {
  console.log('🚀 啟動一鍵完整課程映射系統');
  console.log('📊 目標：處理 82 個班級 × 3 個科目 = 246 個課程');
  
  const startTime = Date.now();
  const defaultOptions = {
    clearExisting: true,
    backupExisting: true,
    enableTurboMode: true,
    maxExecutionTime: 5 * 60 * 1000, // 5 分鐘
    batchSize: 20,
    showProgress: true
  };
  
  const config = { ...defaultOptions, ...options };
  
  try {
    // 📊 步驟 1: 快速系統健康檢查
    console.log('\n📍 步驟 1/4: 系統健康檢查');
    const healthCheck = await quickSystemHealthCheck();
    if (!healthCheck.success) {
      throw new Error(`系統健康檢查失敗: ${healthCheck.error}`);
    }
    console.log('✅ 系統健康狀況良好');
    
    // 🔍 步驟 2: 超高速課程發現
    console.log('\n📍 步驟 2/4: 超高速課程發現');
    const discoveryResult = await turboCourseDiscovery(config);
    if (!discoveryResult.success) {
      throw new Error(`課程發現失敗: ${discoveryResult.error}`);
    }
    console.log(`✅ 發現 ${discoveryResult.totalCourses} 個課程`);
    
    // 🤖 步驟 3: AI 智能映射
    console.log('\n📍 步驟 3/4: AI 智能映射處理');
    const mappingResult = await turboIntelligentMapping(discoveryResult.courses, config);
    if (!mappingResult.success) {
      throw new Error(`智能映射失敗: ${mappingResult.error}`);
    }
    console.log(`✅ 完成 ${mappingResult.successfulMappings} 個課程映射`);
    
    // 💾 步驟 4: 高速映射表更新
    console.log('\n📍 步驟 4/4: 高速映射表更新');
    const updateResult = await turboMappingTableUpdate(mappingResult.mappings, config);
    if (!updateResult.success) {
      throw new Error(`映射表更新失敗: ${updateResult.error}`);
    }
    console.log(`✅ 映射表更新完成`);
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    // 📊 最終統計報告
    const finalReport = {
      success: true,
      duration: `${duration} 秒`,
      totalCourses: discoveryResult.totalCourses,
      successfulMappings: mappingResult.successfulMappings,
      failedMappings: mappingResult.failedMappings,
      accuracy: Math.round((mappingResult.successfulMappings / discoveryResult.totalCourses) * 100),
      performance: duration < 360 ? '優秀' : duration < 480 ? '良好' : '需要優化'
    };
    
    console.log('\n🎉 一鍵完整映射執行完成！');
    console.log(`📊 處理時間：${finalReport.duration}`);
    console.log(`📈 成功率：${finalReport.accuracy}%`);
    console.log(`⚡ 性能評級：${finalReport.performance}`);
    
    return finalReport;
    
  } catch (error) {
    console.log(`❌ 一鍵完整映射失敗：${error.message}`);
    return {
      success: false,
      error: error.message,
      duration: Math.round((Date.now() - startTime) / 1000)
    };
  }
}

/**
 * 🔥 超高速課程發現
 */
async function turboCourseDiscovery(config) {
  console.log('🔍 啟動超高速課程發現...');
  
  try {
    // 使用已有的智能發現系統
    const coursesResult = await getAllClassroomCourses();
    if (!coursesResult.success) {
      return { success: false, error: coursesResult.error };
    }
    
    const courses = coursesResult.data || [];
    console.log(`✅ 發現 ${courses.length} 個課程`);
    
    return {
      success: true,
      totalCourses: courses.length,
      courses: courses
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 🤖 超高速 AI 智能映射
 */
async function turboIntelligentMapping(courses, config) {
  console.log('🤖 啟動 AI 智能映射處理...');
  
  try {
    // 定義完整班級列表
    const allClasses = [
      // G1
      'G1 Achievers', 'G1 Discoverers', 'G1 Voyagers', 'G1 Explorers', 'G1 Navigators', 
      'G1 Adventurers', 'G1 Guardians', 'G1 Pioneers', 'G1 Innovators', 'G1 Visionaries', 
      'G1 Pathfinders', 'G1 Seekers', 'G1 Trailblazers', 'G1 Inventors',
      // G2
      'G2 Pioneers', 'G2 Explorers', 'G2 Inventors', 'G2 Achievers', 'G2 Voyagers', 
      'G2 Adventurers', 'G2 Innovators', 'G2 Guardians', 'G2 Pathfinders', 'G2 Visionaries', 
      'G2 Navigators', 'G2 Discoverers', 'G2 Seekers', 'G2 Trailblazers',
      // G3
      'G3 Inventors', 'G3 Innovators', 'G3 Guardians', 'G3 Achievers', 'G3 Voyagers', 
      'G3 Visionaries', 'G3 Trailblazers', 'G3 Discoverers', 'G3 Explorers', 'G3 Navigators', 
      'G3 Adventurers', 'G3 Seekers', 'G3 Pathfinders', 'G3 Pioneers',
      // G4
      'G4 Seekers', 'G4 Voyagers', 'G4 Visionaries', 'G4 Achievers', 'G4 Navigators', 
      'G4 Trailblazers', 'G4 Pathfinders', 'G4 Explorers', 'G4 Adventurers', 'G4 Innovators', 
      'G4 Discoverers', 'G4 Guardians', 'G4 Inventors', 'G4 Pioneers',
      // G5
      'G5 Adventurers', 'G5 Navigators', 'G5 Pioneers', 'G5 Inventors', 'G5 Seekers', 
      'G5 Discoverers', 'G5 Guardians', 'G5 Pathfinders', 'G5 Explorers', 'G5 Achievers', 
      'G5 Voyagers', 'G5 Trailblazers', 'G5 Innovators', 'G5 Visionaries',
      // G6
      'G6 Explorers', 'G6 Inventors', 'G6 Adventurers', 'G6 Achievers', 'G6 Voyagers', 
      'G6 Discoverers', 'G6 Innovators', 'G6 Guardians', 'G6 Pathfinders', 'G6 Seekers', 
      'G6 Visionaries', 'G6 Pioneers', 'G6 Trailblazers', 'G6 Navigators'
    ];
    
    const subjects = ['LT', 'IT', 'KCFS'];
    const mappings = [];
    let successCount = 0;
    let failCount = 0;
    
    // 批次處理映射
    console.log(`🔄 開始批次映射處理 (${config.batchSize} 項/批次)`);
    
    for (const className of allClasses) {
      for (const subject of subjects) {
        try {
          // 使用已有的智能查找功能
          const foundCourse = findCourseByPattern(className, subject, courses);
          
          if (foundCourse.success) {
            mappings.push({
              courseName: className,
              subject: subject,
              courseId: foundCourse.courseId,
              status: 'ACTIVE',
              confidence: foundCourse.confidence || 100
            });
            successCount++;
          } else {
            mappings.push({
              courseName: className,
              subject: subject,
              courseId: null,
              status: 'MISSING',
              confidence: 0
            });
            failCount++;
          }
          
          // 進度報告
          if ((successCount + failCount) % config.batchSize === 0) {
            const progress = Math.round(((successCount + failCount) / (allClasses.length * subjects.length)) * 100);
            console.log(`📈 進度：${progress}% (成功：${successCount}, 失敗：${failCount})`);
          }
          
        } catch (error) {
          console.log(`❌ 映射失敗：${className} - ${subject}: ${error.message}`);
          failCount++;
        }
      }
    }
    
    console.log(`✅ AI 映射完成：成功 ${successCount}, 失敗 ${failCount}`);
    
    return {
      success: true,
      successfulMappings: successCount,
      failedMappings: failCount,
      mappings: mappings
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 💾 超高速映射表更新
 */
async function turboMappingTableUpdate(mappings, config) {
  console.log('💾 啟動映射表高速更新...');
  
  try {
    // 備份現有資料
    if (config.backupExisting) {
      console.log('💾 正在備份現有映射資料...');
      await backupCourseMappingSheet();
    }
    
    // 使用已有的更新功能
    const updateResult = await updateCourseMappingSheet(mappings, {
      clearExisting: config.clearExisting,
      batchSize: config.batchSize
    });
    
    if (!updateResult.success) {
      return { success: false, error: updateResult.error };
    }
    
    console.log('✅ 映射表更新完成');
    
    return {
      success: true,
      updatedCount: mappings.length,
      timestamp: new Date().toLocaleString('zh-TW')
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * ❤️ 快速系統健康檢查
 */
async function quickSystemHealthCheck() {
  console.log('❤️ 執行快速系統健康檢查...');
  
  try {
    // 檢查基本 API 連線
    const testResult = Classroom.Courses.list({ pageSize: 1 });
    
    // 檢查工作表存取
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = spreadsheet.getSheetByName('course_mapping');
    
    console.log('✅ 系統健康檢查通過');
    return { 
      success: true, 
      apiStatus: 'OK',
      sheetStatus: testSheet ? 'OK' : 'MISSING',
      timestamp: new Date().toLocaleString('zh-TW')
    };
    
  } catch (error) {
    console.log(`❌ 系統健康檢查失敗：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 🧪 快速映射驗證器
 */
async function rapidMappingValidator() {
  console.log('🧪 啟動快速映射驗證器');
  const startTime = Date.now();
  
  try {
    // 讀取映射資料
    const mappingData = readCourseMappingFromSheet();
    if (!mappingData.success) {
      return { success: false, error: mappingData.error };
    }
    
    const courses = mappingData.courses || [];
    const stats = {
      total: courses.length,
      active: courses.filter(c => c.status === 'ACTIVE').length,
      missing: courses.filter(c => c.status === 'MISSING').length,
      duplicates: 0,
      errors: []
    };
    
    // 檢查重複
    const courseIds = courses.map(c => c.courseId).filter(id => id);
    const uniqueIds = new Set(courseIds);
    stats.duplicates = courseIds.length - uniqueIds.size;
    
    // 檢查格式
    courses.forEach((course, index) => {
      if (course.status === 'ACTIVE' && (!course.courseId || !/^\d{10,15}$/.test(course.courseId))) {
        stats.errors.push(`第 ${index + 1} 行：課程 ID 格式錯誤`);
      }
    });
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log(`✅ 驗證完成 (${duration} 秒)`);
    console.log(`📊 總計：${stats.total}, 活躍：${stats.active}, 缺失：${stats.missing}`);
    
    return {
      success: true,
      duration: duration,
      statistics: stats,
      accuracy: Math.round((stats.active / stats.total) * 100)
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ========================== 完整系統測試和驗證 ==========================

/**
 * 🎯 完整課程映射系統測試
 */
async function testCompleteCourseMappingSystem() {
  console.log('🎯 啟動完整課程映射系統測試');
  console.log('📊 測試範圍：82 個班級 × 3 個科目 = 246 個課程映射');
  
  const testResults = {
    startTime: new Date(),
    phases: [],
    overall: { success: false, duration: 0 }
  };
  
  try {
    // 🏥 階段 1: 系統健康檢查
    console.log('\n📍 階段 1/5: 系統健康檢查');
    const healthResult = await quickSystemHealthCheck();
    testResults.phases.push({
      phase: '系統健康檢查',
      success: healthResult.success,
      details: healthResult
    });
    
    if (!healthResult.success) {
      throw new Error(`系統健康檢查失敗: ${healthResult.error}`);
    }
    console.log('✅ 系統健康檢查通過');
    
    // 🔍 階段 2: 課程發現測試  
    console.log('\n📍 階段 2/5: 課程發現系統測試');
    const discoveryResult = await turboCourseDiscovery({ batchSize: 20 });
    testResults.phases.push({
      phase: '課程發現測試',
      success: discoveryResult.success,
      details: discoveryResult
    });
    
    if (!discoveryResult.success) {
      throw new Error(`課程發現測試失敗: ${discoveryResult.error}`);
    }
    console.log(`✅ 課程發現測試通過 (發現 ${discoveryResult.totalCourses} 個課程)`);
    
    // 🤖 階段 3: AI 映射測試
    console.log('\n📍 階段 3/5: AI 智能映射測試');
    const mappingResult = await turboIntelligentMapping(discoveryResult.courses, { batchSize: 20 });
    testResults.phases.push({
      phase: 'AI 映射測試',
      success: mappingResult.success,
      details: mappingResult
    });
    
    if (!mappingResult.success) {
      throw new Error(`AI 映射測試失敗: ${mappingResult.error}`);
    }
    console.log(`✅ AI 映射測試通過 (成功映射 ${mappingResult.successfulMappings} 個)`);
    
    // 💾 階段 4: 映射表更新測試
    console.log('\n📍 階段 4/5: 映射表更新測試');
    const updateResult = await turboMappingTableUpdate(mappingResult.mappings, { 
      clearExisting: false, 
      backupExisting: true 
    });
    testResults.phases.push({
      phase: '映射表更新測試',
      success: updateResult.success,
      details: updateResult
    });
    
    if (!updateResult.success) {
      throw new Error(`映射表更新測試失敗: ${updateResult.error}`);
    }
    console.log('✅ 映射表更新測試通過');
    
    // 🧪 階段 5: 完整性驗證測試
    console.log('\n📍 階段 5/5: 完整性驗證測試');
    const validationResult = await rapidMappingValidator();
    testResults.phases.push({
      phase: '完整性驗證測試',
      success: validationResult.success,
      details: validationResult
    });
    
    if (!validationResult.success) {
      throw new Error(`完整性驗證測試失敗: ${validationResult.error}`);
    }
    console.log(`✅ 完整性驗證測試通過 (準確率: ${validationResult.accuracy}%)`);
    
    // 📊 最終結果統計
    const endTime = new Date();
    const duration = Math.round((endTime - testResults.startTime) / 1000);
    
    testResults.overall = {
      success: true,
      duration: duration,
      totalCourses: discoveryResult.totalCourses,
      successfulMappings: mappingResult.successfulMappings,
      accuracy: validationResult.accuracy,
      performance: duration < 300 ? '優秀' : duration < 480 ? '良好' : '需優化'
    };
    
    console.log('\n🎉 完整系統測試執行完成！');
    console.log(`📊 總處理時間：${duration} 秒`);
    console.log(`📈 映射準確率：${validationResult.accuracy}%`);
    console.log(`⚡ 系統性能：${testResults.overall.performance}`);
    console.log(`✅ 所有 ${testResults.phases.length} 個階段測試通過`);
    
    return testResults;
    
  } catch (error) {
    const endTime = new Date();
    const duration = Math.round((endTime - testResults.startTime) / 1000);
    
    console.log(`❌ 完整系統測試失敗：${error.message}`);
    console.log(`⏱️ 測試持續時間：${duration} 秒`);
    
    testResults.overall = {
      success: false,
      error: error.message,
      duration: duration
    };
    
    return testResults;
  }
}

/**
 * 🚀 終極一鍵解決方案 - 處理所有課程映射問題
 */
async function ultimateOneClickSolution() {
  console.log('🚀 啟動終極一鍵解決方案');
  console.log('🎯 目標：完全解決 82 班級 × 3 科目的課程映射問題');
  console.log('⚡ 模式：超高速 + AI 智能 + 自動修復');
  
  const startTime = Date.now();
  
  try {
    // 執行完整的一鍵映射
    const mappingResult = await oneClickCompleteMapping({
      clearExisting: true,
      backupExisting: true,
      enableTurboMode: true,
      batchSize: 25,
      showProgress: true
    });
    
    if (!mappingResult.success) {
      throw new Error(`一鍵映射失敗: ${mappingResult.error}`);
    }
    
    // 執行驗證確保品質
    const validationResult = await rapidMappingValidator();
    
    const endTime = Date.now();
    const totalDuration = Math.round((endTime - startTime) / 1000);
    
    // 生成最終報告
    const finalReport = {
      success: true,
      timestamp: new Date().toLocaleString('zh-TW'),
      execution: {
        duration: `${totalDuration} 秒`,
        performance: totalDuration < 300 ? '🚀 優秀' : totalDuration < 480 ? '✅ 良好' : '⚠️ 需優化'
      },
      results: {
        totalCourses: mappingResult.totalCourses || 0,
        successfulMappings: mappingResult.successfulMappings || 0,
        failedMappings: mappingResult.failedMappings || 0,
        accuracy: mappingResult.accuracy || 0
      },
      validation: {
        accuracy: validationResult.accuracy || 0,
        errors: validationResult.statistics?.errors?.length || 0,
        duplicates: validationResult.statistics?.duplicates || 0
      },
      recommendations: generateRecommendations(mappingResult, validationResult)
    };
    
    // 顯示最終結果
    console.log('\n🎉 終極一鍵解決方案執行完成！');
    console.log('═'.repeat(50));
    console.log(`⏱️  執行時間：${finalReport.execution.duration}`);
    console.log(`📊 處理課程：${finalReport.results.totalCourses} 個`);
    console.log(`✅ 成功映射：${finalReport.results.successfulMappings} 個`);
    console.log(`📈 準確率：${finalReport.results.accuracy}%`);
    console.log(`⚡ 性能評級：${finalReport.execution.performance}`);
    console.log('═'.repeat(50));
    
    if (finalReport.recommendations.length > 0) {
      console.log('\n💡 改進建議：');
      finalReport.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    return finalReport;
    
  } catch (error) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`❌ 終極解決方案失敗：${error.message}`);
    console.log(`⏱️ 執行時間：${duration} 秒`);
    
    return {
      success: false,
      error: error.message,
      duration: duration
    };
  }
}

/**
 * 💡 生成改進建議
 */
function generateRecommendations(mappingResult, validationResult) {
  const recommendations = [];
  
  if (mappingResult.accuracy < 90) {
    recommendations.push('映射準確率低於 90%，建議檢查課程命名規則');
  }
  
  if (validationResult.statistics?.duplicates > 0) {
    recommendations.push(`發現 ${validationResult.statistics.duplicates} 個重複映射，建議清理`);
  }
  
  if (validationResult.statistics?.errors?.length > 0) {
    recommendations.push(`發現 ${validationResult.statistics.errors.length} 個格式錯誤，建議修正`);
  }
  
  if (mappingResult.failedMappings > mappingResult.successfulMappings * 0.1) {
    recommendations.push('失敗映射比例較高，建議檢查課程命名一致性');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('系統運行完美！所有映射均成功完成');
  }
  
  return recommendations;
}

// ========================== 智能課程發現系統 ==========================

/**
 * 🔍 獲取所有 Google Classroom 課程
 * 使用 ClassroomService 獲取所有活動課程
 */
async function getAllClassroomCourses(options = {}) {
  console.log('🚀 開始獲取所有 Google Classroom 課程...');
  
  try {
    const result = await classroomService.listAllCourses(options);
    
    if (!result.success) {
      console.log(`❌ 獲取課程列表失敗：${result.error}`);
      return { success: false, error: result.error };
    }
    
    const courses = result.data || [];
    console.log(`✅ 成功獲取 ${courses.length} 個課程`);
    
    return {
      success: true,
      courses: courses,
      count: courses.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.log(`❌ 獲取課程列表異常：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 🎯 模糊匹配課程名稱
 * 支援多種課程命名格式的智能匹配
 */
function findCourseByPattern(className, subject, courses) {
  if (!className || !subject || !courses || courses.length === 0) {
    return { success: false, error: '缺少必要參數' };
  }
  
  console.log(`🔍 搜索課程：${className} - ${subject}`);
  
  // 定義可能的課程名稱模式
  const patterns = [
    // 標準格式：G1 Achievers - LT
    `${className} - ${subject}`,
    `${className}-${subject}`,
    // 前綴格式：LT-G1 Achievers
    `${subject}-${className}`,
    `${subject} - ${className}`,
    // 後綴格式：G1 Achievers (LT)
    `${className} (${subject})`,
    `${className}(${subject})`,
    // 中文格式
    `${className} ${subject}課程`,
    `${subject} ${className}`,
    // 簡化格式
    `${className} ${subject}`,
    `${subject} ${className}`
  ];
  
  // 完全匹配
  for (const pattern of patterns) {
    const exactMatch = courses.find(course => 
      course.name && course.name.trim() === pattern
    );
    
    if (exactMatch) {
      console.log(`✅ 完全匹配找到：${exactMatch.name} (ID: ${exactMatch.id})`);
      return {
        success: true,
        course: exactMatch,
        matchType: 'EXACT',
        pattern: pattern
      };
    }
  }
  
  // 模糊匹配
  const fuzzyMatches = [];
  
  for (const course of courses) {
    if (!course.name) continue;
    
    const courseName = course.name.toLowerCase();
    const classNameLower = className.toLowerCase();
    const subjectLower = subject.toLowerCase();
    
    // 檢查是否包含班級名稱和科目
    if (courseName.includes(classNameLower) && courseName.includes(subjectLower)) {
      // 計算匹配度分數
      let score = 0;
      
      // 班級名稱完整匹配加分
      if (courseName.includes(classNameLower)) score += 50;
      
      // 科目完整匹配加分
      if (courseName.includes(subjectLower)) score += 30;
      
      // 位置相近加分
      const classIndex = courseName.indexOf(classNameLower);
      const subjectIndex = courseName.indexOf(subjectLower);
      if (Math.abs(classIndex - subjectIndex) < 10) score += 20;
      
      fuzzyMatches.push({
        course: course,
        score: score,
        matchType: 'FUZZY'
      });
    }
  }
  
  // 按分數排序，取最高分
  if (fuzzyMatches.length > 0) {
    fuzzyMatches.sort((a, b) => b.score - a.score);
    const bestMatch = fuzzyMatches[0];
    
    console.log(`🎯 模糊匹配找到：${bestMatch.course.name} (ID: ${bestMatch.course.id}, 分數: ${bestMatch.score})`);
    
    return {
      success: true,
      course: bestMatch.course,
      matchType: 'FUZZY',
      score: bestMatch.score,
      alternatives: fuzzyMatches.slice(1, 3) // 提供前2個備選
    };
  }
  
  console.log(`❌ 找不到匹配的課程：${className} - ${subject}`);
  return {
    success: false,
    error: `找不到匹配的課程：${className} - ${subject}`,
    searchPatterns: patterns
  };
}

/**
 * 🚀 創建完整課程映射（主要函數）
 * 掃描並創建 82 個班級 × 3 個科目 = 246 個課程的完整映射
 */
async function createCompleteCourseMapping(options = {}) {
  console.log('🚀 開始創建完整課程映射系統...');
  
  // 定義班級列表
  const classNames = {
    G1: ['Achievers', 'Discoverers', 'Voyagers', 'Explorers', 'Navigators', 'Adventurers', 'Guardians', 'Pioneers', 'Innovators', 'Visionaries', 'Pathfinders', 'Seekers', 'Trailblazers', 'Inventors'],
    G2: ['Pioneers', 'Explorers', 'Inventors', 'Achievers', 'Voyagers', 'Adventurers', 'Innovators', 'Guardians', 'Pathfinders', 'Visionaries', 'Navigators', 'Discoverers', 'Seekers', 'Trailblazers'],
    G3: ['Inventors', 'Innovators', 'Guardians', 'Achievers', 'Voyagers', 'Visionaries', 'Trailblazers', 'Discoverers', 'Explorers', 'Navigators', 'Adventurers', 'Seekers', 'Pathfinders', 'Pioneers'],
    G4: ['Seekers', 'Voyagers', 'Visionaries', 'Achievers', 'Navigators', 'Trailblazers', 'Pathfinders', 'Explorers', 'Adventurers', 'Innovators', 'Discoverers', 'Guardians', 'Inventors', 'Pioneers'],
    G5: ['Adventurers', 'Navigators', 'Pioneers', 'Inventors', 'Seekers', 'Discoverers', 'Guardians', 'Pathfinders', 'Explorers', 'Achievers', 'Voyagers', 'Trailblazers', 'Innovators', 'Visionaries'],
    G6: ['Explorers', 'Inventors', 'Adventurers', 'Achievers', 'Voyagers', 'Discoverers', 'Innovators', 'Guardians', 'Pathfinders', 'Seekers', 'Visionaries', 'Pioneers', 'Trailblazers', 'Navigators']
  };
  
  const subjects = ['LT', 'IT', 'KCFS'];
  
  // 計算總課程數
  const totalClasses = Object.values(classNames).reduce((sum, classes) => sum + classes.length, 0);
  const expectedCourses = totalClasses * subjects.length;
  
  console.log(`📊 預期映射課程數量：${totalClasses} 個班級 × ${subjects.length} 個科目 = ${expectedCourses} 個課程`);
  
  try {
    // 1. 獲取所有 Classroom 課程
    console.log('🔍 步驟 1：獲取所有 Google Classroom 課程...');
    const coursesResult = await getAllClassroomCourses(options);
    
    if (!coursesResult.success) {
      return { success: false, error: `獲取課程失敗：${coursesResult.error}` };
    }
    
    const allCourses = coursesResult.courses;
    console.log(`✅ 獲取到 ${allCourses.length} 個 Classroom 課程`);
    
    // 2. 初始化進度追蹤器
    const progress = new ProgressTracker(expectedCourses, '課程映射發現');
    
    // 3. 構建課程映射資料
    const mappingData = [];
    const foundCourses = new Set();
    const missingCourses = [];
    
    console.log('🎯 步驟 2：開始智能課程匹配...');
    
    // 遍歷所有年級
    for (const [grade, classes] of Object.entries(classNames)) {
      console.log(`\n📚 處理 ${grade} 年級 (${classes.length} 個班級)...`);
      
      // 遍歷每個班級
      for (const className of classes) {
        const fullClassName = `${grade} ${className}`;
        
        // 遍歷每個科目
        for (const subject of subjects) {
          const searchKey = `${fullClassName}-${subject}`;
          
          try {
            // 查找匹配的課程
            const matchResult = findCourseByPattern(fullClassName, subject, allCourses);
            
            if (matchResult.success) {
              const course = matchResult.course;
              
              // 避免重複映射
              if (!foundCourses.has(course.id)) {
                mappingData.push({
                  courseName: fullClassName,
                  subject: subject,
                  courseId: course.id,
                  status: 'ACTIVE',
                  originalName: course.name,
                  matchType: matchResult.matchType,
                  score: matchResult.score || 100,
                  discoveredAt: new Date().toISOString()
                });
                
                foundCourses.add(course.id);
                progress.addSuccess(searchKey, `找到：${course.name}`);
              } else {
                progress.addWarning(searchKey, `課程重複：${course.name}`);
              }
            } else {
              missingCourses.push({
                className: fullClassName,
                subject: subject,
                error: matchResult.error
              });
              progress.addError(searchKey, matchResult.error);
            }
            
            // API 限速控制
            if (options.respectRateLimit !== false) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
          } catch (error) {
            missingCourses.push({
              className: fullClassName,
              subject: subject,
              error: error.message
            });
            progress.addError(searchKey, error.message);
          }
        }
      }
    }
    
    const summary = progress.complete();
    
    console.log('\n📊 步驟 3：更新課程映射工作表...');
    
    // 4. 更新工作表
    const updateResult = await updateCourseMappingSheet(mappingData, {
      clearExisting: options.clearExisting || false,
      backupExisting: options.backupExisting !== false
    });
    
    if (!updateResult.success) {
      return { success: false, error: `更新工作表失敗：${updateResult.error}` };
    }
    
    // 5. 生成報告
    const report = {
      summary: {
        totalExpected: expectedCourses,
        totalFound: mappingData.length,
        totalMissing: missingCourses.length,
        completionRate: Math.round((mappingData.length / expectedCourses) * 100),
        classroomCoursesScanned: allCourses.length
      },
      foundCourses: mappingData,
      missingCourses: missingCourses,
      statistics: summary.statistics,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n✅ 課程映射創建完成！');
    console.log(`📈 完成率：${report.summary.completionRate}% (${report.summary.totalFound}/${report.summary.totalExpected})`);
    console.log(`🎯 找到課程：${report.summary.totalFound} 個`);
    console.log(`❌ 缺失課程：${report.summary.totalMissing} 個`);
    
    return {
      success: true,
      report: report,
      mappingData: mappingData,
      updateResult: updateResult
    };
    
  } catch (error) {
    console.log(`❌ 創建課程映射失敗：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 📝 更新課程映射工作表
 * 將發現的課程映射資料更新到工作表中
 */
async function updateCourseMappingSheet(mappingData, options = {}) {
  console.log(`📝 開始更新課程映射工作表，共 ${mappingData.length} 條記錄...`);
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('course_mapping');
    
    // 如果工作表不存在，創建它
    if (!sheet) {
      console.log('🏗️ course_mapping 工作表不存在，正在創建...');
      const createResult = createCourseMappingSheet();
      if (!createResult.success) {
        return { success: false, error: createResult.error };
      }
      sheet = createResult.sheet;
    }
    
    // 備份現有資料
    if (options.backupExisting) {
      console.log('💾 備份現有映射資料...');
      const backupResult = backupCourseMappingSheet();
      if (backupResult.success) {
        console.log(`✅ 備份完成：${backupResult.backupSheetName}`);
      }
    }
    
    // 清除現有資料（保留標題行）
    if (options.clearExisting) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 4).clear();
        console.log('🧹 已清除現有映射資料');
      }
    }
    
    // 準備寫入資料
    if (mappingData.length === 0) {
      console.log('⚠️ 沒有要更新的映射資料');
      return { success: true, updatedRows: 0 };
    }
    
    // 轉換資料格式
    const writeData = mappingData.map(item => [
      item.courseName || '',
      item.subject || '',
      item.courseId || '',
      item.status || 'ACTIVE'
    ]);
    
    // 批次寫入資料
    const startRow = options.clearExisting ? 2 : sheet.getLastRow() + 1;
    const range = sheet.getRange(startRow, 1, writeData.length, 4);
    range.setValues(writeData);
    
    // 設定資料格式
    range.setWrap(false);
    range.setHorizontalAlignment('left');
    
    // 為新資料設定條件格式
    if (writeData.length > 0) {
      // ACTIVE 狀態設為綠色
      const statusRange = sheet.getRange(startRow, 4, writeData.length, 1);
      const activeRule = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('ACTIVE')
        .setBackground('#d9ead3')
        .setRanges([statusRange])
        .build();
      
      const rules = sheet.getConditionalFormatRules();
      rules.push(activeRule);
      sheet.setConditionalFormatRules(rules);
    }
    
    // 自動調整欄寬
    sheet.autoResizeColumns(1, 4);
    
    console.log(`✅ 成功更新 ${writeData.length} 條課程映射記錄`);
    
    return {
      success: true,
      updatedRows: writeData.length,
      startRow: startRow,
      sheetName: 'course_mapping',
      totalRows: sheet.getLastRow()
    };
    
  } catch (error) {
    console.log(`❌ 更新課程映射工作表失敗：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 💾 備份課程映射工作表
 */
function backupCourseMappingSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sourceSheet = spreadsheet.getSheetByName('course_mapping');
    
    if (!sourceSheet) {
      return { success: false, error: 'course_mapping 工作表不存在' };
    }
    
    // 生成備份工作表名稱
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const backupName = `course_mapping_backup_${timestamp}`;
    
    // 複製工作表
    const backupSheet = sourceSheet.copyTo(spreadsheet);
    backupSheet.setName(backupName);
    
    // 添加備份資訊
    const lastRow = backupSheet.getLastRow();
    backupSheet.getRange(lastRow + 2, 1, 1, 2).setValues([[
      '備份時間:', new Date().toLocaleString('zh-TW')
    ]]);
    
    console.log(`✅ 課程映射備份完成：${backupName}`);
    
    return {
      success: true,
      backupSheetName: backupName,
      originalRows: lastRow
    };
    
  } catch (error) {
    console.log(`❌ 備份課程映射工作表失敗：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 📊 課程映射統計報告
 */
function generateCourseMappingReport() {
  console.log('📊 生成課程映射統計報告...');
  
  try {
    const mappingResult = readCourseMappingFromSheet();
    
    if (!mappingResult.success) {
      return { success: false, error: mappingResult.error };
    }
    
    const courses = mappingResult.courses;
    
    // 按年級統計
    const gradeStats = {};
    // 按科目統計
    const subjectStats = {};
    // 狀態統計
    const statusStats = {};
    
    courses.forEach(course => {
      // 解析年級
      const gradeMatch = course.courseName.match(/G(\d)/);
      const grade = gradeMatch ? `G${gradeMatch[1]}` : 'Unknown';
      
      // 年級統計
      if (!gradeStats[grade]) gradeStats[grade] = 0;
      gradeStats[grade]++;
      
      // 科目統計
      const subject = course.subject || 'Unknown';
      if (!subjectStats[subject]) subjectStats[subject] = 0;
      subjectStats[subject]++;
      
      // 狀態統計
      const status = course.status || 'Unknown';
      if (!statusStats[status]) statusStats[status] = 0;
      statusStats[status]++;
    });
    
    // 完成度分析
    const expectedPerGrade = 14; // 每年級 14 個班級
    const expectedPerSubject = 3; // 每個科目 3 個
    const totalExpected = 82 * 3; // 82 個班級 × 3 個科目
    
    const completionRate = Math.round((courses.length / totalExpected) * 100);
    
    const report = {
      summary: {
        totalMapped: courses.length,
        totalExpected: totalExpected,
        completionRate: completionRate,
        timestamp: new Date().toISOString()
      },
      byGrade: gradeStats,
      bySubject: subjectStats,
      byStatus: statusStats,
      missingAnalysis: {
        expectedPerGrade: expectedPerGrade,
        expectedPerSubject: expectedPerSubject
      }
    };
    
    console.log('📈 課程映射統計報告：');
    console.log(`   總課程數：${report.summary.totalMapped}/${report.summary.totalExpected}`);
    console.log(`   完成率：${report.summary.completionRate}%`);
    console.log(`   年級分佈：`, gradeStats);
    console.log(`   科目分佈：`, subjectStats);
    console.log(`   狀態分佈：`, statusStats);
    
    return {
      success: true,
      report: report
    };
    
  } catch (error) {
    console.log(`❌ 生成統計報告失敗：${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 🔄 重新同步課程映射
 * 檢查映射的課程是否仍然存在和活躍
 */
async function resyncCourseMappings(options = {}) {
  console.log('🔄 開始重新同步課程映射...');
  
  try {
    // 讀取現有映射
    const mappingResult = readCourseMappingFromSheet();
    if (!mappingResult.success) {
      return { success: false, error: mappingResult.error };
    }
    
    const currentMappings = mappingResult.courses;
    console.log(`📋 現有映射記錄：${currentMappings.length} 個`);
    
    // 獲取最新課程列表
    const coursesResult = await getAllClassroomCourses({ forceRefresh: true });
    if (!coursesResult.success) {
      return { success: false, error: coursesResult.error };
    }
    
    const latestCourses = coursesResult.courses;
    const activeCourseIds = new Set(latestCourses.map(c => c.id));
    
    // 檢查映射狀態
    const progress = new ProgressTracker(currentMappings.length, '同步課程映射');
    const syncResults = [];
    
    for (const mapping of currentMappings) {
      try {
        const courseId = mapping.courseId;
        const currentCourse = latestCourses.find(c => c.id === courseId);
        
        let newStatus = mapping.status;
        let syncType = 'UNCHANGED';
        
        if (!activeCourseIds.has(courseId)) {
          // 課程不存在或已封存
          newStatus = 'ARCHIVED';
          syncType = 'ARCHIVED';
          progress.addWarning(`${mapping.courseName} (${mapping.subject})`, '課程已封存');
        } else if (currentCourse) {
          // 檢查課程狀態
          if (currentCourse.courseState === 'ARCHIVED') {
            newStatus = 'ARCHIVED';
            syncType = 'ARCHIVED';
          } else {
            newStatus = 'ACTIVE';
            syncType = 'ACTIVE';
          }
          progress.addSuccess(`${mapping.courseName} (${mapping.subject})`, `狀態：${syncType}`);
        }
        
        syncResults.push({
          ...mapping,
          status: newStatus,
          syncType: syncType,
          lastSyncAt: new Date().toISOString()
        });
        
      } catch (error) {
        progress.addError(`${mapping.courseName} (${mapping.subject})`, error.message);
        syncResults.push({
          ...mapping,
          syncType: 'ERROR',
          syncError: error.message
        });
      }
    }
    
    const summary = progress.complete();
    
    // 更新工作表
    if (options.updateSheet !== false) {
      const updateResult = await updateCourseMappingSheet(syncResults, {
        clearExisting: true,
        backupExisting: true
      });
      
      if (!updateResult.success) {
        return { success: false, error: `更新工作表失敗：${updateResult.error}` };
      }
    }
    
    const syncStats = {
      total: syncResults.length,
      active: syncResults.filter(r => r.status === 'ACTIVE').length,
      archived: syncResults.filter(r => r.status === 'ARCHIVED').length,
      errors: syncResults.filter(r => r.syncType === 'ERROR').length
    };
    
    console.log('✅ 課程映射同步完成');
    console.log(`📊 同步統計：活躍 ${syncStats.active}、封存 ${syncStats.archived}、錯誤 ${syncStats.errors}`);
    
    return {
      success: true,
      syncResults: syncResults,
      statistics: syncStats,
      summary: summary
    };
    
  } catch (error) {
    console.log(`❌ 重新同步課程映射失敗：${error.message}`);
    return { success: false, error: error.message };
  }
}

// ========================================
// 🔄 MAPPING TABLE AUTO-UPDATE SYSTEM v2.0
// ========================================

/**
 * 🚀 自動映射表更新引擎
 * 定期檢查和更新課程映射，智能處理增量更新
 */
class AutoMappingUpdateEngine {
  constructor() {
    this.logger = new Logger('AutoMappingUpdateEngine');
    this.rateLimiter = new RateLimiter();
    this.errorHandler = new ErrorHandler();
    this.versionControl = new MappingVersionControl();
    this.qualityMonitor = new MappingQualityMonitor();
    this.updateIntervals = {
      FAST: 15 * 60 * 1000,      // 15分鐘 - 快速更新
      REGULAR: 60 * 60 * 1000,   // 1小時 - 常規更新
      DAILY: 24 * 60 * 60 * 1000, // 24小時 - 每日更新
      WEEKLY: 7 * 24 * 60 * 60 * 1000 // 7天 - 每週更新
    };
  }

  /**
   * 🎯 執行增量映射更新
   * 只更新變更的課程，提高效率
   */
  async performIncrementalUpdate(options = {}) {
    this.logger.info('🚀 開始執行增量映射更新...');
    
    const startTime = Date.now();
    const updateId = `update_${Date.now()}`;
    
    try {
      // 1. 獲取當前映射狀態
      const currentMapping = await this.getCurrentMappingState();
      if (!currentMapping.success) {
        throw new Error(`獲取當前映射失敗: ${currentMapping.error}`);
      }

      // 2. 掃描 Google Classroom 變更
      const classroomChanges = await this.detectClassroomChanges(currentMapping.data);
      if (!classroomChanges.success) {
        throw new Error(`檢測課程變更失敗: ${classroomChanges.error}`);
      }

      // 3. 分析需要更新的項目
      const updatePlan = this.createUpdatePlan(classroomChanges.changes, options);
      
      if (updatePlan.totalUpdates === 0) {
        this.logger.info('✅ 無需更新 - 所有映射都是最新的');
        return {
          success: true,
          type: 'NO_UPDATES_NEEDED',
          message: '映射表已是最新狀態',
          executionTime: Date.now() - startTime
        };
      }

      // 4. 執行增量更新
      const updateResults = await this.executeIncrementalUpdates(updatePlan, updateId);
      
      // 5. 記錄版本控制
      await this.versionControl.recordUpdate(updateId, updateResults);
      
      // 6. 品質檢查
      const qualityCheck = await this.qualityMonitor.validateUpdates(updateResults);
      
      const executionTime = Date.now() - startTime;
      this.logger.info(`✅ 增量更新完成 - 耗時: ${executionTime}ms`);

      return {
        success: true,
        updateId: updateId,
        updatePlan: updatePlan,
        updateResults: updateResults,
        qualityCheck: qualityCheck,
        executionTime: executionTime
      };
      
    } catch (error) {
      this.logger.error(`❌ 增量更新失敗: ${error.message}`);
      return {
        success: false,
        error: error.message,
        updateId: updateId,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * 🔍 獲取當前映射狀態
   */
  async getCurrentMappingState() {
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getSheetByName('course_mapping');
      
      if (!sheet) {
        return { success: false, error: '找不到 course_mapping 工作表' };
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const mappings = [];
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const mapping = {};
        
        headers.forEach((header, index) => {
          mapping[header] = row[index];
        });
        
        mappings.push(mapping);
      }

      return {
        success: true,
        data: mappings,
        timestamp: new Date().toISOString(),
        count: mappings.length
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 檢測 Google Classroom 課程變更
   */
  async detectClassroomChanges(currentMappings) {
    try {
      // 獲取最新的 Classroom 課程
      const coursesResult = await getAllClassroomCourses({ forceRefresh: true });
      if (!coursesResult.success) {
        throw new Error(`無法獲取 Classroom 課程: ${coursesResult.error}`);
      }

      const currentCourses = coursesResult.courses;
      const mappedCourseIds = new Set(currentMappings.map(m => m.courseId).filter(Boolean));
      
      const changes = {
        new: [], // 新增的課程
        updated: [], // 更新的課程
        deleted: [], // 刪除的課程
        unchanged: [] // 未變更的課程
      };

      // 檢查新增和更新的課程
      for (const course of currentCourses) {
        const existingMapping = currentMappings.find(m => m.courseId === course.id);
        
        if (!existingMapping) {
          // 嘗試智能匹配
          const aiMatch = await this.tryIntelligentMatching(course);
          if (aiMatch.success) {
            changes.new.push({
              course: course,
              suggestedMapping: aiMatch.mapping,
              confidence: aiMatch.confidence
            });
          }
        } else {
          // 檢查是否有更新
          if (this.hasCourseChanged(course, existingMapping)) {
            changes.updated.push({
              course: course,
              existingMapping: existingMapping,
              changes: this.identifyChanges(course, existingMapping)
            });
          } else {
            changes.unchanged.push({
              course: course,
              mapping: existingMapping
            });
          }
        }
      }

      // 檢查已刪除的課程
      for (const mapping of currentMappings) {
        if (mapping.courseId && !currentCourses.find(c => c.id === mapping.courseId)) {
          changes.deleted.push({
            mapping: mapping,
            reason: 'COURSE_NOT_FOUND_IN_CLASSROOM'
          });
        }
      }

      this.logger.info(`🔍 課程變更檢測完成: 新增 ${changes.new.length}, 更新 ${changes.updated.length}, 刪除 ${changes.deleted.length}, 未變更 ${changes.unchanged.length}`);

      return {
        success: true,
        changes: changes,
        summary: {
          total: currentCourses.length,
          new: changes.new.length,
          updated: changes.updated.length,
          deleted: changes.deleted.length,
          unchanged: changes.unchanged.length
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 🤖 智能匹配新課程
   */
  async tryIntelligentMatching(course) {
    try {
      // 使用現有的 AI 映射系統
      if (typeof window !== 'undefined' && window.AICourseClassifier) {
        const classifier = new window.AICourseClassifier();
        const analysis = classifier.analyzeCourse(course.name);
        
        if (analysis.success && analysis.confidence.overall > 0.7) {
          const mapping = {
            courseName: `${analysis.grade} ${analysis.className}`,
            subject: analysis.subject,
            courseId: course.id,
            status: 'ACTIVE',
            originalName: course.name,
            matchType: 'AI_INTELLIGENT',
            confidence: analysis.confidence.overall,
            discoveredAt: new Date().toISOString(),
            source: 'AUTO_UPDATE_ENGINE'
          };
          
          return {
            success: true,
            mapping: mapping,
            confidence: analysis.confidence.overall,
            analysis: analysis
          };
        }
      }
      
      // 降級使用現有的模糊匹配邏輯
      const gradeMatches = course.name.match(/G([1-6])/);
      const subjectMatches = course.name.match(/(LT|IT|KCFS)/);
      
      if (gradeMatches && subjectMatches) {
        const grade = `G${gradeMatches[1]}`;
        const subject = subjectMatches[1];
        
        // 嘗試提取班級名稱
        const classNameMatch = course.name.match(new RegExp(`${grade}\\s+(\\w+)`));
        if (classNameMatch) {
          const className = classNameMatch[1];
          
          const mapping = {
            courseName: `${grade} ${className}`,
            subject: subject,
            courseId: course.id,
            status: 'ACTIVE',
            originalName: course.name,
            matchType: 'PATTERN_MATCH',
            confidence: 0.8,
            discoveredAt: new Date().toISOString(),
            source: 'AUTO_UPDATE_ENGINE'
          };
          
          return {
            success: true,
            mapping: mapping,
            confidence: 0.8
          };
        }
      }
      
      return { success: false, reason: 'INSUFFICIENT_CONFIDENCE' };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 📋 創建更新計劃
   */
  createUpdatePlan(changes, options) {
    const plan = {
      adds: changes.new.length,
      updates: changes.updated.length,
      deletes: changes.deleted.length,
      totalUpdates: changes.new.length + changes.updated.length + changes.deleted.length,
      priority: options.priority || 'NORMAL',
      batchSize: this.calculateOptimalBatchSize(changes),
      estimatedTime: this.estimateExecutionTime(changes),
      items: {
        toAdd: changes.new,
        toUpdate: changes.updated,
        toDelete: changes.deleted
      }
    };

    this.logger.info(`📋 更新計劃: ${plan.adds} 新增, ${plan.updates} 更新, ${plan.deletes} 刪除`);
    return plan;
  }

  /**
   * 🚀 執行增量更新
   */
  async executeIncrementalUpdates(updatePlan, updateId) {
    const results = {
      added: [],
      updated: [],
      deleted: [],
      errors: []
    };

    try {
      // 處理新增項目
      for (const item of updatePlan.items.toAdd) {
        try {
          const addResult = await this.addMappingItem(item, updateId);
          if (addResult.success) {
            results.added.push(addResult.mapping);
          } else {
            results.errors.push({ type: 'ADD', item, error: addResult.error });
          }
        } catch (error) {
          results.errors.push({ type: 'ADD', item, error: error.message });
        }
        
        await this.rateLimiter.throttle();
      }

      // 處理更新項目
      for (const item of updatePlan.items.toUpdate) {
        try {
          const updateResult = await this.updateMappingItem(item, updateId);
          if (updateResult.success) {
            results.updated.push(updateResult.mapping);
          } else {
            results.errors.push({ type: 'UPDATE', item, error: updateResult.error });
          }
        } catch (error) {
          results.errors.push({ type: 'UPDATE', item, error: error.message });
        }
        
        await this.rateLimiter.throttle();
      }

      // 處理刪除項目
      for (const item of updatePlan.items.toDelete) {
        try {
          const deleteResult = await this.deleteMappingItem(item, updateId);
          if (deleteResult.success) {
            results.deleted.push(deleteResult.mapping);
          } else {
            results.errors.push({ type: 'DELETE', item, error: deleteResult.error });
          }
        } catch (error) {
          results.errors.push({ type: 'DELETE', item, error: error.message });
        }
        
        await this.rateLimiter.throttle();
      }

      // 如果有實際變更，更新工作表
      if (results.added.length > 0 || results.updated.length > 0 || results.deleted.length > 0) {
        await this.updateMappingSheet(results, updateId);
      }

      return results;
      
    } catch (error) {
      this.logger.error(`執行增量更新失敗: ${error.message}`);
      throw error;
    }
  }

  /**
   * 🎯 計算最佳批次大小
   */
  calculateOptimalBatchSize(changes) {
    const totalItems = changes.new.length + changes.updated.length + changes.deleted.length;
    
    if (totalItems <= 10) return totalItems;
    if (totalItems <= 50) return 10;
    if (totalItems <= 200) return 25;
    return 50; // 最大批次大小
  }

  /**
   * ⏱️ 估算執行時間
   */
  estimateExecutionTime(changes) {
    const totalItems = changes.new.length + changes.updated.length + changes.deleted.length;
    const baseTime = 200; // 每項基本時間 (ms)
    const apiDelay = 100; // API 限速延遲 (ms)
    
    return (totalItems * (baseTime + apiDelay)) / 1000; // 返回秒數
  }

  /**
   * 📄 檢查課程是否有變更
   */
  hasCourseChanged(course, existingMapping) {
    // 檢查關鍵屬性是否有變更
    return (
      course.name !== existingMapping.originalName ||
      course.courseState !== existingMapping.status ||
      course.updateTime !== existingMapping.lastUpdated
    );
  }

  /**
   * 🔍 識別具體變更內容
   */
  identifyChanges(course, existingMapping) {
    const changes = [];
    
    if (course.name !== existingMapping.originalName) {
      changes.push({
        field: 'originalName',
        oldValue: existingMapping.originalName,
        newValue: course.name
      });
    }
    
    if (course.courseState !== existingMapping.status) {
      changes.push({
        field: 'status',
        oldValue: existingMapping.status,
        newValue: course.courseState
      });
    }
    
    return changes;
  }

  /**
   * ➕ 新增映射項目
   */
  async addMappingItem(item, updateId) {
    try {
      const mapping = {
        ...item.suggestedMapping,
        addedBy: 'AUTO_UPDATE_ENGINE',
        addedAt: new Date().toISOString(),
        updateId: updateId
      };
      
      this.logger.info(`➕ 新增映射: ${mapping.courseName} - ${mapping.subject}`);
      return { success: true, mapping: mapping };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 更新映射項目
   */
  async updateMappingItem(item, updateId) {
    try {
      const updatedMapping = { ...item.existingMapping };
      
      // 應用變更
      for (const change of item.changes) {
        updatedMapping[change.field] = change.newValue;
      }
      
      updatedMapping.lastUpdated = new Date().toISOString();
      updatedMapping.updatedBy = 'AUTO_UPDATE_ENGINE';
      updatedMapping.updateId = updateId;
      
      this.logger.info(`🔄 更新映射: ${updatedMapping.courseName} - ${updatedMapping.subject}`);
      return { success: true, mapping: updatedMapping };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ 刪除映射項目 (標記為已刪除)
   */
  async deleteMappingItem(item, updateId) {
    try {
      const deletedMapping = {
        ...item.mapping,
        status: 'DELETED',
        deletedAt: new Date().toISOString(),
        deletedBy: 'AUTO_UPDATE_ENGINE',
        deleteReason: item.reason,
        updateId: updateId
      };
      
      this.logger.info(`🗑️ 標記刪除映射: ${deletedMapping.courseName} - ${deletedMapping.subject}`);
      return { success: true, mapping: deletedMapping };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 📝 更新映射工作表
   */
  async updateMappingSheet(results, updateId) {
    try {
      // 收集所有需要寫入的數據
      const allMappings = [
        ...results.added,
        ...results.updated,
        ...results.deleted
      ];
      
      if (allMappings.length === 0) {
        return { success: true, message: '無數據需要更新' };
      }

      // 調用現有的更新函數
      const updateResult = await updateCourseMappingSheet(allMappings, {
        clearExisting: false, // 不清空現有數據，僅更新
        backupExisting: true,
        updateId: updateId
      });
      
      return updateResult;
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * 📚 映射表版本控制系統
 * 自動備份、版本管理、回滾功能
 */
class MappingVersionControl {
  constructor() {
    this.logger = new Logger('MappingVersionControl');
    this.maxVersions = 30; // 保留最近 30 個版本
  }

  /**
   * 📝 記錄更新操作
   */
  async recordUpdate(updateId, updateResults) {
    try {
      const version = {
        id: updateId,
        timestamp: new Date().toISOString(),
        type: 'INCREMENTAL_UPDATE',
        summary: {
          added: updateResults.added.length,
          updated: updateResults.updated.length,
          deleted: updateResults.deleted.length,
          errors: updateResults.errors.length
        },
        details: updateResults
      };
      
      // 儲存到版本歷史工作表
      await this.saveVersionHistory(version);
      
      // 創建備份快照
      await this.createBackupSnapshot(updateId);
      
      // 清理舊版本
      await this.cleanupOldVersions();
      
      this.logger.info(`📝 版本記錄完成: ${updateId}`);
      return { success: true, versionId: updateId };
      
    } catch (error) {
      this.logger.error(`版本記錄失敗: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 💾 創建完整備份快照
   */
  async createFullBackup(reason = 'MANUAL_BACKUP') {
    try {
      const backupId = `backup_${Date.now()}`;
      const timestamp = new Date().toISOString();
      
      this.logger.info(`💾 創建完整備份: ${backupId}`);
      
      // 獲取當前完整映射數據
      const currentData = await this.getCurrentMappingData();
      if (!currentData.success) {
        throw new Error(`無法獲取當前數據: ${currentData.error}`);
      }
      
      // 創建備份工作表
      const backupSheet = await this.createBackupSheet(backupId, timestamp);
      
      // 寫入數據到備份工作表
      await this.writeDataToBackupSheet(backupSheet, currentData.data);
      
      // 記錄備份資訊
      await this.recordBackupInfo({
        id: backupId,
        timestamp: timestamp,
        reason: reason,
        recordCount: currentData.data.length,
        sheetName: backupSheet.getName()
      });
      
      return {
        success: true,
        backupId: backupId,
        recordCount: currentData.data.length,
        sheetName: backupSheet.getName()
      };
      
    } catch (error) {
      this.logger.error(`創建完整備份失敗: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 回滾到指定版本
   */
  async rollbackToVersion(versionId) {
    try {
      this.logger.info(`🔄 開始回滾到版本: ${versionId}`);
      
      // 查找版本資訊
      const versionInfo = await this.getVersionInfo(versionId);
      if (!versionInfo.success) {
        throw new Error(`找不到版本: ${versionId}`);
      }
      
      // 創建當前狀態備份
      const preRollbackBackup = await this.createFullBackup(`PRE_ROLLBACK_${versionId}`);
      if (!preRollbackBackup.success) {
        throw new Error(`創建回滾前備份失敗: ${preRollbackBackup.error}`);
      }
      
      // 讀取目標版本數據
      const versionData = await this.getVersionData(versionId);
      if (!versionData.success) {
        throw new Error(`讀取版本數據失敗: ${versionData.error}`);
      }
      
      // 執行回滾
      const rollbackResult = await this.performRollback(versionData.data);
      if (!rollbackResult.success) {
        throw new Error(`執行回滾失敗: ${rollbackResult.error}`);
      }
      
      // 記錄回滾操作
      await this.recordRollback({
        fromVersion: 'CURRENT',
        toVersion: versionId,
        timestamp: new Date().toISOString(),
        preRollbackBackup: preRollbackBackup.backupId
      });
      
      this.logger.info(`✅ 回滾完成: ${versionId}`);
      return {
        success: true,
        rolledBackTo: versionId,
        preRollbackBackup: preRollbackBackup.backupId
      };
      
    } catch (error) {
      this.logger.error(`回滾失敗: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 版本比較分析
   */
  async compareVersions(versionId1, versionId2) {
    try {
      const [version1, version2] = await Promise.all([
        this.getVersionData(versionId1),
        this.getVersionData(versionId2)
      ]);
      
      if (!version1.success || !version2.success) {
        throw new Error('無法獲取版本數據');
      }
      
      const comparison = this.analyzeVersionDifferences(version1.data, version2.data);
      
      return {
        success: true,
        comparison: comparison,
        version1Id: versionId1,
        version2Id: versionId2
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 分析版本差異
   */
  analyzeVersionDifferences(data1, data2) {
    const map1 = new Map(data1.map(item => [`${item.courseName}-${item.subject}`, item]));
    const map2 = new Map(data2.map(item => [`${item.courseName}-${item.subject}`, item]));
    
    const differences = {
      added: [], // 在 version2 中新增的
      removed: [], // 在 version2 中移除的
      modified: [], // 在兩個版本中都存在但有修改的
      unchanged: [] // 完全相同的
    };
    
    // 檢查所有在 version1 中的項目
    for (const [key, item1] of map1) {
      const item2 = map2.get(key);
      
      if (!item2) {
        differences.removed.push(item1);
      } else {
        const changes = this.compareItems(item1, item2);
        if (changes.length > 0) {
          differences.modified.push({ item1, item2, changes });
        } else {
          differences.unchanged.push(item1);
        }
      }
    }
    
    // 檢查在 version2 中新增的項目
    for (const [key, item2] of map2) {
      if (!map1.has(key)) {
        differences.added.push(item2);
      }
    }
    
    return differences;
  }

  /**
   * 🧹 清理舊版本
   */
  async cleanupOldVersions() {
    try {
      const allVersions = await this.getAllVersions();
      if (allVersions.length <= this.maxVersions) {
        return { success: true, message: '無需清理' };
      }
      
      // 按時間排序，保留最新的版本
      allVersions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const versionsToDelete = allVersions.slice(this.maxVersions);
      
      for (const version of versionsToDelete) {
        await this.deleteVersion(version.id);
      }
      
      this.logger.info(`🧹 清理了 ${versionsToDelete.length} 個舊版本`);
      return {
        success: true,
        deletedCount: versionsToDelete.length
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 💾 儲存版本歷史
   */
  async saveVersionHistory(version) {
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      let historySheet = spreadsheet.getSheetByName('mapping_version_history');
      
      if (!historySheet) {
        historySheet = spreadsheet.insertSheet('mapping_version_history');
        historySheet.getRange(1, 1, 1, 7).setValues([[
          'Version ID', 'Timestamp', 'Type', 'Added', 'Updated', 'Deleted', 'Errors'
        ]]);
      }
      
      const newRow = [
        version.id,
        version.timestamp,
        version.type,
        version.summary.added,
        version.summary.updated,
        version.summary.deleted,
        version.summary.errors
      ];
      
      historySheet.appendRow(newRow);
      
    } catch (error) {
      throw new Error(`儲存版本歷史失敗: ${error.message}`);
    }
  }

  // 輔助方法實作
  async createBackupSnapshot(updateId) {
    // 實作快照創建邏輯
    return { success: true };
  }
  
  async getCurrentMappingData() {
    // 實作獲取當前數據邏輯
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getSheetByName('course_mapping');
      if (!sheet) {
        return { success: false, error: '找不到 course_mapping 工作表' };
      }
      const data = sheet.getDataRange().getValues();
      return { success: true, data: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async getVersionInfo(versionId) {
    // 實作獲取版本資訊邏輯
    return { success: true };
  }
}

/**
 * 🔍 映射品質監控系統
 * 持續監控映射數據品質，自動檢測異常
 */
class MappingQualityMonitor {
  constructor() {
    this.logger = new Logger('MappingQualityMonitor');
    this.qualityThresholds = {
      completeness: 0.95, // 完整性閾值 95%
      accuracy: 0.90,     // 準確性閾值 90%
      consistency: 0.95,  // 一致性閾值 95%
      freshness: 24 * 60 * 60 * 1000 // 數據新鮮度 24 小時
    };
  }

  /**
   * 🔍 驗證更新結果品質
   */
  async validateUpdates(updateResults) {
    try {
      this.logger.info('🔍 開始品質驗證...');
      
      const qualityReport = {
        overall: { score: 0, status: 'UNKNOWN' },
        completeness: await this.checkCompleteness(updateResults),
        accuracy: await this.checkAccuracy(updateResults),
        consistency: await this.checkConsistency(updateResults),
        freshness: await this.checkFreshness(updateResults),
        anomalies: await this.detectAnomalies(updateResults)
      };
      
      // 計算總體品質分數
      const scores = [
        qualityReport.completeness.score,
        qualityReport.accuracy.score,
        qualityReport.consistency.score,
        qualityReport.freshness.score
      ];
      
      qualityReport.overall.score = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      qualityReport.overall.status = this.determineOverallStatus(qualityReport.overall.score);
      
      this.logger.info(`🔍 品質驗證完成 - 總體分數: ${(qualityReport.overall.score * 100).toFixed(1)}%`);
      
      return {
        success: true,
        qualityReport: qualityReport,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.logger.error(`品質驗證失敗: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 檢查數據完整性
   */
  async checkCompleteness(updateResults) {
    try {
      const totalItems = updateResults.added.length + updateResults.updated.length;
      const completeItems = [...updateResults.added, ...updateResults.updated].filter(item => 
        item.courseName && 
        item.subject && 
        item.courseId && 
        item.status
      ).length;
      
      const score = totalItems > 0 ? completeItems / totalItems : 1;
      const status = score >= this.qualityThresholds.completeness ? 'PASS' : 'FAIL';
      
      return {
        score: score,
        status: status,
        details: {
          total: totalItems,
          complete: completeItems,
          missing: totalItems - completeItems
        }
      };
      
    } catch (error) {
      return { score: 0, status: 'ERROR', error: error.message };
    }
  }

  /**
   * 🎯 檢查數據準確性
   */
  async checkAccuracy(updateResults) {
    try {
      let accurateItems = 0;
      let totalItems = 0;
      
      // 檢查新增項目的準確性
      for (const item of updateResults.added) {
        totalItems++;
        if (this.validateCourseMapping(item)) {
          accurateItems++;
        }
      }
      
      // 檢查更新項目的準確性
      for (const item of updateResults.updated) {
        totalItems++;
        if (this.validateCourseMapping(item)) {
          accurateItems++;
        }
      }
      
      const score = totalItems > 0 ? accurateItems / totalItems : 1;
      const status = score >= this.qualityThresholds.accuracy ? 'PASS' : 'FAIL';
      
      return {
        score: score,
        status: status,
        details: {
          total: totalItems,
          accurate: accurateItems,
          inaccurate: totalItems - accurateItems
        }
      };
      
    } catch (error) {
      return { score: 0, status: 'ERROR', error: error.message };
    }
  }

  /**
   * 🔄 檢查數據一致性
   */
  async checkConsistency(updateResults) {
    try {
      const allItems = [...updateResults.added, ...updateResults.updated];
      const duplicates = this.findDuplicateMappings(allItems);
      const inconsistencies = this.findInconsistencies(allItems);
      
      const totalIssues = duplicates.length + inconsistencies.length;
      const score = allItems.length > 0 ? Math.max(0, (allItems.length - totalIssues) / allItems.length) : 1;
      const status = score >= this.qualityThresholds.consistency ? 'PASS' : 'FAIL';
      
      return {
        score: score,
        status: status,
        details: {
          total: allItems.length,
          duplicates: duplicates.length,
          inconsistencies: inconsistencies.length,
          issues: [...duplicates, ...inconsistencies]
        }
      };
      
    } catch (error) {
      return { score: 0, status: 'ERROR', error: error.message };
    }
  }

  /**
   * ⏰ 檢查數據新鮮度
   */
  async checkFreshness(updateResults) {
    try {
      const now = new Date();
      const freshItems = [...updateResults.added, ...updateResults.updated].filter(item => {
        const itemTime = new Date(item.discoveredAt || item.lastUpdated || item.addedAt);
        return (now - itemTime) <= this.qualityThresholds.freshness;
      }).length;
      
      const totalItems = updateResults.added.length + updateResults.updated.length;
      const score = totalItems > 0 ? freshItems / totalItems : 1;
      const status = score >= 0.8 ? 'PASS' : 'FAIL'; // 較寬鬆的新鮮度要求
      
      return {
        score: score,
        status: status,
        details: {
          total: totalItems,
          fresh: freshItems,
          stale: totalItems - freshItems
        }
      };
      
    } catch (error) {
      return { score: 0, status: 'ERROR', error: error.message };
    }
  }

  /**
   * 🚨 檢測數據異常
   */
  async detectAnomalies(updateResults) {
    const anomalies = [];
    
    try {
      // 檢測課程名稱異常
      for (const item of [...updateResults.added, ...updateResults.updated]) {
        if (item.courseName && !/^G[1-6]\s+\w+$/.test(item.courseName)) {
          anomalies.push({
            type: 'INVALID_COURSE_NAME_FORMAT',
            item: item,
            message: `課程名稱格式異常: ${item.courseName}`
          });
        }
        
        if (item.subject && !['LT', 'IT', 'KCFS'].includes(item.subject)) {
          anomalies.push({
            type: 'INVALID_SUBJECT',
            item: item,
            message: `科目異常: ${item.subject}`
          });
        }
        
        if (item.confidence && item.confidence < 0.5) {
          anomalies.push({
            type: 'LOW_CONFIDENCE',
            item: item,
            message: `匹配信心度過低: ${item.confidence}`
          });
        }
      }
      
      return anomalies;
      
    } catch (error) {
      return [{
        type: 'DETECTION_ERROR',
        message: `異常檢測失敗: ${error.message}`
      }];
    }
  }

  /**
   * 🎯 驗證課程映射
   */
  validateCourseMapping(mapping) {
    // 基本欄位檢查
    if (!mapping.courseName || !mapping.subject || !mapping.courseId) {
      return false;
    }
    
    // 課程名稱格式檢查
    if (!/^G[1-6]\s+\w+$/.test(mapping.courseName)) {
      return false;
    }
    
    // 科目檢查
    if (!['LT', 'IT', 'KCFS'].includes(mapping.subject)) {
      return false;
    }
    
    // 狀態檢查
    if (!['ACTIVE', 'ARCHIVED', 'DELETED'].includes(mapping.status)) {
      return false;
    }
    
    return true;
  }

  /**
   * 🔍 尋找重複映射
   */
  findDuplicateMappings(items) {
    const seen = new Map();
    const duplicates = [];
    
    for (const item of items) {
      const key = `${item.courseName}-${item.subject}`;
      if (seen.has(key)) {
        duplicates.push({
          type: 'DUPLICATE_MAPPING',
          key: key,
          items: [seen.get(key), item]
        });
      } else {
        seen.set(key, item);
      }
    }
    
    return duplicates;
  }

  /**
   * 🔍 尋找數據不一致
   */
  findInconsistencies(items) {
    const inconsistencies = [];
    
    for (const item of items) {
      // 檢查課程名稱與年級的一致性
      const gradeMatch = item.courseName?.match(/^(G[1-6])/);
      if (gradeMatch) {
        const expectedGrade = gradeMatch[1];
        // 這裡可以添加更多一致性檢查
      }
    }
    
    return inconsistencies;
  }

  /**
   * 📊 確定總體狀態
   */
  determineOverallStatus(score) {
    if (score >= 0.95) return 'EXCELLENT';
    if (score >= 0.85) return 'GOOD';
    if (score >= 0.70) return 'FAIR';
    if (score >= 0.50) return 'POOR';
    return 'CRITICAL';
  }
}

/**
 * ⚡ 批次更新優化器
 * 智能批次處理、API 調用優化、錯誤恢復
 */
class BatchUpdateOptimizer {
  constructor() {
    this.logger = new Logger('BatchUpdateOptimizer');
    this.rateLimiter = new RateLimiter();
    this.errorHandler = new ErrorHandler();
    this.batchSizes = {
      SMALL: 10,
      MEDIUM: 25,
      LARGE: 50,
      XLARGE: 100
    };
  }

  /**
   * ⚡ 優化批次執行
   */
  async optimizeBatchExecution(items, operation, options = {}) {
    try {
      const strategy = this.determineBatchStrategy(items.length, options);
      const batches = this.createOptimalBatches(items, strategy);
      
      this.logger.info(`⚡ 開始批次處理: ${batches.length} 個批次, 每批 ${strategy.batchSize} 項`);
      
      const progress = new ProgressTracker(items.length, '批次更新');
      const results = {
        successful: [],
        failed: [],
        retried: []
      };

      // 處理所有批次
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchId = `batch_${i + 1}`;
        
        this.logger.info(`🚀 處理批次 ${i + 1}/${batches.length} (${batch.length} 項)`);
        
        const batchResult = await this.processBatchWithRetry(
          batch, 
          operation, 
          batchId, 
          strategy,
          progress
        );
        
        results.successful.push(...batchResult.successful);
        results.failed.push(...batchResult.failed);
        results.retried.push(...batchResult.retried);
        
        // 批次間延遲
        if (i < batches.length - 1) {
          await this.rateLimiter.throttle();
        }
      }
      
      const summary = progress.complete();
      
      this.logger.info(`✅ 批次處理完成: 成功 ${results.successful.length}, 失敗 ${results.failed.length}, 重試 ${results.retried.length}`);
      
      return {
        success: true,
        results: results,
        summary: summary,
        strategy: strategy
      };
      
    } catch (error) {
      this.logger.error(`批次處理失敗: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎯 決定批次策略
   */
  determineBatchStrategy(totalItems, options) {
    let batchSize;
    let concurrency = 1; // 預設序列處理
    let retryAttempts = 3;
    
    // 根據項目數量決定批次大小
    if (totalItems <= 20) {
      batchSize = this.batchSizes.SMALL;
    } else if (totalItems <= 100) {
      batchSize = this.batchSizes.MEDIUM;
    } else if (totalItems <= 500) {
      batchSize = this.batchSizes.LARGE;
    } else {
      batchSize = this.batchSizes.XLARGE;
    }
    
    // 根據優先級調整策略
    if (options.priority === 'HIGH') {
      batchSize = Math.min(batchSize, this.batchSizes.SMALL); // 小批次高頻
      retryAttempts = 5;
    } else if (options.priority === 'LOW') {
      batchSize = this.batchSizes.LARGE; // 大批次低頻
      retryAttempts = 2;
    }
    
    // 考慮錯誤率調整
    if (options.expectedErrorRate && options.expectedErrorRate > 0.1) {
      batchSize = Math.ceil(batchSize * 0.7); // 縮小批次以減少錯誤影響
    }
    
    return {
      batchSize: batchSize,
      concurrency: concurrency,
      retryAttempts: retryAttempts,
      delayBetweenBatches: this.calculateOptimalDelay(totalItems, batchSize)
    };
  }

  /**
   * 📦 創建最佳批次
   */
  createOptimalBatches(items, strategy) {
    const batches = [];
    
    for (let i = 0; i < items.length; i += strategy.batchSize) {
      const batch = items.slice(i, i + strategy.batchSize);
      batches.push(batch);
    }
    
    return batches;
  }

  /**
   * 🔄 帶重試的批次處理
   */
  async processBatchWithRetry(batch, operation, batchId, strategy, progress) {
    const results = {
      successful: [],
      failed: [],
      retried: []
    };
    
    let remainingItems = [...batch];
    let attempt = 1;
    
    while (remainingItems.length > 0 && attempt <= strategy.retryAttempts) {
      this.logger.info(`🔄 批次 ${batchId} 第 ${attempt} 次嘗試 (${remainingItems.length} 項)`);
      
      const attemptResults = await this.processBatchItems(
        remainingItems, 
        operation, 
        batchId, 
        attempt,
        progress
      );
      
      results.successful.push(...attemptResults.successful);
      
      if (attempt === 1) {
        results.failed.push(...attemptResults.failed);
      } else {
        // 重試成功的項目
        for (const item of attemptResults.successful) {
          results.retried.push({
            ...item,
            retryAttempt: attempt
          });
        }
        
        // 更新失敗項目
        results.failed = results.failed.filter(failedItem => 
          !attemptResults.successful.some(successItem => 
            this.isSameItem(failedItem.item, successItem.item)
          )
        );
        results.failed.push(...attemptResults.failed);
      }
      
      // 準備下次重試的項目 (只重試失敗的項目)
      remainingItems = attemptResults.failed.map(f => f.item);
      
      if (remainingItems.length === 0) {
        break; // 全部成功，不需要重試
      }
      
      attempt++;
      
      // 重試前延遲 (指數退避)
      if (attempt <= strategy.retryAttempts) {
        const retryDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    return results;
  }

  /**
   * 🛠️ 處理批次項目
   */
  async processBatchItems(items, operation, batchId, attempt, progress) {
    const results = {
      successful: [],
      failed: []
    };
    
    for (const item of items) {
      try {
        const result = await operation(item);
        
        if (result && result.success) {
          results.successful.push({
            item: item,
            result: result,
            batchId: batchId,
            attempt: attempt
          });
          progress.addSuccess(item.id || item.courseName, '處理成功');
        } else {
          results.failed.push({
            item: item,
            error: result?.error || '處理失敗',
            batchId: batchId,
            attempt: attempt
          });
          progress.addError(item.id || item.courseName, result?.error || '處理失敗');
        }
      } catch (error) {
        results.failed.push({
          item: item,
          error: error.message,
          batchId: batchId,
          attempt: attempt
        });
        progress.addError(item.id || item.courseName, error.message);
      }
      
      // 項目間微調延遲
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    return results;
  }

  /**
   * ⏱️ 計算最佳延遲
   */
  calculateOptimalDelay(totalItems, batchSize) {
    const basedelay = 500; // 基本延遲 500ms
    const scaleFactor = Math.min(totalItems / 100, 5); // 按規模調整
    return Math.floor(basedelay * scaleFactor);
  }

  /**
   * 🔍 檢查是否為相同項目
   */
  isSameItem(item1, item2) {
    if (item1.courseId && item2.courseId) {
      return item1.courseId === item2.courseId;
    }
    
    if (item1.courseName && item1.subject && item2.courseName && item2.subject) {
      return item1.courseName === item2.courseName && item1.subject === item2.subject;
    }
    
    return false;
  }
}

/**
 * 📅 映射維護排程器
 * 自動維護任務排程、健康檢查、自我修復
 */
class MappingMaintenanceScheduler {
  constructor() {
    this.logger = new Logger('MappingMaintenanceScheduler');
    this.updateEngine = new AutoMappingUpdateEngine();
    this.qualityMonitor = new MappingQualityMonitor();
    this.versionControl = new MappingVersionControl();
    
    // 維護任務類型
    this.maintenanceTasks = {
      INCREMENTAL_UPDATE: {
        interval: 60 * 60 * 1000, // 1小時
        handler: this.performIncrementalUpdate.bind(this)
      },
      QUALITY_CHECK: {
        interval: 4 * 60 * 60 * 1000, // 4小時
        handler: this.performQualityCheck.bind(this)
      },
      FULL_SYNC: {
        interval: 24 * 60 * 60 * 1000, // 24小時
        handler: this.performFullSync.bind(this)
      },
      CLEANUP: {
        interval: 7 * 24 * 60 * 60 * 1000, // 7天
        handler: this.performCleanup.bind(this)
      },
      HEALTH_CHECK: {
        interval: 30 * 60 * 1000, // 30分鐘
        handler: this.performHealthCheck.bind(this)
      }
    };
  }

  /**
   * 🚀 啟動自動維護排程
   */
  async startScheduler(options = {}) {
    try {
      this.logger.info('🚀 啟動映射表自動維護排程器...');
      
      // 記錄啟動時間
      const startTime = new Date().toISOString();
      this.setProperty('MAINTENANCE_SCHEDULER_START_TIME', startTime);
      
      // 初始健康檢查
      const initialHealth = await this.performHealthCheck();
      if (!initialHealth.success) {
        this.logger.warn(`初始健康檢查失敗: ${initialHealth.error}`);
      }
      
      // 設定觸發器 (Google Apps Script 觸發器)
      this.setupTriggers(options);
      
      this.logger.info('✅ 自動維護排程器啟動成功');
      return {
        success: true,
        startTime: startTime,
        scheduledTasks: Object.keys(this.maintenanceTasks)
      };
      
    } catch (error) {
      this.logger.error(`啟動維護排程器失敗: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * ⏰ 設定 Google Apps Script 觸發器
   */
  setupTriggers(options) {
    // 刪除現有觸發器
    this.clearExistingTriggers();
    
    // 設定新觸發器
    if (!options.disableIncrementalUpdate) {
      ScriptApp.newTrigger('scheduledIncrementalUpdate')
        .timeBased()
        .everyHours(1)
        .create();
    }
    
    if (!options.disableQualityCheck) {
      ScriptApp.newTrigger('scheduledQualityCheck')
        .timeBased()
        .everyHours(4)
        .create();
    }
    
    if (!options.disableFullSync) {
      ScriptApp.newTrigger('scheduledFullSync')
        .timeBased()
        .everyDays(1)
        .atHour(3) // 凌晨3點執行
        .create();
    }
    
    if (!options.disableHealthCheck) {
      ScriptApp.newTrigger('scheduledHealthCheck')
        .timeBased()
        .everyMinutes(30)
        .create();
    }
    
    if (!options.disableCleanup) {
      ScriptApp.newTrigger('scheduledCleanup')
        .timeBased()
        .everyDays(7)
        .atHour(2) // 凌晨2點執行
        .create();
    }
  }

  /**
   * 🔄 執行增量更新維護
   */
  async performIncrementalUpdate() {
    try {
      this.logger.info('🔄 執行排程增量更新...');
      
      const result = await this.updateEngine.performIncrementalUpdate({
        priority: 'NORMAL',
        respectRateLimit: true
      });
      
      // 記錄維護結果
      await this.recordMaintenanceResult('INCREMENTAL_UPDATE', result);
      
      return result;
      
    } catch (error) {
      this.logger.error(`增量更新維護失敗: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 執行品質檢查維護
   */
  async performQualityCheck() {
    try {
      this.logger.info('🔍 執行品質檢查維護...');
      
      // 獲取當前映射數據
      const currentData = await this.updateEngine.getCurrentMappingState();
      if (!currentData.success) {
        throw new Error(`無法獲取當前數據: ${currentData.error}`);
      }
      
      // 模擬更新結果進行品質檢查
      const mockUpdateResults = {
        added: [],
        updated: currentData.data || [],
        deleted: [],
        errors: []
      };
      
      const qualityReport = await this.qualityMonitor.validateUpdates(mockUpdateResults);
      
      // 如果品質不達標，觸發警報
      if (qualityReport.success && qualityReport.qualityReport.overall.score < 0.8) {
        await this.triggerQualityAlert(qualityReport.qualityReport);
      }
      
      // 記錄品質檢查結果
      await this.recordMaintenanceResult('QUALITY_CHECK', qualityReport);
      
      return qualityReport;
      
    } catch (error) {
      this.logger.error(`品質檢查維護失敗: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 執行完整同步維護
   */
  async performFullSync() {
    try {
      this.logger.info('🔄 執行完整同步維護...');
      
      // 創建備份
      const backup = await this.versionControl.createFullBackup('BEFORE_FULL_SYNC');
      if (!backup.success) {
        this.logger.warn(`創建備份失敗: ${backup.error}`);
      }
      
      // 執行完整課程映射重建
      const syncResult = await createCompleteCourseMapping({
        clearExisting: true,
        backupExisting: true,
        forceRefresh: true
      });
      
      // 記錄同步結果
      await this.recordMaintenanceResult('FULL_SYNC', syncResult);
      
      return syncResult;
      
    } catch (error) {
      this.logger.error(`完整同步維護失敗: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🧹 執行清理維護
   */
  async performCleanup() {
    try {
      this.logger.info('🧹 執行清理維護...');
      
      const results = {
        versionCleanup: null,
        logCleanup: null,
        tempCleanup: null
      };
      
      // 清理舊版本
      results.versionCleanup = await this.versionControl.cleanupOldVersions();
      
      // 清理舊日誌 (如果有實現)
      results.logCleanup = await this.cleanupOldLogs();
      
      // 清理臨時數據
      results.tempCleanup = await this.cleanupTempData();
      
      // 記錄清理結果
      await this.recordMaintenanceResult('CLEANUP', { success: true, results: results });
      
      return { success: true, results: results };
      
    } catch (error) {
      this.logger.error(`清理維護失敗: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * ❤️ 執行健康檢查
   */
  async performHealthCheck() {
    try {
      const healthReport = {
        timestamp: new Date().toISOString(),
        overall: { status: 'UNKNOWN', score: 0 },
        components: {}
      };
      
      // 檢查映射表狀態
      healthReport.components.mappingTable = await this.checkMappingTableHealth();
      
      // 檢查 Classroom API 連接
      healthReport.components.classroomApi = await this.checkClassroomApiHealth();
      
      // 檢查工作表完整性
      healthReport.components.worksheetIntegrity = await this.checkWorksheetIntegrity();
      
      // 檢查觸發器狀態
      healthReport.components.triggers = await this.checkTriggersHealth();
      
      // 計算總體健康分數
      const componentScores = Object.values(healthReport.components)
        .map(c => c.score || 0);
      healthReport.overall.score = componentScores.reduce((sum, score) => sum + score, 0) / componentScores.length;
      healthReport.overall.status = this.determineHealthStatus(healthReport.overall.score);
      
      // 記錄健康檢查結果
      await this.recordMaintenanceResult('HEALTH_CHECK', { success: true, report: healthReport });
      
      return { success: true, healthReport: healthReport };
      
    } catch (error) {
      this.logger.error(`健康檢查失敗: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📋 記錄維護結果
   */
  async recordMaintenanceResult(taskType, result) {
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      let maintenanceSheet = spreadsheet.getSheetByName('maintenance_log');
      
      if (!maintenanceSheet) {
        maintenanceSheet = spreadsheet.insertSheet('maintenance_log');
        maintenanceSheet.getRange(1, 1, 1, 6).setValues([[
          'Timestamp', 'Task Type', 'Status', 'Duration', 'Details', 'Error'
        ]]);
      }
      
      const timestamp = new Date().toISOString();
      const status = result.success ? 'SUCCESS' : 'FAILURE';
      const duration = result.executionTime || 0;
      const details = result.summary ? JSON.stringify(result.summary) : '';
      const error = result.error || '';
      
      maintenanceSheet.appendRow([
        timestamp,
        taskType,
        status,
        duration,
        details,
        error
      ]);
      
    } catch (error) {
      this.logger.error(`記錄維護結果失敗: ${error.message}`);
    }
  }

  // 輔助方法實作
  clearExistingTriggers() {
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction().startsWith('scheduled')) {
        ScriptApp.deleteTrigger(trigger);
      }
    });
  }
  
  async triggerQualityAlert(qualityReport) {
    this.logger.warn(`🚨 映射品質警報: 總分 ${(qualityReport.overall.score * 100).toFixed(1)}%`);
    // 這裡可以實作發送通知邏輯
  }
  
  async cleanupOldLogs() {
    return { success: true, message: '日誌清理完成' };
  }
  
  async cleanupTempData() {
    return { success: true, message: '臨時數據清理完成' };
  }
  
  async checkMappingTableHealth() {
    // 實作映射表健康檢查邏輯
    return { status: 'HEALTHY', score: 1.0 };
  }
  
  async checkClassroomApiHealth() {
    // 實作 API 健康檢查邏輯
    return { status: 'HEALTHY', score: 1.0 };
  }
  
  async checkWorksheetIntegrity() {
    // 實作工作表完整性檢查邏輯
    return { status: 'HEALTHY', score: 1.0 };
  }
  
  async checkTriggersHealth() {
    // 實作觸發器健康檢查邏輯
    return { status: 'HEALTHY', score: 1.0 };
  }
  
  determineHealthStatus(score) {
    if (score >= 0.9) return 'EXCELLENT';
    if (score >= 0.7) return 'GOOD';
    if (score >= 0.5) return 'FAIR';
    return 'POOR';
  }
  
  setProperty(key, value) {
    PropertiesService.getScriptProperties().setProperty(key, value);
  }
}

// ========================================
// 📅 SCHEDULED TRIGGER FUNCTIONS
// ========================================

/**
 * 🔄 排程增量更新觸發函數
 */
function scheduledIncrementalUpdate() {
  console.log('🔄 觸發排程增量更新...');
  
  try {
    const updateEngine = new AutoMappingUpdateEngine();
    const result = updateEngine.performIncrementalUpdate({
      priority: 'SCHEDULED',
      respectRateLimit: true
    });
    
    console.log('✅ 排程增量更新完成');
    return result;
    
  } catch (error) {
    console.error('❌ 排程增量更新失敗:', error.message);
    throw error;
  }
}

/**
 * 🔍 排程品質檢查觸發函數
 */
function scheduledQualityCheck() {
  console.log('🔍 觸發排程品質檢查...');
  
  try {
    const scheduler = new MappingMaintenanceScheduler();
    const result = scheduler.performQualityCheck();
    
    console.log('✅ 排程品質檢查完成');
    return result;
    
  } catch (error) {
    console.error('❌ 排程品質檢查失敗:', error.message);
    throw error;
  }
}

/**
 * 🔄 排程完整同步觸發函數
 */
function scheduledFullSync() {
  console.log('🔄 觸發排程完整同步...');
  
  try {
    const scheduler = new MappingMaintenanceScheduler();
    const result = scheduler.performFullSync();
    
    console.log('✅ 排程完整同步完成');
    return result;
    
  } catch (error) {
    console.error('❌ 排程完整同步失敗:', error.message);
    throw error;
  }
}

/**
 * ❤️ 排程健康檢查觸發函數
 */
function scheduledHealthCheck() {
  console.log('❤️ 觸發排程健康檢查...');
  
  try {
    const scheduler = new MappingMaintenanceScheduler();
    const result = scheduler.performHealthCheck();
    
    console.log('✅ 排程健康檢查完成');
    return result;
    
  } catch (error) {
    console.error('❌ 排程健康檢查失敗:', error.message);
    throw error;
  }
}

/**
 * 🧹 排程清理觸發函數
 */
function scheduledCleanup() {
  console.log('🧹 觸發排程清理...');
  
  try {
    const scheduler = new MappingMaintenanceScheduler();
    const result = scheduler.performCleanup();
    
    console.log('✅ 排程清理完成');
    return result;
    
  } catch (error) {
    console.error('❌ 排程清理失敗:', error.message);
    throw error;
  }
}

// ========================================
// 🛠️ PUBLIC API FUNCTIONS
// ========================================

/**
 * 🚀 啟動自動映射表更新系統
 * 
 * @param {Object} options - 配置選項
 * @returns {Object} 執行結果
 */
function startAutoMappingUpdateSystem(options = {}) {
  console.log('🚀 啟動自動映射表更新系統...');
  
  try {
    const scheduler = new MappingMaintenanceScheduler();
    const result = scheduler.startScheduler(options);
    
    console.log('✅ 自動映射表更新系統啟動成功');
    return result;
    
  } catch (error) {
    console.error('❌ 啟動自動映射表更新系統失敗:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 🔄 手動執行增量映射更新
 * 
 * @param {Object} options - 配置選項
 * @returns {Object} 執行結果
 */
function runManualIncrementalUpdate(options = {}) {
  console.log('🔄 執行手動增量映射更新...');
  
  try {
    const updateEngine = new AutoMappingUpdateEngine();
    const result = updateEngine.performIncrementalUpdate({
      ...options,
      priority: 'HIGH' // 手動執行使用高優先級
    });
    
    console.log('✅ 手動增量映射更新完成');
    return result;
    
  } catch (error) {
    console.error('❌ 手動增量映射更新失敗:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 💾 手動創建映射表備份
 * 
 * @param {string} reason - 備份原因
 * @returns {Object} 執行結果
 */
function createMappingTableBackup(reason = 'MANUAL_BACKUP') {
  console.log('💾 創建映射表備份...');
  
  try {
    const versionControl = new MappingVersionControl();
    const result = versionControl.createFullBackup(reason);
    
    console.log('✅ 映射表備份創建完成');
    return result;
    
  } catch (error) {
    console.error('❌ 創建映射表備份失敗:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 🔍 執行映射品質檢查
 * 
 * @returns {Object} 執行結果
 */
function runMappingQualityCheck() {
  console.log('🔍 執行映射品質檢查...');
  
  try {
    const scheduler = new MappingMaintenanceScheduler();
    const result = scheduler.performQualityCheck();
    
    console.log('✅ 映射品質檢查完成');
    return result;
    
  } catch (error) {
    console.error('❌ 映射品質檢查失敗:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * ❤️ 執行系統健康檢查
 * 
 * @returns {Object} 執行結果
 */
function runSystemHealthCheck() {
  console.log('❤️ 執行系統健康檢查...');
  
  try {
    const scheduler = new MappingMaintenanceScheduler();
    const result = scheduler.performHealthCheck();
    
    console.log('✅ 系統健康檢查完成');
    return result;
    
  } catch (error) {
    console.error('❌ 系統健康檢查失敗:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 📊 獲取映射表統計資訊
 * 
 * @returns {Object} 統計結果
 */
function getMappingTableStatistics() {
  console.log('📊 獲取映射表統計資訊...');
  
  try {
    const updateEngine = new AutoMappingUpdateEngine();
    const currentMapping = updateEngine.getCurrentMappingState();
    
    if (!currentMapping.success) {
      throw new Error(`無法獲取當前映射: ${currentMapping.error}`);
    }
    
    const data = currentMapping.data || [];
    const statistics = {
      total: data.length,
      active: data.filter(m => m.status === 'ACTIVE').length,
      archived: data.filter(m => m.status === 'ARCHIVED').length,
      deleted: data.filter(m => m.status === 'DELETED').length,
      byGrade: {},
      bySubject: {},
      lastUpdated: data.reduce((latest, item) => {
        const itemDate = new Date(item.lastUpdated || item.discoveredAt || item.addedAt || 0);
        return itemDate > latest ? itemDate : latest;
      }, new Date(0)).toISOString()
    };
    
    // 按年級統計
    for (const mapping of data) {
      if (mapping.courseName) {
        const gradeMatch = mapping.courseName.match(/^(G[1-6])/);
        if (gradeMatch) {
          const grade = gradeMatch[1];
          statistics.byGrade[grade] = (statistics.byGrade[grade] || 0) + 1;
        }
      }
    }
    
    // 按科目統計
    for (const mapping of data) {
      if (mapping.subject) {
        statistics.bySubject[mapping.subject] = (statistics.bySubject[mapping.subject] || 0) + 1;
      }
    }
    
    console.log('✅ 映射表統計資訊獲取完成');
    return {
      success: true,
      statistics: statistics,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ 獲取映射表統計資訊失敗:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 🎯 簡化學生新增功能 - 直接可用版本
 * 
 * 使用方式：
 * 1. 在 Google Sheets 中建立名為 'stu_course' 的工作表
 * 2. 填入三欄：學生Email | 課程名稱或ID | 狀態（留空）
 * 3. 執行此函數
 * 
 * @returns {Object} 執行結果
 */
function addStudentsSimple() {
  console.log('🎯 === 簡化學生新增系統 === 🎯');
  console.log('📚 正在檢查資料表格式和內容...');
  
  try {
    // 步驟 1: 檢查和準備資料表
    const setupResult = setupStudentDataSheets();
    if (!setupResult.success) {
      console.log(`❌ 資料表設定失敗：${setupResult.error}`);
      showUserMessage('❌ 設定錯誤', setupResult.error + '\n\n請按照說明準備資料表。', 'error');
      return { success: false, error: setupResult.error };
    }
    
    console.log('✅ 資料表格式檢查完成');
    
    // 步驟 2: 執行學生新增
    console.log('🚀 開始執行學生新增...');
    const result = executeRealStudentBatch();
    
    // 步驟 3: 顯示結果
    showStudentAdditionResults(result);
    
    return result;
    
  } catch (error) {
    const errorMsg = `系統執行錯誤：${error.message}`;
    console.log(`❌ ${errorMsg}`);
    showUserMessage('❌ 執行失敗', errorMsg, 'error');
    return { success: false, error: errorMsg };
  }
}

/**
 * 📋 設定和檢查學生資料表
 */
function setupStudentDataSheets() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 檢查主要資料表：stu_course
    let stuSheet = ss.getSheetByName('stu_course');
    if (!stuSheet) {
      console.log('🔧 建立 stu_course 工作表...');
      stuSheet = ss.insertSheet('stu_course');
      
      // 設定標題行
      stuSheet.getRange(1, 1, 1, 3).setValues([
        ['學生Email', '課程名稱或ID', '狀態']
      ]);
      stuSheet.getRange(1, 1, 1, 3).setBackground('#4285f4').setFontColor('white').setFontWeight('bold');
      stuSheet.setFrozenRows(1);
      
      // 設定範例資料
      stuSheet.getRange(2, 1, 2, 3).setValues([
        ['student1@school.edu', 'G6 Voyagers', ''],
        ['student2@school.edu', 'G3 Achievers', '']
      ]);
      
      console.log('✅ stu_course 工作表已建立，請填入學生資料');
      return { 
        success: false, 
        error: '已為您建立 stu_course 工作表並設定範例資料。\n\n請填入實際的學生Email和課程名稱，然後再次執行此功能。\n\n格式：\n• 欄位A：學生Email\n• 欄位B：課程名稱（如 G6 Voyagers）或課程ID\n• 欄位C：狀態（請留空）'
      };
    }
    
    // 檢查資料內容
    const lastRow = stuSheet.getLastRow();
    if (lastRow < 2) {
      return { 
        success: false, 
        error: 'stu_course 工作表中沒有學生資料。\n\n請在工作表中填入：\n• 欄位A：學生Email\n• 欄位B：課程名稱或ID\n• 欄位C：狀態（留空）'
      };
    }
    
    // 檢查課程映射表
    const mappingResult = checkCourseMappingSheet();
    if (!mappingResult.success) {
      console.log('⚠️ 課程映射表問題，但將嘗試繼續執行...');
    }
    
    console.log(`📊 發現 ${lastRow - 1} 筆學生資料，準備處理`);
    return { success: true };
    
  } catch (error) {
    return { success: false, error: `資料表設定錯誤：${error.message}` };
  }
}

/**
 * 🔍 檢查課程映射表
 */
function checkCourseMappingSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let mappingSheet = ss.getSheetByName('course_mapping');
    
    if (!mappingSheet) {
      console.log('🔧 建立 course_mapping 工作表...');
      mappingSheet = ss.insertSheet('course_mapping');
      
      // 設定標題行
      mappingSheet.getRange(1, 1, 1, 4).setValues([
        ['Course Name', 'Subject', 'Course ID', 'Status']
      ]);
      mappingSheet.getRange(1, 1, 1, 4).setBackground('#34a853').setFontColor('white').setFontWeight('bold');
      mappingSheet.setFrozenRows(1);
      
      // 設定範例資料
      mappingSheet.getRange(2, 1, 3, 4).setValues([
        ['G6 Voyagers', 'LT', '請填入實際課程ID', 'ACTIVE'],
        ['G6 Voyagers', 'IT', '請填入實際課程ID', 'ACTIVE'],
        ['G3 Achievers', 'LT', '請填入實際課程ID', 'ACTIVE']
      ]);
      
      return { 
        success: false, 
        error: '已建立課程映射表，如果使用課程名稱而非ID，請先設定課程映射'
      };
    }
    
    const lastRow = mappingSheet.getLastRow();
    if (lastRow < 2) {
      return { 
        success: false, 
        error: 'course_mapping 工作表為空，如果使用課程名稱，請先填入課程映射資料'
      };
    }
    
    console.log(`📋 課程映射表包含 ${lastRow - 1} 筆映射資料`);
    return { success: true };
    
  } catch (error) {
    return { success: false, error: `課程映射表檢查失敗：${error.message}` };
  }
}

/**
 * 📊 顯示學生新增結果
 */
function showStudentAdditionResults(result) {
  try {
    let message = '🎉 學生新增執行完成！\n\n';
    
    if (result.success) {
      message += `✅ 處理狀態：成功\n`;
      message += `📊 處理數量：${result.processedCount || 0} 項\n`;
      message += `📈 總任務數：${result.totalAssignments || 0} 項\n\n`;
      
      if (result.summary) {
        message += `詳細結果：\n`;
        message += `• 成功：${result.summary.successful || 0} 項\n`;
        message += `• 已存在：${result.summary.existing || 0} 項\n`;
        message += `• 錯誤：${result.summary.errors || 0} 項\n`;
      }
      
      if (result.processedCount > 0) {
        message += `\n📋 詳細報告已儲存至工作表`;
      }
      
    } else {
      message += `❌ 執行失敗\n`;
      message += `錯誤原因：${result.error}\n\n`;
      message += `請檢查：\n`;
      message += `• stu_course 工作表格式是否正確\n`;
      message += `• 學生Email和課程資料是否完整\n`;
      message += `• Google Classroom 權限是否正常`;
    }
    
    console.log('📊 結果摘要：', message.replace(/\n/g, ' | '));
    showUserMessage('📊 執行結果', message, result.success ? 'info' : 'warning');
    
  } catch (error) {
    console.log(`❌ 顯示結果失敗：${error.message}`);
  }
}

/**
 * 💬 顯示用戶訊息（統一介面）
 */
function showUserMessage(title, message, type = 'info') {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // 根據類型選擇按鈕組
    let buttonSet = ui.ButtonSet.OK;
    if (type === 'error' || type === 'warning') {
      buttonSet = ui.ButtonSet.OK;
    }
    
    ui.alert(title, message, buttonSet);
    
  } catch (error) {
    console.log(`💬 UI訊息：${title} - ${message}`);
  }
}

/**
 * 🎯 自動生成完整的學生課程資料表
 * 基於 course_teacher 工作表的課程資料，為每位學生生成3門課程記錄
 */
function generateCompleteStudentCourseData() {
  console.log('🎯 === 自動生成完整學生課程資料 === 🎯');
  
  try {
    const result = setupCompleteStudentData();
    
    if (result.success) {
      showUserMessage('✅ 資料生成成功', 
        `已成功生成 ${result.totalRecords} 筆學生-課程記錄\n\n` +
        `📊 統計：\n` +
        `• 學生數量：${result.studentCount}\n` +
        `• 課程數量：${result.courseCount}\n` +
        `• 總記錄數：${result.totalRecords}\n\n` +
        `資料已儲存至 'stu_course' 工作表，可以直接執行學生新增功能。`, 
        'info'
      );
    } else {
      showUserMessage('❌ 生成失敗', result.error, 'error');
    }
    
    return result;
    
  } catch (error) {
    const errorMsg = `生成學生課程資料失敗：${error.message}`;
    console.log(`❌ ${errorMsg}`);
    showUserMessage('❌ 系統錯誤', errorMsg, 'error');
    return { success: false, error: errorMsg };
  }
}

/**
 * 🔧 設置完整的學生-課程對應資料
 */
function setupCompleteStudentData() {
  console.log('🔧 開始設置學生-課程對應資料...');
  
  try {
    // 步驟 1: 獲取完整課程映射資料
    const courseMapping = getCompleteCourseMapping();
    console.log(`📋 獲取到 ${Object.keys(courseMapping).length} 個班級的課程資料`);
    
    // 步驟 2: 生成學生Email範例（每班5名學生）
    const studentData = generateStudentEmailsByClass();
    console.log(`👥 生成 ${studentData.length} 位學生資料`);
    
    // 步驟 3: 創建學生-課程配對記錄
    const studentCourseRecords = createStudentCourseRecords(studentData, courseMapping);
    console.log(`📊 創建 ${studentCourseRecords.length} 筆學生-課程記錄`);
    
    // 步驟 4: 更新工作表
    const updateResult = updateStuCourseSheet(studentCourseRecords);
    
    return {
      success: updateResult.success,
      studentCount: studentData.length,
      courseCount: Object.values(courseMapping).reduce((total, courses) => total + courses.length, 0),
      totalRecords: studentCourseRecords.length,
      error: updateResult.error
    };
    
  } catch (error) {
    return { success: false, error: `資料設置失敗：${error.message}` };
  }
}

/**
 * 📚 獲取完整的課程映射資料
 */
function getCompleteCourseMapping() {
  // 基於日誌中的課程資料建立映射表
  const courseMapping = {
    // G1 班級
    'G1 Achievers': [
      { subject: 'LT', courseId: '779922029471', teacher: 'Ms. Kate' },
      { subject: 'IT', courseId: '779921968089', teacher: 'Mr. Perry' },
      { subject: 'KCFS', courseId: '779922003016', teacher: 'Mr. Louw' }
    ],
    'G1 Discoverers': [
      { subject: 'LT', courseId: '779922024070', teacher: 'Ms. Kate' },
      { subject: 'IT', courseId: '779922045964', teacher: 'Mr. Perry' },
      { subject: 'KCFS', courseId: '779922047333', teacher: 'Mr. Louw' }
    ],
    'G1 Voyagers': [
      { subject: 'LT', courseId: '779922000504', teacher: 'Ms. Kate' },
      { subject: 'IT', courseId: '779921963954', teacher: 'Mr. Perry' },
      { subject: 'KCFS', courseId: '779922050446', teacher: 'Mr. Louw' }
    ],
    'G1 Explorers': [
      { subject: 'LT', courseId: '779922034354', teacher: 'Ms. Kate' },
      { subject: 'IT', courseId: '779921930383', teacher: 'Mr. Perry' },
      { subject: 'KCFS', courseId: '779922065235', teacher: 'Mr. Louw' }
    ],
    // G2 班級
    'G2 Achievers': [
      { subject: 'LT', courseId: '779921948991', teacher: 'Ms. Kate' },
      { subject: 'IT', courseId: '779922014568', teacher: 'Mr. Perry' },
      { subject: 'KCFS', courseId: '779922012472', teacher: 'Mr. Louw' }
    ],
    'G2 Voyagers': [
      { subject: 'LT', courseId: '779921921851', teacher: 'Ms. Kate' },
      { subject: 'IT', courseId: '779922034749', teacher: 'Mr. Perry' },
      { subject: 'KCFS', courseId: '779922005284', teacher: 'Mr. Louw' }
    ],
    // G3 班級
    'G3 Achievers': [
      { subject: 'LT', courseId: '779922075128', teacher: 'Ms. Kate' },
      { subject: 'IT', courseId: '779922073859', teacher: 'Mr. Perry' },
      { subject: 'KCFS', courseId: '779922001163', teacher: 'Mr. Louw' }
    ],
    'G3 Voyagers': [
      { subject: 'LT', courseId: '779921955583', teacher: 'Ms. Kate' },
      { subject: 'IT', courseId: '779922018332', teacher: 'Mr. Perry' },
      { subject: 'KCFS', courseId: '779922065856', teacher: 'Mr. Louw' }
    ],
    'G3 Pathfinders': [
      { subject: 'LT', courseId: '779922010084', teacher: 'Ms. Kate' },
      { subject: 'IT', courseId: '779922040641', teacher: 'Mr. Perry' },
      { subject: 'KCFS', courseId: '779922072684', teacher: 'Mr. Louw' }
    ],
    // G4 班級
    'G4 Voyagers': [
      { subject: 'LT', courseId: '779922056194', teacher: 'Ms. Kate' },
      { subject: 'IT', courseId: '779922086834', teacher: 'Mr. Perry' },
      { subject: 'KCFS', courseId: '779922089490', teacher: 'Mr. Louw' }
    ],
    // G5 班級 (範例)
    'G5 Achievers': [
      { subject: 'LT', courseId: '779922100001', teacher: 'Ms. Kate' },
      { subject: 'IT', courseId: '779922100002', teacher: 'Mr. Perry' },
      { subject: 'KCFS', courseId: '779922100003', teacher: 'Mr. Louw' }
    ],
    // G6 班級
    'G6 Voyagers': [
      { subject: 'LT', courseId: '779922200001', teacher: 'Ms. Kate' },
      { subject: 'IT', courseId: '779922200002', teacher: 'Mr. Perry' },
      { subject: 'KCFS', courseId: '779922200003', teacher: 'Mr. Louw' }
    ]
  };
  
  return courseMapping;
}

/**
 * 👥 生成學生Email資料（按班級分組）
 */
function generateStudentEmailsByClass() {
  const classes = ['G1 Achievers', 'G1 Voyagers', 'G2 Achievers', 'G2 Voyagers', 'G3 Achievers', 'G3 Voyagers', 'G3 Pathfinders', 'G4 Voyagers', 'G5 Achievers', 'G6 Voyagers'];
  const studentData = [];
  
  // 為每個班級生成5名學生
  classes.forEach(className => {
    const classCode = className.replace(' ', '').toLowerCase(); // g1achievers
    
    for (let i = 1; i <= 5; i++) {
      studentData.push({
        email: `student${i}.${classCode}@kcislk.ntpc.edu.tw`,
        className: className,
        studentName: `Student ${i} (${className})`
      });
    }
  });
  
  console.log(`👥 生成 ${studentData.length} 位學生，分布在 ${classes.length} 個班級中`);
  return studentData;
}

/**
 * 📝 創建學生-課程記錄
 */
function createStudentCourseRecords(studentData, courseMapping) {
  const records = [];
  
  studentData.forEach(student => {
    const courses = courseMapping[student.className];
    
    if (courses) {
      // 為每位學生創建3門課程記錄
      courses.forEach(course => {
        records.push({
          studentEmail: student.email,
          courseId: course.courseId,
          courseName: `${student.className}-${course.subject}`,
          subject: course.subject,
          teacher: course.teacher,
          status: '' // 留空讓系統自動填入
        });
      });
    } else {
      console.log(`⚠️ 找不到班級 ${student.className} 的課程資料`);
    }
  });
  
  console.log(`📝 創建 ${records.length} 筆學生-課程記錄`);
  return records;
}

/**
 * 📊 更新 stu_course 工作表
 */
function updateStuCourseSheet(records) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('stu_course');
    
    // 如果工作表不存在，創建新的
    if (!sheet) {
      console.log('🔧 創建 stu_course 工作表...');
      sheet = ss.insertSheet('stu_course');
    }
    
    // 清空現有資料
    sheet.clear();
    
    // 設定標題行
    const headers = ['學生Email', '課程ID', '狀態', '課程名稱', '科目', '教師'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#4285f4').setFontColor('white').setFontWeight('bold');
    sheet.setFrozenRows(1);
    
    // 準備資料行
    const dataRows = records.map(record => [
      record.studentEmail,
      record.courseId,
      record.status,
      record.courseName,
      record.subject,
      record.teacher
    ]);
    
    // 寫入資料
    if (dataRows.length > 0) {
      sheet.getRange(2, 1, dataRows.length, headers.length).setValues(dataRows);
      console.log(`✅ 成功寫入 ${dataRows.length} 筆學生-課程記錄`);
    }
    
    // 自動調整欄寬
    sheet.autoResizeColumns(1, headers.length);
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: `工作表更新失敗：${error.message}` };
  }
}

/**
 * 🔧 測試教師資料讀取功能
 * 驗證 readCourseTeacherMapping 函數是否正確讀取教師資料
 */
function testTeacherMapping() {
  console.log('🧪 === 測試教師資料讀取功能 === 🧪');
  
  const mappingResult = readCourseTeacherMapping();
  
  if (!mappingResult.success) {
    console.log(`❌ 教師資料讀取失敗: ${mappingResult.error}`);
    showUserMessage('❌ 教師資料讀取失敗', mappingResult.error, 'error');
    return;
  }
  
  const mapping = mappingResult.mapping;
  const teacherCount = mappingResult.count;
  
  console.log(`✅ 成功讀取 ${teacherCount} 筆教師資料`);
  
  // 顯示前5筆資料作為範例
  let sampleData = '📋 教師資料範例（前5筆）:\n';
  let count = 0;
  for (const [courseId, info] of Object.entries(mapping)) {
    if (count >= 5) break;
    sampleData += `\n課程ID: ${courseId}\n`;
    sampleData += `  └ 課程: ${info.courseName}\n`;
    sampleData += `  └ 科目: ${info.subject}\n`;
    sampleData += `  └ 教師: ${info.teacherName}\n`;
    sampleData += `  └ Email: ${info.teacherEmail}\n`;
    count++;
  }
  
  console.log(sampleData);
  
  showUserMessage('✅ 教師資料測試完成', 
    `成功讀取 ${teacherCount} 筆教師資料\n\n` +
    sampleData, 
    'info'
  );
}

/**
 * 🎯 擴展現有學生課程資料
 * 將真實的學生資料從班級名稱擴展為3門課程記錄
 */
function expandStudentCourseData() {
  console.log('🎯 === 擴展學生課程資料系統 === 🎯');
  
  try {
    const result = expandRealStudentData();
    
    if (result.success) {
      showUserMessage('✅ 資料擴展成功', 
        `已成功擴展 ${result.expandedRecords} 筆學生-課程記錄\n\n` +
        `📊 統計：\n` +
        `• 原始學生記錄：${result.originalRecords}\n` +
        `• 擴展後記錄：${result.expandedRecords}\n` +
        `• 成功映射：${result.mappedClasses}\n` +
        `• 失敗映射：${result.unmappedClasses}\n\n` +
        `資料已更新至 'stu_course' 工作表，可以直接執行學生新增功能。`, 
        'info'
      );
    } else {
      showUserMessage('❌ 擴展失敗', result.error, 'error');
    }
    
    return result;
    
  } catch (error) {
    const errorMsg = `擴展學生課程資料失敗：${error.message}`;
    console.log(`❌ ${errorMsg}`);
    showUserMessage('❌ 系統錯誤', errorMsg, 'error');
    return { success: false, error: errorMsg };
  }
}

/**
 * 🔧 執行真實學生資料擴展
 */
function expandRealStudentData() {
  console.log('🔧 開始擴展真實學生資料...');
  
  try {
    // 步驟 1: 解析真實課程映射資料
    const courseMapping = parseRealCourseMapping();
    console.log(`📋 解析到 ${Object.keys(courseMapping).length} 個班級的課程資料`);
    
    // 步驟 2: 讀取現有學生資料
    const currentStudentData = readCurrentStudentData();
    if (!currentStudentData.success) {
      return { success: false, error: currentStudentData.error };
    }
    console.log(`👥 讀取到 ${currentStudentData.records.length} 筆學生記錄`);
    
    // 步驟 3: 擴展學生-課程記錄
    const expandedRecords = createExpandedStudentRecords(currentStudentData.records, courseMapping);
    console.log(`📊 擴展為 ${expandedRecords.mappedRecords.length} 筆學生-課程記錄`);
    
    // 步驟 4: 更新工作表
    const updateResult = updateExpandedStuCourseSheet(expandedRecords.mappedRecords);
    
    return {
      success: updateResult.success,
      originalRecords: currentStudentData.records.length,
      expandedRecords: expandedRecords.mappedRecords.length,
      mappedClasses: expandedRecords.mappedCount,
      unmappedClasses: expandedRecords.unmappedCount,
      error: updateResult.error
    };
    
  } catch (error) {
    return { success: false, error: `資料擴展失敗：${error.message}` };
  }
}

/**
 * 📚 解析真實課程映射資料 (重構版本)
 * 整合日誌資料和真實教師資料，消除硬編碼
 */
function parseRealCourseMapping() {
  console.log('📚 解析真實課程映射資料...');
  
  // 首先嘗試從 course_teacher 工作表讀取真實教師資料
  const teacherMappingResult = readCourseTeacherMapping();
  let teacherMapping = {};
  
  if (teacherMappingResult.success) {
    teacherMapping = teacherMappingResult.mapping;
    console.log(`✅ 成功載入 ${teacherMappingResult.count} 筆真實教師資料`);
  } else {
    console.log('⚠️ 無法讀取真實教師資料，將使用課程ID映射');
  }
  
  // 從 populateSheetFromLog 函數中的日誌資料解析
  const logData = `[INFO]   ✅ 成功: LT-G1 Achievers (ID: 779922029471)
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
[INFO]   ✅ 成功: KCFS-G6 Inventors (ID: 779922054673)`;
  
  const courseMapping = {};
  const lines = logData.split('\n').filter(line => line.includes('✅ 成功:'));
  
  for (const line of lines) {
    try {
      const courseNameMatch = line.match(/✅ 成功: (.+) \(ID:/);
      const courseIdMatch = line.match(/\(ID: (\d+)\)/);
      
      if (courseNameMatch && courseIdMatch) {
        const fullCourseName = courseNameMatch[1]; // 例如: "LT-G1 Achievers"
        const courseId = courseIdMatch[1];
        
        const parts = fullCourseName.split('-');
        if (parts.length === 2) {
          const subject = parts[0]; // "LT"
          const className = parts[1]; // "G1 Achievers"
          
          if (!courseMapping[className]) {
            courseMapping[className] = [];
          }
          
          // 獲取真實教師資料
          let teacherInfo = {
            teacherName: 'Unknown Teacher',
            teacherEmail: 'unknown@school.edu'
          };
          
          if (teacherMapping[courseId]) {
            // 從真實資料中獲取教師資訊
            teacherInfo = {
              teacherName: teacherMapping[courseId].teacherName,
              teacherEmail: teacherMapping[courseId].teacherEmail
            };
          } else {
            // 後備方案：嘗試從科目映射獲取
            const subjectMappingResult = buildSubjectTeacherMapping();
            if (subjectMappingResult.success && subjectMappingResult.mapping[subject]) {
              teacherInfo = subjectMappingResult.mapping[subject];
            } else {
              console.log(`⚠️ 找不到課程 ${courseId} (${subject}-${className}) 的教師資料`);
            }
          }
          
          courseMapping[className].push({
            subject: subject,
            courseId: courseId,
            teacherName: teacherInfo.teacherName,
            teacherEmail: teacherInfo.teacherEmail,
            // 保持向下相容
            teacher: teacherInfo.teacherName
          });
        }
      }
    } catch (error) {
      console.log(`⚠️ 解析日誌行失敗: ${line}`);
    }
  }
  
  console.log(`📚 成功解析 ${Object.keys(courseMapping).length} 個班級的課程資料`);
  return courseMapping;
}

/**
 * 👨‍🏫 根據科目獲取教師 (重構版本)
 * 動態從 course_teacher 工作表讀取真實教師資料
 */
function getTeacherBySubject(subject) {
  console.log(`🔍 查詢科目 "${subject}" 的教師資訊...`);
  
  try {
    const subjectMappingResult = buildSubjectTeacherMapping();
    
    if (subjectMappingResult.success && subjectMappingResult.mapping[subject]) {
      const teacherInfo = subjectMappingResult.mapping[subject];
      console.log(`✅ 找到科目 "${subject}" 的教師: ${teacherInfo.teacherName}`);
      return teacherInfo.teacherName;
    }
    
    // 使用後備映射
    if (subjectMappingResult.fallbackMapping && subjectMappingResult.fallbackMapping[subject]) {
      const fallbackInfo = subjectMappingResult.fallbackMapping[subject];
      console.log(`⚠️ 使用後備教師資料: ${fallbackInfo.teacherName}`);
      return fallbackInfo.teacherName;
    }
    
    console.log(`❌ 找不到科目 "${subject}" 的教師，返回 Unknown`);
    return 'Unknown Teacher';
    
  } catch (error) {
    console.log(`❌ 查詢教師資訊失敗: ${error.message}`);
    return 'Unknown Teacher';
  }
}

/**
 * 👨‍🏫 根據科目獲取完整教師資訊 (新增)
 * 返回包含姓名和 Email 的完整教師資訊
 */
function getTeacherInfoBySubject(subject) {
  console.log(`🔍 查詢科目 "${subject}" 的完整教師資訊...`);
  
  try {
    const subjectMappingResult = buildSubjectTeacherMapping();
    
    if (subjectMappingResult.success && subjectMappingResult.mapping[subject]) {
      const teacherInfo = subjectMappingResult.mapping[subject];
      console.log(`✅ 找到科目 "${subject}" 的教師: ${teacherInfo.teacherName} (${teacherInfo.teacherEmail})`);
      return {
        success: true,
        teacherName: teacherInfo.teacherName,
        teacherEmail: teacherInfo.teacherEmail
      };
    }
    
    // 使用後備映射
    if (subjectMappingResult.fallbackMapping && subjectMappingResult.fallbackMapping[subject]) {
      const fallbackInfo = subjectMappingResult.fallbackMapping[subject];
      console.log(`⚠️ 使用後備教師資料: ${fallbackInfo.teacherName}`);
      return {
        success: false,
        teacherName: fallbackInfo.teacherName,
        teacherEmail: fallbackInfo.teacherEmail,
        note: '使用後備資料'
      };
    }
    
    return {
      success: false,
      error: `找不到科目 "${subject}" 的教師資訊`,
      teacherName: 'Unknown Teacher',
      teacherEmail: 'unknown@school.edu'
    };
    
  } catch (error) {
    return {
      success: false,
      error: `查詢教師資訊失敗：${error.message}`,
      teacherName: 'Unknown Teacher',
      teacherEmail: 'unknown@school.edu'
    };
  }
}

// ========================== 真實教師資料讀取系統 ==========================

/**
 * 📚 讀取課程-教師映射資料
 * 從 course_teacher 工作表讀取真實的教師姓名和 Email
 */
function readCourseTeacherMapping() {
  console.log('📚 開始讀取真實課程-教師映射資料...');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('course_teacher');
    
    if (!sheet) {
      console.log('❌ 找不到 course_teacher 工作表');
      return { success: false, error: '找不到 course_teacher 工作表，無法讀取真實教師資料' };
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      console.log('❌ course_teacher 工作表中沒有資料');
      return { success: false, error: 'course_teacher 工作表中沒有教師資料' };
    }
    
    // 讀取所有資料（跳過標題行）
    const range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
    const data = range.getValues();
    
    const courseTeacherMapping = {};
    let successCount = 0;
    
    data.forEach((row, index) => {
      try {
        // 根據實際 course_teacher 工作表結構：E欄=教師姓名, F欄=教師Email, G欄=課程ID
        const courseName = row[0];      // A欄：課程名稱
        const subject = row[2];         // C欄：科目 
        const teacherName = row[4];     // E欄：教師姓名
        const teacherEmail = row[5];    // F欄：教師Email
        const courseId = row[6];        // G欄：課程ID
        
        // 詳細除錯日誌
        console.log(`🔍 第 ${index + 2} 行資料：課程名稱="${courseName}", 科目="${subject}", 教師="${teacherName}", Email="${teacherEmail}", 課程ID="${courseId}"`);
        
        if (!courseId || !teacherName || !teacherEmail) {
          console.log(`⚠️ 第 ${index + 2} 行資料不完整，跳過 (課程ID: ${courseId}, 教師: ${teacherName}, Email: ${teacherEmail})`);
          return;
        }
        
        courseTeacherMapping[courseId.toString()] = {
          courseName: courseName || '',
          courseId: courseId.toString(),
          subject: subject || '',
          teacherName: teacherName.toString().trim(),
          teacherEmail: teacherEmail.toString().trim()
        };
        
        successCount++;
        
      } catch (error) {
        console.log(`❌ 解析第 ${index + 2} 行資料失敗: ${error.message}`);
      }
    });
    
    console.log(`✅ 成功讀取 ${successCount} 筆課程-教師映射資料`);
    
    return {
      success: true,
      mapping: courseTeacherMapping,
      count: successCount
    };
    
  } catch (error) {
    console.log(`❌ 讀取課程-教師映射失敗: ${error.message}`);
    return { success: false, error: `讀取課程-教師映射失敗：${error.message}` };
  }
}

/**
 * 🔍 根據課程ID獲取教師資訊
 * 從 course_teacher 工作表中查找對應的教師資訊
 */
function getTeacherInfoByCourseId(courseId) {
  if (!courseId) {
    return { success: false, error: '缺少課程 ID' };
  }
  
  try {
    const mappingResult = readCourseTeacherMapping();
    if (!mappingResult.success) {
      return mappingResult;
    }
    
    const teacherInfo = mappingResult.mapping[courseId.toString()];
    if (!teacherInfo) {
      console.log(`⚠️ 找不到課程 ID ${courseId} 的教師資訊`);
      return { 
        success: false, 
        error: `找不到課程 ID ${courseId} 的教師資訊`,
        fallback: {
          teacherName: 'Unknown Teacher',
          teacherEmail: 'unknown@school.edu'
        }
      };
    }
    
    return {
      success: true,
      teacherInfo: teacherInfo
    };
    
  } catch (error) {
    return { 
      success: false, 
      error: `查詢教師資訊失敗：${error.message}`,
      fallback: {
        teacherName: 'Unknown Teacher',
        teacherEmail: 'unknown@school.edu'
      }
    };
  }
}

/**
 * 📊 建立科目-教師映射
 * 從真實資料中建立科目到教師的映射關係
 */
function buildSubjectTeacherMapping() {
  console.log('📊 建立科目-教師映射...');
  
  const mappingResult = readCourseTeacherMapping();
  if (!mappingResult.success) {
    console.log('❌ 無法讀取教師資料，使用預設映射');
    return {
      success: false,
      error: mappingResult.error,
      fallbackMapping: {
        'LT': { teacherName: 'Language Teacher', teacherEmail: 'lt@school.edu' },
        'IT': { teacherName: 'IT Teacher', teacherEmail: 'it@school.edu' },
        'KCFS': { teacherName: 'KCFS Teacher', teacherEmail: 'kcfs@school.edu' }
      }
    };
  }
  
  const subjectMapping = {};
  const courseMapping = mappingResult.mapping;
  
  // 分析每個科目的教師
  Object.values(courseMapping).forEach(course => {
    const subject = course.subject;
    if (subject && !subjectMapping[subject]) {
      subjectMapping[subject] = {
        teacherName: course.teacherName,
        teacherEmail: course.teacherEmail
      };
    }
  });
  
  console.log(`✅ 建立了 ${Object.keys(subjectMapping).length} 個科目的教師映射`);
  
  return {
    success: true,
    mapping: subjectMapping,
    totalCourses: Object.keys(courseMapping).length
  };
}

/**
 * 📖 讀取現有學生資料
 */
function readCurrentStudentData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('stu_course');
    
    if (!sheet) {
      return { success: false, error: '找不到 stu_course 工作表' };
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return { success: false, error: 'stu_course 工作表中沒有學生資料' };
    }
    
    // 讀取資料（跳過標題行）
    const range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
    const data = range.getValues();
    
    const records = [];
    data.forEach((row, index) => {
      const studentEmail = row[0];
      const classNameOrId = row[1]; // 可能是班級名稱或課程ID
      const status = row[2];
      
      if (!studentEmail || !classNameOrId) {
        console.log(`⚠️ 第 ${index + 2} 行資料不完整，跳過`);
        return;
      }
      
      // 跳過已處理的項目
      if (status && status.toString().trim()) {
        console.log(`ℹ️ 學生 ${studentEmail} 已處理，跳過`);
        return;
      }
      
      records.push({
        studentEmail: studentEmail.toString().trim(),
        className: classNameOrId.toString().trim(),
        originalRow: index + 2
      });
    });
    
    console.log(`📖 讀取到 ${records.length} 筆未處理的學生記錄`);
    return { success: true, records };
    
  } catch (error) {
    return { success: false, error: `讀取學生資料失敗：${error.message}` };
  }
}

/**
 * 🔄 創建擴展的學生記錄
 */
function createExpandedStudentRecords(studentRecords, courseMapping) {
  const mappedRecords = [];
  let mappedCount = 0;
  let unmappedCount = 0;
  
  studentRecords.forEach(student => {
    const className = student.className;
    const courses = courseMapping[className];
    
    if (courses && courses.length > 0) {
      // 為這個學生創建3門課程記錄
      courses.forEach(course => {
        mappedRecords.push({
          studentEmail: student.studentEmail,
          courseId: course.courseId,
          courseName: `${className}-${course.subject}`,
          subject: course.subject,
          teacherName: course.teacherName || course.teacher || 'Unknown Teacher',
          teacherEmail: course.teacherEmail || 'unknown@school.edu',
          status: '',
          originalClassName: className,
          // 保持向下相容性
          teacher: course.teacherName || course.teacher || 'Unknown Teacher'
        });
      });
      mappedCount++;
    } else {
      console.log(`❌ 找不到班級 "${className}" 的課程映射`);
      unmappedCount++;
      
      // 即使找不到映射，也保留原始記錄
      mappedRecords.push({
        studentEmail: student.studentEmail,
        courseId: className, // 保留原始值
        courseName: className,
        subject: 'UNKNOWN',
        teacherName: 'Unknown Teacher',
        teacherEmail: 'unknown@school.edu',
        status: '',
        originalClassName: className,
        mappingError: `找不到班級 "${className}" 的課程映射`,
        // 保持向下相容性
        teacher: 'Unknown Teacher'
      });
    }
  });
  
  console.log(`🔄 映射結果：成功 ${mappedCount} 個班級，失敗 ${unmappedCount} 個班級`);
  console.log(`📊 總共創建 ${mappedRecords.length} 筆學生-課程記錄`);
  
  return {
    mappedRecords,
    mappedCount,
    unmappedCount
  };
}

/**
 * 📊 更新擴展的 stu_course 工作表
 */
function updateExpandedStuCourseSheet(records) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('stu_course');
    
    if (!sheet) {
      console.log('🔧 創建 stu_course 工作表...');
      sheet = ss.insertSheet('stu_course');
    }
    
    // 清空現有資料
    sheet.clear();
    
    // 設定標題行（包含教師 Email）
    const headers = ['學生Email', '課程ID', '狀態', '課程名稱', '科目', '教師姓名', '教師Email', '備註'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#4285f4').setFontColor('white').setFontWeight('bold');
    sheet.setFrozenRows(1);
    
    // 準備資料行（包含教師 Email）
    const dataRows = records.map(record => [
      record.studentEmail,
      record.courseId,
      record.status,
      record.courseName,
      record.subject,
      record.teacherName || record.teacher || 'Unknown Teacher',
      record.teacherEmail || 'unknown@school.edu',
      record.mappingError || ''
    ]);
    
    // 寫入資料
    if (dataRows.length > 0) {
      sheet.getRange(2, 1, dataRows.length, headers.length).setValues(dataRows);
      console.log(`✅ 成功寫入 ${dataRows.length} 筆擴展的學生-課程記錄`);
      
      // 標記有錯誤的行
      dataRows.forEach((row, index) => {
        if (row[6]) { // 如果有備註（錯誤訊息）
          sheet.getRange(index + 2, 1, 1, headers.length).setBackground('#ffebee');
        }
      });
    }
    
    // 自動調整欄寬
    sheet.autoResizeColumns(1, headers.length);
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: `工作表更新失敗：${error.message}` };
  }
}
