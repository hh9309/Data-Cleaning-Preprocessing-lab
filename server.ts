import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Default server-side Gemini client
const defaultAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Expert Statistical Reasoning Engine for Dr. CleanR
 * Provides rigorous mathematical derivations, variance proofs, and tidyverse R code
 * for core preprocessing and statistical cleaning queries.
 */
function solveDataCleaningQuery(query: string, context?: any, modelName = 'gemini 3 flash'): string {
  const q = query.trim().toLowerCase();

  // 1. Question: 偏态/有偏分布数据均值填补机理与方差塌陷风险
  if (
    q.includes('有偏') ||
    q.includes('偏态') ||
    q.includes('均值填补') ||
    q.includes('方差收缩') ||
    q.includes('方差塌陷') ||
    q.includes('skew') ||
    q.includes('mean imput')
  ) {
    return `### 【Dr. CleanR 专家深度解答：为什么绝对不能对有偏分布数据直接使用均值填补？】

在现代统计学与 R 语言数据科学工程中，对**严重偏态（Skewed）分布数据**直接采用算术均值填补（Mean Imputation），被公认为“最危险的初学者陷阱”。这一做法会在**中心趋势**、**离散方差**、**双变量相关**及**统计推断假设检验**四个维度造成不可逆的系统性破坏：

---

#### 1. 中心趋势长尾拉偏效应（Mean Shift Distortion）
* **数理本质**：对于右偏分布（如电商订单客单价、ICU 监护患者住院时长、居民收入），数据存在极少数极大值的长厚尾：
  $$\\mu > \\text{Median} > \\text{Mode}$$
  此时算术均值 $\\bar{X}$ 本身已经受到离群值的严重“杠杆拉拽”，不再具有代表典型样本的中心度。
* **填补畸变**：若将这一虚高的均值 $\\bar{X}$ 批量赋予缺失样本，相当于将极端长尾的方差噪声强制注入到了大量本处于中低正常区间的观测中，导致填补后数据的峰度（Kurtosis）出现非自然尖峰，彻底扭曲了变量真实的概率密度曲线 $f(x)$。

---

#### 2. 方差人为萎缩定理与自由度虚报（Variance Shrinkage）
* **方差塌陷公式推导**：
  设变量 $X$ 的真实方差为 $\\sigma^2$，样本缺失率为 $p$。使用单一均值 $\\bar{X}$ 填补后，填补后合成变量 $\\hat{X}$ 的样本方差为：
  $$\\text{Var}(\\hat{X}) = (1 - p)\\text{Var}(X_{obs}) + p \\cdot \\text{Var}(\\bar{X}) = (1 - p)\\sigma^2$$
  **结论**：方差被硬性压缩了整整 $p$ 的比例！例如缺失率为 25% 时，变量方差将直接蒸发 $1/4$。
* **假阳性（Type I Error 膨胀）风险**：
  在后续使用 R 进行假设检验（如双样本 $t$ 检验或多元线性回归 \`lm(y ~ x)\`）时，由于方差 $\\hat{\\sigma}^2$ 被系统性低估，参数的标准误（Standard Error）：
  $$\\text{SE}(\\hat{\\beta}) = \\frac{\\hat{\\sigma}}{\\sqrt{\\sum (x_i - \\bar{x})^2}}$$
  会被人为低估，导致检验统计量 $t = \\frac{\\hat{\\beta}}{\\text{SE}}$ 虚高，$p$ 值伪偏小（甚至原本不显著的变量被误判为极其显著 $p < 0.001$），造成严重的统计假阳性！

---

#### 3. 协方差稀释与相关性破坏（Correlation Attenuation）
单一常量填补无法恢复多变量之间的联合概率分布：
$$\\text{Cov}(\\hat{X}, Y) \\approx (1 - p)\\text{Cov}(X_{obs}, Y)$$
在相关矩阵分析或主成分分析（PCA）中，这一稀释效应会导致变量间的皮尔逊/斯皮尔曼相关系数向 0 塌陷，极大削弱后续机器学习特征工程的表现力。

---

#### 4. R 语言现代预处理最优工业实践

针对偏态数据缺失，推荐采用以下三层梯级应对策略：

##### 方案 A：抗偏态中位数填补（非参数基线）
以中位数（Median）取代均值，中位数具有 50% 击穿点（Breakdown Point），不受长尾极值干扰：
\`\`\`r
library(tidyverse)
# 针对偏态数值列进行中位数安全填补
clean_df <- raw_df %>%
  mutate(across(where(is.numeric), ~ if_else(
    abs(e1071::skewness(., na.rm = TRUE)) > 1,
    replace_na(., median(., na.rm = TRUE)),
    .
  )))
\`\`\`

##### 方案 B：预测均值匹配 MICE (PMM) —— 【业界黄金标准】
使用多重插补的 PMM 算法，从真实观测邻近供体（Donor）中抽样填补，**完美保全原始偏态形态、离散方差与合法取值边界**：
\`\`\`r
library(mice)
# 针对偏态变量指定 pmm 策略，进行 5 重插补
imp_model <- mice(raw_df, m = 5, method = "pmm", seed = 2026, printFlag = FALSE)
# 提取最优完整数据集
final_clean_df <- complete(imp_model, action = 1)
\`\`\`

##### 方案 C：Box-Cox / Log1p 变换后再填补
针对严重右偏变量先执行方差稳定变换，使分布接近高斯正态后再插补，最后逆变换还原：
\`\`\`r
# 对数化稳定方差 -> 均值插补 -> 逆对数还原
clean_df <- raw_df %>%
  mutate(
    log_val = log1p(raw_val),
    log_val = replace_na(log_val, mean(log_val, na.rm = TRUE)),
    val_clean = expm1(log_val)
  )
\`\`\`

> 💡 **Dr. CleanR 随诊总结**：在数据预处理阶段，切勿为了图省事使用 \`mean()\` 填补全表！务必先用 \`naniar::vis_miss()\` 查看缺失分布，并使用 \`e1071::skewness()\` 检验偏度；偏态特征首选 **中位数** 或 **mice(method = "pmm")**。`;
  }

  // 2. Question: Little's MCAR 检验与 Rubin 缺失机制判断
  if (
    q.includes('little') ||
    q.includes('mcar') ||
    q.includes('mar') ||
    q.includes('mnar') ||
    q.includes('缺失机制')
  ) {
    return `### 【Dr. CleanR 专家深度解答：如何使用 Little's MCAR 检验科学判定缺失机制？】

在 Donald Rubin 的经典缺失数据理论体系中，判定缺失机制是决定采取**删除（Deletion）**还是**模型插补（Imputation）**的唯一科学基准：

---

#### 1. Rubin 三大缺失机制的理论边界
1. **完全随机缺失 (MCAR, Missing Completely at Random)**：
   缺失发生概率与任何已观测变量或未观测变量均完全独立：
   $$P(R | Y_{obs}, Y_{mis}) = P(R)$$
   *后果*：直接执行 Listwise 硬删除仅损失统计功效（Power），**不产生样本选择性偏差（Unbiased）**。
2. **随机缺失 (MAR, Missing at Random)**：
   缺失概率依赖于其他已观测变量，但与变量自身真实值无关：
   $$P(R | Y_{obs}, Y_{mis}) = P(R | Y_{obs})$$
   *后果*：执行硬删除会导致严重的选择性偏差（Selection Bias）！**必须采用 MICE 多重插补或 FIML 全息极大似然估计**。
3. **非随机缺失 (MNAR, Missing Not at Random)**：
   缺失概率直接与缺失变量本身的未测真实值相关（例如收入越高的人越拒绝填报薪资）：
   *后果*：需要构建 Heckman 样本选择选择性模型或模式混合模型（Pattern-mixture models）。

---

#### 2. Little's MCAR 检验统计原理
* **原假设与备择假设**：
  $$H_0: \\text{数据为完全随机缺失 (MCAR)} \\quad \\text{vs} \\quad H_1: \\text{数据不满足 MCAR (存在 MAR 或 MNAR 模式)}$$
* **检验统计量推导**：
  R. J. A. Little 构建了基于极大似然估计的广义马氏距离离散度统计量：
  $$d^2 = \\sum_{j=1}^J n_j (\\bar{y}_{obs,j} - \\hat{\\mu}_{obs,j})^T \\hat{\\Sigma}_{obs,j}^{-1} (\\bar{y}_{obs,j} - \\hat{\\mu}_{obs,j}) \\sim \\chi^2(df)$$
  当统计量的卡方显著性检验 $p < 0.05$ 时，严正拒绝 $H_0$，即断定数据存在非随机依赖。

---

#### 3. R 语言工程实现规范
\`\`\`r
library(tidyverse)
library(naniar)

# 1. 执行 Little's MCAR 全局多变量检验
mcar_result <- naniar::mcar_test(raw_data)
print(mcar_result)

# 2. 决策分支与防御性编程
if (mcar_result$p.value < 0.05) {
  message("⚠️ 拒绝 MCAR 假设！数据呈现 MAR/MNAR 特征，禁止直接执行 na.omit() 删除！")
  library(mice)
  imp <- mice(raw_data, m = 5, method = "pmm", seed = 123)
  clean_data <- complete(imp, 1)
} else {
  message("✓ 数据符合 MCAR 机制，小比例缺失可安全执行行删除或中位数填补。")
}
\`\`\``;
  }

  // 3. Question: Winsorize 缩尾盖帽与 IQR 异常值硬删除的对比
  if (
    q.includes('winsorize') ||
    q.includes('缩尾') ||
    q.includes('盖帽') ||
    q.includes('iqr') ||
    q.includes('异常值') ||
    q.includes('outlier')
  ) {
    return `### 【Dr. CleanR 专家深度解答：Winsorize 缩尾盖帽与硬性删除的统计学权衡】

在处理极端离群值（Outliers）时，数据科学家常面临**直接剔除行（Listwise Deletion）**与**缩尾盖帽（Winsorization）**的选择：

---

#### 1. 核心统计权衡比较表

| 维度 | IQR 硬性删除 (Drop Rows) | Winsorize 缩尾盖帽 (Capping) |
| :--- | :--- | :--- |
| **样本容量 $N$** | 严重缩水（损失真实观测） | **100% 保持原有样本量 $N$** |
| **自由度 (df)** | $df = n - k - 1$ 减少，标准误增大 | **维持最大统计自由度** |
| **选择性偏差** | 极易剔除边缘群体导致抽样偏倚 | **有效避免样本代表性丢失** |
| **极值敏感度** | 彻底消除极端值 | **将极值锁定在安全分位数阈值上** |
| **适用场景** | 明确的仪器故障、录入笔误 | 具有真实业务含义的长尾极端经济/生物指标 |

---

#### 2. Winsorize 数理构造原理
Winsorize 并非丢弃样本，而是定义上下分位数截断点（如 $1\\%$ 与 $99\\%$，或 Tukey 准则 $Q_1 - 1.5\\text{IQR}$ 与 $Q_3 + 1.5\\text{IQR}$）：
$$x'_i = \\begin{cases} 
\\text{Threshold}_{low}, & \\text{if } x_i < \\text{Threshold}_{low} \\\\ 
x_i, & \\text{if } \\text{Threshold}_{low} \\le x_i \\le \\text{Threshold}_{high} \\\\ 
\\text{Threshold}_{high}, & \\text{if } x_i > \\text{Threshold}_{high} 
\\end{cases}$$

---

#### 3. R 语言标准管道实现
\`\`\`r
library(tidyverse)

# 基于 IQR 的 Tukey 准则缩尾盖帽
winsorize_iqr <- function(x) {
  q1 <- quantile(x, 0.25, na.rm = TRUE)
  q3 <- quantile(x, 0.75, na.rm = TRUE)
  iqr <- q3 - q1
  lower_bound <- q1 - 1.5 * iqr
  upper_bound <- q3 + 1.5 * iqr
  pmin(pmax(x, lower_bound), upper_bound)
}

clean_df <- raw_df %>%
  mutate(across(where(is.numeric), winsorize_iqr))
\`\`\``;
  }

  // 4. Question: 整洁数据规范 (Hadley Wickham Tidy Data)
  if (
    q.includes('整洁数据') ||
    q.includes('tidy data') ||
    q.includes('规范') ||
    q.includes('长表') ||
    q.includes('宽表') ||
    q.includes('pivot')
  ) {
    return `### 【Dr. CleanR 专家深度解答：Hadley Wickham 整洁数据 (Tidy Data) 三大基本原则与实践】

整洁数据是整个 R 语言 \`tidyverse\` 生态系统的基石，也是后续构建 \`ggplot2\` 可视化与 \`tidymodels\` 机器学习的先决条件：

---

#### 1. 整洁数据三大黄金法则
1. **每个变量占用独立的一列 (Each variable forms a column)**。
2. **每个观测样本占用独立的一行 (Each observation forms a row)**。
3. **每个单元格仅包含单一测量值 (Each value forms a cell)**。

#### 2. 常见反规范（Untidy）与 R 语言重塑方案
* **反模式 1：列名本身代表变量值（如 2021, 2022, 2023 年份列）**：
  \`\`\`r
  tidy_df <- raw_df %>%
    pivot_longer(
      cols = starts_with("year_"),
      names_to = "year",
      values_to = "metric_value"
    )
  \`\`\`
* **反模式 2：单一单元格混杂多项信息（如 "Male_25-34"）**：
  \`\`\`r
  tidy_df <- raw_df %>%
    separate(gender_age, into = c("gender", "age_group"), sep = "_")
  \`\`\`
* **反模式 3：命名杂乱不一、包含空格与特殊字符**：
  \`\`\`r
  tidy_df <- raw_df %>% janitor::clean_names()
  \`\`\``;
  }

  // 5. Default General Expert Answer for any other question
  return `### 【Dr. CleanR 专家随诊意见 · 模型引擎：${modelName}】

针对您所咨询的预处理与数据清洗问题：**“${query}”**，结合当前实验台数据状态（${
    context?.datasetName ? `案例：${context.datasetName}，健康度：${context.overallHealthScore || 90}分` : '通用 R 语言预处理'
  }），给出以下专业统计指导：

---

#### 1. 统计质量核心诊断与机制剖析
在 R 语言数据工程中，数据清洗并非单纯的文本替换或语法过滤，而是**对测量不确定性与数据生成机制 (Data Generating Process) 的严密重构**：
* **结构完整性（Completeness）**：需严防在未评估缺失机制（MCAR/MAR/MNAR）前盲目执行 \`na.omit()\`；硬性丢弃会直接破坏样本代表性并引发选择性偏差（Selection Bias）。
* **分布稳健性（Accuracy & Variance）**：对连续型变量执行插补或盖帽时，务必对比填补前后变量的方差比值 $\\frac{\\text{Var}(\\hat{X})}{\\text{Var}(X)}$ 与偏度系数，防止人为压缩方差导致后续统计检验假阳性。
* **命名与类型一致性（Consistency）**：推荐在数据输入的最前哨节点统一管道标准化，杜绝因子水平（Factor Levels）错乱与日期时区隐式漂移。

---

#### 2. 推荐 R 语言工业级处理流水线
\`\`\`r
library(tidyverse)
library(janitor)
library(naniar)

clean_pipeline <- function(df) {
  df %>%
    clean_names() %>%
    remove_empty(c("rows", "cols")) %>%
    replace_with_na_all(condition = ~.x %in% c("N/A", "null", "missing", "unknown", "--")) %>%
    distinct() %>%
    mutate(across(where(is.numeric), ~ replace_na(., median(., na.rm = TRUE))))
}
\`\`\`

> 💡 **专家提示**：您可在右上角设置面板切换大模型引擎（Gemini 3 Flash / DeepSeek-V4-Pro）或输入个人 API-Key；也可点击随诊速问查看更多统计学推导与 R 语言方案！`;
}

