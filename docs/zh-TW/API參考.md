# API 參考文件 - Google Classroom Manager Pro

## 概述

Google Classroom Manager Pro 提供了一系列 JavaScript 函式，用於管理 Google Classroom 課程和成員。本文件詳細說明了所有可用的 API 函式及其用法。

## 核心服務

### ClassroomService

主要的 Google Classroom API 服務包裝器。

#### 初始化

```javascript
const classroomService = new ClassroomService();
```

#### 方法

##### listCourses(options)

列出所有課程。

**參數**:
- `options` (Object, 可選): 篩選選項
  - `courseStates` (Array): 課程狀態篩選 ['ACTIVE', 'ARCHIVED', 'PROVISIONED', 'DECLINED']
  - `pageSize` (Number): 每頁結果數量 (預設: 100)

**回傳值**: 
- `Array<Course>`: 課程物件陣列

**範例**:
```javascript
// 列出所有活躍課程
const courses = classroomService.listCourses({
  courseStates: ['ACTIVE']
});

// 列出所有課程
const allCourses = classroomService.listCourses();
```

##### getCourse(courseId)

取得特定課程詳細資訊。

**參數**:
- `courseId` (String): 課程 ID

**回傳值**: 
- `Course`: 課程物件

**範例**:
```javascript
const course = classroomService.getCourse('abc123');
console.log(course.name);
```

##### createCourse(courseData)

建立新課程。

**參數**:
- `courseData` (Object): 課程資料
  - `name` (String): 課程名稱
  - `description` (String, 可選): 課程描述
  - `ownerId` (String, 可選): 課程擁有者 ID
  - `courseState` (String, 可選): 課程狀態 (預設: 'ACTIVE')

**回傳值**: 
- `Course`: 建立的課程物件

**範例**:
```javascript
const newCourse = classroomService.createCourse({
  name: '數學 101',
  description: '基礎數學課程',
  ownerId: 'teacher@school.edu'
});
```

##### updateCourse(courseId, updateData)

更新課程資訊。

**參數**:
- `courseId` (String): 課程 ID
- `updateData` (Object): 更新資料
  - `name` (String, 可選): 新課程名稱
  - `description` (String, 可選): 新課程描述
  - `courseState` (String, 可選): 新課程狀態

**回傳值**: 
- `Course`: 更新後的課程物件

**範例**:
```javascript
const updatedCourse = classroomService.updateCourse('abc123', {
  name: '進階數學 101',
  description: '更新後的課程描述'
});
```

##### listStudents(courseId)

列出課程學生。

**參數**:
- `courseId` (String): 課程 ID

**回傳值**: 
- `Array<Student>`: 學生物件陣列

**範例**:
```javascript
const students = classroomService.listStudents('abc123');
students.forEach(student => {
  console.log(student.profile.name.fullName);
});
```

##### listTeachers(courseId)

列出課程老師。

**參數**:
- `courseId` (String): 課程 ID

**回傳值**: 
- `Array<Teacher>`: 老師物件陣列

**範例**:
```javascript
const teachers = classroomService.listTeachers('abc123');
teachers.forEach(teacher => {
  console.log(teacher.profile.name.fullName);
});
```

##### inviteStudent(courseId, studentEmail)

邀請學生加入課程。

**參數**:
- `courseId` (String): 課程 ID
- `studentEmail` (String): 學生 Email

**回傳值**: 
- `Invitation`: 邀請物件

**範例**:
```javascript
const invitation = classroomService.inviteStudent('abc123', 'student@school.edu');
```

##### inviteTeacher(courseId, teacherEmail)

邀請老師加入課程。

**參數**:
- `courseId` (String): 課程 ID
- `teacherEmail` (String): 老師 Email

**回傳值**: 
- `Invitation`: 邀請物件

**範例**:
```javascript
const invitation = classroomService.inviteTeacher('abc123', 'teacher@school.edu');
```

##### removeStudent(courseId, studentId)

移除課程學生。

**參數**:
- `courseId` (String): 課程 ID
- `studentId` (String): 學生 ID

**回傳值**: 
- `Boolean`: 是否成功移除

**範例**:
```javascript
const success = classroomService.removeStudent('abc123', 'student123');
```

##### removeTeacher(courseId, teacherId)

移除課程老師。

**參數**:
- `courseId` (String): 課程 ID
- `teacherId` (String): 老師 ID

**回傳值**: 
- `Boolean`: 是否成功移除

**範例**:
```javascript
const success = classroomService.removeTeacher('abc123', 'teacher123');
```

### ErrorHandler

錯誤處理服務，提供自動重試和智能錯誤分類。

#### 初始化

```javascript
const errorHandler = new ErrorHandler();
```

#### 方法

##### handleError(error, context)

處理錯誤並決定是否重試。

