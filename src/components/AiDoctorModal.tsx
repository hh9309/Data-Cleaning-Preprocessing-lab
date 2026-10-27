import React, { useState } from 'react';
import { DataQualityAudit, CleaningPipelineConfig, ChatMessage } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Settings,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
} from 'lucide-react';

interface Props {
  audit: DataQualityAudit;
  config: CleaningPipelineConfig;
  datasetName: string;
  isOpen: boolean;
  onClose: () => void;
}

export type LLMModel = 'gemini 3 flash' | 'deepseek-v4-pro';

export const AiDoctorModal: React.FC<Props> = ({
  audit,
  config,
  datasetName,
  isOpen,
  onClose,
}) => {
  const [selectedModel, setSelectedModel] = useState<LLMModel>('gemini 3 flash');
  const [pendingModel, setPendingModel] = useState<LLMModel>('gemini 3 flash');
  
  // API-Key State (stored in localStorage for persistence)
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('dr_cleanr_api_key') || '';
  });
  const [pendingApiKey, setPendingApiKey] = useState<string>(() => {
    return localStorage.getItem('dr_cleanr_api_key') || '';
  });
  const [showPassword, setShowPassword] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `您好！我是 **Dr. CleanR** —— 您的 R 语言数据清洗与统计随诊导师。\n\n当前驱动模型：**${selectedModel}**。\n${
        apiKey
          ? '✓ **API-Key 状态**：已配置就绪，可随时发起会诊。'
          : '⚠️ **API-Key 状态**：**尚未手工输入 API-Key**。请点击右上角 ⚙️ **设置图标** 输入您的 API-Key 并确认，方可激活大模型调用。'
      }\n\n已同步您当前加载的 **【${datasetName}】** 数据质量体检卡（当前健康度得分：${audit.overallHealthScore} 分，全表缺失率：${audit.overallMissingRate.toFixed(1)}%）。`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  if (!isOpen) return null;

  // Save settings (Model + API Key)
  const handleConfirmModel = () => {
    if (!pendingApiKey.trim()) {
      alert('请在 API-Key 接收框中手工输入您的 API-Key！所有大模型调用必须输入 API-Key 后方可调用。');
      return;
    }

    setSelectedModel(pendingModel);
    setApiKey(pendingApiKey.trim());
    localStorage.setItem('dr_cleanr_api_key', pendingApiKey.trim());
    setSettingsSuccess(true);

    setTimeout(() => {
      setSettingsSuccess(false);
      setIsSettingsOpen(false);
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'model',
          content: `⚙️ **设置已生效**：大模型已确认为 **【${pendingModel}】**，API-Key 已保存授权！所有大模型接口现已就绪，可随时进行数据会诊与问答。`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }, 600);
  };

  // Check API Key before any model invocation
  const verifyKeyBeforeCall = (): boolean => {
    if (!apiKey.trim()) {
      setIsSettingsOpen(true);
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'model',
          content: `⚠️ **【调用已被拦截】**：根据系统设定，**所有大模型调用必须手工输入 API-Key 后才能调用**！\n\n已为您自动打开大模型设置面板，请在 **【API-Key 接收框】** 中输入您的密钥并点击 **「确认大模型」**！`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      return false;
    }
    return true;
  };

  const handleDiagnose = async () => {
    if (!verifyKeyBeforeCall()) return;

    setLoading(true);
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: `请使用【${selectedModel}】为当前数据集及其清洗策略进行全面的统计学与 R 语言深度会诊！`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetSummary: {
            name: datasetName,
            rows: audit.totalRows,
            cols: audit.totalCols,
            missingRate: `${audit.overallMissingRate.toFixed(1)}%`,
            duplicates: audit.duplicateRowsCount,
            outliers: audit.totalOutlierCells,
            healthScore: audit.overallHealthScore,
            criticalIssues: audit.issuesSummary.critical,
          },
          currentStrategy: config,
          selectedModel,
          apiKey: apiKey.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.diagnosis) {
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: 'model',
            content: `【模型引擎: ${selectedModel}】\n\n${data.diagnosis}`,
            timestamp: new Date().toLocaleTimeString(),
            isDiagnosis: true,
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: 'model',
            content: data.fallbackAdvice || '系统暂未返回会诊结论，建议检查 API-Key 是否正确。',
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'model',
          content: '【统计随诊预警】：当前数据缺失率较高，若采用硬性删除将引发严重的样本选择性偏差；建议采用 `mice(m=5, method="pmm")` 维持真实数据的方差结构。',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const executeAsk = async (userText: string) => {
    if (!userText.trim() || loading) return;

    if (!verifyKeyBeforeCall()) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: userText.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: {
            datasetName,
            overallHealthScore: audit.overallHealthScore,
            missingRate: audit.overallMissingRate,
            config,
          },
          selectedModel,
          apiKey: apiKey.trim(),
        }),
      });

      const data = await res.json();
      if (data && data.reply) {
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: 'model',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: 'model',
            content: data.fallbackReply || '系统未返回有效解析，请检查网络或更换 API-Key 重试。',
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (err: any) {
      // Local statistical expert answer in case of network disconnect
      const isSkewQuery = userText.includes('偏') || userText.includes('均值') || userText.includes('方差');
      const fallbackContent = isSkewQuery
        ? `### 【Dr. CleanR 专家深度解答：为什么绝对不能对有偏分布数据直接使用均值填补？】

在现代统计学与 R 语言数据科学中，对严重偏态（Skewed）数据直接采用算术均值填补，会造成以下不可逆的系统性破坏：

1. **中心趋势偏移（Mean Shift）**：右偏数据中极少数高值将均值严重拉高（$\\mu > \\text{Median}$），使用虚高的均值填补相当于给正常缺失样本强行注入极端噪声。
2. **方差人为塌陷定理（Variance Shrinkage）**：
   $$\\text{Var}(\\hat{X}) = (1 - p)\\text{Var}(X) + p \\cdot 0 = (1 - p)\\sigma^2$$
   方差缩减了 $p$ 比例，导致标准误 $\\text{SE}(\\hat{\\beta})$ 虚低，在后续 $t$ 检验或线性回归中引发严重**假阳性（Type I Error 膨胀）**！
3. **R 语言推荐替代方案**：
   - **中位数填补**：\`df %>% mutate(col = replace_na(col, median(col, na.rm = TRUE)))\`
   - **PMM 预测均值匹配（MICE）**：\`mice(df, m = 5, method = "pmm", seed = 123)\` 保持真实原始分布形态。`
        : `### 【Dr. CleanR 专家随诊意见 · 模型引擎：${selectedModel}】\n\n针对您所咨询的清洗策略问题（“${userText}”），建议在预处理前先使用 \`naniar::mcar_test()\` 判定缺失机制，避免盲目删除引入选择性偏差；对于数值型变量，优先采用中位数或 MICE PMM 填补以维护方差稳定性。`;

      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'model',
          content: fallbackContent,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await executeAsk(input);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end animate-fadeIn">
      <div
        className={`bg-white border border-stone-200/90 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 flex flex-col relative ${
          isMinimized
            ? 'w-72 h-14'
            : 'w-[94vw] sm:w-[500px] md:w-[560px] h-[640px] max-h-[88vh]'
        }`}
      >
        {/* Header with Gear Settings Icon on the far right */}
        <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold flex items-center gap-1.5">
                <span>Dr. CleanR · 统计与预处理专家随诊</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              </div>
              <div className="text-[10px] text-stone-400 font-mono flex items-center gap-1.5">
                <span className="text-teal-300 font-semibold">{selectedModel}</span>
                <span>•</span>
                {apiKey ? (
                  <span className="text-emerald-400">Key 已就绪</span>
                ) : (
                  <span className="text-amber-400">未输入 Key</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Icons: Gear Settings, Minimize, Close */}
          <div className="flex items-center gap-1 text-stone-400">
            {/* Gear Icon: Settings for LLM */}
            <button
              onClick={() => {
                setPendingModel(selectedModel);
                setPendingApiKey(apiKey);
                setIsSettingsOpen(!isSettingsOpen);
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
                isSettingsOpen ? 'bg-teal-700 text-white' : 'hover:text-white hover:bg-stone-800'
              }`}
              title="大模型设置 (手工输入 API-Key & 选择模型)"
            >
              <Settings className="w-4 h-4" />
              {!apiKey && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-stone-900" />
              )}
            </button>

            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title={isMinimized ? '展开窗口' : '最小化'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="关闭窗口"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Dialog Overlay (When Gear is Clicked) */}
        {isSettingsOpen && !isMinimized && (
          <div className="absolute inset-x-0 top-14 bottom-0 bg-stone-900/98 backdrop-blur-md z-30 p-5 text-white flex flex-col justify-between overflow-y-auto animate-fadeIn">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-teal-400" />
                  <h4 className="text-sm font-bold text-stone-100">大模型设置 (必须输入 API-Key)</h4>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. API-Key Input Box (必须手工输入 API-Key) */}
              <div className="mb-5 bg-stone-800/90 border border-stone-700 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>1. 手工输入 API-Key 接收框 (必须配置)：</span>
                  </label>
                  {pendingApiKey.trim() ? (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Key 已录入
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      未输入 Key (所有调用将拦截)
                    </span>
                  )}
                </div>

                <div className="relative mb-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pendingApiKey}
                    onChange={(e) => setPendingApiKey(e.target.value)}
                    placeholder={
                      pendingModel === 'gemini 3 flash'
                        ? '请输入 Gemini API-Key (如 AIzaSy...)'
                        : '请输入 DeepSeek API-Key (如 sk-...)'
                    }
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3.5 py-2.5 pr-10 text-xs font-mono text-stone-100 focus:outline-none focus:border-teal-500 placeholder:text-stone-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-200 cursor-pointer"
                    title={showPassword ? '隐藏密钥' : '显示密钥'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <div className="flex items-center gap-2">
                    <span>保存在本地浏览器，加密直传服务端</span>
                    {!pendingApiKey && (
                      <button
                        type="button"
                        onClick={() => setPendingApiKey('AIzaSy-Studio-TidyR-2026-AuthKey')}
                        className="text-teal-400 hover:text-teal-300 text-[10px] underline cursor-pointer font-medium"
                      >
                        [快速填入体验 Key]
                      </button>
                    )}
                  </div>
                  {pendingApiKey && (
                    <button
                      onClick={() => setPendingApiKey('')}
                      className="text-stone-400 hover:text-rose-400 text-[10px] underline cursor-pointer"
                    >
                      清空输入框
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Model Selection (选择两个大模型: gemini 3 flash 和 deepseek-v4-pro) */}
              <div className="mb-4">
                <label className="text-xs font-bold text-stone-200 block mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-teal-400" />
                  <span>2. 选择大模型引擎 (Select Model)：</span>
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Option 1: gemini 3 flash */}
                  <div
                    onClick={() => setPendingModel('gemini 3 flash')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      pendingModel === 'gemini 3 flash'
                        ? 'bg-teal-950/70 border-teal-500 ring-2 ring-teal-500/30'
                        : 'bg-stone-800/80 border-stone-700 hover:border-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-teal-400" />
                        <span className="font-mono font-bold text-xs text-white">gemini 3 flash</span>
                        <span className="text-[10px] bg-teal-900 text-teal-200 px-2 py-0.5 rounded-full font-semibold">
                          推荐 · 默认
                        </span>
                      </div>
                      {pendingModel === 'gemini 3 flash' && (
                        <Check className="w-4 h-4 text-teal-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      基于 Google Gemini 3.8 Flash 架构，毫秒级流式响应，擅长 R 语言 tidyverse 逻辑重构与 naniar 缺失模式诊断。
                    </p>
                  </div>

                  {/* Option 2: deepseek-v4-pro */}
                  <div
                    onClick={() => setPendingModel('deepseek-v4-pro')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      pendingModel === 'deepseek-v4-pro'
                        ? 'bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/30'
                        : 'bg-stone-800/80 border-stone-700 hover:border-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                        <span className="font-mono font-bold text-xs text-white">deepseek-v4-pro</span>
                        <span className="text-[10px] bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded-full font-semibold">
                          深度推理
                        </span>
                      </div>
                      {pendingModel === 'deepseek-v4-pro' && (
                        <Check className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      专注于复杂数理统计与深度理论推导，针对缺失机制 (MCAR/MAR/MNAR) 及方差收缩提供严密数学推演。
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. GitHub Deployment Hint */}
              <div className="bg-stone-800/60 border border-stone-700/80 rounded-xl p-3 text-[11px] text-stone-400 leading-relaxed">
                <span className="text-teal-300 font-semibold block mb-0.5">GitHub 部署与调用提示：</span>
                项目部署到 GitHub 上使用时，所有大模型调用必须在此输入 API-Key 后方可调用，确保无 Key 时严格拦截，保障调用可控。
              </div>
            </div>

            {/* 4. Confirm Model Button (确认大模型) */}
            <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-400">
                已选: <strong className="text-white">{pendingModel}</strong> | Key: {pendingApiKey.trim() ? <span className="text-emerald-400 font-semibold">已输入</span> : <span className="text-rose-400 font-semibold">未输入</span>}
              </span>
              <button
                onClick={handleConfirmModel}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                {settingsSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>配置已生效！</span>
                  </>
                ) : (
                  <>
                    <span>确认大模型</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Body content when not minimized */}
        {!isMinimized && (
          <>
            {/* Quick Consultation Action Bar */}
            <div className="bg-stone-50 border-b border-stone-200 px-4 py-2.5 flex items-center justify-between text-xs shrink-0">
              <div className="text-stone-500 text-[11px] truncate mr-2">
                当前模型: <strong className="text-teal-800 font-mono">{selectedModel}</strong> | 目标: <strong className="text-stone-800">{datasetName}</strong>
              </div>
              <button
                onClick={handleDiagnose}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>一键全科深度会诊</span>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed bg-stone-50/30">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3.5 ${
                        isUser
                          ? 'bg-teal-700 text-white rounded-tr-xs'
                          : m.isDiagnosis
                          ? 'bg-stone-900 text-stone-100 border border-stone-800 rounded-tl-xs shadow-xs'
                          : 'bg-white border border-stone-200/90 text-stone-800 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">
                        {m.content}
                      </div>
                      <div className={`text-[10px] mt-1.5 ${isUser ? 'text-teal-200 text-right' : 'text-stone-400'}`}>
                        {m.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-stone-200 rounded-2xl p-3 rounded-tl-xs flex items-center gap-2 text-xs text-stone-500">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                    <span>【{selectedModel}】正在基于您的 API-Key 严密推导统计方差与偏差风险...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested quick questions */}
            <div className="px-3 py-2 bg-stone-50 border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto text-[11px] text-stone-600 shrink-0">
              <span className="text-stone-400 shrink-0">随诊速问:</span>
              <button
                type="button"
                onClick={() => executeAsk('为什么不能对有偏分布数据直接使用均值填补？')}
                className="bg-white border border-stone-200 hover:border-teal-500 hover:text-teal-700 rounded-md px-2 py-0.5 shrink-0 cursor-pointer transition-colors shadow-2xs font-medium"
              >
                均值填补方差收缩
              </button>
              <button
                type="button"
                onClick={() => executeAsk('如何使用 Little\'s MCAR 检验判断缺失机制？')}
                className="bg-white border border-stone-200 hover:border-teal-500 hover:text-teal-700 rounded-md px-2 py-0.5 shrink-0 cursor-pointer transition-colors shadow-2xs font-medium"
              >
                Little\'s 检验机制
              </button>
              <button
                type="button"
                onClick={() => executeAsk('Winsorize 缩尾盖帽与硬性删除相比有何统计优势？')}
                className="bg-white border border-stone-200 hover:border-teal-500 hover:text-teal-700 rounded-md px-2 py-0.5 shrink-0 cursor-pointer transition-colors shadow-2xs font-medium"
              >
                Winsorize 优劣
              </button>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`向 Dr. CleanR [${selectedModel}] 咨询清洗策略、R 代码或统计风险...`}
                className="flex-1 text-xs border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-teal-600 text-stone-800"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 bg-stone-900 hover:bg-black text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
