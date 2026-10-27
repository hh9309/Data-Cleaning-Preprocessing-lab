import { ColumnMetric, ColumnType, DataQualityAudit } from '../types';

export function isNumericString(val: any): boolean {
  if (val === null || val === undefined || val === '') return false;
  // If it has numbers, strip currency/comma/units
  const cleaned = String(val).replace(/[$€¥£,%\s(units)(pcs)元]/gi, '').trim();
  return !isNaN(Number(cleaned)) && cleaned.length > 0;
}

export function parseNumericVal(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  const str = String(val).trim();
  if (['na', 'n/a', 'null', 'none', '-999', 'nan'].includes(str.toLowerCase())) {
    return null;
  }
  const cleaned = str.replace(/[$€¥£,%\s(units)(pcs)元]/gi, '').trim();
  const num = Number(cleaned);
  return isNaN(num) ? null : num;
}

export function isMissingVal(val: any): boolean {
  if (val === null || val === undefined) return true;
  const str = String(val).trim();
  if (str === '') return true;
  return ['na', 'n/a', 'null', 'none', '-999', 'nan', 'nil'].includes(str.toLowerCase());
}

export function isSnakeCase(str: string): boolean {
  return /^[a-z0-9]+(_[a-z0-9]+)*$/.test(str);
}

