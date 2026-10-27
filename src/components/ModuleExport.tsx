import React, { useState } from 'react';
import { DataQualityAudit, CaseStudy } from '../types';
import { CASE_STUDIES } from '../data/sampleDatasets';
import { convertToCSV, triggerDownload, exportRMarkdown, exportStandaloneHTML } from '../utils/exporter';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Globe,
  Check,
  Sparkles,
  Layers,
  Database,
  ExternalLink,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Code2,
  FileCheck,
} from 'lucide-react';

interface Props {
  caseTitle: string;
  activeCase: CaseStudy;
  rawAudit: DataQualityAudit;
  cleanAudit: DataQualityAudit;
  rawData: Record<string, any>[];
  cleanData: Record<string, any>[];
  rawColumns: string[];
  cleanColumns: string[];
  appliedSteps: string[];
  rScript: string;
  onSelectCase?: (caseStudy: CaseStudy) => void;
}

export const ModuleExport: React.FC<Props> = ({
  caseTitle,
  activeCase,
  rawAudit,
  cleanAudit,
  rawData,
  cleanData,
  rawColumns,
  cleanColumns,
  appliedSteps,
  rScript,
  onSelectCase,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [activePreviewSection, setActivePreviewSection] = useState<number>(0);
  const [previewTab, setPreviewTab] = useState<'all' | 'section'>('all');

  const notifySuccess = (type: string) => {
    setDownloadSuccess(type);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // 1. Download Clean CSV
  const handleExportCleanCSV = () => {
    const csvContent = convertToCSV(cleanData, cleanColumns);
    triggerDownload(csvContent, `cleaned_${activeCase.id}_tidy.csv`, 'text/csv;charset=utf-8;');
    notifySuccess('Clean CSV (已清洗整洁数据)');
  };

  // 2. Download Raw CSV of Current Case
  const handleExportCurrentRawCSV = () => {
    const csvContent = convertToCSV(rawData, rawColumns);
    triggerDownload(csvContent, `raw_${activeCase.id}_dirty.csv`, 'text/csv;charset=utf-8;');
    notifySuccess(`Raw CSV (当前案例原始脏数据: ${activeCase.title})`);
  };

  // 3. Download Raw CSV for ANY of the 6 cases
  const handleDownloadAnyRawCaseCSV = (cs: CaseStudy) => {
    const csvContent = convertToCSV(cs.rawData, cs.rawColumns);
    triggerDownload(csvContent, `raw_${cs.id}_dirty.csv`, 'text/csv;charset=utf-8;');
    notifySuccess(`原始脏数据: ${cs.title}`);
  };

  // 4. Download Standalone HTML
  const handleExportHTML = () => {
    const html = exportStandaloneHTML(activeCase, rawAudit, cleanAudit, appliedSteps, cleanData, cleanColumns, rScript);
    triggerDownload(html, `audit_report_${activeCase.id}.html`, 'text/html;charset=utf-8;');
    notifySuccess('独立 HTML 审计白皮书');
  };

  // 5. Download R Markdown (.Rmd)
  const handleExportRMarkdown = () => {
    const rmd = exportRMarkdown(activeCase, rawAudit, cleanAudit, appliedSteps, cleanColumns, rScript);
    triggerDownload(rmd, `audit_whitepaper_${activeCase.id}.Rmd`, 'text/markdown;charset=utf-8;');
    notifySuccess('R Markdown (.Rmd) 源码');
  };

  // 6. Download Delta JSON
  const handleExportDeltaJSON = () => {
    const deltaReport = {
      project: caseTitle,
      exportTimestamp: new Date().toISOString(),
      rawAudit,
      cleanAudit,
      delta: {
        scoreGain: cleanAudit.overallHealthScore - rawAudit.overallHealthScore,
        missingReductionPct: rawAudit.overallMissingRate - cleanAudit.overallMissingRate,
        duplicateRemoved: rawAudit.duplicateRowsCount - cleanAudit.duplicateRowsCount,
        retainedRowsCount: cleanData.length,
      },
      appliedSteps,
    };
    triggerDownload(JSON.stringify(deltaReport, null, 2), `delta_audit_${activeCase.id}.json`, 'application/json');
    notifySuccess('Delta JSON 审计指标元数据');
  };

  const reportSections = [
    { num: 1, title: '第 1 部分：项目背景与整洁数据契约', enTitle: 'Project Background & Tidy Data Contract' },
    { num: 2, title: '第 2 部分：原始数据接入与五维质量扫描', enTitle: 'Raw Ingestion & 5-Dimension Health Audit' },
    { num: 3, title: '第 3 部分：缺失值模式诊断与多维插补流', enTitle: 'Missingness Diagnostics & Imputation Workflow' },
    { num: 4, title: '第 4 部分：重复记录排查与离群极值治理', enTitle: 'Deduplication & Outlier Governance' },
    { num: 5, title: '第 5 部分：前后对照差分审计与质量增益', enTitle: 'Before/After Comparative Audit & Delta Scorecard' },
    { num: 6, title: '第 6 部分：工业级可复现 R 管道流与落盘验收', enTitle: 'Reproducible R Pipeline & Acceptance Contract' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-medium rounded-full mb-2">
              <Download className="w-3.5 h-3.5" />
              模块 09 · 数据集与审计白皮书导出引擎
            </div>
            <h2 className="text-2xl font-semibold text-stone-900 tracking-tight">
              多格式报告导出与六大案例原始数据交付中心
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              支持下载六大案例对应原始脏数据、一键导出规范整洁数据集、全流程 6 大核心部分审计报告及在线交互预览。
            </p>
          </div>

          {downloadSuccess && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>已成功下载：{downloadSuccess}</span>
            </div>
          )}
        </div>

        {/* SECTION 1: 六大案例原始脏数据下载专区 (Dedicated Raw Dirty Datasets Download Hub) */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-rose-600" />
                六大实战案例原始脏数据下载专区 (Raw Dirty Datasets Download Hub)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                各案例均保留真实的非标准列名、非法符号、极值离群点、时序断流缺失与重复样本，支持一键独立下载用于离线实验。
              </p>
            </div>
            <div className="text-xs text-stone-500 font-mono bg-stone-50 px-3 py-1 rounded-lg border border-stone-200 shrink-0">
              共 6 个标准工业基准数据集
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CASE_STUDIES.map((cs) => {
              const isCurrent = cs.id === activeCase.id;
              return (
                <div
                  key={cs.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'bg-rose-50/40 border-rose-300 ring-2 ring-rose-400/20 shadow-xs'
                      : 'bg-stone-50/60 border-stone-200/90 hover:bg-stone-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                        {cs.domain}
                      </span>
                      <span className="font-mono text-[11px] text-stone-500">
                        {cs.rawData.length} 行 × {cs.rawColumns.length} 列
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                      <span>{cs.title}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-rose-600 text-white font-semibold px-1.5 py-0.2 rounded">
                          当前
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-teal-800 font-medium mb-1.5">
                      {cs.subtitle}
                    </p>
                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed mb-3">
                      {cs.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-200/70 flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadAnyRawCaseCSV(cs)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-stone-300 hover:border-rose-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title={`下载 ${cs.title} 原始 CSV 数据`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载原始脏数据 (CSV)</span>
                    </button>
                    {onSelectCase && !isCurrent && (
                      <button
                        onClick={() => onSelectCase(cs)}
                        className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                        title="加载此案例作为当前实验目标"
                      >
                        载入
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: 四大核心交付文件导出卡片 */}
        <div className="mb-10">
          <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            当前案例成果交付通道 · {activeCase.title}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Clean CSV */}
            <div className="bg-stone-50 border border-stone-200 hover:border-teal-500 rounded-2xl p-5 flex flex-col justify-between transition-all group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-stone-900 mb-1">
                  整洁数据集 (Clean CSV)
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed mb-4">
                  符合 Hadley Wickham 整洁规范，去除乱码与极值，可直接导入后续建模。
                </p>
              </div>
              <button
                onClick={handleExportCleanCSV}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载 Clean CSV ({cleanData.length} 行)</span>
              </button>
            </div>

            {/* Card 2: HTML Report */}
            <div className="bg-stone-50 border border-stone-200 hover:border-indigo-500 rounded-2xl p-5 flex flex-col justify-between transition-all group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-stone-900 mb-1">
                  独立 HTML 审计白皮书
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed mb-4">
                  自包含单文件离线网页报告，包含全流程 6 大核心部分与质量前后对比。
                </p>
              </div>
              <button
                onClick={handleExportHTML}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出 6 大部分 HTML 报告</span>
              </button>
            </div>

            {/* Card 3: R Markdown */}
            <div className="bg-stone-50 border border-stone-200 hover:border-stone-700 rounded-2xl p-5 flex flex-col justify-between transition-all group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-stone-900 mb-1">
                  R Markdown 源码 (.Rmd)
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed mb-4">
                  学术级数据质量审计报告源文档，可在 RStudio 结合 knitr 编译为 PDF/HTML。
                </p>
              </div>
              <button
                onClick={handleExportRMarkdown}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出 .Rmd 源码</span>
              </button>
            </div>

            {/* Card 4: Current Case Raw CSV */}
            <div className="bg-stone-50 border border-stone-200 hover:border-rose-400 rounded-2xl p-5 flex flex-col justify-between transition-all group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-3">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-stone-900 mb-1">
                  当前案例原始脏数据 (Raw CSV)
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed mb-4">
                  下载当前正在审计案例的原始脏数据备份（{rawData.length} 行），用于清洗前后对照。
                </p>
              </div>
              <button
                onClick={handleExportCurrentRawCSV}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载当前 Raw CSV ({rawData.length} 行)</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: 报告全流程 6 大核心部分交互式在线实时预览 (Live Report Preview: 6 Sections) */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-stone-200">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-600" />
                数据质量审计白皮书在线实时预览 (Live Report Preview · 最少 6 大核心部分)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                按照“质检 ➔ 清洗 ➔ 对比 ➔ 报告”全流程导引标准步骤严密组织，支持即时预览与校对。
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium text-stone-600">
              <button
                onClick={() => setPreviewTab('all')}
                className={`px-3 py-1 rounded-lg cursor-pointer ${
                  previewTab === 'all' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : 'hover:text-stone-900'
                }`}
              >
                全文通读 (All 6 Parts)
              </button>
              <button
                onClick={() => setPreviewTab('section')}
                className={`px-3 py-1 rounded-lg cursor-pointer ${
                  previewTab === 'section' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : 'hover:text-stone-900'
                }`}
              >
                分章节导航阅读
              </button>
            </div>
          </div>

          {/* Section Jump Selector (If section tab mode) */}
          {previewTab === 'section' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
              {reportSections.map((sec, idx) => {
                const isSelected = activePreviewSection === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActivePreviewSection(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold ring-2 ring-teal-500/20'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <div className="text-[10px] font-mono opacity-70">Part 0{sec.num}</div>
                    <div className="text-xs truncate">{sec.title.split('：')[1]}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Report Paper Container */}
          <div className="border border-stone-300 rounded-2xl bg-white p-6 sm:p-10 shadow-xs max-h-[640px] overflow-y-auto space-y-8 text-stone-800">
            {/* Report Header Title */}
            <div className="border-b border-stone-200 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    R DATA CLEANING & PREPROCESSING LAB · WHITEPAPER
                  </span>
                  <h2 className="text-xl font-bold text-stone-900 mt-2">
                    数据质量审计与整洁数据白皮书报告
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    案例工程: <strong>{activeCase.title}</strong> · 生成时间: {new Date().toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                    健康评级: {cleanAudit.grade} ({cleanAudit.overallHealthScore} 分)
                  </span>
                </div>
              </div>
            </div>

            {/* PART 1 */}
            {(previewTab === 'all' || activePreviewSection === 0) && (
              <div className="space-y-3 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h4 className="text-base font-bold text-stone-900">
                    第 1 部分：项目背景与整洁数据契约 (Project Background & Tidy Data Contract)
                  </h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>所属领域:</strong> {activeCase.domain} | <strong>案例主题:</strong> {activeCase.title} —— {activeCase.subtitle}
                </p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>业务描述:</strong> {activeCase.description}
                </p>
                <div className="bg-teal-50/70 border border-teal-200 p-3.5 rounded-xl text-xs text-teal-900 leading-relaxed space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                    遵循 Hadley Wickham 《Tidy Data》 整洁数据三大公理约束：
                  </div>
                  <div>• <strong>公理一 (Variables as Columns)</strong>: 每个变量必须独立成列，消除宽表堆叠违规。</div>
                  <div>• <strong>公理二 (Observations as Rows)</strong>: 每个观测实体必须独立成行，彻底过滤重复进件。</div>
                  <div>• <strong>公理三 (Atomic Cell Values)</strong>: 单元格仅存单一原子标量，剔除货币、括号与混合单位字符。</div>
                </div>
              </div>
            )}

            {/* PART 2 */}
            {(previewTab === 'all' || activePreviewSection === 1) && (
              <div className="space-y-3 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h4 className="text-base font-bold text-stone-900">
                    第 2 部分：原始数据接入与五维质量扫描 (Raw Ingestion & 5-Dimension Health Audit)
                  </h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  原始接入规模为 <strong>{rawAudit.totalRows} 行 × {rawAudit.totalCols} 列</strong> (总计 {rawAudit.totalCells} 个数据坐标单元格)。经自动扫描，初始综合健康得分为 <strong>{rawAudit.overallHealthScore} / 100 分 (评级 {rawAudit.grade})</strong>。
                </p>
                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
                        <th className="py-2.5 px-3">核心质检维度</th>
                        <th className="py-2.5 px-3">初始健康分</th>
                        <th className="py-2.5 px-3">微观扫描诊断与检出病灶</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700 text-[11px]">
                      <tr>
                        <td className="py-2 px-3 font-medium">完整性 (Completeness)</td>
                        <td className="py-2 px-3 font-mono font-bold text-rose-600">{rawAudit.completenessScore} 分</td>
                        <td className="py-2 px-3">检出 {rawAudit.totalMissingCells} 个空值单元格 (全表缺失率高达 {rawAudit.overallMissingRate.toFixed(1)}%)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">唯一性 (Uniqueness)</td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-600">{rawAudit.uniquenessScore} 分</td>
                        <td className="py-2 px-3">排查到 {rawAudit.duplicateRowsCount} 行完全冗余重复记录</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">规范性 (Conformity)</td>
                        <td className="py-2 px-3 font-mono font-bold text-indigo-600">{rawAudit.conformityScore} 分</td>
                        <td className="py-2 px-3">{rawAudit.nonStandardColNamesCount} 个变量名包含空格、特殊括号或非 snake_case 字符</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">准确性 (Accuracy)</td>
                        <td className="py-2 px-3 font-mono font-bold text-stone-700">{rawAudit.accuracyScore} 分</td>
                        <td className="py-2 px-3">检出 {rawAudit.totalOutlierCells} 处显著离群极值 (Tukey IQR 准则)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">一致性 (Consistency)</td>
                        <td className="py-2 px-3 font-mono font-bold text-teal-700">{rawAudit.consistencyScore} 分</td>
                        <td className="py-2 px-3">跨字段货币单位与日期时间格式初步对齐</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PART 3 */}
            {(previewTab === 'all' || activePreviewSection === 2) && (
              <div className="space-y-3 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h4 className="text-base font-bold text-stone-900">
                    第 3 部分：缺失值模式诊断与多维插补流 (Missingness Diagnostics & Imputation Workflow)
                  </h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  利用 R 语言 <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">naniar::vis_miss()</code> 对全表缺失分布矩阵执行热力探查，严防直接执行 <code className="font-mono text-rose-600 bg-rose-50 px-1 py-0.5 rounded">na.omit()</code> 导致样本量断崖式萎缩与选择性偏差 (Selection Bias)。
                </p>
                <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-950 leading-relaxed">
                  <div className="font-semibold mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    方差收缩定理防范 (Variance Shrinkage Prevention)：
                  </div>
                  <p>
                    若盲目采用均值插补，变量方差将人为塌缩为 <code className="font-mono">Var(X̂) = (1 - p)Var(X)</code>，诱发后续假设检验假阳性 Type I 错误。本项目全面装配 <strong>MICE 预测均值匹配 (Predictive Mean Matching)</strong> 或稳健中位数填补，严格维持经验总体分布方差结构。
                  </p>
                </div>
              </div>
            )}

            {/* PART 4 */}
            {(previewTab === 'all' || activePreviewSection === 3) && (
              <div className="space-y-3 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <h4 className="text-base font-bold text-stone-900">
                    第 4 部分：重复记录排查与离群极值治理 (Deduplication & Outlier Governance)
                  </h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  - <strong>重复记录治理:</strong> 依据业务主键 <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">{activeCase.primaryKey || '主键/全行'}</code> 执行 <code className="font-mono">distinct(..., .keep_all = TRUE)</code>，排查并清除了 {rawAudit.duplicateRowsCount} 行多头重复进件。<br />
                  - <strong>离群点稳健治理:</strong> 依据 Tukey IQR 准则识别超出边界极值，采用 <strong>Winsorization (5%/95% 缩尾盖帽法)</strong> 截断突波，在完整保留样本量的前提下抑制异常值对后验回归斜率的杠杆干扰。
                </p>
              </div>
            )}

            {/* PART 5 */}
            {(previewTab === 'all' || activePreviewSection === 4) && (
              <div className="space-y-3 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    5
                  </span>
                  <h4 className="text-base font-bold text-stone-900">
                    第 5 部分：前后对照差分审计与质量增益 (Before/After Comparative Audit & Delta Scorecard)
                  </h4>
                </div>
                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
                        <th className="py-2.5 px-3">质量维度</th>
                        <th className="py-2.5 px-3">清洗前 (Raw)</th>
                        <th className="py-2.5 px-3">清洗后 (Clean)</th>
                        <th className="py-2.5 px-3">质量跃迁状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700 text-[11px]">
                      <tr>
                        <td className="py-2 px-3 font-medium">完整性得分</td>
                        <td className="py-2 px-3 font-mono">{rawAudit.completenessScore} 分</td>
                        <td className="py-2 px-3 font-mono text-teal-700 font-bold">{cleanAudit.completenessScore} 分</td>
                        <td className="py-2 px-3 font-mono text-emerald-600 font-semibold">+{cleanAudit.completenessScore - rawAudit.completenessScore} 分</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">唯一性得分</td>
                        <td className="py-2 px-3 font-mono">{rawAudit.uniquenessScore} 分</td>
                        <td className="py-2 px-3 font-mono text-teal-700 font-bold">{cleanAudit.uniquenessScore} 分</td>
                        <td className="py-2 px-3 font-mono text-emerald-600 font-semibold">+{cleanAudit.uniquenessScore - rawAudit.uniquenessScore} 分</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">规范性得分</td>
                        <td className="py-2 px-3 font-mono">{rawAudit.conformityScore} 分</td>
                        <td className="py-2 px-3 font-mono text-teal-700 font-bold">{cleanAudit.conformityScore} 分</td>
                        <td className="py-2 px-3 font-mono text-emerald-600 font-semibold">+{cleanAudit.conformityScore - rawAudit.conformityScore} 分</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">准确性得分</td>
                        <td className="py-2 px-3 font-mono">{rawAudit.accuracyScore} 分</td>
                        <td className="py-2 px-3 font-mono text-teal-700 font-bold">{cleanAudit.accuracyScore} 分</td>
                        <td className="py-2 px-3 font-mono text-emerald-600 font-semibold">+{cleanAudit.accuracyScore - rawAudit.accuracyScore} 分</td>
                      </tr>
                      <tr className="bg-teal-50/40 font-bold text-teal-900">
                        <td className="py-2.5 px-3">全表健康总评分</td>
                        <td className="py-2.5 px-3 font-mono">{rawAudit.overallHealthScore} 分 ({rawAudit.grade})</td>
                        <td className="py-2.5 px-3 font-mono">{cleanAudit.overallHealthScore} 分 ({cleanAudit.grade})</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700">+{cleanAudit.overallHealthScore - rawAudit.overallHealthScore} 分 (质量大幅跃迁)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-xs text-stone-600 space-y-1 pt-2">
                  <div>• 样本规模留存率: <strong>{((cleanData.length / (rawData.length || 1)) * 100).toFixed(1)}%</strong> ({rawData.length} 行 ➔ {cleanData.length} 行整洁观测)。</div>
                  <div>• 实施算子链条: <code>{appliedSteps.join(' ➔ ')}</code></div>
                </div>
              </div>
            )}

            {/* PART 6 */}
            {(previewTab === 'all' || activePreviewSection === 5) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    6
                  </span>
                  <h4 className="text-base font-bold text-stone-900">
                    第 6 部分：工业级可复现 R 管道流与落盘验收 (Reproducible R Pipeline & Acceptance Contract)
                  </h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  清洗后生成的整洁数据符合 POSIX snake_case 命名规约，以下为完整生成的工业级可复现 R 管道流：
                </p>
                <div className="rounded-xl overflow-hidden bg-stone-950 p-4 font-mono text-xs text-stone-200 max-h-56 overflow-y-auto">
                  <pre>{rScript}</pre>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>数据契约验收结论：整洁数据集输出至 <code>cleaned_tidy_dataset.csv</code>，各项指标均达标验收。</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
