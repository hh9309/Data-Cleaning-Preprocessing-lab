import React, { useState } from 'react';
import { ALGEBRA_OPERATORS } from '../utils/cleaningAlgebra';
import { FunctionSquare, Layers, Sparkles, Scale, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';

export const ModuleAlgebra: React.FC = () => {
  const [selectedOp, setSelectedOp] = useState(ALGEBRA_OPERATORS[3]); // Default to Imputation operator
  const [demoP, setDemoP] = useState(0.25); // 25% missing rate for variance shrinkage simulation

  const varOriginal = 100;
  const varMeanImputed = (1 - demoP) * varOriginal;
  const tStatMultiplier = 1 / Math.sqrt(1 - demoP);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Intro */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-medium rounded-full mb-2">
              <FunctionSquare className="w-3.5 h-3.5" />
              模块 01 · 形式化理论基石
            </div>
            <h2 className="text-2xl font-semibold text-stone-900 tracking-tight">
              数据清洗代数与整洁数据规范 (Tidy Data Algebra)
            </h2>
            <p className="text-stone-500 text-sm mt-1 max-w-2xl">
              形式化构建数据清洗算子代数模型，严格推导数据清洗对统计无偏性、方差结构与后续建模参数估计的数学映射原理。
            </p>
          </div>
          <div className="flex items-center gap-2 bg-stone-50 px-4 py-2.5 rounded-xl border border-stone-200/70 text-xs text-stone-600">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>核心规范：<strong>Hadley Wickham 整洁数据三大公理</strong></span>
          </div>
        </div>

        {/* Hadley Wickham Tidy Data Rules Axiom Cards */}
        <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          Hadley Wickham 《Tidy Data》 整洁数据三大公理体系
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-stone-50/70 hover:bg-stone-50 border border-stone-200 rounded-xl p-5 transition-all">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm mb-3">
              I
            </div>
            <h4 className="font-medium text-stone-900 text-sm mb-1">变量公理 (Variables as Columns)</h4>
            <div className="text-xs font-mono text-teal-700 bg-teal-50/50 px-2 py-1 rounded mb-2 inline-block">
              ∀ V_j ∈ AttributeSet: V_j ↦ Column
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              每个独立的测量属性（如年龄、体温、成交额）必须自成一列。禁止将测量指标名称作为值存放在数据单元格中。
            </p>
          </div>

          <div className="bg-stone-50/70 hover:bg-stone-50 border border-stone-200 rounded-xl p-5 transition-all">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm mb-3">
              II
            </div>
            <h4 className="font-medium text-stone-900 text-sm mb-1">观测公理 (Observations as Rows)</h4>
            <div className="text-xs font-mono text-indigo-700 bg-indigo-50/50 px-2 py-1 rounded mb-2 inline-block">
              ∀ O_i ∈ EntityRecords: O_i ↦ Unique Row
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              每次实验、受试者单次访视或交易流水必须自成一行。禁止单个观测横向跨越多个宽表冗余列或违规聚合。
            </p>
          </div>

          <div className="bg-stone-50/70 hover:bg-stone-50 border border-stone-200 rounded-xl p-5 transition-all">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm mb-3">
              III
            </div>
            <h4 className="font-medium text-stone-900 text-sm mb-1">单元格标量公理 (Atomic Cell Values)</h4>
            <div className="text-xs font-mono text-amber-700 bg-amber-50/50 px-2 py-1 rounded mb-2 inline-block">
              c_ij ∈ Atomic Domain (无列表/复合字典)
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              每个坐标单元格仅存放单一原子值。严禁在同一单元格混入“金额+货币代码+单位”（如 “$1,200 pcs”），破坏第一范式。
            </p>
          </div>
        </div>

        {/* Six Algebra Operators Interactive Explorer */}
        <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-600" />
          数据清洗代数算子模型库 (Formal Operator Matrix)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {ALGEBRA_OPERATORS.map((op) => {
            const isActive = selectedOp.symbol === op.symbol;
            return (
              <button
                key={op.symbol}
                onClick={() => setSelectedOp(op)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-50/80 border-teal-500 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="font-mono text-xs font-semibold text-teal-800 mb-1">{op.symbol}</div>
                <div className="text-xs font-medium text-stone-800 truncate">{op.name.split(' ')[0]}</div>
                <div className="text-[10px] text-stone-400 mt-1 truncate">{op.rEquivalent.split('(')[0]}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Operator Detailed Deduction */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 sm:p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-mono font-bold text-teal-800 bg-teal-100/70 px-3 py-1 rounded-md">
                {selectedOp.symbol}
              </span>
              <div>
                <h4 className="text-sm font-semibold text-stone-900">{selectedOp.name}</h4>
                <span className="text-xs text-stone-500">R 对应语法: <code className="font-mono text-teal-700">{selectedOp.rEquivalent}</code></span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className={`px-2 py-0.5 rounded-full font-medium ${selectedOp.commutative ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                {selectedOp.commutative ? '满足交换律' : '严格非交换 (Non-commutative)'}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${selectedOp.reversible ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'}`}>
                {selectedOp.reversible ? '可逆映射' : '不可逆算子 (不可还原)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold text-stone-600 mb-1">形式化数学定义：</div>
              <div className="bg-white border border-stone-200 p-3 rounded-lg font-mono text-xs text-stone-800 mb-3 shadow-2xs">
                {selectedOp.formalDefinition}
              </div>
              <div className="text-xs font-semibold text-stone-600 mb-1">代数语义与统计意义：</div>
              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                {selectedOp.mathExplanation}
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-stone-600 mb-2">算子代数特征与防御原则：</div>
              <ul className="space-y-2">
                {selectedOp.properties.map((prop, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 bg-white border border-stone-200/60 p-2.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{prop}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Statistical Variance Shrinkage Deduction Lab */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-medium mb-2">
            <Scale className="w-4 h-4" />
            <span>核心数学推导 · 为什么均值填补是统计学“致命陷阱”？</span>
          </div>
          <h3 className="text-lg font-semibold text-stone-100 mb-3">
            均值填补方差收缩定理 (Variance Shrinkage Theorem) 与假阳性放大
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed mb-5 max-w-3xl">
            设随机变量 X 的真实方差为 Var(X) = σ²。假设发生随机缺失比例为 p (0 ≤ p &lt; 1)，
            若粗暴使用样本均值 μ̂ 代替全部缺失值，插补后的变量 X̂ 方差推导为：
          </p>

          <div className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-4 mb-6 font-mono text-xs text-teal-200 overflow-x-auto space-y-2">
            <div>{"Var(X̂) = (1/n) ∑ [obs] (x_i - x̄)² + (1/n) ∑ [miss] (x̄ - x̄)²"}</div>
            <div className="text-amber-300">{"⟹ Var(X̂) = (1 - p) · Var(X) < Var(X)  【方差被直接压缩了 (1 - p) 倍！】"}</div>
            <div className="text-rose-300">{"⟹ t = (X̄ - μ₀) / √(Var(X̂)/n) = t_true / √(1 - p)  ⟹ 导致检验统计量虚假膨胀，假阳性 Type I 错误激增！"}</div>
          </div>

          {/* Interactive Slider for Variance Shrinkage */}
          <div className="bg-stone-800/50 border border-stone-700/60 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs text-stone-300 font-medium">交互式缺失率滑块 p：</span>
                <span className="ml-2 font-mono text-amber-400 font-bold text-sm">{(demoP * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={demoP}
                onChange={(e) => setDemoP(parseFloat(e.target.value))}
                className="w-full sm:w-64 accent-teal-400 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                <div className="text-[11px] text-stone-400">原始真实方差 Var(X)</div>
                <div className="text-lg font-mono font-bold text-teal-400">{varOriginal.toFixed(1)}</div>
              </div>
              <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                <div className="text-[11px] text-stone-400">均值填补后萎缩方差 Var(X̂)</div>
                <div className="text-lg font-mono font-bold text-rose-400">{varMeanImputed.toFixed(1)} <span className="text-xs font-normal">(-{(demoP * 100).toFixed(0)}%)</span></div>
              </div>
              <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                <div className="text-[11px] text-stone-400">t 统计量虚假放大系数</div>
                <div className="text-lg font-mono font-bold text-amber-400">{tStatMultiplier.toFixed(2)}x</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <span className="flex items-center gap-1.5 text-teal-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                R 语言最佳实践对策：优先采用 MICE 多重插补 (Rubin 规则修正方差) 或保留缺失标记
              </span>
              <span className="font-mono text-stone-400 text-[11px]">T = Ū + (1 + 1/m)B</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
