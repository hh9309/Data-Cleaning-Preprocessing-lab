import React, { useState } from 'react';
import { DataQualityAudit, OutlierStrategy } from '../types';
import { parseNumericVal } from '../utils/qualityScanner';
import { ShieldCheck, Crosshair, Copy, Trash2, Filter, AlertTriangle, ArrowUpDown, CheckCircle } from 'lucide-react';

interface Props {
  audit: DataQualityAudit;
  rawData: Record<string, any>[];
  columns: string[];
  cleanColNames: boolean;
  removeDuplicates: boolean;
  onToggleDuplicates: (val: boolean) => void;
  dedupKey?: string;
  onSelectDedupKey: (key: string) => void;
  outlierStrategies: Record<string, OutlierStrategy>;
  onUpdateOutlierStrategy: (col: string, strat: OutlierStrategy) => void;
}

export const ModuleOutliers: React.FC<Props> = ({
  audit,
  rawData,
  columns,
  cleanColNames,
  removeDuplicates,
  onToggleDuplicates,
  dedupKey,
  onSelectDedupKey,
  outlierStrategies,
  onUpdateOutlierStrategy,
}) => {
  const numericCols = audit.columns.filter(c => c.type === 'numeric');
  const [selectedCol, setSelectedCol] = useState<string>(numericCols[0]?.name || columns[0] || '');
  const [outlierMethod, setOutlierMethod] = useState<'iqr' | 'zscore'>('iqr');
  const [iqrMultiplier, setIqrMultiplier] = useState<number>(1.5);

  const colMetric = audit.columns.find(c => c.name === selectedCol) || numericCols[0];

  // Extract raw numeric values for selected column
  const rawNumericVals = rawData
    .map((r, i) => ({ idx: i + 1, val: parseNumericVal(r[selectedCol]), raw: r[selectedCol], row: r }))
    .filter(item => item.val !== null) as { idx: number; val: number; raw: any; row: any }[];

  const sortedVals = [...rawNumericVals].map(x => x.val).sort((a, b) => a - b);
  const q1 = sortedVals[Math.floor(sortedVals.length * 0.25)] ?? 0;
  const q3 = sortedVals[Math.floor(sortedVals.length * 0.75)] ?? 0;
  const median = colMetric?.median ?? 0;
  const mean = colMetric?.mean ?? 0;
  const iqr = q3 - q1;
  const lowerBound = q1 - iqrMultiplier * iqr;
  const upperBound = q3 + iqrMultiplier * iqr;

  // Identify outlier rows
  const outliers = rawNumericVals.filter(item => item.val < lowerBound || item.val > upperBound);
  const currentStrategy = outlierStrategies[selectedCol] || 'none';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Module Title */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-medium rounded-full mb-2">
              <Crosshair className="w-3.5 h-3.5" />
              模块 04 · 冗余排查与异常值治理
            </div>
            <h2 className="text-2xl font-semibold text-stone-900 tracking-tight">
              重复记录与极端异常值检测处理
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              基于 Tukey IQR 准则与 Z-Score 自动截断离群极值，排查多头重复进件与主键冲突。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl font-medium">
              检测到重复观测：<strong>{audit.duplicateRowsCount}</strong> 行
            </span>
            <span className="text-xs bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-xl font-medium">
              全表离群点：<strong>{audit.totalOutlierCells}</strong> 处
            </span>
          </div>
        </div>

        {/* Section 1: Duplicate Records Management */}
        <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-5 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Copy className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-semibold text-stone-900">
                1. 重复观测记录排查与清洗策略 (Deduplication Engine)
              </h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700 bg-white px-3 py-1.5 rounded-lg border border-stone-300">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => onToggleDuplicates(e.target.checked)}
                className="accent-teal-600 cursor-pointer"
              />
              <span>启用重复数据清洗算子 (σ_dedup)</span>
            </label>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed mb-4">
            完全重复行违背整洁数据“每个观测自成一行”的原则。多中心临床数据或金融征信中，往往因系统重复轮询或网络重发产生完全相同的冗余记录。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 p-4 rounded-xl">
              <span className="text-xs font-semibold text-stone-700 mb-1 block">全记录完全重复排查 (Full Row Duplicates)</span>
              <div className="text-xs text-stone-500 mb-2">
                对应 R 代码: <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">distinct()</code>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span>发现完全重复行数：</span>
                <span className={`font-bold ${audit.duplicateRowsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {audit.duplicateRowsCount} 行
                </span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-4 rounded-xl">
              <span className="text-xs font-semibold text-stone-700 mb-1 block">指定主键去重 (Primary Key Deduplication)</span>
              <div className="text-xs text-stone-500 mb-2">
                对应 R 代码: <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">distinct(key, .keep_all = TRUE)</code>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-600">选择业务主键:</span>
                <select
                  value={dedupKey || ''}
                  onChange={(e) => onSelectDedupKey(e.target.value)}
                  className="font-mono text-xs bg-stone-50 border border-stone-300 rounded px-2 py-1 text-stone-800"
                >
                  <option value="">-- 全表所有列一致 --</option>
                  {columns.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Outlier Detection and Strategy Studio */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-semibold text-stone-900">
                2. 交互式异常值检测与统计箱线图 (Interactive Outlier Studio)
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-600">目标数值变量:</span>
              <select
                value={selectedCol}
                onChange={(e) => setSelectedCol(e.target.value)}
                className="font-mono text-xs font-semibold bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800"
              >
                {numericCols.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name} (离群点: {c.outlierCount} 个)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Outlier Parameters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6 text-xs">
            <div>
              <span className="text-stone-600 font-medium block mb-1">判定准则选择：</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOutlierMethod('iqr')}
                  className={`px-2.5 py-1 rounded font-medium cursor-pointer ${outlierMethod === 'iqr' ? 'bg-teal-600 text-white' : 'bg-white border text-stone-700'}`}
                >
                  Tukey IQR 四分位距
                </button>
                <button
                  onClick={() => setOutlierMethod('zscore')}
                  className={`px-2.5 py-1 rounded font-medium cursor-pointer ${outlierMethod === 'zscore' ? 'bg-teal-600 text-white' : 'bg-white border text-stone-700'}`}
                >
                  Z-Score (标准分)
                </button>
              </div>
            </div>

            <div>
              <span className="text-stone-600 font-medium block mb-1">IQR 容差系数 k: <strong>{iqrMultiplier}</strong></span>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.5"
                value={iqrMultiplier}
                onChange={(e) => setIqrMultiplier(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[10px] text-stone-400">1.5x 为轻度异常，3.0x 为极端异常</span>
            </div>

            <div className="text-right sm:text-left">
              <span className="text-stone-600 font-medium block mb-1">当前容许边界区间：</span>
              <div className="font-mono text-stone-800 font-bold">
                [{lowerBound.toFixed(1)}, {upperBound.toFixed(1)}]
              </div>
              <div className="text-[10px] text-stone-400">
                Q1={q1.toFixed(1)}, Med={median.toFixed(1)}, Q3={q3.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Interactive Boxplot & Scatter Jitter Visualizer */}
          <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 mb-6">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
              <span>观测值散点分布与五数概括箱线图 (Boxplot & Data Points)</span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block"/> 正常观测</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"/> 截获的异常值 ({outliers.length} 个)</span>
              </div>
            </div>

            {/* SVG Boxplot */}
            <div className="relative py-4">
              <svg viewBox="0 0 600 120" className="w-full h-28 overflow-visible">
                {/* Scale Axis Line */}
                <line x1="40" y1="90" x2="560" y2="90" stroke="#475569" strokeWidth="1" />

                {/* Min / Max labels */}
                <text x="40" y="110" fill="#94a3b8" fontSize="10" fontFamily="monospace">min</text>
                <text x="560" y="110" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="end">max</text>

                {/* Whiskers */}
                <line x1="120" y1="50" x2="480" y2="50" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="120" y1="35" x2="120" y2="65" stroke="#94a3b8" strokeWidth="2" />
                <line x1="480" y1="35" x2="480" y2="65" stroke="#94a3b8" strokeWidth="2" />

                {/* Box (IQR) */}
                <rect x="220" y="30" width="180" height="40" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" rx="4" opacity="0.8" />

                {/* Median Line */}
                <line x1="310" y1="30" x2="310" y2="70" stroke="#fef08a" strokeWidth="3" />
                <text x="310" y="24" fill="#fef08a" fontSize="10" fontFamily="monospace" textAnchor="middle">Median</text>

                {/* Render Data Jitter Points */}
                {rawNumericVals.map((item, i) => {
                  const isOutlier = item.val < lowerBound || item.val > upperBound;
                  // Map value to roughly 40-560 scale
                  const minVal = sortedVals[0] ?? 0;
                  const maxVal = sortedVals[sortedVals.length - 1] ?? 100;
                  const range = maxVal - minVal || 1;
                  const cx = 50 + ((item.val - minVal) / range) * 500;
                  const cy = isOutlier ? 50 : 40 + (i % 5) * 5;

                  return (
                    <g key={i}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isOutlier ? 5 : 3.5}
                        fill={isOutlier ? '#f43f5e' : '#2dd4bf'}
                        stroke={isOutlier ? '#ffffff' : 'none'}
                        strokeWidth={1}
                        className="cursor-pointer transition-transform hover:scale-150"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Outliers Flagged List */}
            {outliers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-800">
                <span className="text-xs text-rose-300 font-semibold block mb-2">
                  ⚠ 触发 IQR 规则的异常观测行清单：
                </span>
                <div className="flex flex-wrap gap-2">
                  {outliers.map((o, idx) => (
                    <span key={idx} className="bg-rose-950/80 border border-rose-700 text-rose-200 text-xs px-2.5 py-1 rounded-md font-mono">
                      Row #{o.idx}: {selectedCol} = <strong className="text-white">{o.val}</strong> (原始字符串: "{o.raw}")
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Outlier Strategy Selection */}
          <div>
            <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">
              选择针对 [{selectedCol}] 离群极值的清洗动作 (Outlier Action)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'drop', name: '直接剔除样本 (Filter)', rCode: 'filter(!outlier)', desc: '从数据集中硬性删除整行。仅当确定离群点为输入笔误或测量仪器严重失效时采用。' },
                { id: 'winsorize', name: '缩尾盖帽法 (Winsorize)', rCode: 'DescTools::Winsorize()', desc: '将超出上/下界的极值分别替换为 5% 和 95% 分位数。保留了样本观测，避免方差估计剧烈扰动。' },
                { id: 'log_transform', name: '对数稳健变换 (Log)', rCode: 'mutate(log1p(x))', desc: '针对长尾偏态分布（如收入、订单金额），压缩右侧极值尺度，使其逼近正态分布。' },
                { id: 'set_na', name: '置为空值待插补 (Set NA)', rCode: 'na_if(outlier)', desc: '将异常离群点标记为 NA，交由后续 MICE 或 KNN 智能插补模型基于多变量联合预测填补。' },
              ].map((strat) => {
                const isSelected = currentStrategy === strat.id;
                return (
                  <button
                    key={strat.id}
                    onClick={() => onUpdateOutlierStrategy(selectedCol, strat.id as OutlierStrategy)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-xs text-stone-900">{strat.name}</span>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-teal-600" />}
                    </div>
                    <div className="font-mono text-[10px] text-teal-700 bg-teal-50/50 px-1.5 py-0.5 rounded inline-block mb-2">
                      {strat.rCode}
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      {strat.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
