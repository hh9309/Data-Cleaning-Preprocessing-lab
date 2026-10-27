export type ColumnType = 'numeric' | 'string' | 'date' | 'categorical' | 'boolean';

export interface ColumnMetric {
  name: string;
  originalName: string;
  type: ColumnType;
  totalCount: number;
  missingCount: number;
  missingRate: number;
  uniqueCount: number;
  outlierCount: number;
  outlierRate: number;
  isSnakeCase: boolean;
  hasSpecialChars: boolean;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  variance?: number;
  stdDev?: number;
  q1?: number;
  q3?: number;
  iqr?: number;
  sampleValues: any[];
}

export interface DataQualityAudit {
  totalRows: number;
  totalCols: number;
  totalCells: number;
  totalMissingCells: number;
  overallMissingRate: number;
  duplicateRowsCount: number;
  duplicateRate: number;
  nonStandardColNamesCount: number;
  totalOutlierCells: number;
  columns: ColumnMetric[];
  
  // Health Scores (0-100)
  completenessScore: number;
  uniquenessScore: number;
  conformityScore: number;
  accuracyScore: number;
  consistencyScore: number;
  overallHealthScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issuesSummary: {
    critical: string[];
    warning: string[];
    good: string[];
  };
}

export type ImputeMethod = 
  | 'none'
  | 'drop_na'
  | 'mean'
  | 'median'
  | 'mode'
  | 'locf' // Last Observation Carried Forward
  | 'linear_interp'
  | 'knn'
  | 'mice_pmm';

export type OutlierStrategy =
  | 'none'
  | 'drop'
  | 'winsorize'
  | 'log_transform'
  | 'set_na';

export interface CleaningPipelineConfig {
  cleanColNames: boolean; // janitor::clean_names()
  removeDuplicates: boolean;
  dedupKey?: string;
  dedupKeep: 'first' | 'last';
  trimWhitespace: boolean;
  removeIllegalChars: boolean;
  
  // Missing strategy per column or global
  imputeStrategies: Record<string, ImputeMethod>;
  
  // Outlier strategy per column
  outlierMethods: Record<string, 'iqr' | 'zscore'>;
  outlierThresholds: Record<string, number>; // 1.5 for IQR, 3 for z-score
  outlierStrategies: Record<string, OutlierStrategy>;
  
  // Reshape (pivot)
  pivotLonger?: {
    enabled: boolean;
    cols: string[];
    namesTo: string;
    valuesTo: string;
  };
}

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  domain: string;
  description: string;
  targetCleaningPoints: string[];
  recommendedSteps: string[];
  rawColumns: string[];
  rawData: Record<string, any>[];
  primaryKey?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isDiagnosis?: boolean;
}
