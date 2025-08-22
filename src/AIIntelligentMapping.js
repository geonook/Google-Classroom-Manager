// ========================================
// 🤖 AI INTELLIGENT COURSE MAPPING SYSTEM
// ========================================

/**
 * 🧠 AI 智能課程分類器
 * 自動識別年級、班級、科目，處理命名不一致問題
 */
class AICourseClassifier {
  constructor() {
    // 年級模式識別
    this.gradePatterns = {
      'G1': ['g1', 'grade1', 'grade 1', '一年級', '1年級', 'year1', 'y1'],
      'G2': ['g2', 'grade2', 'grade 2', '二年級', '2年級', 'year2', 'y2'],
      'G3': ['g3', 'grade3', 'grade 3', '三年級', '3年級', 'year3', 'y3'],
      'G4': ['g4', 'grade4', 'grade 4', '四年級', '4年級', 'year4', 'y4'],
      'G5': ['g5', 'grade5', 'grade 5', '五年級', '5年級', 'year5', 'y5'],
      'G6': ['g6', 'grade6', 'grade 6', '六年級', '6年級', 'year6', 'y6']
    };
    
    // 班級名稱模式
    this.classPatterns = {
      'Achievers': ['achievers', 'achiever', '成功者', '成就者'],
      'Discoverers': ['discoverers', 'discoverer', '探索者', '發現者'],
      'Voyagers': ['voyagers', 'voyager', '航行者', '旅行者'],
      'Explorers': ['explorers', 'explorer', '探險者', '開拓者'],
      'Navigators': ['navigators', 'navigator', '領航者', '導航者'],
      'Adventurers': ['adventurers', 'adventurer', '冒險者', '探險家'],
      'Guardians': ['guardians', 'guardian', '守護者', '監護人'],
      'Pioneers': ['pioneers', 'pioneer', '先驅者', '開拓者'],
      'Innovators': ['innovators', 'innovator', '創新者', '發明家'],
      'Visionaries': ['visionaries', 'visionary', '遠見者', '願景家'],
      'Pathfinders': ['pathfinders', 'pathfinder', '開路者', '探路者'],
      'Seekers': ['seekers', 'seeker', '尋求者', '探尋者'],
      'Trailblazers': ['trailblazers', 'trailblazer', '開拓者', '先鋒'],
      'Inventors': ['inventors', 'inventor', '發明者', '創造者']
    };
    
    // 科目模式
    this.subjectPatterns = {
      'LT': ['lt', 'language', 'lang', 'literacy', '語文', '中文', '國語', 'chinese'],
      'IT': ['it', 'information', 'tech', 'technology', 'computer', '資訊', '電腦', '科技'],
      'KCFS': ['kcfs', 'knowledge', 'creativity', 'food', 'science', '知識', '創意', '食物', '科學']
    };
  }
  
  /**
   * 🎯 智能分析課程名稱，提取年級、班級、科目
   */
  analyzeCourse(courseName, confidenceThreshold = 0.7) {
    if (!courseName) {
      return { success: false, error: '課程名稱不能為空' };
    }
    
    const cleanName = courseName.toLowerCase().trim();
    const analysis = {
      originalName: courseName,
      grade: null,
      className: null,
      subject: null,
      confidence: {
        grade: 0,
        className: 0,
        subject: 0,
        overall: 0
      },
      matchDetails: {
        gradeMatches: [],
        classMatches: [],
        subjectMatches: []
      }
    };
    
    // 年級識別
    for (const [grade, patterns] of Object.entries(this.gradePatterns)) {
      for (const pattern of patterns) {
        if (cleanName.includes(pattern)) {
          const confidence = this.calculatePatternConfidence(pattern, cleanName, 'grade');
          analysis.matchDetails.gradeMatches.push({ grade, pattern, confidence });
          
          if (confidence > analysis.confidence.grade) {
            analysis.grade = grade;
            analysis.confidence.grade = confidence;
          }
        }
      }
    }
    
    // 班級識別
    for (const [className, patterns] of Object.entries(this.classPatterns)) {
      for (const pattern of patterns) {
        if (cleanName.includes(pattern)) {
          const confidence = this.calculatePatternConfidence(pattern, cleanName, 'class');
          analysis.matchDetails.classMatches.push({ className, pattern, confidence });
          
          if (confidence > analysis.confidence.className) {
            analysis.className = className;
            analysis.confidence.className = confidence;
          }
        }
      }
    }
    
    // 科目識別
    for (const [subject, patterns] of Object.entries(this.subjectPatterns)) {
      for (const pattern of patterns) {
        if (cleanName.includes(pattern)) {
          const confidence = this.calculatePatternConfidence(pattern, cleanName, 'subject');
          analysis.matchDetails.subjectMatches.push({ subject, pattern, confidence });
          
          if (confidence > analysis.confidence.subject) {
            analysis.subject = subject;
            analysis.confidence.subject = confidence;
          }
        }
      }
    }
    
    // 計算整體信心度
    analysis.confidence.overall = (
      analysis.confidence.grade * 0.3 +
      analysis.confidence.className * 0.4 +
      analysis.confidence.subject * 0.3
    );
    
    // 判斷是否通過信心度門檻
    const success = analysis.confidence.overall >= confidenceThreshold &&
                   analysis.grade && analysis.className && analysis.subject;
    
    return {
      success,
      analysis,
      recommendation: success ? 
        `${analysis.grade} ${analysis.className}-${analysis.subject}` : null
    };
  }
  
  /**
   * 📊 計算模式匹配信心度
   */
  calculatePatternConfidence(pattern, text, type) {
    let confidence = 0;
    
    // 基礎匹配分數
    if (text.includes(pattern)) {
      confidence += 0.5;
    }
    
    // 完整單詞匹配加分
    const wordBoundary = new RegExp(`\\b${pattern}\\b`);
    if (wordBoundary.test(text)) {
      confidence += 0.3;
    }
    
    // 位置加分（越靠前越好）
    const position = text.indexOf(pattern);
    const positionScore = Math.max(0, (text.length - position) / text.length * 0.2);
    confidence += positionScore;
    
    return Math.min(1.0, confidence);
  }
}

/**
 * 🔍 智能映射驗證器
 * 驗證映射合理性和一致性
 */
class AIMappingValidator {
  constructor() {
    this.validationRules = {
      gradeConsistency: true,    // 年級一致性
      subjectIntegrity: true,    // 科目完整性
      duplicateDetection: true,  // 重複檢測
      namingConvention: true     // 命名規範
    };
  }
  
