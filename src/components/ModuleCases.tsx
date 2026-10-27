import React from 'react';
import { CaseStudy } from '../types';
import { CASE_STUDIES } from '../data/sampleDatasets';
import { BookOpen, Sparkles, Database, CheckCircle2, ArrowRight, Upload, PlayCircle } from 'lucide-react';

interface Props {
  activeCaseId: string;
  onSelectCase: (caseStudy: CaseStudy) => void;
  onApplyPresetRecipe: (caseStudy: CaseStudy) => void;
  onCustomUpload?: (data: Record<string, any>[], cols: string[], name: string) => void;
}

export const ModuleCases: React.FC<Props> = ({
  activeCaseId,
  onSelectCase,
  onApplyPresetRecipe,
  onCustomUpload,
}) => {
  const currentCase = CASE_STUDIES.find(c => c.id === activeCaseId) || CASE_STUDIES[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onCustomUpload) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const parsedData: Record<string, any>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const rowVals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, any> = {};
        headers.forEach((h, idx) => {
          row[h] = rowVals[idx] ?? '';
        });
        parsedData.push(row);
      }

      onCustomUpload(parsedData, headers, file.name);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-medium rounded-full mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              模块 05 · 六大多源异构工业案例库
            </div>
            <h2 className="text-2xl font-semibold text-stone-900 tracking-tight">
              六大数据清洗实战案例库 (Industrial Benchmark Scenarios)
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              覆盖跨境电商、多中心临床试验、金融信贷风控、物联网传感器、现代供应链及社媒情感语料。
            </p>
          </div>

          {/* Upload Custom CSV button */}
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-xl border border-stone-200 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>导入自有 CSV 数据</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 6 Case Studies Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {CASE_STUDIES.map((c) => {
            const isSelected = c.id === activeCaseId;
            return (
              <div
                key={c.id}
                onClick={() => onSelectCase(c)}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700">
                      {c.domain}
                    </span>
                    <span className="font-mono text-xs text-stone-400">
                      {c.rawData.length} 行 × {c.rawColumns.length} 列
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-stone-900 mb-1">{c.title}</h3>
                  <div className="text-xs font-medium text-teal-700 mb-2">{c.subtitle}</div>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
                    {c.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs font-medium">
                  <span className={isSelected ? 'text-teal-700 font-semibold' : 'text-stone-500'}>
                    {isSelected ? '✓ 当前选定案例' : '点击切换此案例'}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-700' : 'text-stone-400'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Case Brief & One-Click Best-Practice Recipe */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-6">
            <div>
              <div className="text-xs font-semibold text-teal-700 tracking-wider uppercase mb-1">
                当前案例深度解构 · {currentCase.domain}
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                {currentCase.title} —— {currentCase.subtitle}
              </h3>
            </div>

            <button
              onClick={() => onApplyPresetRecipe(currentCase)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start lg:self-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>一键装配本案例官方推荐清洗流水线 (Apply Best-Practice Recipe)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-xs font-semibold text-rose-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                本案例预设“脏数据”病灶特征 (Dirty Data Pathology)
              </h4>
              <ul className="space-y-2 text-xs text-stone-700">
                {currentCase.targetCleaningPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white border border-stone-200/60 p-2.5 rounded-lg">
                    <span className="text-rose-500 font-bold shrink-0">#{idx + 1}</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-teal-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
                推荐遵循的 R 语言清洗工艺链 (Recommended Workflow)
              </h4>
              <ul className="space-y-2 text-xs text-stone-700">
                {currentCase.recommendedSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white border border-stone-200/60 p-2.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Raw Dirty Table Live View */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-stone-600 mb-2">
              <span className="font-semibold flex items-center gap-1.5">
                <Database className="w-4 h-4 text-stone-500" />
                原始待清洗数据透视 (Raw Input Data, 前 8 行)
              </span>
              <span className="font-mono text-stone-400">
                Primary Key: {currentCase.primaryKey || 'None'}
              </span>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                    {currentCase.rawColumns.map((col, idx) => (
                      <th key={idx} className="py-2.5 px-3 font-mono font-semibold truncate">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {currentCase.rawData.slice(0, 8).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-stone-50/50 font-mono text-[11px]">
                      {currentCase.rawColumns.map((col, cIdx) => {
                        const val = row[col];
                        const isNull = val === null || val === undefined;
                        const isOutlierVal = String(val).includes('999') || String(val).includes('-88') || String(val).includes('-5');
                        const isDirtyChar = String(val).includes('&amp;') || String(val).includes('&lt;') || String(val).includes('元');

                        return (
                          <td key={cIdx} className="py-2 px-3 truncate max-w-[180px]">
                            {isNull ? (
                              <span className="text-rose-500 font-bold bg-rose-50 px-1 py-0.5 rounded">
                                NA
                              </span>
                            ) : isOutlierVal ? (
                              <span className="text-amber-800 font-bold bg-amber-100 px-1 py-0.5 rounded">
                                {String(val)}
                              </span>
                            ) : isDirtyChar ? (
                              <span className="text-indigo-800 bg-indigo-50 px-1 py-0.5 rounded">
                                {String(val)}
                              </span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
