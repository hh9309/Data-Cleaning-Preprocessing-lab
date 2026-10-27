/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { CASE_STUDIES } from './data/sampleDatasets';
import { CaseStudy, CleaningPipelineConfig, ImputeMethod, OutlierStrategy } from './types';
import { scanDataset } from './utils/qualityScanner';
import { executeCleaningPipeline } from './utils/cleaningAlgebra';
import { generateRScript } from './utils/rCodeGenerator';

// Components
import { Navbar, ModuleKey } from './components/Navbar';
import { ModuleAlgebra } from './components/ModuleAlgebra';
import { ModuleQualityAudit } from './components/ModuleQualityAudit';
import { ModuleMissingImpute } from './components/ModuleMissingImpute';
import { ModuleOutliers } from './components/ModuleOutliers';
import { ModuleCases } from './components/ModuleCases';
import { ModuleRScript } from './components/ModuleRScript';
import { ModuleWorkflow } from './components/ModuleWorkflow';
import { ModuleExport } from './components/ModuleExport';
import { ModuleKnowledgeSlices } from './components/ModuleKnowledgeSlices';
import { AiDoctorModal } from './components/AiDoctorModal';

export default function App() {
  const [activeCase, setActiveCase] = useState<CaseStudy>(CASE_STUDIES[0]);
  const [activeModule, setActiveModule] = useState<ModuleKey>('quality');
  const [isAiDoctorOpen, setIsAiDoctorOpen] = useState(false);

  // Cleaning Pipeline Configuration State
  const [config, setConfig] = useState<CleaningPipelineConfig>({
    cleanColNames: true,
    removeDuplicates: true,
    dedupKey: activeCase.primaryKey,
    dedupKeep: 'first',
    trimWhitespace: true,
    removeIllegalChars: true,
    imputeStrategies: {},
    outlierMethods: {},
    outlierThresholds: {},
    outlierStrategies: {},
  });

  // Calculate Raw Audit
  const rawAudit = useMemo(() => {
    return scanDataset(activeCase.rawData, activeCase.rawColumns, activeCase.primaryKey);
  }, [activeCase]);

  // Execute cleaning pipeline
  const { cleanData, cleanColumns, appliedSteps } = useMemo(() => {
    return executeCleaningPipeline(activeCase.rawData, config, activeCase.rawColumns);
  }, [activeCase, config]);

  // Calculate Cleaned Audit
  const cleanAudit = useMemo(() => {
    return scanDataset(cleanData, cleanColumns);
  }, [cleanData, cleanColumns]);

  // Generate dynamic R script
  const rScript = useMemo(() => {
    return generateRScript(activeCase, config);
  }, [activeCase, config]);

  // Handlers for updating configuration
  const handleUpdateImputeStrategy = (col: string, method: ImputeMethod) => {
    setConfig(prev => ({
      ...prev,
      imputeStrategies: {
        ...prev.imputeStrategies,
        [col]: method,
      },
    }));
  };

  const handleUpdateOutlierStrategy = (col: string, strat: OutlierStrategy) => {
    setConfig(prev => ({
      ...prev,
      outlierStrategies: {
        ...prev.outlierStrategies,
        [col]: strat,
      },
    }));
  };

  const handleToggleDuplicates = (val: boolean) => {
    setConfig(prev => ({ ...prev, removeDuplicates: val }));
  };

  const handleSelectDedupKey = (key: string) => {
    setConfig(prev => ({ ...prev, dedupKey: key || undefined }));
  };

  const handleSelectCase = (newCase: CaseStudy) => {
    setActiveCase(newCase);
    // Reset or configure default recipe for new case
    setConfig({
      cleanColNames: true,
      removeDuplicates: true,
      dedupKey: newCase.primaryKey,
      dedupKeep: 'first',
      trimWhitespace: true,
      removeIllegalChars: true,
      imputeStrategies: {},
      outlierMethods: {},
      outlierThresholds: {},
      outlierStrategies: {},
    });
  };

  // One-click apply preset best-practice recipe
  const handleApplyPresetRecipe = (caseStudy: CaseStudy) => {
    const newConfig: CleaningPipelineConfig = {
      cleanColNames: true,
      removeDuplicates: true,
      dedupKey: caseStudy.primaryKey,
      dedupKeep: 'first',
      trimWhitespace: true,
      removeIllegalChars: true,
      imputeStrategies: {},
      outlierMethods: {},
      outlierThresholds: {},
      outlierStrategies: {},
    };

    if (caseStudy.id === 'ecommerce') {
      newConfig.imputeStrategies['Raw Amount'] = 'mice_pmm';
      newConfig.imputeStrategies['Discount Rate'] = 'median';
      newConfig.outlierStrategies['Raw Amount'] = 'drop';
      newConfig.outlierStrategies['Shipping Fee'] = 'winsorize';
    } else if (caseStudy.id === 'clinical') {
      newConfig.imputeStrategies['Biomarker_X_ngml'] = 'mice_pmm';
      newConfig.outlierStrategies['Systolic_BP'] = 'drop';
      newConfig.outlierStrategies['Age'] = 'drop';
    } else if (caseStudy.id === 'financial') {
      newConfig.imputeStrategies['Credit_Score'] = 'median';
      newConfig.outlierStrategies['Annual_Income_Raw'] = 'winsorize';
      newConfig.outlierStrategies['Debt_To_Income'] = 'drop';
    } else if (caseStudy.id === 'iot_sensor') {
      newConfig.imputeStrategies['PM2_5_ugm3'] = 'linear_interp';
      newConfig.imputeStrategies['Temperature_C'] = 'linear_interp';
      newConfig.outlierStrategies['PM2_5_ugm3'] = 'drop';
      newConfig.outlierStrategies['Temperature_C'] = 'drop';
    } else if (caseStudy.id === 'supply_chain') {
      newConfig.imputeStrategies['Stock_Qty (units)'] = 'median';
      newConfig.outlierStrategies['Lead Time (Days)'] = 'drop';
    } else if (caseStudy.id === 'social_sentiment') {
      newConfig.imputeStrategies['Q1_UI_Score'] = 'median';
      newConfig.pivotLonger = {
        enabled: true,
        cols: ['q1_ui_score', 'q2_speed_score', 'q3_price_score'],
        namesTo: 'survey_dimension',
        valuesTo: 'rating_score',
      };
    }

    setConfig(newConfig);
    setActiveModule('workflow');
  };

  const handleCustomUpload = (data: Record<string, any>[], cols: string[], name: string) => {
    const customCase: CaseStudy = {
      id: `custom-${Date.now()}`,
      title: `自定义上传: ${name}`,
      subtitle: '用户私有数据清洗审计流',
      domain: '用户自定义数据集',
      description: `用户自主导入的本地 CSV 文件 (${data.length} 行 × ${cols.length} 列)。`,
      targetCleaningPoints: ['缺失值自动识别与填补', '列名与类型标准化', '极端异常值检测与治理'],
      recommendedSteps: ['运行 janitor::clean_names()', '排查重复行', '按需选择 MICE 预测插补'],
      rawColumns: cols,
      rawData: data,
    };
    handleSelectCase(customCase);
    setActiveModule('quality');
  };

  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-800 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Top Navigation */}
      <Navbar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        activeCase={activeCase}
        onSelectCase={handleSelectCase}
        healthScore={cleanAudit.overallHealthScore}
        grade={cleanAudit.grade}
        onOpenAiDoctor={() => setIsAiDoctorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeModule === 'algebra' && <ModuleAlgebra />}

        {activeModule === 'quality' && (
          <ModuleQualityAudit
            audit={rawAudit}
            datasetName={activeCase.title}
          />
        )}

        {activeModule === 'missing' && (
          <ModuleMissingImpute
            audit={rawAudit}
            rawData={activeCase.rawData}
            columns={activeCase.rawColumns}
            selectedStrategies={config.imputeStrategies}
            onUpdateStrategy={handleUpdateImputeStrategy}
          />
        )}

        {activeModule === 'outliers' && (
          <ModuleOutliers
            audit={rawAudit}
            rawData={activeCase.rawData}
            columns={activeCase.rawColumns}
            cleanColNames={config.cleanColNames}
            removeDuplicates={config.removeDuplicates}
            onToggleDuplicates={handleToggleDuplicates}
            dedupKey={config.dedupKey}
            onSelectDedupKey={handleSelectDedupKey}
            outlierStrategies={config.outlierStrategies}
            onUpdateOutlierStrategy={handleUpdateOutlierStrategy}
          />
        )}

        {activeModule === 'cases' && (
          <ModuleCases
            activeCaseId={activeCase.id}
            onSelectCase={handleSelectCase}
            onApplyPresetRecipe={handleApplyPresetRecipe}
            onCustomUpload={handleCustomUpload}
          />
        )}

        {activeModule === 'rscript' && (
          <ModuleRScript
            rScript={rScript}
            datasetName={activeCase.id}
            rawRowsCount={rawAudit.totalRows}
            cleanRowsCount={cleanAudit.totalRows}
            cleanData={cleanData}
            cleanColumns={cleanColumns}
            rawAudit={rawAudit}
            cleanAudit={cleanAudit}
            activeCase={activeCase}
          />
        )}

        {activeModule === 'workflow' && (
          <ModuleWorkflow
            rawAudit={rawAudit}
            cleanAudit={cleanAudit}
            rawData={activeCase.rawData}
            cleanData={cleanData}
            rawColumns={activeCase.rawColumns}
            cleanColumns={cleanColumns}
            appliedSteps={appliedSteps}
            config={config}
            onGoToExport={() => setActiveModule('export')}
          />
        )}

        {activeModule === 'export' && (
          <ModuleExport
            caseTitle={activeCase.title}
            activeCase={activeCase}
            rawAudit={rawAudit}
            cleanAudit={cleanAudit}
            rawData={activeCase.rawData}
            cleanData={cleanData}
            rawColumns={activeCase.rawColumns}
            cleanColumns={cleanColumns}
            appliedSteps={appliedSteps}
            rScript={rScript}
            onSelectCase={handleSelectCase}
          />
        )}

        {activeModule === 'slices' && <ModuleKnowledgeSlices />}
      </main>

      {/* Floating AI Doctor Modal (Module 7) */}
      <AiDoctorModal
        audit={rawAudit}
        config={config}
        datasetName={activeCase.title}
        isOpen={isAiDoctorOpen}
        onClose={() => setIsAiDoctorOpen(false)}
      />

      {/* Subtle Footer */}
      <footer className="border-t border-stone-200/80 bg-white/60 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800">R 数据清洗与预处理 WebApp 实验室</span>
            <span>· 10大核心模块 · 纯正 Tidyverse 规范</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>janitor · naniar · mice · DescTools · dplyr</span>
            <span>UTF-8 POSIX 规范</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