  /**
   * 🧪 全面驗證映射數據
   */
  validateMappings(mappings) {
    console.log(`🔍 開始驗證 ${mappings.length} 條映射記錄...`);
    
    const validation = {
      passed: 0,
      warnings: 0,
      errors: 0,
      issues: [],
      recommendations: [],
      statistics: this.calculateStatistics(mappings)
    };
    
    // 重複檢測
    const duplicateIssues = this.detectDuplicates(mappings);
    validation.issues.push(...duplicateIssues);
    
    // 命名一致性檢查
    const namingIssues = this.checkNamingConsistency(mappings);
    validation.issues.push(...namingIssues);
    
    // 完整性檢查
    const completenessIssues = this.checkCompleteness(mappings);
    validation.issues.push(...completenessIssues);
    
    // 分類統計
    validation.issues.forEach(issue => {
      if (issue.severity === 'ERROR') validation.errors++;
      else if (issue.severity === 'WARNING') validation.warnings++;
      else validation.passed++;
    });
    
    // 生成建議
    validation.recommendations = this.generateRecommendations(validation.issues);
    
    console.log(`✅ 驗證完成 - 通過: ${validation.passed}, 警告: ${validation.warnings}, 錯誤: ${validation.errors}`);
    
    return validation;
  }
  
  /**
   * 🔍 檢測重複映射
   */
  detectDuplicates(mappings) {
    const issues = [];
    const courseIds = new Set();
    const mappingKeys = new Set();
    
    mappings.forEach((mapping, index) => {
      // 檢測課程ID重複
      if (courseIds.has(mapping.courseId)) {
        issues.push({
          type: 'DUPLICATE_COURSE_ID',
          severity: 'ERROR',
          index: index,
          message: `課程ID重複: ${mapping.courseId} (${mapping.courseName}-${mapping.subject})`,
          data: mapping
        });
      } else {
        courseIds.add(mapping.courseId);
      }
      
      // 檢測映射鍵重複
      const mappingKey = `${mapping.courseName}-${mapping.subject}`;
      if (mappingKeys.has(mappingKey)) {
        issues.push({
          type: 'DUPLICATE_MAPPING',
          severity: 'WARNING',
          index: index,
          message: `映射重複: ${mappingKey}`,
          data: mapping
        });
      } else {
        mappingKeys.add(mappingKey);
      }
    });
    
    return issues;
  }
  
  /**
   * 📏 檢查命名一致性
   */
  checkNamingConsistency(mappings) {
    const issues = [];
    const gradePattern = /^G[1-6]/;
    const subjectPattern = /^(LT|IT|KCFS)$/;
    
    mappings.forEach((mapping, index) => {
      // 檢查年級格式
      if (!gradePattern.test(mapping.courseName)) {
        issues.push({
          type: 'INVALID_GRADE_FORMAT',
          severity: 'WARNING',
          index: index,
          message: `年級格式不標準: ${mapping.courseName}`,
          data: mapping
        });
      }
      
      // 檢查科目格式
      if (!subjectPattern.test(mapping.subject)) {
        issues.push({
          type: 'INVALID_SUBJECT_FORMAT',
          severity: 'ERROR',
          index: index,
          message: `科目格式錯誤: ${mapping.subject}`,
          data: mapping
        });
      }
    });
    
    return issues;
  }
  
  /**
   * 📋 檢查數據完整性
   */
  checkCompleteness(mappings) {
    const issues = [];
    
    // 預期的課程組合
    const expectedCombinations = this.generateExpectedCombinations();
    const actualCombinations = new Set(
      mappings.map(m => `${m.courseName}-${m.subject}`)
    );
    
    // 檢查缺失的組合
    expectedCombinations.forEach(expected => {
      if (!actualCombinations.has(expected)) {
        issues.push({
          type: 'MISSING_MAPPING',
          severity: 'WARNING',
          message: `缺失映射: ${expected}`,
          data: { expectedMapping: expected }
        });
      }
    });
    
    return issues;
  }
  
  /**
   * 📊 計算統計信息
   */
  calculateStatistics(mappings) {
    const stats = {
      totalMappings: mappings.length,
      byGrade: {},
      bySubject: {},
      byStatus: {},
      averageScore: 0
    };
    
    let totalScore = 0;
    
    mappings.forEach(mapping => {
      // 年級統計
      const grade = mapping.courseName.substring(0, 2);
      stats.byGrade[grade] = (stats.byGrade[grade] || 0) + 1;
      
      // 科目統計
      stats.bySubject[mapping.subject] = (stats.bySubject[mapping.subject] || 0) + 1;
      
      // 狀態統計
      stats.byStatus[mapping.status || 'UNKNOWN'] = (stats.byStatus[mapping.status || 'UNKNOWN'] || 0) + 1;
      
      // 分數累計
      totalScore += mapping.score || 100;
    });
    
    stats.averageScore = mappings.length > 0 ? totalScore / mappings.length : 0;
    
    return stats;
  }
  
  /**
   * 💡 生成改進建議
   */
  generateRecommendations(issues) {
    const recommendations = [];
    
    const errorCount = issues.filter(i => i.severity === 'ERROR').length;
    const warningCount = issues.filter(i => i.severity === 'WARNING').length;
    
    if (errorCount > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'FIX_ERRORS',
        description: `修復 ${errorCount} 個錯誤，特別是重複的課程ID和無效的科目格式`
      });
    }
    
    if (warningCount > 5) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'STANDARDIZE_NAMING',
        description: `標準化 ${warningCount} 個命名格式問題，提高數據一致性`
      });
    }
    
    return recommendations;
  }
  
  /**
   * 🎯 生成預期課程組合
   */
  generateExpectedCombinations() {
    const classNames = {
      G1: ['Achievers', 'Discoverers', 'Voyagers', 'Explorers', 'Navigators', 'Adventurers', 'Guardians', 'Pioneers', 'Innovators', 'Visionaries', 'Pathfinders', 'Seekers', 'Trailblazers', 'Inventors'],
      G2: ['Pioneers', 'Explorers', 'Inventors', 'Achievers', 'Voyagers', 'Adventurers', 'Innovators', 'Guardians', 'Pathfinders', 'Visionaries', 'Navigators', 'Discoverers', 'Seekers', 'Trailblazers'],
      G3: ['Inventors', 'Innovators', 'Guardians', 'Achievers', 'Voyagers', 'Visionaries', 'Trailblazers', 'Discoverers', 'Explorers', 'Navigators', 'Adventurers', 'Seekers', 'Pathfinders', 'Pioneers'],
      G4: ['Seekers', 'Voyagers', 'Visionaries', 'Achievers', 'Navigators', 'Trailblazers', 'Pathfinders', 'Explorers', 'Adventurers', 'Innovators', 'Discoverers', 'Guardians', 'Inventors', 'Pioneers'],
      G5: ['Adventurers', 'Navigators', 'Pioneers', 'Inventors', 'Seekers', 'Discoverers', 'Guardians', 'Pathfinders', 'Explorers', 'Achievers', 'Voyagers', 'Trailblazers', 'Innovators', 'Visionaries'],
      G6: ['Explorers', 'Inventors', 'Adventurers', 'Achievers', 'Voyagers', 'Discoverers', 'Innovators', 'Guardians', 'Pathfinders', 'Seekers', 'Visionaries', 'Pioneers', 'Trailblazers', 'Navigators']
    };
    const subjects = ['LT', 'IT', 'KCFS'];
    
    const combinations = [];
    Object.entries(classNames).forEach(([grade, classes]) => {
      classes.forEach(className => {
        subjects.forEach(subject => {
          combinations.push(`${grade} ${className}-${subject}`);
        });
      });
    });
    
    return combinations;
  }
}

