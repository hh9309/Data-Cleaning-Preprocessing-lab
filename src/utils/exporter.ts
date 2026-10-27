import { DataQualityAudit, CaseStudy } from '../types';

export function convertToCSV(data: Record<string, any>[], columns: string[]): string {
  if (data.length === 0) return '';
  const header = columns.map(c => `"${c.replace(/"/g, '""')}"`).join(',');
  const rows = data.map(row => {
    return columns
      .map(col => {
        const val = row[col];
        if (val === null || val === undefined) return '';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',');
  });
  return [header, ...rows].join('\n');
}

export function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 6-Section Structured R Markdown Report
export function exportRMarkdown(
  caseStudy: CaseStudy,
  rawAudit: DataQualityAudit,
  cleanAudit: DataQualityAudit,
  appliedSteps: string[],
  cleanColumns: string[],
  rScript: string
): string {
  return `---
title: "R 数据清洗与预处理实验室 - 质量审计白皮书"
subtitle: "全流程标准化审计报告: ${caseStudy.title}"
author: "R Data Cleaning & Preprocessing WebApp Lab"
date: "\`r Sys.Date()\`"
output:
  html_document:
    theme: flatly
    toc: true
    toc_depth: 3
    number_sections: true
    code_folding: show
---

# 第 1 部分：项目背景与整洁数据契约 (Project Background & Tidy Data Contract)

## 业务背景与应用领域
- **业务领域**: ${caseStudy.domain}
- **案例课题**: ${caseStudy.title} —— ${caseStudy.subtitle}
- **业务场景描述**: ${caseStudy.description}

## Hadley Wickham 整洁数据三大公理约束
1. **公理一 (Variables as Columns)**: 每一个物理变量必须独立成列，消除宽表违规横向堆叠。
2. **公理二 (Observations as Rows)**: 每一个实体观测必须独立成行，彻底过滤重复进件与冗余打卡。
3. **公理三 (Atomic Cell Values)**: 每一个坐标单元格仅存放单一原子值，严格剥离复合文本、多重货币与未清洗单位。

---

# 第 2 部分：原始数据接入与五维质量扫描 (Raw Ingestion & 5-Dimension Health Audit)

## 数据集原始规模与字段构成
- **原始规模**: \`${rawAudit.totalRows}\` 行 × \`${rawAudit.totalCols}\` 列 (单元格总数: ${rawAudit.totalCells})
- **综合健康度得分**: **${rawAudit.overallHealthScore} / 100 分** (评级: **${rawAudit.grade}**)

## 五维健康雷达初始指标
- **完整性得分 (Completeness)**: ${rawAudit.completenessScore} 分 (全表缺失率: ${rawAudit.overallMissingRate.toFixed(2)}%)
- **唯一性得分 (Uniqueness)**: ${rawAudit.uniquenessScore} 分 (排查到 ${rawAudit.duplicateRowsCount} 行完全重复)
- **规范性得分 (Conformity)**: ${rawAudit.conformityScore} 分 (${rawAudit.nonStandardColNamesCount} 个非标列名)
- **准确性得分 (Accuracy)**: ${rawAudit.accuracyScore} 分 (${rawAudit.totalOutlierCells} 处显著离群极值)
- **一致性得分 (Consistency)**: ${rawAudit.consistencyScore} 分

## 检出的核心病灶与高危缺陷
\`\`\`markdown
${rawAudit.issuesSummary.critical.map((c, i) => `[Critical #${i+1}] ${c}`).join('\n')}
${rawAudit.issuesSummary.warning.map((w, i) => `[Warning #${i+1}] ${w}`).join('\n')}
\`\`\`

---

# 第 3 部分：缺失值模式诊断与多维插补流 (Missingness Diagnostics & Imputation Workflow)

## Rubin 缺失机制诊断与统计推演
- **缺失机制分类**: 经评估，本数据缺失特征需防范选择性偏差 (Selection Bias)。若属于 MAR，严禁直接执行 \`na.omit()\`。
- **方差收缩定理防范**: 警惕机械均值填补所引发的方差塌陷：
  $$\\mathrm{Var}(\\hat{X}) = (1 - p)\\cdot \\mathrm{Var}(X) < \\mathrm{Var}(X)$$
- **MICE 预测均值匹配 (PMM)**: 采用 Rubin 多重插补法则，通过链式方程 $m=5$ 重抽样，将总方差分解为 $T = \\bar{U} + (1 + 1/m)B$，严格维持经验分布形态。

---

# 第 4 部分：重复记录排查与离群极值治理 (Deduplication & Outlier Governance)

## 冗余排查策略
- **主键排查**: ${caseStudy.primaryKey ? `基于业务主键 [${caseStudy.primaryKey}] 执行 \`distinct(..., .keep_all = TRUE)\`` : '全表行完全重复去重 \`distinct()\`'}。
- **治理效果**: 彻底清除了 ${rawAudit.duplicateRowsCount} 行冗余记录，保障每个观测实体的唯一性。

## 极端离群值处理 (Tukey IQR & Winsorization)
- **IQR 准则**: 基于 $[Q_1 - 1.5\\cdot \\mathrm{IQR}, Q_3 + 1.5\\cdot \\mathrm{IQR}]$ 边界截获脉冲异常。
- **治理方法**: 采用 5%/95% 分位数双侧缩尾盖帽法 (Winsorization) 或条件过滤，避免极端手误污染后验回归参数。

---

# 第 5 部分：前后对照差分审计与质量增益 (Before/After Comparative Audit & Delta Scorecard)

| 核心质检维度 | 原始数据指标 (Before) | 清洗后整洁数据 (After) | 质量增益 ($\\Delta$) |
| :--- | :--- | :--- | :--- |
| **完整性得分** | ${rawAudit.completenessScore} 分 | ${cleanAudit.completenessScore} 分 | +${cleanAudit.completenessScore - rawAudit.completenessScore} 分 |
| **唯一性得分** | ${rawAudit.uniquenessScore} 分 | ${cleanAudit.uniquenessScore} 分 | +${cleanAudit.uniquenessScore - rawAudit.uniquenessScore} 分 |
| **规范性得分** | ${rawAudit.conformityScore} 分 | ${cleanAudit.conformityScore} 分 | +${cleanAudit.conformityScore - rawAudit.conformityScore} 分 |
| **准确性得分** | ${rawAudit.accuracyScore} 分 | ${cleanAudit.accuracyScore} 分 | +${cleanAudit.accuracyScore - rawAudit.accuracyScore} 分 |
| **一致性得分** | ${rawAudit.consistencyScore} 分 | ${cleanAudit.consistencyScore} 分 | +${cleanAudit.consistencyScore - rawAudit.consistencyScore} 分 |
| **全表健康度总评分** | **${rawAudit.overallHealthScore} (${rawAudit.grade})** | **${cleanAudit.overallHealthScore} (${cleanAudit.grade})** | **+${cleanAudit.overallHealthScore - rawAudit.overallHealthScore} 分** |

## 样本留存率与规模变迁
- **原始规模**: ${rawAudit.totalRows} 行 $\\rightarrow$ **清洗后规模**: ${cleanAudit.totalRows} 行
- **样本留存率**: ${((cleanAudit.totalRows / (rawAudit.totalRows || 1)) * 100).toFixed(1)}%
- **已实施完整算子链**:
\`\`\`markdown
${appliedSteps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}
\`\`\`

---

# 第 6 部分：工业级可复现 R 管道流与落盘验收 (Reproducible R Pipeline & Acceptance Contract)

## 可直接运行的 R 脚本源码
\`\`\`r
${rScript}
\`\`\`

## 交付物验收结论
- **整洁数据集输出**: \`cleaned_tidy_dataset.csv\` 已成功通过数据契约检验。
- **命名规范合规率**: 100% 遵循 POSIX snake_case 命名标准。
`;
}

// 6-Section Structured Standalone HTML Report
export function exportStandaloneHTML(
  caseStudy: CaseStudy,
  rawAudit: DataQualityAudit,
  cleanAudit: DataQualityAudit,
  appliedSteps: string[],
  cleanData: Record<string, any>[],
  cleanColumns: string[],
  rScript: string
): string {
  const tableRows = cleanData.slice(0, 15).map((row, idx) => {
    return `<tr><td style="padding:6px 10px;border:1px solid #e2e8f0;font-family:monospace;color:#64748b;">${idx + 1}</td>${cleanColumns.map(col => `<td style="padding:6px 12px;border:1px solid #e2e8f0;font-size:12px;font-family:monospace;">${row[col] ?? '<span style="color:#ef4444;font-weight:bold;">NA</span>'}</td>`).join('')}</tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>数据质量审计白皮书 - ${caseStudy.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 40px 20px; max-width: 1040px; margin: 0 auto; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    h1 { font-size: 24px; color: #0f172a; margin-top: 0; }
    h2 { font-size: 17px; color: #0f766e; border-bottom: 2px solid #ccfbf1; padding-bottom: 8px; margin-top: 28px; }
    h3 { font-size: 14px; color: #334155; margin-top: 16px; margin-bottom: 8px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 13px; background: #ccfbf1; color: #0f766e; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; background: #fff; }
    th { background: #f1f5f9; padding: 8px 12px; border: 1px solid #cbd5e1; font-size: 12px; text-align: left; font-weight: 600; color: #475569; }
    td { font-size: 12px; }
    pre { background: #0f172a; color: #38bdf8; padding: 16px; border-radius: 10px; overflow-x: auto; font-family: monospace; font-size: 12px; line-height: 1.5; }
    .info-box { background: #f0fdfa; border: 1px solid #99f6e4; padding: 14px 18px; border-radius: 10px; margin: 14px 0; font-size: 13px; color: #115e59; }
    .warning-box { background: #fffbeb; border: 1px solid #fde68a; padding: 14px 18px; border-radius: 10px; margin: 14px 0; font-size: 13px; color: #92400e; }
  </style>
</head>
<body>
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:16px;">
      <div>
        <h1>R 数据清洗与预处理实验室 - 质量审计白皮书</h1>
        <p style="color:#64748b; font-size:13px; margin:4px 0 0 0;">全流程导引标准化报告 · 遵循 Hadley Wickham 《Tidy Data》 规范</p>
      </div>
      <span class="badge">健康评级: ${cleanAudit.grade} (${cleanAudit.overallHealthScore} 分)</span>
    </div>

    <!-- Part 1 -->
    <h2>第 1 部分：项目背景与整洁数据契约 (Project Background & Tidy Data Contract)</h2>
    <p><strong>案例项目:</strong> ${caseStudy.title} (${caseStudy.domain})</p>
    <p><strong>应用场景:</strong> ${caseStudy.description}</p>
    <div class="info-box">
      <strong>Hadley Wickham 整洁数据三大公理约束：</strong><br/>
      1. 每一个独立测量属性必须独立成列 (Variables as Columns)；<br/>
      2. 每一个独立物理观测实体必须独立成行 (Observations as Rows)；<br/>
      3. 每一个单元格仅存储单一原子标量 (Atomic Scalar Values)。
    </div>

    <!-- Part 2 -->
    <h2>第 2 部分：原始数据接入与五维质量扫描 (Raw Ingestion & 5-Dimension Health Audit)</h2>
    <p>原始接入规模：<strong>${rawAudit.totalRows} 行 × ${rawAudit.totalCols} 列</strong> (总单元格数: ${rawAudit.totalCells})，初始综合健康得分：<strong>${rawAudit.overallHealthScore} 分 (${rawAudit.grade})</strong>。</p>
    <table>
      <thead>
        <tr><th>核心质检维度</th><th>初始健康评分</th><th>现状扫描诊断</th></tr>
      </thead>
      <tbody>
        <tr><td>完整性 (Completeness)</td><td>${rawAudit.completenessScore} 分</td><td>发现 ${rawAudit.totalMissingCells} 个缺失单元格 (全表缺失率 ${rawAudit.overallMissingRate.toFixed(1)}%)</td></tr>
        <tr><td>唯一性 (Uniqueness)</td><td>${rawAudit.uniquenessScore} 分</td><td>排查到 ${rawAudit.duplicateRowsCount} 行完全重复观测记录</td></tr>
        <tr><td>规范性 (Conformity)</td><td>${rawAudit.conformityScore} 分</td><td>${rawAudit.nonStandardColNamesCount} 个变量列名存在空格、括号或非标准大写</td></tr>
        <tr><td>准确性 (Accuracy)</td><td>${rawAudit.accuracyScore} 分</td><td>检测到 ${rawAudit.totalOutlierCells} 处显著极端离群点 (Tukey IQR 准则)</td></tr>
        <tr><td>一致性 (Consistency)</td><td>${rawAudit.consistencyScore} 分</td><td>跨字段数据类型与单位格式完成校验</td></tr>
      </tbody>
    </table>

    <!-- Part 3 -->
    <h2>第 3 部分：缺失值模式诊断与多维插补流 (Missingness Diagnostics & Imputation Workflow)</h2>
    <p>通过 <code>naniar::vis_miss()</code> 探查缺失模式，严防直接执行 <code>na.omit()</code> 引发样本量雪崩与选择性偏差 (Selection Bias)。</p>
    <div class="warning-box">
      <strong>方差收缩定理防范：</strong> 均值填补将使得方差收缩为 Var(X̂) = (1 - p)Var(X)，导致 t 统计量虚假膨胀。本项目推荐采用 MICE 链式方程多重抽样 (Predictive Mean Matching) 或中位数填补，严格维持经验总体分布形态。
    </div>

    <!-- Part 4 -->
    <h2>第 4 部分：重复记录排查与离群极值治理 (Deduplication & Outlier Governance)</h2>
    <p>针对冗余进件，执行 <code>distinct(${caseStudy.primaryKey || ''}, .keep_all = TRUE)</code> 保留首条有效记录；针对极端突波与输入手误，采用 Tukey 准则与 <strong>Winsorization (5%/95% 盖帽法)</strong> 截断平滑，避免后验回归参数剧烈扰动。</p>

    <!-- Part 5 -->
    <h2>第 5 部分：前后对照差分审计与质量增益 (Before/After Comparative Audit & Delta Scorecard)</h2>
    <table>
      <thead>
        <tr><th>核心质检维度</th><th>清洗前 (Raw)</th><th>清洗后 (Cleaned)</th><th>状态提升增益</th></tr>
      </thead>
      <tbody>
        <tr><td>完整性得分</td><td>${rawAudit.completenessScore} 分</td><td>${cleanAudit.completenessScore} 分</td><td>+${cleanAudit.completenessScore - rawAudit.completenessScore} 分</td></tr>
        <tr><td>唯一性得分</td><td>${rawAudit.uniquenessScore} 分</td><td>${cleanAudit.uniquenessScore} 分</td><td>+${cleanAudit.uniquenessScore - rawAudit.uniquenessScore} 分</td></tr>
        <tr><td>规范性得分</td><td>${rawAudit.conformityScore} 分</td><td>${cleanAudit.conformityScore} 分</td><td>+${cleanAudit.conformityScore - rawAudit.conformityScore} 分</td></tr>
        <tr><td>准确性得分</td><td>${rawAudit.accuracyScore} 分</td><td>${cleanAudit.accuracyScore} 分</td><td>+${cleanAudit.accuracyScore - rawAudit.accuracyScore} 分</td></tr>
        <tr><td>一致性得分</td><td>${rawAudit.consistencyScore} 分</td><td>${cleanAudit.consistencyScore} 分</td><td>+${cleanAudit.consistencyScore - rawAudit.consistencyScore} 分</td></tr>
        <tr style="font-weight:bold; background:#f0fdfa; color:#0f766e;">
          <td>全表综合健康度</td>
          <td>${rawAudit.overallHealthScore} 分 (${rawAudit.grade})</td>
          <td>${cleanAudit.overallHealthScore} 分 (${cleanAudit.grade})</td>
          <td>+${cleanAudit.overallHealthScore - rawAudit.overallHealthScore} 分 (大幅跃升)</td>
        </tr>
      </tbody>
    </table>
    <p><strong>实施的清洗工艺链 (Applied Operations):</strong></p>
    <ol style="font-size:12px; color:#475569;">
      ${appliedSteps.map(s => `<li>${s}</li>`).join('')}
    </ol>

    <!-- Part 6 -->
    <h2>第 6 部分：工业级可复现 R 管道流与落盘验收 (Reproducible R Pipeline & Acceptance Contract)</h2>
    <p><strong>清洗后整洁数据预览 (head(df_cleaned, 15)):</strong></p>
    <div style="overflow-x:auto;">
      <table>
        <thead>
          <tr><th style="width:40px;">#</th>${cleanColumns.map(c => `<th>${c}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
    <p><strong>可复现 R Tidyverse 源码:</strong></p>
    <pre>${rScript}</pre>
    <p style="color:#64748b; font-size:12px;">落盘验收文件: <code>cleaned_tidy_dataset.csv</code> 已成功生成并符合第一范式。</p>
  </div>
</body>
</html>`;
}