**參數**:
- `error` (Error): 錯誤物件
- `context` (Object): 錯誤上下文
  - `operation` (String): 操作名稱
  - `retryCount` (Number): 目前重試次數
  - `maxRetries` (Number): 最大重試次數

**回傳值**: 
- `Object`: 處理結果
  - `shouldRetry` (Boolean): 是否應該重試
  - `waitTime` (Number): 等待時間（毫秒）
  - `errorType` (String): 錯誤類型

**範例**:
```javascript
try {
  // 執行 API 操作
  const result = classroomService.getCourse('abc123');
} catch (error) {
  const handleResult = errorHandler.handleError(error, {
    operation: 'getCourse',
    retryCount: 1,
    maxRetries: 3
  });
  
  if (handleResult.shouldRetry) {
    // 等待後重試
    Utilities.sleep(handleResult.waitTime);
    // 重試操作
  }
}
```

##### logError(error, context)

記錄錯誤詳細資訊。

**參數**:
- `error` (Error): 錯誤物件
- `context` (Object): 錯誤上下文

**範例**:
```javascript
errorHandler.logError(error, {
  operation: 'createCourse',
  courseData: { name: '數學 101' }
});
```

### RateLimiter

API 限速控制服務，防止超過 Google Classroom API 配額。

#### 初始化

```javascript
const rateLimiter = new RateLimiter();
```

#### 方法

##### waitIfNeeded()

檢查是否需要等待以符合 API 限速要求。

**回傳值**: 
- `Number`: 等待時間（毫秒）

**範例**:
```javascript
// 在 API 調用前檢查限速
const waitTime = rateLimiter.waitIfNeeded();
if (waitTime > 0) {
  Utilities.sleep(waitTime);
}

// 執行 API 調用
const courses = classroomService.listCourses();
```

##### recordRequest()

記錄 API 請求。

**範例**:
```javascript
// 記錄 API 請求
rateLimiter.recordRequest();
```

##### getStatus()

取得限速狀態。

**回傳值**: 
- `Object`: 限速狀態
  - `requestCount` (Number): 當前請求數量
  - `windowStart` (Number): 時間窗口開始時間
  - `remainingQuota` (Number): 剩餘配額

**範例**:
```javascript
const status = rateLimiter.getStatus();
console.log(`剩餘配額: ${status.remainingQuota}`);
```

### ProgressTracker

進度追蹤服務，用於顯示批次處理進度。

#### 初始化

```javascript
const progressTracker = new ProgressTracker();
```

#### 方法

##### startProgress(total, operation)

開始進度追蹤。

**參數**:
- `total` (Number): 總項目數
- `operation` (String): 操作名稱

**範例**:
```javascript
progressTracker.startProgress(100, '批次建立課程');
```

##### updateProgress(completed, message)

更新進度。

**參數**:
- `completed` (Number): 已完成項目數
- `message` (String, 可選): 狀態訊息

**範例**:
```javascript
progressTracker.updateProgress(25, '已建立 25 門課程');
```

##### finishProgress(summary)

完成進度追蹤。

**參數**:
- `summary` (Object): 完成摘要
  - `successful` (Number): 成功項目數
  - `failed` (Number): 失敗項目數
  - `errors` (Array): 錯誤清單

**範例**:
```javascript
progressTracker.finishProgress({
  successful: 95,
  failed: 5,
  errors: ['課程名稱重複', 'Email 格式錯誤']
});
```

## 批次處理函式

### batchCreateCourses(sheetName, ownerEmail)

批次建立課程。

**參數**:
- `sheetName` (String): 包含課程資料的工作表名稱
- `ownerEmail` (String, 可選): 課程擁有者 Email

**工作表格式**:
```
課程名稱 | 課程描述 | 課程ID | 狀態
========|========|======|====
數學101  | 基礎數學 |      |
物理201  | 進階物理 |      |
```

**範例**:
```javascript
batchCreateCourses('課程清單', 'teacher@school.edu');
```

### batchInviteStudents(sheetName)

批次邀請學生。

**參數**:
- `sheetName` (String): 包含學生資料的工作表名稱

**工作表格式**:
```
課程ID | 學生Email | 學生姓名 | 狀態
======|=========|========|====
abc123| student1@school.edu | 王小明 |
abc123| student2@school.edu | 李小華 |
```

**範例**:
```javascript
batchInviteStudents('學生名單');
```

### batchInviteTeachers(sheetName)

批次邀請老師。

**參數**:
- `sheetName` (String): 包含老師資料的工作表名稱

**工作表格式**:
```
課程ID | 老師Email | 老師姓名 | 角色 | 狀態
======|=========|========|====|====
abc123| teacher1@school.edu | 陳老師 | 老師 |
def456| teacher2@school.edu | 林老師 | 老師 |
```

