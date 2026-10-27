import { CaseStudy, CleaningPipelineConfig } from '../types';

export function generateRScript(
  caseStudy: CaseStudy,
  config: CleaningPipelineConfig
): string {
  const codeLines: string[] = [];

  codeLines.push('# ==============================================================================');
  codeLines.push('# R Tidyverse / Janitor / Naniar / MICE Data Cleaning Engine');
  codeLines.push(`# Scenario: ${caseStudy.title} (${caseStudy.domain})`);
  codeLines.push('# Follows Hadley Wickham Tidy Data Principles');
  codeLines.push('# All graphics (titles, labels, legends) are configured in English');
  codeLines.push('# NOTE: Self-contained script. Copy and run directly in RStudio / Posit Cloud.');
  codeLines.push('# ==============================================================================\n');

  codeLines.push('# 1. Environment & Package Initialization');
  codeLines.push('suppressPackageStartupMessages({');
  codeLines.push('  library(tidyverse)    # Core Tidyverse: dplyr, tidyr, stringr, readr, purrr, ggplot2');
  codeLines.push('  library(janitor)      # Standardized snake_case naming & duplicate audits');
  codeLines.push('  library(naniar)       # Missing value diagnostics & heatmap visualization');
  codeLines.push('  library(mice)         # Multivariate Imputation by Chained Equations');
  codeLines.push('  library(lubridate)    # Robust date-time parsing');
  codeLines.push('  library(DescTools)    # Robust statistics & Winsorization');
  codeLines.push('})\n');

  codeLines.push('# 2. Reproducible Raw Dirty Dataset (Self-Contained for External R Run)');
  codeLines.push('# (You can replace this tribble block with: df_raw <- read_csv("your_file.csv"))');
  
  // Format sample rows into tribble
  const tribbleHeader = caseStudy.rawColumns.map(c => `~"${c}"`).join(', ');
  codeLines.push(`df_raw <- tibble::tribble(`);
  codeLines.push(`  ${tribbleHeader},`);

  caseStudy.rawData.slice(0, 10).forEach(row => {
    const vals = caseStudy.rawColumns.map(col => {
      const v = row[col];
      if (v === null || v === undefined) return 'NA';
      return JSON.stringify(String(v));
    });
    codeLines.push(`  ${vals.join(', ')},`);
  });
  codeLines.push(')\n');

  codeLines.push('# 3. Exploratory Data Audit & Missing Value Diagnostic Plot');
  codeLines.push('cat(">>> [Phase 1] Inspecting raw dataset structure and missing patterns...\\n")');
  codeLines.push('glimpse(df_raw)\n');
  codeLines.push('# Plot 1: Missingness Heatmap Overview (English Title, Axes & Legend)');
  codeLines.push('vis_miss(df_raw) +');
  codeLines.push('  labs(');
  codeLines.push('    title = "Missing Value Patterns Heatmap",');
  codeLines.push('    subtitle = "Diagnostic evaluation of raw missingness across features",');
  codeLines.push('    x = "Variables",');
  codeLines.push('    y = "Observations (Rows)",');
  codeLines.push('    fill = "Value Status"');
  codeLines.push('  ) +\n  theme_minimal()\n');

  codeLines.push('# 4. Tidyverse Data Cleaning Pipeline (dplyr / janitor / stringr)');
  codeLines.push('df_cleaned <- df_raw %>%');

  // Step A: janitor
  if (config.cleanColNames) {
    codeLines.push('  # [Operator N_clean]: Standardize column names to snake_case');
    codeLines.push('  clean_names() %>%');
  }

  // Step B: Deduplicate
  if (config.removeDuplicates) {
    if (config.dedupKey) {
      const cleanKey = config.cleanColNames ? config.dedupKey.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') : config.dedupKey;
      codeLines.push(`  # [Operator sigma_dedup]: Deduplicate based on primary key [${cleanKey}]`);
      codeLines.push(`  distinct(${cleanKey}, .keep_all = TRUE) %>%`);
    } else {
      codeLines.push('  # [Operator sigma_dedup]: Remove identical duplicate rows');
      codeLines.push('  distinct() %>%');
    }
  }

  // Step C: String trimming and clean illegal characters
  if (config.trimWhitespace || config.removeIllegalChars) {
    codeLines.push('  # [Operator N_text]: Regex whitespace collapse & HTML entity normalization');
    codeLines.push('  mutate(across(where(is.character), ~ {');
    codeLines.push('    .x %>%');
    codeLines.push('      str_replace_all("&amp;", "&") %>%');
    codeLines.push('      str_replace_all("&lt;", "<") %>%');
    codeLines.push('      str_replace_all("&gt;", ">") %>%');
    codeLines.push('      str_replace_all("&quot;", "\\"") %>%');
    codeLines.push('      str_squish()');
    codeLines.push('  })) %>%');
  }

  // Step D: Outliers
  Object.keys(config.outlierStrategies).forEach(col => {
    const strat = config.outlierStrategies[col];
    if (strat === 'none') return;
    if (strat === 'drop') {
      codeLines.push(`  # [Operator Phi_filter]: Truncate outliers on [${col}] via Tukey IQR rule`);
      codeLines.push(`  filter(!is.na(${col}) & between(${col}, quantile(${col}, 0.25, na.rm=T) - 1.5*IQR(${col}, na.rm=T), quantile(${col}, 0.75, na.rm=T) + 1.5*IQR(${col}, na.rm=T))) %>%`);
    } else if (strat === 'winsorize') {
      codeLines.push(`  # [Operator Phi_winsorize]: Robust Winsorization (cap extremes at 5th and 95th percentiles)`);
      codeLines.push(`  mutate(${col} = DescTools::Winsorize(${col}, probs = c(0.05, 0.95), na.rm = TRUE)) %>%`);
    } else if (strat === 'log_transform') {
      codeLines.push(`  # [Operator Phi_log]: Log transformation for right-skewed tail distributions`);
      codeLines.push(`  mutate(${col} = log1p(pmax(0, ${col}))) %>%`);
    }
  });

  // Step E: Imputation
  const imputeCols = Object.keys(config.imputeStrategies).filter(c => config.imputeStrategies[c] !== 'none');
  if (imputeCols.length > 0) {
    imputeCols.forEach(col => {
      const method = config.imputeStrategies[col];
      if (method === 'drop_na') {
        codeLines.push(`  # [Operator sigma_dropna]: Listwise deletion on [${col}]`);
        codeLines.push(`  drop_na(${col}) %>%`);
      } else if (method === 'mean') {
        codeLines.push(`  # [Operator I_mean]: Mean imputation on [${col}] (Caution: shrinks variance)`);
        codeLines.push(`  mutate(${col} = if_else(is.na(${col}), mean(${col}, na.rm = TRUE), ${col})) %>%`);
      } else if (method === 'median') {
        codeLines.push(`  # [Operator I_median]: Robust median imputation on [${col}]`);
        codeLines.push(`  mutate(${col} = if_else(is.na(${col}), median(${col}, na.rm = TRUE), ${col})) %>%`);
      } else if (method === 'locf') {
        codeLines.push(`  # [Operator I_locf]: Last observation carried forward (time series)`);
        codeLines.push(`  tidyr::fill(${col}, .direction = "down") %>%`);
      }
    });
  }

  // Close pipeline
  codeLines.push('  identity()\n');

  // If MICE was selected
  const hasMice = Object.values(config.imputeStrategies).includes('mice_pmm');
  if (hasMice) {
    codeLines.push('# 5. [Advanced Operator I_mice]: Multiple Imputation by Chained Equations (PMM)');
    codeLines.push('cat(">>> Running MICE chained equations (m = 5, method = \'pmm\')...\\n")');
    codeLines.push('mice_mod <- mice(df_cleaned, m = 5, method = "pmm", maxit = 10, printFlag = FALSE)');
    codeLines.push('df_cleaned <- complete(mice_mod, 1)  # Extract 1st balanced imputed dataset\n');
    codeLines.push('# Plot 2: Density Comparison (English Titles & Labels)');
    codeLines.push('densityplot(');
    codeLines.push('  mice_mod,');
    codeLines.push('  main = "Kernel Density Comparison: Observed vs Imputed",');
    codeLines.push('  xlab = "Feature Value",');
    codeLines.push('  ylab = "Density Kernel",');
    codeLines.push('  col = c("#0f766e", "#f43f5e")');
    codeLines.push(')\n');
  }

  // Pivot longer if enabled
  if (config.pivotLonger?.enabled && config.pivotLonger.cols.length > 0) {
    const { cols, namesTo, valuesTo } = config.pivotLonger;
    codeLines.push('# 6. [Operator rho_pivot]: Reshape Wide Format to Tidy Long Format');
    codeLines.push(`df_cleaned <- df_cleaned %>%`);
    codeLines.push(`  pivot_longer(`);
    codeLines.push(`    cols = c(${cols.map(c => `"${c}"`).join(', ')}),`);
    codeLines.push(`    names_to = "${namesTo}",`);
    codeLines.push(`    values_to = "${valuesTo}"`);
    codeLines.push(`  )\n`);
  }

  codeLines.push('# 7. Quality Verification & Distribution Plots');
  codeLines.push('cat(">>> [Phase 3] Preprocessing Audit Summary:\\n")');
  codeLines.push('cat("  [Raw Data]     Rows:", nrow(df_raw), "Columns:", ncol(df_raw), "\\n")');
  codeLines.push('cat("  [Cleaned Data] Rows:", nrow(df_cleaned), "Columns:", ncol(df_cleaned), "\\n")');
  codeLines.push('cat("  [Remaining NA] Cells:", sum(is.na(df_cleaned)), "\\n")\n');

  codeLines.push('# Plot 3: Cleaned Dataset Distribution Boxplot (English Titles & Legend)');
  codeLines.push('numeric_cols <- names(select(df_cleaned, where(is.numeric)))');
  codeLines.push('if (length(numeric_cols) > 0) {');
  codeLines.push('  target_col <- numeric_cols[1]');
  codeLines.push('  boxplot(');
  codeLines.push('    df_cleaned[[target_col]],');
  codeLines.push('    main = paste("Tukey Outlier Audit for", target_col),');
  codeLines.push('    ylab = "Standardized Value",');
  codeLines.push('    xlab = "Cleaned Feature Distribution",');
  codeLines.push('    col = "#2dd4bf",');
  codeLines.push('    border = "#0f766e"');
  codeLines.push('  )');
  codeLines.push('}\n');

  codeLines.push('# 8. Export Clean Tidy Data');
  codeLines.push('write_csv(df_cleaned, "cleaned_tidy_dataset.csv")');
  codeLines.push('cat(">>> Cleaned dataset saved to cleaned_tidy_dataset.csv successfully.\\n")');

  return codeLines.join('\n');
}
