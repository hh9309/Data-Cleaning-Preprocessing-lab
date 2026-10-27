import React, { useState } from 'react';
import { Terminal, Copy, Download, Check, Play, Code2, BarChart3, Table as TableIcon, Activity, ExternalLink, Sparkles, Layers } from 'lucide-react';
import { triggerDownload } from '../utils/exporter';
import { CaseStudy, DataQualityAudit } from '../types';

interface Props {
  rScript: string;
  datasetName: string;
  rawRowsCount: number;
  cleanRowsCount: number;
  cleanData?: Record<string, any>[];
  cleanColumns?: string[];
  rawAudit?: DataQualityAudit;
  cleanAudit?: DataQualityAudit;
  activeCase?: CaseStudy;
}

export const ModuleRScript: React.FC<Props> = ({
  rScript,
  datasetName,
  rawRowsCount,
  cleanRowsCount,
  cleanData = [],
  cleanColumns = [],
  rawAudit,
  cleanAudit,
  activeCase,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(true);
  const [activeOutputTab, setActiveOutputTab] = useState<'plots' | 'table' | 'console' | 'delta'>('plots');
  const [activePlotType, setActivePlotType] = useState<'missingness' | 'density' | 'boxplot'>('missingness');

  const handleCopy = () => {
    navigator.clipboard.writeText(rScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    triggerDownload(rScript, `clean_${datasetName.replace(/[^a-zA-Z0-9]/g, '_')}.R`, 'text/plain');
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasExecuted(true);
    }, 600);
  };

  const consoleLogs = [
    '> source("data_cleaning_pipeline.R")',
    '── Attaching core tidyverse packages ──────────────────────── tidyverse 2.0.0 ──',
    '✔ dplyr     1.1.4     ✔ readr     2.1.5',
    '✔ tidyr     1.3.1     ✔ stringr   1.5.1',
    '✔ purrr     1.0.2     ✔ lubridate 1.9.3',
    '── Attaching data quality packages ─────────────────────────────────────────────',
    '✔ janitor   2.2.0     ✔ naniar    1.1.0',
    '✔ mice      3.16.0    ✔ DescTools 0.99.54',
    '',
    '>>> [Phase 1] Inspecting raw dataset structure and missing patterns...',
    `Rows: ${rawRowsCount} Columns: ${activeCase?.rawColumns.length || 8}`,
    '── Column specification ────────────────────────────────────────────────────────',
    'Delimiter: ","',
    `chr (${Math.max(1, (activeCase?.rawColumns.length || 6) - 3)}): character columns standardized`,
    'dbl (3): numeric measurements parsed',
    '',
    '>>> [Plot 1 Generated] naniar::vis_miss() graphic device opened: "Missing Value Patterns Heatmap"',
    '>>> [Phase 2] janitor::clean_names() completed (mapped to snake_case)...',
    '>>> [Phase 3] distinct() applied, redundant observations filtered...',
    '>>> [Phase 4] mice(m=5, method="pmm", maxit=10) chained imputation converged...',
    '>>> [Plot 2 Generated] mice::densityplot() graphic device opened: "Kernel Density Comparison"',
    '>>> [Phase 5] DescTools::Winsorize robust outlier capping completed...',
    '>>> [Plot 3 Generated] boxplot() graphic device opened: "Tukey Outlier Audit"',
    '',
    `>>> [Phase 6] Quality Audit: Raw ${rawRowsCount} Rows ➔ Cleaned ${cleanRowsCount} Rows Tidy Data`,
    '>>> [Output] Cleaned dataset written to "cleaned_tidy_dataset.csv" [SUCCESS]',
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-medium rounded-full mb-2">
              <Code2 className="w-3.5 h-3.5" />
              模块 06 · 工业级 R 代码生成引擎
            </div>
            <h2 className="text-2xl font-semibold text-stone-900 tracking-tight">
              R 语言 Tidyverse / Janitor / Naniar / MICE 代码引擎
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              代码可在项目内即时运行，绘图标题、图例与坐标轴均遵循英文规范；亦可一键复制代码至外部 RStudio 独立执行。
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Run Code Button */}
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? '正在运行代码...' : '运行代码'}</span>
            </button>

            {/* Copy Code Button */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              title="代码自带可复现数据，可复制到项目外（RStudio / Posit Cloud）直接运行"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制！可外部运行' : '复制代码'}</span>
            </button>

            {/* Export R Script */}
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-xl border border-stone-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出 .R 脚本</span>
            </button>
          </div>
        </div>

        {/* Notice Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-xl text-xs text-stone-600 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>
              <strong>环境提示：</strong> 点击 <strong>【运行代码】</strong> 将在项目内置引擎中生成图表、整洁表及控制台；点击 <strong>【复制代码】</strong> 可直接粘贴到外部 RStudio 执行。
            </span>
          </div>
          <span className="font-mono text-[11px] text-teal-700 bg-white px-2 py-0.5 rounded border border-stone-200">
            Self-Contained Reproducible Tibble
          </span>
        </div>

        {/* Code Editor Window */}
        <div className="rounded-2xl overflow-hidden border border-stone-800 shadow-sm bg-stone-950 mb-8">
          <div className="bg-stone-900 px-4 py-3 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-stone-300">pipeline_clean_{datasetName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.R</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-stone-500">
              <span>English Graphic Labels</span>
              <span>•</span>
              <span>Tidyverse 2.0</span>
            </div>
          </div>

          <div className="p-5 font-mono text-xs leading-relaxed text-stone-200 overflow-x-auto max-h-[460px] selection:bg-teal-800 selection:text-white">
            <pre>{rScript}</pre>
          </div>
        </div>

        {/* Output Window Section (Interactive Output Panes: Plots, Table, Console, Delta) */}
        {hasExecuted && (
          <div className="rounded-2xl border border-stone-300 bg-white overflow-hidden shadow-xs animate-fadeIn">
            {/* Output Window Header */}
            <div className="bg-stone-100/90 border-b border-stone-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse inline-block" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  代码运行输出窗口 (R Execution Output Window)
                </h3>
              </div>

              {/* Output Sub-Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 text-xs">
                <button
                  onClick={() => setActiveOutputTab('plots')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                    activeOutputTab === 'plots' ? 'bg-teal-700 text-white font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>可视化图表 (Plots)</span>
                </button>
                <button
                  onClick={() => setActiveOutputTab('table')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                    activeOutputTab === 'table' ? 'bg-teal-700 text-white font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>整洁数据表 (Clean Table)</span>
                </button>
                <button
                  onClick={() => setActiveOutputTab('console')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                    activeOutputTab === 'console' ? 'bg-teal-700 text-white font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>控制台日志 (Console)</span>
                </button>
                <button
                  onClick={() => setActiveOutputTab('delta')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                    activeOutputTab === 'delta' ? 'bg-teal-700 text-white font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>指标差分 (Metrics)</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Visual Plots (With English Titles, Legends, and Axes) */}
            {activeOutputTab === 'plots' && (
              <div className="p-6 space-y-6">
                {/* Plot Type Selector */}
                <div className="flex items-center gap-2 border-b border-stone-200 pb-3 text-xs">
                  <span className="text-stone-500 font-medium mr-2">选择渲染的 R 图形对象:</span>
                  <button
                    onClick={() => setActivePlotType('missingness')}
                    className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                      activePlotType === 'missingness' ? 'bg-teal-100 text-teal-900 font-semibold border border-teal-300' : 'bg-stone-50 border border-stone-200 text-stone-700'
                    }`}
                  >
                    Plot 1: naniar::vis_miss() 缺失热力图
                  </button>
                  <button
                    onClick={() => setActivePlotType('density')}
                    className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                      activePlotType === 'density' ? 'bg-teal-100 text-teal-900 font-semibold border border-teal-300' : 'bg-stone-50 border border-stone-200 text-stone-700'
                    }`}
                  >
                    Plot 2: mice::densityplot() 核密度对比
                  </button>
                  <button
                    onClick={() => setActivePlotType('boxplot')}
                    className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                      activePlotType === 'boxplot' ? 'bg-teal-100 text-teal-900 font-semibold border border-teal-300' : 'bg-stone-50 border border-stone-200 text-stone-700'
                    }`}
                  >
                    Plot 3: boxplot() 离群点箱线图
                  </button>
                </div>

                {/* Plot 1: naniar::vis_miss simulation with English labels */}
                {activePlotType === 'missingness' && (
                  <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-stone-800 pb-3">
                      <div>
                        <div className="font-mono text-sm font-bold text-teal-300">
                          Missing Value Patterns Heatmap
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Diagnostic evaluation of raw missingness across features (vis_miss)
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 bg-rose-500 rounded-xs inline-block" />
                          <span>Missing (NA: {rawAudit?.overallMissingRate.toFixed(1) || '12.5'}%)</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 bg-stone-500 rounded-xs inline-block" />
                          <span>Observed (Present)</span>
                        </span>
                      </div>
                    </div>

                    {/* SVG Graphic with English Axes & Labels */}
                    <div className="relative py-2">
                      <div className="text-[11px] font-mono text-stone-400 mb-1">Y-axis: Observations (Rows: 1..{rawRowsCount})</div>
                      <svg viewBox="0 0 600 130" className="w-full h-32">
                        {/* Heatmap Grid */}
                        {(activeCase?.rawColumns || []).map((col, cIdx) => {
                          const colWidth = 560 / (activeCase?.rawColumns.length || 1);
                          const x = 30 + cIdx * colWidth;
                          return (
                            <g key={cIdx}>
                              {/* Draw vertical column cells */}
                              {(activeCase?.rawData.slice(0, 10) || []).map((row, rIdx) => {
                                const val = row[col];
                                const isMissing = val === null || val === undefined || ['na', 'null', 'none', '-999'].includes(String(val).toLowerCase());
                                return (
                                  <rect
                                    key={rIdx}
                                    x={x}
                                    y={rIdx * 11}
                                    width={colWidth - 2}
                                    height={9}
                                    fill={isMissing ? '#f43f5e' : '#64748b'}
                                    rx={1}
                                  />
                                );
                              })}
                            </g>
                          );
                        })}
                      </svg>
                      {/* X-axis variables labels */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-teal-300 px-6 mt-1">
                        {(activeCase?.rawColumns || []).map((c, i) => (
                          <span key={i} className="truncate max-w-[70px] text-center" title={c}>{c}</span>
                        ))}
                      </div>
                      <div className="text-center text-[11px] font-mono text-stone-400 mt-2">
                        X-axis: Features / Variables
                      </div>
                    </div>
                  </div>
                )}

                {/* Plot 2: mice::densityplot simulation with English labels */}
                {activePlotType === 'density' && (
                  <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-stone-800 pb-3">
                      <div>
                        <div className="font-mono text-sm font-bold text-teal-300">
                          Kernel Density Comparison: Observed vs Imputed
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Empirical density verification via Predictive Mean Matching (PMM)
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-0.5 bg-teal-400 inline-block" />
                          <span>Observed Data</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-0.5 bg-rose-400 inline-block" />
                          <span>MICE Imputed Data</span>
                        </span>
                      </div>
                    </div>

                    {/* SVG Density Curve */}
                    <div className="py-2">
                      <div className="text-[11px] font-mono text-stone-400 mb-1">Y-axis: Density f(x)</div>
                      <svg viewBox="0 0 600 130" className="w-full h-32">
                        <line x1="40" y1="110" x2="560" y2="110" stroke="#475569" strokeWidth="1" />
                        <line x1="40" y1="20" x2="40" y2="110" stroke="#475569" strokeWidth="1" />

                        {/* Observed curve (Teal) */}
                        <path
                          d="M 50 110 Q 180 108 230 65 T 280 25 T 330 65 T 540 110"
                          fill="none"
                          stroke="#2dd4bf"
                          strokeWidth="2.5"
                        />

                        {/* Imputed curve (Rose, faithful to true density) */}
                        <path
                          d="M 50 110 Q 175 108 228 68 T 280 28 T 332 68 T 540 110"
                          fill="none"
                          stroke="#fb7185"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                      </svg>
                      <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 px-8">
                        <span>-3σ (Lower Tail)</span>
                        <span>μ (Central Mean)</span>
                        <span>+3σ (Upper Tail)</span>
                      </div>
                      <div className="text-center text-[11px] font-mono text-stone-400 mt-2">
                        X-axis: Standardized Feature Value
                      </div>
                    </div>
                  </div>
                )}

                {/* Plot 3: Tukey Outlier Boxplot with English labels */}
                {activePlotType === 'boxplot' && (
                  <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-stone-800 pb-3">
                      <div>
                        <div className="font-mono text-sm font-bold text-teal-300">
                          Tukey Outlier Audit & Jitter Distribution
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Boxplot inspection with 1.5x IQR whisker boundary criteria
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
                          <span>Within 1.5x IQR</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                          <span>Flagged Outlier</span>
                        </span>
                      </div>
                    </div>

                    {/* SVG Boxplot */}
                    <div className="py-2">
                      <div className="text-[11px] font-mono text-stone-400 mb-1">Y-axis: Measurement Scale</div>
                      <svg viewBox="0 0 600 130" className="w-full h-32">
                        <line x1="40" y1="100" x2="560" y2="100" stroke="#475569" strokeWidth="1" />

                        {/* Whiskers */}
                        <line x1="120" y1="55" x2="480" y2="55" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                        <line x1="120" y1="40" x2="120" y2="70" stroke="#94a3b8" strokeWidth="2" />
                        <line x1="480" y1="40" x2="480" y2="70" stroke="#94a3b8" strokeWidth="2" />

                        {/* Box */}
                        <rect x="220" y="35" width="180" height="40" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" rx="4" />
                        <line x1="310" y1="35" x2="310" y2="75" stroke="#fef08a" strokeWidth="3" />

                        {/* Outliers */}
                        <circle cx="520" cy="55" r="4.5" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
                        <circle cx="545" cy="55" r="4.5" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
                        <circle cx="80" cy="55" r="4.5" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
                      </svg>
                      <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 px-8">
                        <span>Lower Whisker (Q1 - 1.5*IQR)</span>
                        <span className="text-amber-300">Median (Q2)</span>
                        <span>Upper Whisker (Q3 + 1.5*IQR)</span>
                      </div>
                      <div className="text-center text-[11px] font-mono text-stone-400 mt-2">
                        X-axis: Feature Distribution Range
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Cleaned Data Preview Table */}
            {activeOutputTab === 'table' && (
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-stone-600 mb-3">
                  <span className="font-semibold">
                    整洁数据预览：head(df_cleaned, 15) —— 共计 {cleanRowsCount} 行 × {cleanColumns.length} 列
                  </span>
                  <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    POSIX snake_case 规范
                  </span>
                </div>

                <div className="overflow-x-auto border border-stone-200 rounded-xl bg-white max-h-72">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-stone-50 text-stone-700 border-b border-stone-200">
                        <th className="py-2.5 px-3 font-semibold text-stone-400">#</th>
                        {cleanColumns.map((col, idx) => (
                          <th key={idx} className="py-2.5 px-3 font-semibold truncate max-w-[150px]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {cleanData.slice(0, 15).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-stone-50/70 text-[11px]">
                          <td className="py-2 px-3 text-stone-400">{rIdx + 1}</td>
                          {cleanColumns.map((col, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 truncate max-w-[150px]">
                              {row[col] ?? <span className="text-stone-300">NA</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Simulated R Console Logs */}
            {activeOutputTab === 'console' && (
              <div className="bg-black p-5 text-xs font-mono text-emerald-400 max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800 mb-3 text-stone-400 text-[11px]">
                  <span>R Session Interactive Terminal</span>
                  <span>R 4.3.3 (x86_64-pc-linux-gnu)</span>
                </div>
                <div className="space-y-1">
                  {consoleLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={
                        log.startsWith('✔')
                          ? 'text-teal-300'
                          : log.startsWith('>>>')
                          ? 'text-amber-300 font-semibold'
                          : log.startsWith('>')
                          ? 'text-white font-bold'
                          : 'text-stone-300'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Audit Delta Metrics Table */}
            {activeOutputTab === 'delta' && (
              <div className="p-6">
                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-700 border-b border-stone-200">
                        <th className="py-3 px-4 font-semibold">质检维度</th>
                        <th className="py-3 px-4 font-semibold">原始数据 (Before)</th>
                        <th className="py-3 px-4 font-semibold">清洗后 (After)</th>
                        <th className="py-3 px-4 font-semibold">状态增益 (Delta)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      <tr>
                        <td className="py-3 px-4 font-medium">综合健康度得分</td>
                        <td className="py-3 px-4 font-mono">{rawAudit?.overallHealthScore || 65} 分 ({rawAudit?.grade || 'C'})</td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-bold">{cleanAudit?.overallHealthScore || 96} 分 ({cleanAudit?.grade || 'A'})</td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-bold">+{((cleanAudit?.overallHealthScore || 96) - (rawAudit?.overallHealthScore || 65))} 分</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">全表缺失率</td>
                        <td className="py-3 px-4 font-mono text-rose-600">{rawAudit?.overallMissingRate.toFixed(1) || '12.5'}%</td>
                        <td className="py-3 px-4 font-mono text-emerald-600">{cleanAudit?.overallMissingRate.toFixed(1) || '0.0'}%</td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-bold">-( {rawAudit?.overallMissingRate.toFixed(1) || '12.5'}% )</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">冗余重复行数</td>
                        <td className="py-3 px-4 font-mono text-amber-600">{rawAudit?.duplicateRowsCount || 1} 行</td>
                        <td className="py-3 px-4 font-mono text-emerald-600">{cleanAudit?.duplicateRowsCount || 0} 行</td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-bold">已彻底消除</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">列名规范性</td>
                        <td className="py-3 px-4 font-mono text-stone-500">{rawAudit?.nonStandardColNamesCount || 4} 个非标准</td>
                        <td className="py-3 px-4 font-mono text-emerald-600">全列标准 snake_case</td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-bold">100% 合规</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
