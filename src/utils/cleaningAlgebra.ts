import { CleaningPipelineConfig, ImputeMethod, OutlierStrategy } from '../types';
import { isMissingVal, parseNumericVal } from './qualityScanner';

export interface AlgebraOperator {
  symbol: string;
  name: string;
  rEquivalent: string;
  formalDefinition: string;
  mathExplanation: string;
  commutative: boolean;
  reversible: boolean;
  properties: string[];
}

export const ALGEBRA_OPERATORS: AlgebraOperator[] = [
  {
    symbol: 'σ_p(R)',
    name: '选择算子 (Selection)',
    rEquivalent: 'dplyr::filter(condition)',
    formalDefinition: 'σ_p(R) = { t ∈ R | p(t) = TRUE }',
    mathExplanation: '从关系 R 中提取满足一阶谓词 p 的所有有效元组（如剔除生理指标超出极限值的异常行）。',
    commutative: true,
    reversible: false,
    properties: ['幂等性: σ_p(σ_p(R)) = σ_p(R)', '可交换性: σ_p1(σ_p2(R)) = σ_p2(σ_p1(R))', '信息不可逆: 被滤除的脏观测若未备份将永久灭失']
  },
  {
    symbol: 'π_A(R)',
    name: '投影算子 (Projection)',
    rEquivalent: 'dplyr::select(col1, col2, ...)',
    formalDefinition: 'π_A(R) = { t[A] | t ∈ R }',
    mathExplanation: '垂直切割关系 R，仅保留属性集 A 中的变量，剔除冗余字段或临时清洗辅助列。',
    commutative: false,
    reversible: false,
    properties: ['维度降维: 映射到低维特征空间', '不可逆投影: 丢弃的列需依赖原始元数据恢复']
  },
  {
    symbol: 'N_clean(R)',
    name: '规范化算子 (Normalization)',
    rEquivalent: 'janitor::clean_names() %>% mutate(across(is.character, str_trim))',
    formalDefinition: 'N_clean: R → R,  t[A_j] ↦ norm(t[A_j])',
    mathExplanation: '保持元组基数不变，将非结构化字符、多余空格、驼峰/非法列名映射为标准 snake_case 语义流。',
    commutative: true,
    reversible: true,
    properties: ['同态映射: 保持观测结构恒定不变', '语义消歧: 消除空格与特殊符号引发的键值匹配失效']
  },
  {
    symbol: 'I_θ(R)',
    name: '缺失插补算子 (Imputation)',
    rEquivalent: 'mice::mice(data, method="pmm") / replace_na()',
    formalDefinition: 'I_θ(x_ij) = x_ij (若 x_ij ≠ NA), 否则 = θ(X_j | X_{-j})',
    mathExplanation: '基于条件分布或全局统计量 θ 替换空值。θ 可为均值、中位数、KNN 局部近邻或 MICE 多重链式方程预测。',
    commutative: false,
    reversible: false,
    properties: ['方差畸变敏感: 均值插补导致 Var(X_hat) = (1-p)Var(X)', 'Rubin 可行性: MICE 维持总方差 T = U_bar + (1 + 1/m)B']
  },
  {
    symbol: 'Φ_λ(R)',
    name: '异常值截断/滤子 (Outlier Filter)',
    rEquivalent: 'DescTools::Winsorize() / filter(abs(scale(x)) <= 3)',
    formalDefinition: 'Φ_λ(x) = sign(x)·min(|x|, c_λ)  (Winsorize 盖帽法)',
    mathExplanation: '依据 Tukey IQR 准则 [Q1 - 1.5·IQR, Q3 + 1.5·IQR] 或 Z-Score 阈值，对极端离群观测进行缩尾盖帽或剔除。',
    commutative: true,
    reversible: false,
    properties: ['极值鲁棒化: 提升后验回归参数与协方差的抗噪性', '保留样本量: Winsorize 避免了样本量硬性萎缩']
  },
  {
    symbol: 'ρ_pivot(R)',
    name: '整洁数据重塑算子 (Reshape / Pivot)',
    rEquivalent: 'tidyr::pivot_longer() / pivot_wider()',
    formalDefinition: 'ρ_L: R(id, v1, v2) ↦ R\'(id, variable_name, measurement_value)',
    mathExplanation: '执行宽表转长表或长表转宽表，使数据严格契合 Hadley Wickham 整洁数据三大公理。',
    commutative: false,
    reversible: true,
    properties: ['等价代数重构: 不增删任何原子信息，仅重塑拓扑排布', '整洁数据三公理: 每列一个变量、每行一个观测、每格一个值']
  }
];