/**
 * 🔮 缺失課程預測器
 * AI 分析缺失課程並提供建議
 */
class AIMissingCoursePredictor {
  constructor() {
    this.classifier = new AICourseClassifier();
  }
  
  /**
   * 🔮 預測和建議缺失的課程
   */
  predictMissingCourses(expectedCombinations, actualMappings, availableCourses) {
    console.log('🔮 開始預測缺失課程...');
    
    const actualCombinations = new Set(
      actualMappings.map(m => `${m.courseName}-${m.subject}`)
    );
    
    const missingCourses = [];
    const predictions = [];
    
    expectedCombinations.forEach(expected => {
      if (!actualCombinations.has(expected)) {
        const [fullClassName, subject] = expected.split('-');
        const prediction = this.predictAlternatives(fullClassName, subject, availableCourses);
        
        missingCourses.push({
          expectedMapping: expected,
          fullClassName: fullClassName,
          subject: subject,
          alternatives: prediction.alternatives,
          confidence: prediction.confidence,
          recommendation: prediction.recommendation
        });
        
        if (prediction.alternatives.length > 0) {
          predictions.push(prediction);
        }
      }
    });
    
    console.log(`📊 發現 ${missingCourses.length} 個缺失課程，${predictions.length} 個有替代方案`);
    
    return {
      missing: missingCourses,
      predictions: predictions,
      summary: {
        totalMissing: missingCourses.length,
        withAlternatives: predictions.length,
        predictionRate: predictions.length / Math.max(1, missingCourses.length)
      }
    };
  }
  
  /**
   * 🎯 為單個缺失課程預測替代方案
   */
  predictAlternatives(fullClassName, subject, availableCourses, maxAlternatives = 3) {
    const alternatives = [];
    
    // 使用AI分類器分析每個可用課程
    availableCourses.forEach(course => {
      const analysis = this.classifier.analyzeCourse(course.name, 0.3); // 降低門檻以找到更多候選
      
      if (analysis.success) {
        const expectedClass = `${analysis.analysis.grade} ${analysis.analysis.className}`;
        const expectedSubject = analysis.analysis.subject;
        
        // 計算匹配度
        let matchScore = 0;
        
        if (expectedClass === fullClassName) matchScore += 0.6;
        else if (expectedClass.includes(fullClassName.split(' ')[1])) matchScore += 0.3; // 班級名稱部分匹配
        
        if (expectedSubject === subject) matchScore += 0.4;
        
        if (matchScore > 0.3) {
          alternatives.push({
            course: course,
            matchScore: matchScore,
            analysisConfidence: analysis.analysis.confidence.overall,
            reason: this.generateMatchReason(fullClassName, subject, expectedClass, expectedSubject)
          });
        }
      }
    });
    
    // 排序並取前N個
    alternatives.sort((a, b) => 
      (b.matchScore * 0.7 + b.analysisConfidence * 0.3) - 
      (a.matchScore * 0.7 + a.analysisConfidence * 0.3)
    );
    
    const topAlternatives = alternatives.slice(0, maxAlternatives);
    
    return {
      alternatives: topAlternatives,
      confidence: topAlternatives.length > 0 ? topAlternatives[0].matchScore : 0,
      recommendation: topAlternatives.length > 0 ? 
        `建議使用 "${topAlternatives[0].course.name}" (匹配度: ${Math.round(topAlternatives[0].matchScore * 100)}%)` : 
        '無可用替代方案'
    };
  }
  
  /**
   * 💬 生成匹配原因說明
   */
  generateMatchReason(expectedClass, expectedSubject, actualClass, actualSubject) {
    const reasons = [];
    
    if (expectedClass === actualClass) {
      reasons.push('班級完全匹配');
    } else if (actualClass.includes(expectedClass.split(' ')[1])) {
      reasons.push('班級名稱部分匹配');
    }
    
    if (expectedSubject === actualSubject) {
      reasons.push('科目完全匹配');
    }
    
    return reasons.join(', ') || '低相似度匹配';
  }
}

/**
 * ⚡ 映射優化器
 * 動態優化搜尋和匹配策略
 */
class AIMappingOptimizer {
  constructor() {
    this.classifier = new AICourseClassifier();
    this.validator = new AIMappingValidator();
    this.predictor = new AIMissingCoursePredictor();
    
    // 優化策略配置
    this.strategies = {
      AGGRESSIVE: { confidenceThreshold: 0.5, fuzzyMatching: true },
      BALANCED: { confidenceThreshold: 0.7, fuzzyMatching: true },
      CONSERVATIVE: { confidenceThreshold: 0.8, fuzzyMatching: false }
    };
    
    this.currentStrategy = 'BALANCED';
  }
  