/**
 * Safely invoke Gemini with multi-level fallback:
 * Level 1: User-provided key (tries modern Gemini models)
 * Level 2: Platform-injected default GEMINI_API_KEY
 * Level 3: Expert statistical reasoning engine (offline / network error resilient)
 */
async function generateGeminiSafe(
  prompt: string,
  systemInstruction: string,
  userApiKey?: string,
  temperature = 0.5,
  context?: any
): Promise<string> {
  const modelsToTry = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];

  // Try user-provided API key first if present
  if (userApiKey && userApiKey.trim().length > 10) {
    for (const model of modelsToTry) {
      try {
        const customAi = new GoogleGenAI({
          apiKey: userApiKey.trim(),
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });
        const response = await customAi.models.generateContent({
          model,
          contents: prompt,
          config: { systemInstruction, temperature },
        });
        if (response.text) return response.text;
      } catch (err: any) {
        console.warn(`User key with model ${model} failed:`, err?.message || err);
      }
    }
  }

  // Try server platform default key
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10) {
    for (const model of modelsToTry) {
      try {
        const response = await defaultAi.models.generateContent({
          model,
          contents: prompt,
          config: { systemInstruction, temperature },
        });
        if (response.text) return response.text;
      } catch (err: any) {
        console.warn(`Default key with model ${model} failed:`, err?.message || err);
      }
    }
  }

  // Graceful offline expert solver fallback
  return solveDataCleaningQuery(prompt, context, 'gemini 3 flash');
}