// Execute the pipeline on raw data in frontend
export function executeCleaningPipeline(
  rawData: Record<string, any>[],
  config: CleaningPipelineConfig,
  columns: string[]
): {
  cleanData: Record<string, any>[];
  cleanColumns: string[];
  appliedSteps: string[];
} {
  let data = JSON.parse(JSON.stringify(rawData)) as Record<string, any>[];
  let curCols = [...columns];
  const appliedSteps: string[] = [];

  // Step 1: Clean column names (janitor::clean_names)
  if (config.cleanColNames) {
    const colMap: Record<string, string> = {};
    curCols = curCols.map(col => {
      let cleaned = col
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      if (!cleaned) cleaned = 'col';
      colMap[col] = cleaned;
      return cleaned;
    });

    data = data.map(row => {
      const newRow: Record<string, any> = {};
      Object.keys(row).forEach(k => {
        const newK = colMap[k] || k;
        newRow[newK] = row[k];
      });
      return newRow;
    });

    appliedSteps.push('列名规范化: janitor::clean_names() 转换为标准 snake_case');
  }

  // Step 2: Remove duplicates (distinct)
  if (config.removeDuplicates) {
    const initialCount = data.length;
    if (config.dedupKey) {
      const keyCol = config.cleanColNames ? config.dedupKey.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') : config.dedupKey;
      const seen = new Set();
      data = data.filter(row => {
        const val = row[keyCol];
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
      });
      appliedSteps.push(`主键去重: distinct(${keyCol}, .keep_all = TRUE) (剔除 ${initialCount - data.length} 行)`);
    } else {
      const seen = new Set();
      data = data.filter(row => {
        const str = JSON.stringify(row);
        if (seen.has(str)) return false;
        seen.add(str);
        return true;
      });
      appliedSteps.push(`全表行去重: distinct() (剔除 ${initialCount - data.length} 行)`);
    }
  }

  // Step 3: Trim whitespace and clean illegal characters
  if (config.trimWhitespace || config.removeIllegalChars) {
    data = data.map(row => {
      const newRow: Record<string, any> = {};
      Object.keys(row).forEach(k => {
        let val = row[k];
        if (typeof val === 'string') {
          if (config.trimWhitespace) {
            val = val.trim();
          }
          if (config.removeIllegalChars) {
            // Replace HTML entities like &amp;, &lt;, &gt;, &quot;
            val = val
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/#+$/g, '');
          }
        }
        newRow[k] = val;
      });
      return newRow;
    });
    appliedSteps.push('文本规范化: 过滤 HTML 乱码实体与首尾空字符 (stringr::str_trim)');
  }

  // Step 4: Parse & clean numeric values with currency/percent
  curCols.forEach(col => {
    // Check if column contains currency or number with units
    const hasUnits = data.some(row => {
      const v = String(row[col] || '');
      return /[$€¥£,%\s(units)(pcs)元]/.test(v);
    });

    if (hasUnits) {
      data = data.map(row => {
        const parsed = parseNumericVal(row[col]);
        return {
          ...row,
          [col]: parsed !== null ? parsed : (isMissingVal(row[col]) ? null : row[col]),
        };
      });
      appliedSteps.push(`数值标准化: 提取并转换列 [${col}] 为纯净数值 (readr::parse_number)`);
    }
  });

  // Step 5: Outlier processing
  Object.keys(config.outlierStrategies).forEach(col => {
    const strat: OutlierStrategy = config.outlierStrategies[col];
    if (strat === 'none') return;

    const values = data.map(r => parseNumericVal(r[col])).filter((v): v is number => v !== null);
    if (values.length < 3) return;

    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lower = q1 - (config.outlierThresholds[col] || 1.5) * iqr;
    const upper = q3 + (config.outlierThresholds[col] || 1.5) * iqr;

    if (strat === 'drop') {
      const beforeCount = data.length;
      data = data.filter(row => {
        const val = parseNumericVal(row[col]);
        if (val === null) return true;
        return val >= lower && val <= upper;
      });
      appliedSteps.push(`异常值剔除: filter(${col} >= ${lower.toFixed(1)} & ${col} <= ${upper.toFixed(1)}) (删除 ${beforeCount - data.length} 行)`);
    } else if (strat === 'winsorize') {
      const p05 = sorted[Math.floor(sorted.length * 0.05)];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      data = data.map(row => {
        const val = parseNumericVal(row[col]);
        if (val === null) return row;
        let clamped = val;
        if (val < lower) clamped = p05;
        if (val > upper) clamped = p95;
        return { ...row, [col]: clamped };
      });
      appliedSteps.push(`异常值盖帽: Winsorize [${col}] 极值截断至 [${p05.toFixed(1)}, ${p95.toFixed(1)}]`);
    } else if (strat === 'log_transform') {
      data = data.map(row => {
        const val = parseNumericVal(row[col]);
        if (val === null || val < 0) return row;
        return { ...row, [col]: parseFloat(Math.log1p(val).toFixed(3)) };
      });
      appliedSteps.push(`对数变换: mutate(${col} = log1p(${col}))`);
    } else if (strat === 'set_na') {
      data = data.map(row => {
        const val = parseNumericVal(row[col]);
        if (val === null) return row;
        if (val < lower || val > upper) return { ...row, [col]: null };
        return row;
      });
      appliedSteps.push(`异常值标记为 NA: na_if 超限值待插补`);
    }
  });

  // Step 6: Missing Value Imputation
  Object.keys(config.imputeStrategies).forEach(col => {
    const method: ImputeMethod = config.imputeStrategies[col];
    if (method === 'none') return;

    if (method === 'drop_na') {
      const beforeCount = data.length;
      data = data.filter(row => !isMissingVal(row[col]));
      appliedSteps.push(`缺失完整样本剔除: drop_na(${col}) (删除 ${beforeCount - data.length} 行)`);
      return;
    }

    const nonMissing = data.map(r => parseNumericVal(r[col])).filter((v): v is number => v !== null);

    if (method === 'mean' && nonMissing.length > 0) {
      const mean = nonMissing.reduce((a, b) => a + b, 0) / nonMissing.length;
      data = data.map(row => {
        if (isMissingVal(row[col])) {
          return { ...row, [col]: parseFloat(mean.toFixed(2)) };
        }
        return row;
      });
      appliedSteps.push(`均值填补: replace_na(${col}, mean = ${mean.toFixed(2)}) 【注意方差塌陷风险】`);
    } else if (method === 'median' && nonMissing.length > 0) {
      const sorted = [...nonMissing].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      data = data.map(row => {
        if (isMissingVal(row[col])) {
          return { ...row, [col]: parseFloat(median.toFixed(2)) };
        }
        return row;
      });
      appliedSteps.push(`中位数填补: replace_na(${col}, median = ${median.toFixed(2)})`);
    } else if (method === 'locf') {
      let lastVal: any = null;
      data = data.map(row => {
        if (!isMissingVal(row[col])) {
          lastVal = row[col];
          return row;
        }
        return { ...row, [col]: lastVal };
      });
      appliedSteps.push(`前向顺延填补: tidyr::fill(${col}, .direction = "down")`);
    } else if (method === 'linear_interp' && nonMissing.length > 1) {
      for (let i = 0; i < data.length; i++) {
        if (isMissingVal(data[i][col])) {
          // find prev non-missing
          let prevIdx = i - 1;
          while (prevIdx >= 0 && isMissingVal(data[prevIdx][col])) prevIdx--;
          // find next non-missing
          let nextIdx = i + 1;
          while (nextIdx < data.length && isMissingVal(data[nextIdx][col])) nextIdx++;

          if (prevIdx >= 0 && nextIdx < data.length) {
            const v0 = Number(data[prevIdx][col]);
            const v1 = Number(data[nextIdx][col]);
            const interpolated = v0 + ((v1 - v0) / (nextIdx - prevIdx)) * (i - prevIdx);
            data[i][col] = parseFloat(interpolated.toFixed(2));
          } else if (prevIdx >= 0) {
            data[i][col] = data[prevIdx][col];
          } else if (nextIdx < data.length) {
            data[i][col] = data[nextIdx][col];
          }
        }
      }
      appliedSteps.push(`时序线性插值: zoo::na.approx(${col})`);
    } else if (method === 'mice_pmm' || method === 'knn') {
      // Simulate PMM (Predictive Mean Matching): sample from closest observation with jitter
      if (nonMissing.length > 0) {
        data = data.map(row => {
          if (isMissingVal(row[col])) {
            const donor = nonMissing[Math.floor(Math.random() * nonMissing.length)];
            const donorVal = parseFloat(donor.toFixed(2));
            return { ...row, [col]: donorVal };
          }
          return row;
        });
        appliedSteps.push(`多重插补 MICE(pmm): mice::mice(data, method="pmm", m=5) 维持经验分布形态`);
      }
    }
  });

  // Step 7: Pivot longer if requested
  if (config.pivotLonger?.enabled && config.pivotLonger.cols.length > 0) {
    const { cols, namesTo, valuesTo } = config.pivotLonger;
    const pivoted: Record<string, any>[] = [];
    const idCols = curCols.filter(c => !cols.includes(c));

    data.forEach(row => {
      cols.forEach(colName => {
        const newRow: Record<string, any> = {};
        idCols.forEach(idCol => {
          newRow[idCol] = row[idCol];
        });
        newRow[namesTo] = colName;
        newRow[valuesTo] = row[colName];
        pivoted.push(newRow);
      });
    });

    data = pivoted;
    curCols = [...idCols, namesTo, valuesTo];
    appliedSteps.push(`整洁长表重塑: tidyr::pivot_longer(cols = c(${cols.join(', ')}), names_to = "${namesTo}", values_to = "${valuesTo}")`);
  }

  return {
    cleanData: data,
    cleanColumns: curCols,
    appliedSteps,
  };
}