export function hasSpecialChars(str: string): boolean {
  return /[#@!$%^&*()+=[\]{}|\\:;"'<>,?/~`\s]/.test(str);
}

export function scanDataset(
  rawData: Record<string, any>[],
  columns: string[],
  primaryKey?: string
): DataQualityAudit {
  const totalRows = rawData.length;
  const totalCols = columns.length;
  const totalCells = totalRows * totalCols;

  if (totalRows === 0 || totalCols === 0) {
    return {
      totalRows: 0,
      totalCols: 0,
      totalCells: 0,
      totalMissingCells: 0,
      overallMissingRate: 0,
      duplicateRowsCount: 0,
      duplicateRate: 0,
      nonStandardColNamesCount: 0,
      totalOutlierCells: 0,
      columns: [],
      completenessScore: 100,
      uniquenessScore: 100,
      conformityScore: 100,
      accuracyScore: 100,
      consistencyScore: 100,
      overallHealthScore: 100,
      grade: 'A',
      issuesSummary: { critical: [], warning: [], good: ['数据集为空'] },
    };
  }

  // 1. Duplicate detection
  const rowStrings = rawData.map(r => JSON.stringify(r));
  const uniqueRows = new Set(rowStrings);
  const duplicateRowsCount = totalRows - uniqueRows.size;
  const duplicateRate = totalRows > 0 ? (duplicateRowsCount / totalRows) * 100 : 0;

  // 2. Scan each column
  let totalMissingCells = 0;
  let totalOutlierCells = 0;
  let nonStandardColNamesCount = 0;

  const colMetrics: ColumnMetric[] = columns.map(col => {
    const originalName = col;
    const isSnake = isSnakeCase(col);
    const hasSpecial = hasSpecialChars(col);
    if (!isSnake || hasSpecial) {
      nonStandardColNamesCount++;
    }

    const values = rawData.map(r => r[col]);
    let missingCount = 0;
    const nonMissingNumeric: number[] = [];
    const nonMissingStrings: string[] = [];

    values.forEach(v => {
      if (isMissingVal(v)) {
        missingCount++;
      } else {
        const num = parseNumericVal(v);
        if (num !== null) {
          nonMissingNumeric.push(num);
        } else {
          nonMissingStrings.push(String(v));
        }
      }
    });

    totalMissingCells += missingCount;
    const missingRate = (missingCount / totalRows) * 100;
    const uniqueCount = new Set(values.filter(v => !isMissingVal(v))).size;

    // Determine type
    let type: ColumnType = 'string';
    if (nonMissingNumeric.length > nonMissingStrings.length) {
      type = 'numeric';
    } else if (values.some(v => String(v).match(/^\d{4}[-/.]\d{2}[-/.]\d{2}/))) {
      type = 'date';
    } else if (uniqueCount <= 5 && totalRows >= 8) {
      type = 'categorical';
    }

    // Outlier calculation for numeric
    let min: number | undefined;
    let max: number | undefined;
    let mean: number | undefined;
    let median: number | undefined;
    let variance: number | undefined;
    let stdDev: number | undefined;
    let q1: number | undefined;
    let q3: number | undefined;
    let iqr: number | undefined;
    let outlierCount = 0;

    if (type === 'numeric' && nonMissingNumeric.length > 2) {
      const sorted = [...nonMissingNumeric].sort((a, b) => a - b);
      min = sorted[0];
      max = sorted[sorted.length - 1];

      const sum = sorted.reduce((acc, cur) => acc + cur, 0);
      mean = sum / sorted.length;

      const mid = Math.floor(sorted.length / 2);
      median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

      // Variance & StdDev
      variance = sorted.reduce((acc, cur) => acc + Math.pow(cur - mean!, 2), 0) / (sorted.length - 1);
      stdDev = Math.sqrt(variance);

      // Quartiles
      const q1Index = Math.floor(sorted.length * 0.25);
      const q3Index = Math.floor(sorted.length * 0.75);
      q1 = sorted[q1Index];
      q3 = sorted[q3Index];
      iqr = q3 - q1;

      // IQR outlier rule
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      outlierCount = sorted.filter(v => v < lowerBound || v > upperBound).length;
      totalOutlierCells += outlierCount;
    }

    const outlierRate = nonMissingNumeric.length > 0 ? (outlierCount / nonMissingNumeric.length) * 100 : 0;

    return {
      name: col,
      originalName,
      type,
      totalCount: totalRows,
      missingCount,
      missingRate,
      uniqueCount,
      outlierCount,
      outlierRate,
      isSnakeCase: isSnake,
      hasSpecialChars: hasSpecial,
      min,
      max,
      mean,
      median,
      variance,
      stdDev,
      q1,
      q3,
      iqr,
      sampleValues: values.slice(0, 6),
    };
  });

  const overallMissingRate = (totalMissingCells / totalCells) * 100;

  // 3. Compute Health Scores (0-100)
  // Completeness: 100 - (overallMissingRate * 2.5) clamped
  const completenessScore = Math.max(0, Math.min(100, Math.round(100 - overallMissingRate * 2.5)));

  // Uniqueness: 100 - (duplicateRate * 3)
  const uniquenessScore = Math.max(0, Math.min(100, Math.round(100 - duplicateRate * 3)));

  // Conformity: percentage of standard column names & clean formats
  const nonStandardRatio = nonStandardColNamesCount / totalCols;
  const conformityScore = Math.max(0, Math.min(100, Math.round((1 - nonStandardRatio * 0.7) * 100)));

  // Accuracy: penalty for outlier cells
  const outlierCellRate = (totalOutlierCells / totalCells) * 100;
  const accuracyScore = Math.max(0, Math.min(100, Math.round(100 - outlierCellRate * 5)));

  // Consistency: heuristics on mixed units, string currencies in numeric
  let consistencyPenalty = 0;
  colMetrics.forEach(c => {
    if (c.type === 'numeric') {
      const dirtyStringCount = rawData.filter(r => {
        const v = String(r[c.name] || '');
        return /[€¥$£%元]/.test(v);
      }).length;
      if (dirtyStringCount > 0) consistencyPenalty += 8;
    }
  });
  const consistencyScore = Math.max(0, Math.min(100, 100 - consistencyPenalty));

  // Overall Weighted Score
  const overallHealthScore = Math.round(
    completenessScore * 0.28 +
    uniquenessScore * 0.20 +
    conformityScore * 0.18 +
    accuracyScore * 0.20 +
    consistencyScore * 0.14
  );

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (overallHealthScore >= 90) grade = 'A';
  else if (overallHealthScore >= 80) grade = 'B';
  else if (overallHealthScore >= 65) grade = 'C';
  else if (overallHealthScore >= 50) grade = 'D';

  // Issues summary
  const critical: string[] = [];
  const warning: string[] = [];
  const good: string[] = [];

  if (overallMissingRate > 15) {
    critical.push(`全表缺失率高达 ${overallMissingRate.toFixed(1)}%，若直接执行 na.omit() 将导致样本量严重收缩与统计偏差。`);
  } else if (overallMissingRate > 0) {
    warning.push(`存在 ${totalMissingCells} 个缺失单元格 (占比 ${overallMissingRate.toFixed(1)}%)，需采用合理填补策略。`);
  } else {
    good.push('数据集完整度优秀，无缺失观测。');
  }

  if (duplicateRowsCount > 0) {
    critical.push(`排查到 ${duplicateRowsCount} 行完全重复记录，违背每个观测独立成行的整洁数据规范。`);
  } else {
    good.push('无完全重复行，记录唯一性良好。');
  }

  if (totalOutlierCells > 0) {
    warning.push(`检测到 ${totalOutlierCells} 处显著离群点 (Tukey IQR 准则)，可能受输入错误或脉冲噪音污染。`);
  }

  if (nonStandardColNamesCount > 0) {
    warning.push(`${nonStandardColNamesCount} 个变量列名含有空格、大写或非法字符，建议调用 janitor::clean_names()。`);
  } else {
    good.push('列名均严格遵循 snake_case 工业命名标准。');
  }

  return {
    totalRows,
    totalCols,
    totalCells,
    totalMissingCells,
    overallMissingRate,
    duplicateRowsCount,
    duplicateRate,
    nonStandardColNamesCount,
    totalOutlierCells,
    columns: colMetrics,
    completenessScore,
    uniquenessScore,
    conformityScore,
    accuracyScore,
    consistencyScore,
    overallHealthScore,
    grade,
    issuesSummary: { critical, warning, good },
  };
}
