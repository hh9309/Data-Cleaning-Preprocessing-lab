import React from 'react';
import { CASE_STUDIES } from '../data/sampleDatasets';
import { CaseStudy } from '../types';
import {
  FunctionSquare,
  Activity,
  HelpCircle,
  Crosshair,
  BookOpen,
  Code2,
  Bot,
  GitCommit,
  Download,
  Lightbulb,
  Sparkles,
  Database,
} from 'lucide-react';

export type ModuleKey =
  | 'algebra'
  | 'quality'
  | 'missing'
  | 'outliers'
  | 'cases'
  | 'rscript'
  | 'workflow'
  | 'export'
  | 'slices';

interface Props {
  activeModule: ModuleKey;
  onSelectModule: (key: ModuleKey) => void;
  activeCase: CaseStudy;
  onSelectCase: (caseStudy: CaseStudy) => void;
  healthScore: number;
  grade: string;
  onOpenAiDoctor: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeModule,
  onSelectModule,
  activeCase,
  onSelectCase,
  healthScore,
  grade,
  onOpenAiDoctor,
}) => {
  const navItems: { key: ModuleKey; label: string; icon: React.FC<any>; num: string }[] = [
    { key: 'algebra', label: '1. 质检代数', icon: FunctionSquare, num: '01' },
    { key: 'quality', label: '2. 质量检测', icon: Activity, num: '02' },
    { key: 'missing', label: '3. 缺失填补', icon: HelpCircle, num: '03' },
    { key: 'outliers', label: '4. 异常值处理', icon: Crosshair, num: '04' },
    { key: 'cases', label: '5. 六大案例', icon: BookOpen, num: '05' },
    { key: 'rscript', label: '6. R代码引擎', icon: Code2, num: '06' },
    { key: 'workflow', label: '8. 全流程导引', icon: GitCommit, num: '08' },
    { key: 'export', label: '9. 报告导出', icon: Download, num: '09' },
    { key: 'slices', label: '10. 清洗要素', icon: Lightbulb, num: '10' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-xs font-mono">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 tracking-tight text-sm sm:text-base">
                  R 数据清洗与预处理 WebApp 实验室
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-semibold border border-teal-200">
                  Tidyverse 2.0 版
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden md:block">
                缺失值 · 异常值 · 算子代数 · 整洁数据规范
              </p>
            </div>
          </div>

          {/* Quick Case Switcher & Status Actions */}
          <div className="flex items-center gap-3">
            {/* Case Dropdown */}
            <div className="hidden sm:flex items-center gap-2 bg-stone-100/80 border border-stone-200/80 rounded-xl px-2.5 py-1.5 text-xs">
              <Database className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <select
                value={activeCase.id}
                onChange={(e) => {
                  const found = CASE_STUDIES.find((c) => c.id === e.target.value);
                  if (found) onSelectCase(found);
                }}
                className="bg-transparent text-xs font-medium text-stone-800 focus:outline-none cursor-pointer max-w-[150px] md:max-w-[180px] truncate"
              >
                {CASE_STUDIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Health Score Pill */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs ${
                grade === 'A' || grade === 'B'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : grade === 'C'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span className="text-[10px] opacity-75">健康评级:</span>
              <span className="font-mono font-bold">{grade}</span>
              <span className="text-[11px] font-mono">({healthScore}分)</span>
            </div>

            {/* AI Doctor Trigger Button (Module 7) */}
            <button
              onClick={onOpenAiDoctor}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer group"
            >
              <Bot className="w-3.5 h-3.5 text-teal-400 group-hover:rotate-12 transition-transform" />
              <span>7. AI随诊会诊</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>
        </div>

        {/* 10 Core Modules Navigation Bar */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar border-t border-stone-100 text-xs">
          {navItems.map((item) => {
            const isActive = activeModule === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onSelectModule(item.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer font-medium ${
                  isActive
                    ? 'bg-teal-700 text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