  /**
   * 🚀 執行智能映射優化
   */
  async optimizeMapping(courses, options = {}) {
    console.log('🚀 開始執行AI智能映射優化...');
    
    const strategy = this.strategies[options.strategy || this.currentStrategy];
    const results = {
      strategy: options.strategy || this.currentStrategy,
      mappings: [],
      improvements: [],
      statistics: {},
      performance: { startTime: Date.now() }
    };
    
    try {
      // 階段 1: 智能分類和映射
      console.log('📝 階段 1: 智能課程分類...');
      const classificationResults = await this.classifyAllCourses(courses, strategy);
      
      // 階段 2: 映射驗證
      console.log('🔍 階段 2: 映射驗證...');
      const validationResults = this.validator.validateMappings(classificationResults.mappings);
      
      // 階段 3: 缺失預測
      console.log('🔮 階段 3: 缺失課程預測...');
      const expectedCombinations = this.validator.generateExpectedCombinations();
      const predictionResults = this.predictor.predictMissingCourses(
        expectedCombinations, 
        classificationResults.mappings, 
        courses
      );
      
      // 階段 4: 自動修復
      console.log('🔧 階段 4: 自動修復和優化...');
      const repairResults = await this.autoRepair(
        classificationResults.mappings,
        validationResults.issues,
        predictionResults.predictions
      );
      
      // 整合結果
      results.mappings = repairResults.mappings;
      results.improvements = repairResults.improvements;
      results.statistics = {
        classification: classificationResults.statistics,
        validation: validationResults.statistics,
        prediction: predictionResults.summary,
        repair: repairResults.statistics
      };
      
      results.performance.endTime = Date.now();
      results.performance.duration = results.performance.endTime - results.performance.startTime;
      
      console.log(`✅ AI映射優化完成 - 耗時: ${results.performance.duration}ms`);
      console.log(`📊 最終結果: ${results.mappings.length} 個映射, ${results.improvements.length} 項改進`);
      
      return { success: true, results };
      
    } catch (error) {
      console.log(`❌ AI映射優化失敗: ${error.message}`);
      return { success: false, error: error.message, partialResults: results };
    }
  }
  
  /**
   * 🧠 對所有課程執行智能分類
   */
  async classifyAllCourses(courses, strategy) {
    const mappings = [];
    const classifications = [];
    
    console.log(`🧠 開始分類 ${courses.length} 個課程...`);
    
    const progress = new ProgressTracker(courses.length, 'AI課程分類');
    
    for (const course of courses) {
      try {
        const analysis = this.classifier.analyzeCourse(course.name, strategy.confidenceThreshold);
        
        classifications.push({
          course: course,
          analysis: analysis
        });
        
        if (analysis.success) {
          mappings.push({
            courseName: `${analysis.analysis.grade} ${analysis.analysis.className}`,
            subject: analysis.analysis.subject,
            courseId: course.id,
            originalName: course.name,
            status: 'ACTIVE',
            matchType: 'AI_CLASSIFIED',
            score: Math.round(analysis.analysis.confidence.overall * 100),
            discoveredAt: new Date().toISOString(),
            aiAnalysis: analysis.analysis
          });
          
          progress.addSuccess(course.id, `AI分類: ${analysis.recommendation}`);
        } else {
          progress.addWarning(course.id, `分類信心度不足: ${course.name}`);
        }
        
        // API限速
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        progress.addError(course.id, `分類失敗: ${error.message}`);
      }
    }
    
    const summary = progress.complete();
    
    return {
      mappings: mappings,
      classifications: classifications,
      statistics: {
        totalProcessed: courses.length,
        successfullyClassified: mappings.length,
        classificationRate: mappings.length / courses.length,
        averageConfidence: mappings.reduce((sum, m) => sum + m.score, 0) / Math.max(1, mappings.length)
      }
    };
  }
  
  /**
   * 🔧 自動修復映射問題
   */
  async autoRepair(mappings, issues, predictions) {
    const repairedMappings = [...mappings];
    const improvements = [];
    
    console.log(`🔧 開始自動修復 ${issues.length} 個問題...`);
    
    // 修復重複課程ID
    const duplicateIssues = issues.filter(i => i.type === 'DUPLICATE_COURSE_ID');
    for (const issue of duplicateIssues) {
      const improvement = await this.resolveDuplicateCourseId(repairedMappings, issue);
      if (improvement) improvements.push(improvement);
    }
    
    // 應用預測結果填補缺失
    for (const prediction of predictions) {
      if (prediction.alternatives.length > 0) {
        const bestMatch = prediction.alternatives[0];
        if (bestMatch.matchScore > 0.6) { // 只接受高信心度的預測
          const newMapping = {
            courseName: prediction.expectedMapping.split('-')[0],
            subject: prediction.expectedMapping.split('-')[1],
            courseId: bestMatch.course.id,
            originalName: bestMatch.course.name,
            status: 'ACTIVE',
            matchType: 'AI_PREDICTED',
            score: Math.round(bestMatch.matchScore * 100),
            discoveredAt: new Date().toISOString(),
            predictionReason: bestMatch.reason
          };
          
          repairedMappings.push(newMapping);
          improvements.push({
            type: 'MISSING_COURSE_FILLED',
            description: `AI預測填補: ${prediction.expectedMapping} -> ${bestMatch.course.name}`,
            confidence: bestMatch.matchScore,
            data: newMapping
          });
        }
      }
    }
    
    return {
      mappings: repairedMappings,
      improvements: improvements,
      statistics: {
        originalCount: mappings.length,
        repairedCount: repairedMappings.length,
        improvementsApplied: improvements.length
      }
    };
  }
  
  /**
   * 🔄 解決重複課程ID問題
   */
  async resolveDuplicateCourseId(mappings, issue) {
    // 找到所有使用相同課程ID的映射
    const duplicates = mappings.filter(m => m.courseId === issue.data.courseId);
    
    if (duplicates.length > 1) {
      // 保留信心度最高的一個
      duplicates.sort((a, b) => (b.score || 0) - (a.score || 0));
      const keepMapping = duplicates[0];
      
      // 移除其他重複項
      for (let i = 1; i < duplicates.length; i++) {
        const indexToRemove = mappings.findIndex(m => 
          m.courseId === duplicates[i].courseId && 
          m.courseName === duplicates[i].courseName && 
          m.subject === duplicates[i].subject
        );
        
        if (indexToRemove !== -1) {
          mappings.splice(indexToRemove, 1);
        }
      }
      
      return {
        type: 'DUPLICATE_RESOLVED',
        description: `保留信心度最高的映射: ${keepMapping.courseName}-${keepMapping.subject} (${keepMapping.score}%)`,
        removedCount: duplicates.length - 1
      };
    }
    
    return null;
  }
}

/**
 * 🔬 數據完整性檢查器
 * AI 分析和自動修復數據問題
 */