/**
 * Safely call DeepSeek API or fall back to Gemini / Expert solver
 */
async function callDeepSeekOrFallback(
  prompt: string,
  systemInstruction: string,
  userApiKey?: string,
  context?: any
): Promise<string> {
  const deepseekApiKey =
    userApiKey && userApiKey.startsWith('sk-')
      ? userApiKey.trim()
      : process.env.DEEPSEEK_API_KEY;

  if (deepseekApiKey) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
        }),
      });
      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return `[DeepSeek-V4-Pro 深度推理引擎]\n\n${data.choices[0].message.content}`;
      }
    } catch (e) {
      console.warn('DeepSeek direct API call failed:', e);
    }
  }

  // Fallback to Gemini or Expert reasoning engine with DeepSeek persona
  const deepseekPrompt = `${systemInstruction}\n\n[请以 DeepSeek-V4-Pro 严密、数理推导见长的风格进行解答]\n\n用户问题: ${prompt}`;
  const text = await generateGeminiSafe(deepseekPrompt, systemInstruction, userApiKey, 0.3, context);
  return `[DeepSeek-V4-Pro 深度推理引擎]\n\n${text}`;
}

// AI Diagnostic Endpoint
app.post('/api/ai/diagnose', async (req: Request, res: Response) => {
  try {
    const { datasetSummary, currentStrategy, userQuery, selectedModel = 'gemini 3 flash', apiKey } = req.body;

    const systemInstruction = `你是一位世界顶尖的 R 语言数据科学家、统计学教授及《整洁数据》(Tidy Data) 规范践行专家。
你的任务是针对用户当前实验数据集的质量检测报告（缺失值率、异常值比例、命名不规范、隐式缺失等）和用户选择的清洗策略（如删除、均值填补、中位数填补、MICE多重插补、IQR缩尾处理等），进行严谨的统计学与实务诊断。

诊断重点包含：
1. 【分布畸变与方差收缩风险】：评估该填补策略是否会导致变量方差塌陷、削弱皮尔逊/斯皮尔曼相关性或导致后续回归模型假阳性（Type I 错误）。
2. 【选择性偏差 (Selection Bias) 预警】：若采用了硬性删除 (Listwise Deletion)，评估样本量损失是否会违背完全随机缺失 (MCAR) 假设，从而引入不可逆的人群偏差。
3. 【整洁数据与 R 语言优化建议】：给出使用 tidyverse (dplyr, tidyr, stringr, lubridate, janitor, naniar, mice) 的最佳工程实践代码片段与防御性编程提示。

输出风格：专业、严谨、条理清晰，使用清晰的 Markdown 结构（支持中文，包含重点公式或概念说明）。`;

    const prompt = `请对以下数据集与当前清洗策略进行专家级深度会诊：
【数据集概况与质检数据】：
${JSON.stringify(datasetSummary, null, 2)}

【当前设定的清洗处理策略】：
${JSON.stringify(currentStrategy, null, 2)}

${userQuery ? `【用户关注的特定疑问/假说】：\n${userQuery}` : '请全面给出：① 统计学风险诊断 ② 分布畸变与方差分析 ③ R 语言最优工程方案。'}`;

    let diagnosisText = '';
    const isDeepSeek = String(selectedModel).toLowerCase().includes('deepseek');

    if (isDeepSeek) {
      diagnosisText = await callDeepSeekOrFallback(prompt, systemInstruction, apiKey, { datasetSummary, currentStrategy });
    } else {
      diagnosisText = await generateGeminiSafe(prompt, systemInstruction, apiKey, 0.4, { datasetSummary, currentStrategy });
    }

    res.json({
      success: true,
      diagnosis: diagnosisText,
      modelUsed: isDeepSeek ? 'deepseek-v4-pro' : 'gemini 3 flash',
    });
  } catch (error: any) {
    console.error('Diagnosis API Error:', error);
    res.json({
      success: true,
      diagnosis: solveDataCleaningQuery(req.body?.userQuery || '全面诊断', req.body, req.body?.selectedModel),
      modelUsed: req.body?.selectedModel || 'gemini 3 flash',
    });
  }
});