**範例**:
```javascript
batchInviteTeachers('老師名單');
```

## 工具函式

### exportCourseList(sheetName)

匯出課程清單到工作表。

**參數**:
- `sheetName` (String): 輸出工作表名稱

**範例**:
```javascript
exportCourseList('課程清單');
```

### exportCourseMembers(courseId, sheetName)

匯出課程成員清單到工作表。

**參數**:
- `courseId` (String): 課程 ID
- `sheetName` (String): 輸出工作表名稱

**範例**:
```javascript
exportCourseMembers('abc123', '課程成員');
```

### clearCache()

清除系統快取。

**範例**:
```javascript
clearCache();
```

### getSystemStatus()

取得系統狀態。

**回傳值**: 
- `Object`: 系統狀態
  - `apiQuota` (Object): API 配額資訊
  - `cacheStatus` (Object): 快取狀態
  - `errorStats` (Object): 錯誤統計

**範例**:
```javascript
const status = getSystemStatus();
console.log(`API 使用率: ${status.apiQuota.usagePercent}%`);
```

### exportOperationLog(sheetName)

匯出操作日誌到工作表。

**參數**:
- `sheetName` (String): 輸出工作表名稱

**範例**:
```javascript
exportOperationLog('操作日誌');
```

## 資料模型

### Course 物件

```javascript
{
  id: "abc123",
  name: "數學 101",
  description: "基礎數學課程",
  courseState: "ACTIVE",
  creationTime: "2024-01-01T10:00:00Z",
  updateTime: "2024-01-15T15:30:00Z",
  ownerId: "teacher@school.edu",
  enrollmentCode: "def456"
}
```

### Student 物件

```javascript
{
  courseId: "abc123",
  userId: "student123",
  profile: {
    id: "student123",
    name: {
      fullName: "王小明"
    },
    emailAddress: "student@school.edu",
    photoUrl: "https://..."
  }
}
```

### Teacher 物件

```javascript
{
  courseId: "abc123",
  userId: "teacher123",
  profile: {
    id: "teacher123",
    name: {
      fullName: "陳老師"
    },
    emailAddress: "teacher@school.edu",
    photoUrl: "https://..."
  }
}
```

### Invitation 物件

```javascript
{
  id: "invitation123",
  courseId: "abc123",
  userId: "user123",
  role: "STUDENT", // 或 "TEACHER"
  state: "PENDING" // 或 "ACCEPTED", "REJECTED"
}
```

## 錯誤處理

### 常見錯誤類型

- `PERMISSION_DENIED`: 權限不足
- `NOT_FOUND`: 資源不存在
- `ALREADY_EXISTS`: 資源已存在
- `INVALID_ARGUMENT`: 參數無效
- `QUOTA_EXCEEDED`: 配額超限
- `UNAVAILABLE`: 服務不可用

### 錯誤處理範例

```javascript
try {
  const course = classroomService.createCourse({
    name: '數學 101',
    description: '基礎數學課程'
  });
} catch (error) {
  if (error.message.includes('PERMISSION_DENIED')) {
    console.log('權限不足，請檢查帳戶權限');
  } else if (error.message.includes('ALREADY_EXISTS')) {
    console.log('課程已存在');
  } else {
    console.log('未知錯誤：', error.message);
  }
}
```

## 最佳實踐

### 1. 錯誤處理

```javascript
function safeApiCall(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return operation();
    } catch (error) {
      const result = errorHandler.handleError(error, {
        operation: operation.name,
        retryCount: i + 1,
        maxRetries: maxRetries
      });
      
      if (result.shouldRetry && i < maxRetries - 1) {
        Utilities.sleep(result.waitTime);
        continue;
      }
      throw error;
    }
  }
}
```

### 2. 限速控制

```javascript
function apiCallWithRateLimit(apiFunction) {
  const waitTime = rateLimiter.waitIfNeeded();
  if (waitTime > 0) {
    Utilities.sleep(waitTime);
  }
  
  rateLimiter.recordRequest();
  return apiFunction();
}
```

### 3. 進度追蹤

```javascript
function batchProcessWithProgress(items, processFunction, operationName) {
  progressTracker.startProgress(items.length, operationName);
  
  const results = [];
  const errors = [];
  
  items.forEach((item, index) => {
    try {
      const result = processFunction(item);
      results.push(result);
      progressTracker.updateProgress(index + 1, `處理項目: ${item.name}`);
    } catch (error) {
      errors.push({ item, error });
    }
  });
  
  progressTracker.finishProgress({
    successful: results.length,
    failed: errors.length,
    errors: errors.map(e => e.error.message)
  });
  
  return { results, errors };
}
```

---

更多詳細資訊和範例程式碼，請參考 [GitHub 專案頁面](https://github.com/your-org/classroom-manager-pro)。