class AIDataIntegrityChecker {
  constructor() {
    this.optimizer = new AIMappingOptimizer();
    this.validator = new AIMappingValidator();
  }
  
  /**
   * 🔍 全面數據完整性檢查
   */
  async performIntegrityCheck(mappings, courses) {
    console.log('🔬 開始AI數據完整性檢查...');
    
    const checkResult = {
      overall: { status: 'UNKNOWN', score: 0 },
      checks: {
        dataQuality: null,
        consistency: null,
        completeness: null,
        accuracy: null
      },
      issues: [],
      autoFixSuggestions: [],
      recommendations: []
    };
    
    try {
      // 檢查 1: 數據質量
      console.log('📊 檢查 1: 數據質量分析...');
      checkResult.checks.dataQuality = this.checkDataQuality(mappings);
      
      // 檢查 2: 一致性驗證
      console.log('🔄 檢查 2: 一致性驗證...');
      checkResult.checks.consistency = this.validator.validateMappings(mappings);
      
      // 檢查 3: 完整性評估
      console.log('📋 檢查 3: 完整性評估...');
      checkResult.checks.completeness = this.checkCompleteness(mappings);
      
      // 檢查 4: 準確性分析
      console.log('🎯 檢查 4: 準確性分析...');
      checkResult.checks.accuracy = this.checkAccuracy(mappings, courses);
      
      // 整合所有問題
      checkResult.issues = [
        ...checkResult.checks.dataQuality.issues,
        ...checkResult.checks.consistency.issues,
        ...checkResult.checks.completeness.issues,
        ...checkResult.checks.accuracy.issues
      ];
      
      // 生成自動修復建議
      checkResult.autoFixSuggestions = this.generateAutoFixSuggestions(checkResult.issues);
      
      // 計算整體評分
      checkResult.overall.score = this.calculateOverallScore(checkResult.checks);
      checkResult.overall.status = this.determineOverallStatus(checkResult.overall.score);
      
      // 生成建議
      checkResult.recommendations = this.generateRecommendations(checkResult);
      
      console.log(`✅ 數據完整性檢查完成 - 總分: ${checkResult.overall.score}/100`);
      
      return checkResult;
      
    } catch (error) {
      console.log(`❌ 數據完整性檢查失敗: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 📊 檢查數據質量
   */
  checkDataQuality(mappings) {
    const issues = [];
    let qualityScore = 100;
    
    const requiredFields = ['courseName', 'subject', 'courseId', 'status'];
    let missingFieldCount = 0;
    
    mappings.forEach((mapping, index) => {
      // 檢查必要欄位
      const missingFields = requiredFields.filter(field => !mapping[field]);
      if (missingFields.length > 0) {
        issues.push({
          type: 'MISSING_REQUIRED_FIELDS',
          severity: 'ERROR',
          index: index,
          message: `缺少必要欄位: ${missingFields.join(', ')}`,
          data: { mapping, missingFields }
        });
        missingFieldCount++;
      }
      
      // 檢查數據格式
      if (mapping.courseId && !mapping.courseId.match(/^[a-zA-Z0-9_-]+$/)) {
        issues.push({
          type: 'INVALID_COURSE_ID_FORMAT',
          severity: 'WARNING',
          index: index,
          message: `課程ID格式異常: ${mapping.courseId}`,
          data: mapping
        });
      }
    });
    
    // 計算質量分數
    if (mappings.length > 0) {
      const missingFieldRate = missingFieldCount / mappings.length;
      qualityScore -= missingFieldRate * 50;
    }
    
    return {
      score: Math.max(0, qualityScore),
      issues: issues,
      metrics: {
        totalRecords: mappings.length,
        recordsWithMissingFields: missingFieldCount,
        dataCompletenessRate: 1 - (missingFieldCount / Math.max(1, mappings.length))
      }
    };
  }
  
  /**
   * 📋 檢查完整性
   */
  checkCompleteness(mappings) {
    const expectedTotal = 82 * 3; // 82個班級 × 3個科目
    const actualTotal = mappings.length;
    const completenessRate = actualTotal / expectedTotal;
    
    const issues = [];
    
    if (completenessRate < 0.8) {
      issues.push({
        type: 'LOW_COMPLETENESS',
        severity: 'WARNING',
        message: `完整性不足: ${Math.round(completenessRate * 100)}% (${actualTotal}/${expectedTotal})`,
        data: { expected: expectedTotal, actual: actualTotal, rate: completenessRate }
      });
    }
    
    return {
      score: Math.round(completenessRate * 100),
      issues: issues,
      metrics: {
        expectedMappings: expectedTotal,
        actualMappings: actualTotal,
        completenessRate: completenessRate
      }
    };
  }
  
  /**
   * 🎯 檢查準確性
   */
  checkAccuracy(mappings, courses) {
    const issues = [];
    let accuracyScore = 100;
    
    const courseIdSet = new Set(courses.map(c => c.id));
    let invalidCourseIdCount = 0;
    
    mappings.forEach((mapping, index) => {
      // 檢查課程ID是否存在
      if (mapping.courseId && !courseIdSet.has(mapping.courseId)) {
        issues.push({
          type: 'INVALID_COURSE_ID',
          severity: 'ERROR',
          index: index,
          message: `無效的課程ID: ${mapping.courseId}`,
          data: mapping
        });
        invalidCourseIdCount++;
      }
    });
    
    // 計算準確性分數
    if (mappings.length > 0) {
      const invalidRate = invalidCourseIdCount / mappings.length;
      accuracyScore -= invalidRate * 60;
    }
    
    return {
      score: Math.max(0, accuracyScore),
      issues: issues,
      metrics: {
        totalMappings: mappings.length,
        invalidCourseIds: invalidCourseIdCount,
        accuracyRate: 1 - (invalidCourseIdCount / Math.max(1, mappings.length))
      }
    };
  }
  
  /**
   * 🔧 生成自動修復建議
   */
  generateAutoFixSuggestions(issues) {
    const suggestions = [];
    
    const errorCount = issues.filter(i => i.severity === 'ERROR').length;
    const warningCount = issues.filter(i => i.severity === 'WARNING').length;
    
    if (errorCount > 0) {
      suggestions.push({
        priority: 'HIGH',
        action: 'RUN_AUTO_REPAIR',
        description: `執行自動修復，解決 ${errorCount} 個嚴重錯誤`,
        command: 'runAIMappingOptimizer()',
        estimatedTime: '2-5分鐘'
      });
    }
    
    if (warningCount > 5) {
      suggestions.push({
        priority: 'MEDIUM',
        action: 'STANDARDIZE_DATA',
        description: `標準化數據格式，改善 ${warningCount} 個警告`,
        command: 'standardizeMapping()',
        estimatedTime: '1-3分鐘'
      });
    }
    
    return suggestions;
  }
  
  /**
   * 📊 計算整體評分
   */
  calculateOverallScore(checks) {
    const weights = {
      dataQuality: 0.3,
      consistency: 0.2,
      completeness: 0.3,
      accuracy: 0.2
    };
    
    let totalScore = 0;
    Object.entries(weights).forEach(([check, weight]) => {
      if (checks[check] && typeof checks[check].score === 'number') {
        totalScore += checks[check].score * weight;
      }
    });
    
    return Math.round(totalScore);
  }
  
  /**
   * 🎯 確定整體狀態
   */
  determineOverallStatus(score) {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'FAIR';
    return 'POOR';
  }
  
  /**
   * 💡 生成整體建議
   */
  generateRecommendations(checkResult) {
    const recommendations = [];
    
    switch (checkResult.overall.status) {
      case 'EXCELLENT':
        recommendations.push('數據質量優秀，建議定期維護以保持高質量標準');
        break;
      case 'GOOD':
        recommendations.push('數據質量良好，可考慮進一步優化以達到優秀標準');
        break;
      case 'FAIR':
        recommendations.push('數據質量一般，建議執行自動修復以改善問題');
        break;
      case 'POOR':
        recommendations.push('數據質量較差，建議立即執行完整的AI優化流程');
        break;
    }
    
    return recommendations;
  }
}

// ========================================
// 🎯 AI SYSTEM INTEGRATION & UTILITIES
// ========================================

/**
 * 🚀 AI智能課程映射主函數
 * 整合所有AI功能的入口點
 */
async function runAIIntelligentCourseMapping(options = {}) {
  console.log('🚀 開始執行AI智能課程映射系統...');
  
  const startTime = Date.now();
  const optimizer = new AIMappingOptimizer();
  const integrityChecker = new AIDataIntegrityChecker();
  
  try {
    // 步驟 1: 獲取所有課程
    console.log('📚 步驟 1: 獲取 Google Classroom 課程...');
    const coursesResult = await getAllClassroomCourses(options);
    
    if (!coursesResult.success) {
      return { success: false, error: `獲取課程失敗: ${coursesResult.error}` };
    }
    
    const courses = coursesResult.courses;
    console.log(`✅ 獲取到 ${courses.length} 個課程`);
    
    // 步驟 2: AI智能映射優化
    console.log('🧠 步驟 2: AI智能映射優化...');
    const optimizationResult = await optimizer.optimizeMapping(courses, options);
    
    if (!optimizationResult.success) {
      return { success: false, error: `AI優化失敗: ${optimizationResult.error}` };
    }
    
    const mappings = optimizationResult.results.mappings;
    
    // 步驟 3: 數據完整性檢查
    console.log('🔬 步驟 3: 數據完整性檢查...');
    const integrityResult = await integrityChecker.performIntegrityCheck(mappings, courses);
    
    // 步驟 4: 更新工作表
    console.log('📝 步驟 4: 更新課程映射工作表...');
    const updateResult = await updateCourseMappingSheet(mappings, {
      clearExisting: options.clearExisting !== false,
      backupExisting: options.backupExisting !== false
    });
    
    if (!updateResult.success) {
      return { success: false, error: `更新工作表失敗: ${updateResult.error}` };
    }
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 生成最終報告
    const finalReport = {
      success: true,
      performance: {
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration: totalDuration,
        coursesProcessed: courses.length,
        mappingsCreated: mappings.length
      },
      optimization: optimizationResult.results,
      integrityCheck: integrityResult,
      update: updateResult,
      summary: {
        totalCourses: courses.length,
        successfulMappings: mappings.length,
        aiImprovements: optimizationResult.results.improvements.length,
        dataQualityScore: integrityResult.overall ? integrityResult.overall.score : 0,
        completionRate: Math.round((mappings.length / 246) * 100) // 82班級×3科目=246
      },
      recommendations: [
        ...optimizationResult.results.improvements.map(imp => imp.description),
        ...(integrityResult.recommendations || [])
      ]
    };
    
    console.log('\n🎉 AI智能課程映射完成！');
    console.log(`⏱️  總耗時: ${Math.round(totalDuration/1000)}秒`);
    console.log(`📊 映射成功率: ${finalReport.summary.completionRate}%`);
    console.log(`🎯 數據質量分數: ${finalReport.summary.dataQualityScore}/100`);
    console.log(`⚡ AI改進項目: ${finalReport.summary.aiImprovements}個`);
    
    return finalReport;
    
  } catch (error) {
    console.log(`❌ AI智能課程映射執行失敗: ${error.message}`);
    return { success: false, error: error.message, duration: Date.now() - startTime };
  }
}

/**
 * 📊 生成AI映射分析報告
 */
function generateAIMappingReport(mappingResult) {
  if (!mappingResult || !mappingResult.success) {
    return { success: false, error: '無效的映射結果' };
  }
  
  const report = {
    title: 'AI智能課程映射分析報告',
    generatedAt: new Date().toISOString(),
    summary: mappingResult.summary,
    performance: mappingResult.performance,
    insights: [],
    actionItems: []
  };
  
  // 生成洞察
  const completionRate = mappingResult.summary.completionRate;
  if (completionRate >= 95) {
    report.insights.push('🎉 課程映射完整性極高，AI系統運作優異');
  } else if (completionRate >= 85) {
    report.insights.push('👍 課程映射完整性良好，少數課程需要人工確認');
  } else {
    report.insights.push('⚠️ 課程映射完整性需要改善，建議檢查命名規範');
  }
  
  const qualityScore = mappingResult.summary.dataQualityScore;
  if (qualityScore >= 90) {
    report.insights.push('✨ 數據質量優秀，符合最佳實踐標準');
  } else if (qualityScore >= 75) {
    report.insights.push('📈 數據質量良好，有進一步優化空間');
  } else {
    report.insights.push('🔧 數據質量需要改善，建議執行清理作業');
  }
  
  // 生成行動項目
  if (mappingResult.recommendations && mappingResult.recommendations.length > 0) {
    report.actionItems = mappingResult.recommendations.map((rec, index) => ({
      id: index + 1,
      description: rec,
      priority: index < 2 ? 'HIGH' : 'MEDIUM'
    }));
  }
  
  console.log('📋 AI映射分析報告已生成');
  return { success: true, report };
}

/**
 * 🎯 為原有函數添加缺失建議生成
 */
function generateMissingSuggestions(className, subject, courses) {
  const suggestions = [];
  const predictor = new AIMissingCoursePredictor();
  
  const prediction = predictor.predictAlternatives(className, subject, courses, 5);
  
  if (prediction.alternatives.length > 0) {
    suggestions.push({
      type: 'ALTERNATIVE_COURSES',
      description: `找到 ${prediction.alternatives.length} 個可能的替代課程`,
      alternatives: prediction.alternatives.map(alt => ({
        courseName: alt.course.name,
        courseId: alt.course.id,
        matchScore: Math.round(alt.matchScore * 100),
        reason: alt.reason
      }))
    });
  }
  
  return suggestions;
}

/**
 * 🧹 AI 數據清理和標準化
 * 自動清理和標準化映射數據
 */
async function cleanAndStandardizeMappingData() {
  console.log('🧹 開始AI數據清理和標準化...');
  
  try {
    // 1. 讀取現有映射數據
    const currentMappings = await readCourseMappingFromSheet();
    if (!currentMappings.success) {
      return { success: false, error: `讀取映射數據失敗: ${currentMappings.error}` };
    }
    
    const classifier = new AICourseClassifier();
    const cleanedMappings = [];
    const cleaningLog = [];
    
    // 2. 清理和標準化每個映射
    for (const mapping of currentMappings.courses) {
      try {
        // AI重新分析原始課程名稱
        const analysis = classifier.analyzeCourse(mapping.originalName || mapping.courseName, 0.6);
        
        let cleanedMapping = { ...mapping };
        let wasModified = false;
        
        if (analysis.success) {
          const standardName = `${analysis.analysis.grade} ${analysis.analysis.className}`;
          const standardSubject = analysis.analysis.subject;
          
          // 標準化課程名稱
          if (cleanedMapping.courseName !== standardName) {
            cleaningLog.push({
              type: 'NAME_STANDARDIZED',
              courseId: mapping.courseId,
              before: cleanedMapping.courseName,
              after: standardName,
              confidence: Math.round(analysis.analysis.confidence.overall * 100)
            });
            cleanedMapping.courseName = standardName;
            wasModified = true;
          }
          
          // 標準化科目
          if (cleanedMapping.subject !== standardSubject) {
            cleaningLog.push({
              type: 'SUBJECT_STANDARDIZED',
              courseId: mapping.courseId,
              before: cleanedMapping.subject,
              after: standardSubject,
              confidence: Math.round(analysis.analysis.confidence.subject * 100)
            });
            cleanedMapping.subject = standardSubject;
            wasModified = true;
          }
        }
        
        // 標準化狀態
        if (!cleanedMapping.status || cleanedMapping.status === 'UNKNOWN') {
          cleanedMapping.status = 'ACTIVE';
          wasModified = true;
        }
        
        // 添加清理標記
        if (wasModified) {
          cleanedMapping.lastCleaned = new Date().toISOString();
          cleanedMapping.cleanedByAI = true;
        }
        
        cleanedMappings.push(cleanedMapping);
        
      } catch (error) {
        cleaningLog.push({
          type: 'CLEANING_ERROR',
          courseId: mapping.courseId,
          error: error.message
        });
        // 保留原始映射
        cleanedMappings.push(mapping);
      }
    }
    
    // 3. 更新工作表
    console.log(`📝 更新 ${cleanedMappings.length} 個清理後的映射...`);
    const updateResult = await updateCourseMappingSheet(cleanedMappings, {
      clearExisting: true,
      backupExisting: true
    });
    
    if (!updateResult.success) {
      return { success: false, error: `更新清理數據失敗: ${updateResult.error}` };
    }
    
    const cleaningStats = {
      totalProcessed: currentMappings.courses.length,
      totalCleaned: cleaningLog.filter(log => log.type !== 'CLEANING_ERROR').length,
      nameStandardized: cleaningLog.filter(log => log.type === 'NAME_STANDARDIZED').length,
      subjectStandardized: cleaningLog.filter(log => log.type === 'SUBJECT_STANDARDIZED').length,
      errors: cleaningLog.filter(log => log.type === 'CLEANING_ERROR').length
    };
    
    console.log('✅ AI數據清理完成');
    console.log(`📊 清理統計: ${cleaningStats.totalCleaned}/${cleaningStats.totalProcessed} 個映射已標準化`);
    console.log(`📝 名稱標準化: ${cleaningStats.nameStandardized} 個`);
    console.log(`🏷️  科目標準化: ${cleaningStats.subjectStandardized} 個`);
    
    return {
      success: true,
      cleanedMappings: cleanedMappings,
      cleaningLog: cleaningLog,
      statistics: cleaningStats,
      updateResult: updateResult
    };
    
  } catch (error) {
    console.log(`❌ AI數據清理失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 🚀 一鍵執行完整AI映射流程
 * 包含發現、分類、驗證、修復和報告生成
 */
async function executeCompleteAIMappingWorkflow(options = {}) {
  console.log('🚀 執行完整AI智能映射工作流程...');
  
  const workflow = {
    startTime: Date.now(),
    phases: {
      discovery: null,
      classification: null,
      validation: null,
      repair: null,
      cleanup: null,
      reporting: null
    },
    finalResults: null
  };
  
  try {
    // Phase 1: AI智能映射
    console.log('\n🎯 階段 1: AI智能課程映射...');
    const phaseStart = Date.now();
    const mappingResult = await runAIIntelligentCourseMapping(options);
    workflow.phases.discovery = {
      duration: Date.now() - phaseStart,
      success: mappingResult.success,
      result: mappingResult
    };
    
    if (!mappingResult.success) {
      throw new Error(`AI映射階段失敗: ${mappingResult.error}`);
    }
    
    // Phase 2: 數據清理（可選）
    if (options.performCleaning !== false) {
      console.log('\n🧹 階段 2: 數據清理和標準化...');
      const phaseStart2 = Date.now();
      const cleaningResult = await cleanAndStandardizeMappingData();
      workflow.phases.cleanup = {
        duration: Date.now() - phaseStart2,
        success: cleaningResult.success,
        result: cleaningResult
      };
      
      if (!cleaningResult.success) {
        console.log(`⚠️ 數據清理警告: ${cleaningResult.error}`);
      }
    }
    
    // Phase 3: 最終驗證
    console.log('\n🔍 階段 3: 最終驗證和質量檢查...');
    const phaseStart3 = Date.now();
    const integrityChecker = new AIDataIntegrityChecker();
    const coursesResult = await getAllClassroomCourses();
    
    if (coursesResult.success) {
      const currentMappings = await readCourseMappingFromSheet();
      if (currentMappings.success) {
        const finalValidation = await integrityChecker.performIntegrityCheck(
          currentMappings.courses, 
          coursesResult.courses
        );
        workflow.phases.validation = {
          duration: Date.now() - phaseStart3,
          success: finalValidation.success !== false,
          result: finalValidation
        };
      }
    }
    
    // Phase 4: 生成綜合報告
    console.log('\n📊 階段 4: 生成綜合分析報告...');
    const phaseStart4 = Date.now();
    const reportResult = generateAIMappingReport(mappingResult);
    workflow.phases.reporting = {
      duration: Date.now() - phaseStart4,
      success: reportResult.success,
      result: reportResult
    };
    
    const totalDuration = Date.now() - workflow.startTime;
    
    // 整合最終結果
    workflow.finalResults = {
      success: true,
      totalDuration: totalDuration,
      summary: {
        coursesProcessed: mappingResult.summary?.totalCourses || 0,
        mappingsCreated: mappingResult.summary?.successfulMappings || 0,
        completionRate: mappingResult.summary?.completionRate || 0,
        dataQualityScore: workflow.phases.validation?.result?.overall?.score || 0,
        totalImprovements: mappingResult.summary?.aiImprovements || 0,
        phasesCompleted: Object.values(workflow.phases).filter(p => p?.success).length
      },
      recommendations: [
        ...mappingResult.recommendations || [],
        ...(workflow.phases.validation?.result?.recommendations || [])
      ]
    };
    
    console.log('\n🎉 完整AI映射工作流程執行完成!');
    console.log(`⏱️  總執行時間: ${Math.round(totalDuration/1000)}秒`);
    console.log(`📊 映射完成率: ${workflow.finalResults.summary.completionRate}%`);
    console.log(`🎯 數據質量: ${workflow.finalResults.summary.dataQualityScore}/100`);
    console.log(`⚡ 完成階段: ${workflow.finalResults.summary.phasesCompleted}/4`);
    
    return workflow;
    
  } catch (error) {
    console.log(`❌ AI映射工作流程執行失敗: ${error.message}`);
    workflow.finalResults = {
      success: false,
      error: error.message,
      totalDuration: Date.now() - workflow.startTime
    };
    return workflow;
  }
}

/**
 * 🎯 快速AI映射修復
 * 針對特定問題進行快速修復
 */
async function quickAIMappingFix(issues = []) {
  console.log(`🎯 執行快速AI映射修復 (${issues.length} 個問題)...`);
  
  const optimizer = new AIMappingOptimizer();
  const fixes = [];
  
  try {
    // 讀取當前映射
    const currentMappings = await readCourseMappingFromSheet();
    if (!currentMappings.success) {
      return { success: false, error: `讀取映射失敗: ${currentMappings.error}` };
    }
    
    const mappings = currentMappings.courses;
    let modifiedCount = 0;
    
    // 針對每個問題進行修復
    for (const issue of issues) {
      try {
        let wasFixed = false;
        
        switch (issue.type) {
          case 'DUPLICATE_COURSE_ID':
            // 修復重複課程ID
            const duplicatefix = await optimizer.resolveDuplicateCourseId(mappings, issue);
            if (duplicatefix) {
              fixes.push(duplicatefix);
              wasFixed = true;
            }
            break;
            
          case 'INVALID_SUBJECT_FORMAT':
            // 修復無效科目格式
            const mapping = mappings[issue.index];
            if (mapping) {
              const classifier = new AICourseClassifier();
              const analysis = classifier.analyzeCourse(mapping.originalName || mapping.courseName);
              
              if (analysis.success && analysis.analysis.subject) {
                mapping.subject = analysis.analysis.subject;
                fixes.push({
                  type: 'SUBJECT_FORMAT_FIXED',
                  description: `科目格式修復: ${mapping.courseName} -> ${analysis.analysis.subject}`,
                  before: issue.data.subject,
                  after: analysis.analysis.subject
                });
                wasFixed = true;
              }
            }
            break;
            
          case 'MISSING_MAPPING':
            // 嘗試填補缺失映射
            const courses = await getAllClassroomCourses();
            if (courses.success) {
              const predictor = new AIMissingCoursePredictor();
              const [className, subject] = issue.data.expectedMapping.split('-');
              const prediction = predictor.predictAlternatives(className, subject, courses.courses, 1);
              
              if (prediction.alternatives.length > 0 && prediction.alternatives[0].matchScore > 0.7) {
                const newMapping = {
                  courseName: className,
                  subject: subject,
                  courseId: prediction.alternatives[0].course.id,
                  originalName: prediction.alternatives[0].course.name,
                  status: 'ACTIVE',
                  matchType: 'AI_QUICK_FIX',
                  score: Math.round(prediction.alternatives[0].matchScore * 100),
                  discoveredAt: new Date().toISOString()
                };
                
                mappings.push(newMapping);
                fixes.push({
                  type: 'MISSING_MAPPING_FILLED',
                  description: `缺失映射已填補: ${issue.data.expectedMapping} -> ${newMapping.originalName}`,
                  confidence: prediction.alternatives[0].matchScore
                });
                wasFixed = true;
              }
            }
            break;
        }
        
        if (wasFixed) modifiedCount++;
        
      } catch (error) {
        fixes.push({
          type: 'FIX_ERROR',
          description: `修復失敗: ${issue.type} - ${error.message}`
        });
      }
    }
    
    // 更新映射（如果有修改）
    let updateResult = null;
    if (modifiedCount > 0) {
      updateResult = await updateCourseMappingSheet(mappings, {
        clearExisting: true,
        backupExisting: false
      });
    }
    
    console.log(`✅ 快速修復完成 - 修復了 ${modifiedCount}/${issues.length} 個問題`);
    
    return {
      success: true,
      fixes: fixes,
      statistics: {
        issuesProvided: issues.length,
        issuesFixed: modifiedCount,
        fixRate: modifiedCount / Math.max(1, issues.length)
      },
      updateResult: updateResult
    };
    
  } catch (error) {
    console.log(`❌ 快速修復失敗: ${error.message}`);
    return { success: false, error: error.message, partialFixes: fixes };
  }
}