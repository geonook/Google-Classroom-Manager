/**
 * @OnlyCurrentDoc
 */

async function addTeachersWithCheck(spreadsheetId = null) {
  const sheetName = 'course_teacher';
  
  // 如果提供了 spreadsheetId，使用外部試算表；否則使用當前開啟的試算表
  const ss = spreadsheetId ? 
    SpreadsheetApp.openById(spreadsheetId) : 
    SpreadsheetApp.getActiveSpreadsheet();
    
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
    const courseId = row[6];     // G 欄
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
      console.log(`  ❌ 新增老師 ${teacherEmail} 到課程 ${courseId} 失敗: ${JSON.stringify(result.error, null, 2)}`);
    }
    
    Utilities.sleep(1000);
  }
  
  console.log('--- 所有老師處理完畢 ---');
}

/**
 * 從指定的外部試算表執行老師新增作業
 */
async function addTeachersFromExternalSheet() {
  const EXTERNAL_SPREADSHEET_ID = '1GWbn5qIKCikvLV_frTeIjDcTbi8wWxwCQR6S0NIEAp8';
  console.log(`--- 開始從外部試算表新增老師 ---`);
  console.log(`試算表ID: ${EXTERNAL_SPREADSHEET_ID}`);
  
  await addTeachersWithCheck(EXTERNAL_SPREADSHEET_ID);
  
  console.log(`--- 外部試算表老師新增完成 ---`);
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
    const courseId = row[6];     // G 欄
    const status = row[7];       // H 欄 (checkbox value)

    if (!teacherEmail || !courseId || status === true) {
      continue;
    }

    try {
      console.log(`正在處理課程 ${courseId} 中的老師 ${teacherEmail}...`);

      // 檢查老師是否已存在
      const teachers = Classroom.Courses.Teachers.list(courseId).teachers || [];
      const teacherExists = teachers.some(teacher => 
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
    'Achievers', 'Discoverers', 'Voyagers', 'Explorers', 'Navigators', 
    'Adventurers', 'Guardians', 'Pioneers', 'Innovators', 'Visionaries', 
    'Pathfinders', 'Seekers', 'Trailblazers', 'Inventors'
  ];
  const SUBJECTS = [
    { code: 'LT', teacher: 'Ms. Kate' },
    { code: 'IT', teacher: 'Mr. Perry' },
    { code: 'KCFS', teacher: 'Mr. Louw' }
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
            const newRow = [subject.code, grade, className, subject.teacher, newCourse.id, newCourse.alternateLink];
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
    'LT': 'Ms. Kate',
    'IT': 'Mr. Perry',
    'KCFS': 'Mr. Louw'
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
  const lines = logData.split('\n').filter(line => line.includes('✅ 成功:'));
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
    const headers = ['Subject', 'Grade', 'Class Name', 'Teacher', 'Email', 'Course ID', 'Course Link', 'Status'];
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

        const newRow = [subjectCode, grade, className, teacher, '' , courseId, courseLink, false];
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
