import React, { useState } from 'react';
import { DataQualityAudit, CleaningPipelineConfig } from '../types';
import { GitCommit, ArrowRight, CheckCircle2, ShieldCheck, Database, RefreshCw, Sparkles, Filter, FileSpreadsheet } from 'lucide-react';

interface Props {
  rawAudit: DataQualityAudit;
  cleanAudit: DataQualityAudit;
  rawData: Record<string, any>[];
  cleanData: Record<string, any>[];
  rawColumns: string[];
  cleanColumns: string[];
  appliedSteps: string[];
  config: CleaningPipelineConfig;
  onGoToExport: () => void;
}

export const ModuleWorkflow: React.FC<Props> = ({
  rawAudit,
  cleanAudit,
  rawData,
  cleanData,
  rawColumns,
  cleanColumns,
  appliedSteps,
  config,
  onGoToExport,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(3); // Default at Step 4 (Comparison)
  const [previewMode, setPreviewMode] = useState<'both' | 'clean' | 'raw'>('both');

  const steps = [
    { num: 1, title: '原始数据接入', subtitle: '异构数据输入与结构推断' },
    { num: 2, title: '五维质量扫描', subtitle: '健康度记分卡与病灶识别' },
    { num: 3, title: '交互清洗流', subtitle: '算子装配、填补与离群治理' },
    { num: 4, title: '前后对比审计', subtitle: '差分校验与整洁数据验收' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-medium rounded-full mb-2">
              <GitCommit className="w-3.5 h-3.5" />
              模块 08 · 质检 ➔ 清洗 ➔ 对比 ➔ 报告全流程向导
            </div>
            <h2 className="text-2xl font-semibold text-stone-900 tracking-tight">
              数据预处理流水线导引与增量审计 (Workflow & Delta Audit)
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              端到端追踪清洗全生命周期，量化前后质量跃升并核对整洁数据契约。
            </p>
          </div>

          <button
            onClick={onGoToExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer self-start md:self-auto"
          >
            <span>下一步：一键导出清洗报告与白皮书</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {steps.map((st, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <button
                key={st.num}
                onClick={() => setCurrentStep(idx)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/20'
                    : isCompleted
                    ? 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                    : 'bg-white border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isCurrent ? 'bg-teal-600 text-white' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                    {isCompleted ? '✓' : st.num}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">Step 0{st.num}</span>
                </div>
                <div className="text-xs font-semibold text-stone-800">{st.title}</div>
                <div className="text-[10px] text-stone-500 truncate">{st.subtitle}</div>
              </button>
            );
          })}
        </div>

        {/* Delta Metrics Summary Bar */}
        <div className="bg-stone-900 text-white rounded-2xl p-6 border border-stone-800 mb-8">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-800">
            <span className="text-xs font-semibold text-teal-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              清洗前后增量质检差分表 (Delta Quality Scorecard)
            </span>
            <span className="text-xs font-mono text-stone-400">
              综合提升: +{cleanAudit.overallHealthScore - rawAudit.overallHealthScore} 分
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
            <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
              <div className="text-[10px] text-stone-400">健康度总评分</div>
              <div className="text-xl font-mono font-bold text-teal-400 mt-1">
                {rawAudit.overallHealthScore} <span className="text-stone-500 text-xs">➔</span> {cleanAudit.overallHealthScore}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                评级: {rawAudit.grade} ➔ {cleanAudit.grade}
              </div>
            </div>

            <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
              <div className="text-[10px] text-stone-400">全表缺失率</div>
              <div className="text-xl font-mono font-bold text-rose-400 mt-1">
                {rawAudit.overallMissingRate.toFixed(1)}% <span className="text-stone-500 text-xs">➔</span> {cleanAudit.overallMissingRate.toFixed(1)}%
              </div>
              <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                消除 {rawAudit.totalMissingCells - cleanAudit.totalMissingCells} 个空值
              </div>
            </div>

            <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
              <div className="text-[10px] text-stone-400">重复观测记录</div>
              <div className="text-xl font-mono font-bold text-amber-400 mt-1">
                {rawAudit.duplicateRowsCount} <span className="text-stone-500 text-xs">➔</span> {cleanAudit.duplicateRowsCount}
              </div>
              <div className="text-[10px] text-stone-400 font-medium mt-0.5">
                过滤 {rawAudit.duplicateRowsCount - cleanAudit.duplicateRowsCount} 行冗余
              </div>
            </div>

            <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
              <div className="text-[10px] text-stone-400">非标列名数</div>
              <div className="text-xl font-mono font-bold text-indigo-400 mt-1">
                {rawAudit.nonStandardColNamesCount} <span className="text-stone-500 text-xs">➔</span> {cleanAudit.nonStandardColNamesCount}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                统一 snake_case
              </div>
            </div>

            <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
              <div className="text-[10px] text-stone-400">异常极端值</div>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                {rawAudit.totalOutlierCells} <span className="text-stone-500 text-xs">➔</span> {cleanAudit.totalOutlierCells}
              </div>
              <div className="text-[10px] text-teal-400 font-medium mt-0.5">
                鲁棒截断/平滑
              </div>
            </div>

            <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
              <div className="text-[10px] text-stone-400">样本量规模</div>
              <div className="text-xl font-mono font-bold text-stone-200 mt-1">
                {rawAudit.totalRows} <span className="text-stone-500 text-xs">➔</span> {cleanAudit.totalRows}
              </div>
              <div className="text-[10px] text-stone-400 font-medium mt-0.5">
                留存率: {((cleanAudit.totalRows / (rawAudit.totalRows || 1)) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Applied Steps Traceability */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            本次执行的完整清洗算子链 (Audit Trail & Cleaning Operations)
          </div>
          <div className="space-y-2">
            {appliedSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-stone-800 bg-white border border-stone-200/70 p-2.5 rounded-lg font-mono">
                <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Before vs After Tables Dual Comparison */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-semibold text-stone-900">
                数据形态前后对照透视 (Dual Comparison Table)
              </h3>
            </div>

            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium text-stone-600">
              <button
                onClick={() => setPreviewMode('both')}
                className={`px-3 py-1 rounded-lg cursor-pointer ${previewMode === 'both' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : ''}`}
              >
                分屏并列对比
              </button>
              <button
                onClick={() => setPreviewMode('clean')}
                className={`px-3 py-1 rounded-lg cursor-pointer ${previewMode === 'clean' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : ''}`}
              >
                仅看清洗后 (Clean)
              </button>
              <button
                onClick={() => setPreviewMode('raw')}
                className={`px-3 py-1 rounded-lg cursor-pointer ${previewMode === 'raw' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : ''}`}
              >
                仅看原始脏数据 (Raw)
              </button>
            </div>
          </div>

          <div className={`grid gap-4 ${previewMode === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Raw Table */}
            {(previewMode === 'both' || previewMode === 'raw') && (
              <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                <div className="bg-rose-50/70 px-4 py-2.5 border-b border-rose-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"/>
                    原始脏数据 (Raw Dirty Data: {rawAudit.totalRows} 行)
                  </span>
                  <span className="font-mono text-rose-700">NA: {rawAudit.totalMissingCells} 个</span>
                </div>
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left border-collapse text-[11px] font-mono">
                    <thead>
                      <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                        {rawColumns.map((c, i) => (
                          <th key={i} className="py-2 px-3 truncate max-w-[140px] font-semibold">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-600">
                      {rawData.slice(0, 10).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-stone-50">
                          {rawColumns.map((col, cIdx) => (
                            <td key={cIdx} className="py-1.5 px-3 truncate max-w-[140px]">
                              {row[col] ?? <span className="text-rose-500 font-bold bg-rose-50 px-1 rounded">NA</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cleaned Table */}
            {(previewMode === 'both' || previewMode === 'clean') && (
              <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                <div className="bg-teal-50/70 px-4 py-2.5 border-b border-teal-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-teal-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"/>
                    清洗后整洁数据 (Clean Tidy Data: {cleanAudit.totalRows} 行)
                  </span>
                  <span className="font-mono text-teal-700">缺失率: {cleanAudit.overallMissingRate.toFixed(1)}%</span>
                </div>
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left border-collapse text-[11px] font-mono">
                    <thead>
                      <tr className="bg-teal-50/50 text-teal-900 border-b border-teal-200">
                        {cleanColumns.map((c, i) => (
                          <th key={i} className="py-2 px-3 truncate max-w-[140px] font-semibold">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-800">
                      {cleanData.slice(0, 10).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-stone-50">
                          {cleanColumns.map((col, cIdx) => (
                            <td key={cIdx} className="py-1.5 px-3 truncate max-w-[140px]">
                              {row[col] ?? <span className="text-stone-400">NA</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