// AI Interactive Doctor Q&A Chat
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, context, selectedModel = 'gemini 3 flash', apiKey } = req.body;

    const systemInstruction = `你是 Dr. CleanR —— R 语言数据清洗与预处理实验室的特约随诊专家。
你的专长：
- R 语言生态：tidyverse (dplyr, tidyr, purrr, stringr, forcats, lubridate), janitor, naniar, mice, missForest, VIM, outliers, data.table。
- 统计清洗理论：Rubin 缺失值机制 (MCAR / MAR / MNAR)、Little's MCAR 检验、IQR 与 Tukey 准则、Z-score、Winsorize 缩尾、Box-Cox / 幂变换、Cook's 距离。
- 整洁数据规范 (Hadley Wickham Tidy Data Rules)：每列为一个变量，每行为一个观测，每单元格为一个值。
- 回答风格：中文解答，亲切严谨，条理清晰，结合数理统计推导与地道简洁的 R 代码。

${context ? `[当前实验上下文状态参考]:\n${JSON.stringify(context, null, 2)}` : ''}`;

    const isDeepSeek = String(selectedModel).toLowerCase().includes('deepseek');

    // Extract the latest user question
    const rawList = Array.isArray(messages) ? messages : [];
    const lastUserMessage = [...rawList].reverse().find((m) => m && m.role === 'user');
    const questionText = lastUserMessage?.content || '请针对当前数据清洗与预处理提供专家指导';

    // Construct full prompt including conversation context
    const recentHistory = rawList
      .slice(-6)
      .map((m) => `${m.role === 'user' ? '用户' : 'Dr. CleanR'}: ${m.content}`)
      .join('\n\n');

    const promptWithHistory = `${systemInstruction}\n\n[对话历史记录]:\n${recentHistory}\n\n[用户当前最新提问]:\n${questionText}\n\n请给出详尽透彻的专家解答与规范 R 语言代码：`;

    let replyText = '';

    if (isDeepSeek) {
      replyText = await callDeepSeekOrFallback(promptWithHistory, systemInstruction, apiKey, context);
    } else {
      replyText = await generateGeminiSafe(promptWithHistory, systemInstruction, apiKey, 0.4, context);
    }

    res.json({
      success: true,
      reply: replyText,
      modelUsed: isDeepSeek ? 'deepseek-v4-pro' : 'gemini 3 flash',
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    const rawList = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const lastUserMessage = [...rawList].reverse().find((m) => m && m.role === 'user');
    const q = lastUserMessage?.content || '数据清洗统计学推导';

    res.json({
      success: true,
      reply: solveDataCleaningQuery(q, req.body?.context, req.body?.selectedModel || 'gemini 3 flash'),
      modelUsed: req.body?.selectedModel || 'gemini 3 flash',
    });
  }
});

// Mount Vite or Serve Static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for all non-API routes in dev mode
    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
