import React, { useState } from 'react';
import { BookOpen, Sparkles, AlertOctagon, Scale, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Lightbulb, Compass } from 'lucide-react';

export const ModuleKnowledgeSlices: React.FC = () => {
  const [activeSlice, setActiveSlice] = useState<number>(0);

  const slices = [
    {
      id: 'slice-1',
      num: '切片一',
      title: '数据清洗基本要素的整洁解构',
      subtitle: '完整性、准确性、一致性与 80/20 铁律',
      icon: Compass,
      color: 'teal',
      badge: '认知基石',
    },
    {
      id: 'slice-2',
      num: '切片二',
      title: '缺失值填补与删除的权衡边界',
      subtitle: 'Rubin 机制 (MCAR/MAR/MNAR) 与方差结构保真',
      icon: Scale,
      color: 'indigo',
      badge: '统计权衡',
    },
    {
      id: 'slice-3',
      num: '切片三',
      title: '三大致命清洗陷阱深度解剖',
      subtitle: '不可逆硬删除、均值方差塌陷与隐性类型掩盖',
      icon: ShieldAlert,
      color: 'rose',
      badge: '踩坑预警',
    },
    {
      id: 'slice-4',
      num: '切片四',
      title: '误区警示与实务诊断陷阱',
      subtitle: '“清洗不等于盲目删减”——恢复数据物理真实语义',
      icon: Lightbulb,
      color: 'amber',
      badge: '思维跃迁',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-medium rounded-full mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              模块 10 · 数据清洗要素与多维切片知识导引
            </div>
            <h2 className="text-2xl font-semibold text-stone-900 tracking-tight">
              数据预处理四大核心切片方法论 (Four Methodological Slices)
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              深入剖析清洗要素的拓扑解构、缺失与删除边界定理、工业界高发致命陷阱与统计反常识警示。
            </p>
          </div>

          <div className="text-xs bg-stone-50 text-stone-600 border border-stone-200 px-3.5 py-2 rounded-xl">
            数据科学法则：<strong>80% 的生产力耗费在清洗，预处理是模型泛化能力的生命线</strong>
          </div>
        </div>

        {/* Slice Navigation Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {slices.map((sl, idx) => {
            const isSelected = activeSlice === idx;
            const Icon = sl.icon;
            return (
              <button
                key={sl.id}
                onClick={() => setActiveSlice(idx)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-stone-50/60 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-semibold text-stone-500">{sl.num}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isSelected ? 'bg-teal-200/80 text-teal-900' : 'bg-stone-200/70 text-stone-600'}`}>
                      {sl.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 mb-1 leading-snug">{sl.title}</h4>
                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                    {sl.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                  <span className={isSelected ? 'text-teal-700 font-semibold' : 'text-stone-400'}>
                    {isSelected ? '正在研读' : '点击切换'}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-700' : 'text-stone-400'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Slice 1: 数据清洗基本要素的整洁解构 */}
        {activeSlice === 0 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-7">
              <div className="flex items-center gap-2 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-2">
                <Compass className="w-4 h-4" />
                切片一 · 核心要素拓扑模型
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">
                数据清洗三大基本要素：完整性、准确性与一致性
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed max-w-3xl mb-6">
                据行业共识，数据科学家高达 <strong>80% 的工作时间</strong> 消耗在繁冗的数据探查、类型解析、缺失修复与异常降噪上。清洗绝非简单的“脏数据删掉”，而是确保后续统计推断有效性（Statistical Validity）与机器学习泛化边界（Generalization Bound）的生命线。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm mb-3">
                    1
                  </div>
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">完整性 (Completeness)</h4>
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    每个实体的观测属性是否被系统性记录？有无大面积的缺失模式（Missing Patterns）阻碍模型收敛？
                  </p>
                  <div className="text-[11px] font-mono text-teal-700 bg-teal-50 p-2 rounded">
                    R 工具: naniar::vis_miss()
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm mb-3">
                    2
                  </div>
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">准确性 (Accuracy)</h4>
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    记录的物理量是否落在合理阈值域内？有无人为输入手误（如年龄 165 岁、收缩压 999 mmHg）或传感器脉冲？
                  </p>
                  <div className="text-[11px] font-mono text-indigo-700 bg-indigo-50 p-2 rounded">
                    R 工具: Tukey IQR & DescTools::Winsorize
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm mb-3">
                    3
                  </div>
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">一致性 (Consistency)</h4>
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    跨中心、多批次的数据格式与语义是否对齐？货币符号、时间戳格式、列名大小写及单位是否统一？
                  </p>
                  <div className="text-[11px] font-mono text-amber-700 bg-amber-50 p-2 rounded">
                    R 工具: janitor::clean_names() & lubridate
                  </div>
                </div>
              </div>

              <div className="bg-stone-900 text-stone-200 p-5 rounded-xl border border-stone-800 text-xs leading-relaxed">
                <span className="text-teal-400 font-semibold block mb-1">Hadley 整洁数据契约 (Tidy Data Contract)：</span>
                无论原始数据多么脏乱，预处理的最终目的都是将其重构为“每列一个变量、每行一个观测、每格一个原子标量”的规范关系表。唯有如此，后续利用 <code className="text-teal-300 font-mono">ggplot2</code> 作图与 <code className="text-teal-300 font-mono">tidymodels</code> 建模才具备数学确定性。
              </div>
            </div>
          </div>
        )}

        {/* Slice 2: 缺失值填补与删除的权衡边界 */}
        {activeSlice === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-7">
              <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
                <Scale className="w-4 h-4" />
                切片二 · 统计权衡与方差结构保真
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">
                缺失值处理的权衡边界：删除 vs 插补的数学冲突
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed max-w-3xl mb-6">
                面对缺失数据，初学者往往陷入“两极分化”：要么无脑执行 <code className="font-mono text-teal-800 bg-teal-100 px-1 py-0.5 rounded">na.omit()</code> 导致样本量暴跌，要么无脑全部填补均值。这两者在统计推断中均会导致灾难性后果。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="bg-white border border-stone-200 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-rose-800 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    完整案例删除 (Listwise Deletion) 的三大危机
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-600 leading-relaxed">
                    <li><strong>1. 样本容量雪崩效应：</strong>若 20 个变量各自仅有 3% 的随机缺失，完全案例删除可能直接导致超过 45% 的整行观测被彻底丢弃！</li>
                    <li><strong>2. 选择性偏差 (Selection Bias)：</strong>除非数据完全满足 MCAR，否则丢弃缺失行会破坏原始总体的代表性，导致参数估计系统性偏离真值。</li>
                    <li><strong>3. 统计检验功效 (Power) 剧烈下降：</strong>样本量的缩水直接放大置信区间宽度，导致原本显著的效应变得不显著。</li>
                  </ul>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-amber-600" />
                    单一插补 (Single Imputation) 的方差萎缩陷阱
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-600 leading-relaxed">
                    <li><strong>1. 方差人为塌陷：</strong>均值插补使得插补值与均值之差为 0，导致方差缩水为 {"Var(X̂) = (1 - p)Var(X)"}。</li>
                    <li><strong>2. 虚假缩小标准误：</strong>单值填补将“未观测不确定性”强行抹平，使计算机误认为掌握了完全确凿的数据，导致 t 统计量与 F 统计量虚假膨胀。</li>
                    <li><strong>3. 变量间相关性被削弱：</strong>单纯单变量填补破坏了特征之间的协方差结构与条件分布。</li>
                  </ul>
                </div>
              </div>

              <div className="bg-indigo-900 text-white p-5 rounded-xl border border-indigo-800 text-xs">
                <span className="text-teal-300 font-semibold block mb-1">终极解决方案：Rubin 多重插补 (MICE) 规则</span>
                MICE 算法通过构建 m 个插补数据集（通常 m=5），将总方差分解为：
                <div className="font-mono text-teal-200 bg-indigo-950 p-2.5 rounded my-2">
                  {"T = Ū + (1 + 1/m)B"}
                </div>
                其中 Ū 为插补内方差（Within-imputation variance），B 为插补间方差（Between-imputation variance）。MICE 通过贝叶斯随机抽样或预测均值匹配 (PMM)，优雅地恢复了数据内在的不确定性！
              </div>
            </div>
          </div>
        )}

        {/* Slice 3: 三大致命清洗陷阱 */}
        {activeSlice === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-7">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2">
                <ShieldAlert className="w-4 h-4" />
                切片三 · 高危陷阱深度解剖
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">
                三大致命清洗陷阱 (Three Fatal Preprocessing Pitfalls)
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed max-w-3xl mb-6">
                现实生产中，超过 70% 的模型线上崩溃并非因为算法选型不当，而是源于数据预处理阶段埋下的隐性毒药。
              </p>

              <div className="space-y-4">
                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs">1</span>
                      陷阱一：不可逆的硬删除与血缘追溯断裂 (Irreversible Hard Deletion)
                    </h4>
                    <span className="text-rose-600 font-semibold text-xs bg-rose-50 px-2 py-0.5 rounded">灾难级风险</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed mb-2">
                    在未对原始数据（Raw Staging）进行只读快照和版本控制的情况下，直接使用 <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">{"df <- df %>% filter(...)"}</code> 原地覆写。当后续业务审计发现过滤条件过激（如误删了罕见病阳性病例）时，原始数据已永久灭失。
                  </p>
                  <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <strong>防御方案：</strong> 遵循数据湖分层原则：Raw（原始只读）➔ Staging（质检中间层）➔ Clean（整洁分析层），严禁原地破坏性写入。
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs">2</span>
                      陷阱二：机械均值填补导致方差塌陷与假阳性激增 (Variance Collapse)
                    </h4>
                    <span className="text-amber-600 font-semibold text-xs bg-amber-50 px-2 py-0.5 rounded">统计学隐性毒药</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed mb-2">
                    对高偏态（如金融收入、电商交易额）或缺失率高于 10% 的变量使用均值填补。虽然代码不会抛出任何报错，但数据分布中心被异常拔高，自由度虚假膨胀，导致后续回归检验中的 p 值极具欺骗性（虚假的极高显著性）。
                  </p>
                  <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <strong>防御方案：</strong> 优先选择基于近邻经验抽样的 <code className="font-mono">mice(method="pmm")</code>，并在填补后对比核密度曲线（KDE）。
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs">3</span>
                      陷阱三：隐性类型掩盖与占位符污染 (Silent Type Masking)
                    </h4>
                    <span className="text-rose-600 font-semibold text-xs bg-rose-50 px-2 py-0.5 rounded">计算崩塌级风险</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed mb-2">
                    许多老旧数据库或业务系统使用 <code className="font-mono text-stone-700 bg-stone-100 px-1 py-0.5 rounded">-999</code>、<code className="font-mono text-stone-700 bg-stone-100 px-1 py-0.5 rounded">"NULL"</code>、<code className="font-mono text-stone-700 bg-stone-100 px-1 py-0.5 rounded">"9999"</code> 代表缺失。若未事先执行 <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">na_if()</code> 转换为标准 NA，统计函数会将 -999 作为真实物理数值参与求和与均值计算，导致算术平均值发生极其荒谬的负向暴跌！
                  </p>
                  <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <strong>防御方案：</strong> 接入数据的第一道防线必须是运行隐式空值标准化：<code className="font-mono">mutate(across(everything(), ~na_if(.x, "-999")))</code>。
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slice 4: 误区警示与诊断陷阱 */}
        {activeSlice === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-7">
              <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-2">
                <Lightbulb className="w-4 h-4" />
                切片四 · 误区警示与思维认知升级
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">
                误区警示：清洗绝非简单的“减法”，而是恢复数据的真实物理语义
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed max-w-3xl mb-6">
                “把离群点删掉，把缺失行扔掉，把格式改好看”——这是对数据清洗最大的误解。清洗的本质是<strong>数据拓扑映射与信息保真</strong>。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="bg-white border border-stone-200 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                    <span className="text-amber-600 font-bold">⚠</span>
                    离群点到底是“噪音”还是“黄金信号”？
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    在网络安全入侵检测、金融反洗钱风控或罕见基因突变研究中，那些偏离正态分布均值 5 个标准差的“极端异常值”，恰恰是业务中最具商业价值的信号！若盲目按照 1.5 倍 IQR 剔除，清洗后的模型将彻底丧失对黑天鹅事件的捕获能力。
                  </p>
                  <div className="text-[11px] font-mono text-teal-800 bg-teal-50 p-2 rounded">
                    黄金准则：严格区分“测量记录误差 (Measurement Error)”与“真实物理极值 (True Extreme Signal)”。
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                    <span className="text-amber-600 font-bold">⚠</span>
                    缺失本身就是一种强烈的“特征”
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    用户不愿透露年金收入、病人未参加某项自费化验，这种 MNAR 非随机缺失本身就蕴含着极强的行为意图。直接填补一个数字反而抹杀了这种行为特征。
                  </p>
                  <div className="text-[11px] font-mono text-teal-800 bg-teal-50 p-2 rounded">
                    最佳实践：在填补前为变量新增指示哑变量：mutate(income_is_missing = as.integer(is.na(income)))。
                  </div>
                </div>
              </div>

              <div className="bg-stone-900 text-stone-300 p-5 rounded-xl border border-stone-800 text-xs leading-relaxed flex items-center justify-between">
                <span>
                  <strong>结语：</strong> 优雅的数据清洗是一门兼具数学严谨性与业务洞察力的艺术。遵循 Hadley 整洁公理与 Rubin 统计原则，为后续的数据智能铺平坦途。
                </span>
                <span className="text-teal-400 font-mono shrink-0 ml-4">
                  library(tidyverse)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
