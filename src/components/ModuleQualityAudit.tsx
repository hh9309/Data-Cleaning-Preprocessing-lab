import React from 'react';
import { DataQualityAudit } from '../types';
import { ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Activity, BarChart2, Hash, FileSpreadsheet, Sparkles } from 'lucide-react';

interface Props {
  audit: DataQualityAudit;
  datasetName: string;
}

export const ModuleQualityAudit: React.FC<Props> = ({ audit, datasetName }) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'B': return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'C': return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'D': return 'bg-orange-50 text-orange-800 border-orange-300';
      default: return 'bg-rose-50 text-rose-800 border-rose-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-teal-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 75) return 'bg-teal-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const dimensions = [
    { label: '完整性 (Completeness)', score: audit.completenessScore, desc: '单元格与关键指标缺失比例' },
    { label: '唯一性 (Uniqueness)', score: audit.uniquenessScore, desc: '完全重复行与主键记录排查' },
    { label: '规范性 (Conformity)', score: audit.conformityScore, desc: '列名 snake_case 与字符编码' },
    { label: '准确性 (Accuracy)', score: audit.accuracyScore, desc: '极值离群点与物理范围有效性' },
    { label: '一致性 (Consistency)', score: audit.consistencyScore, desc: '跨字段数据类型与单位统一' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Health Score Overview Card */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-medium rounded-full mb-2">
              <Activity className="w-3.5 h-3.5" />
              模块 02 · 数据健康度全面审计
            </div>
            <h2 className="text-2xl font-semibold text-stone-900 tracking-tight">
              数据质量扫描与健康度评分卡
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              当前审计目标：<strong className="text-stone-800 font-medium">{datasetName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className={`flex flex-col items-center justify-center w-28 h-28 rounded-2xl border-2 ${getGradeColor(audit.grade)} shadow-2xs`}>
              <span className="text-[11px] font-semibold tracking-wider uppercase opacity-75">综合评级</span>
              <span className="text-3xl font-extrabold font-mono my-0.5">{audit.grade}</span>
              <span className="text-xs font-bold">{audit.overallHealthScore} / 100</span>
            </div>
            <div className="space-y-1 text-xs text-stone-600">
              <div>• 原始行数：<strong className="font-mono text-stone-900">{audit.totalRows}</strong> 行</div>
              <div>• 原始列数：<strong className="font-mono text-stone-900">{audit.totalCols}</strong> 变量</div>
              <div>• 缺失率：<strong className="font-mono text-rose-600">{audit.overallMissingRate.toFixed(1)}%</strong></div>
              <div>• 重复行：<strong className="font-mono text-amber-600">{audit.duplicateRowsCount}</strong> 行</div>
            </div>
          </div>
        </div>

        {/* Five Health Dimensions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
          {dimensions.map((dim, idx) => (
            <div key={idx} className="bg-stone-50/80 border border-stone-200/70 rounded-xl p-4 transition-all hover:bg-stone-50">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-stone-700 truncate">{dim.label.split(' ')[0]}</span>
                <span className={`font-mono font-bold text-sm ${getScoreColor(dim.score)}`}>
                  {dim.score}
                </span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-1.5 mb-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getScoreBg(dim.score)}`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              <div className="text-[11px] text-stone-500 truncate" title={dim.desc}>
                {dim.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Quality Diagnostics Issues Checklist */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <XCircle className="w-4 h-4 text-rose-600" />
              高危严重缺陷 (Critical Issues)
            </h4>
            {audit.issuesSummary.critical.length > 0 ? (
              <ul className="space-y-2 text-xs text-stone-700">
                {audit.issuesSummary.critical.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-stone-500 italic">未检出严重破损级缺陷</div>
            )}
          </div>

          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              中度风险预警 (Warnings)
            </h4>
            {audit.issuesSummary.warning.length > 0 ? (
              <ul className="space-y-2 text-xs text-stone-700">
                {audit.issuesSummary.warning.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-stone-500 italic">暂无中度清洗警示</div>
            )}
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              合规质量项 (Conformant)
            </h4>
            <ul className="space-y-2 text-xs text-stone-700">
              {audit.issuesSummary.good.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Column-by-Column Deep Quality Ledger */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-stone-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-600" />
              列级微观质检全景表 (Column-Level Quality Diagnostics)
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              自动探测各特征变量的数据类型、缺失率、离群点数、分布分位数及采样取值
            </p>
          </div>
          <div className="text-xs text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
            共计扫描 <strong className="text-stone-800">{audit.columns.length}</strong> 个属性特征
          </div>
        </div>

        <div className="overflow-x-auto border border-stone-200/80 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/90 text-stone-600 border-b border-stone-200">
                <th className="py-3 px-4 font-semibold">变量名</th>
                <th className="py-3 px-3 font-semibold">推断类型</th>
                <th className="py-3 px-3 font-semibold">缺失数 / 缺失率</th>
                <th className="py-3 px-3 font-semibold">唯一值</th>
                <th className="py-3 px-3 font-semibold">IQR 离群点</th>
                <th className="py-3 px-3 font-semibold">命名规范</th>
                <th className="py-3 px-4 font-semibold">数值统揽 / 样例值</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {audit.columns.map((col, idx) => {
                const hasMissing = col.missingCount > 0;
                const hasOutlier = col.outlierCount > 0;

                return (
                  <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-stone-900">
                      {col.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-stone-100 text-stone-700">
                        {col.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono ${hasMissing ? 'text-rose-600 font-semibold' : 'text-stone-500'}`}>
                          {col.missingCount} ({col.missingRate.toFixed(1)}%)
                        </span>
                        {hasMissing && (
                          <div className="w-12 bg-stone-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, col.missingRate)}%` }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-600">
                      {col.uniqueCount}
                    </td>
                    <td className="py-3 px-3">
                      {col.type === 'numeric' ? (
                        <span className={`font-mono ${hasOutlier ? 'text-amber-600 font-semibold' : 'text-stone-400'}`}>
                          {col.outlierCount} 个
                        </span>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {col.isSnakeCase && !col.hasSpecialChars ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          snake_case ✓
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                          非标准 ⚠
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                      {col.type === 'numeric' && col.mean !== undefined ? (
                        <div className="truncate max-w-xs">
                          μ={col.mean.toFixed(1)}, med={col.median?.toFixed(1)}, [min:{col.min}, max:{col.max}]
                        </div>
                      ) : (
                        <div className="truncate max-w-xs text-stone-400">
                          {col.sampleValues.filter(Boolean).slice(0, 3).join(', ') || 'N/A'}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
