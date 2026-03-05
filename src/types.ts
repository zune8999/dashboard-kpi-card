export type Aggregation = 'sum' | 'avg' | 'max' | 'min' | 'last';
export type NumberUnit = 'none' | 'wan' | 'yi';

export interface Config {
  // 数据源
  tableId: string;
  fieldId: string;
  aggregation: Aggregation;
  // 显示
  title: string;
  unit: string;
  decimals: number;
  numberUnit: NumberUnit;
  subText: string;
  themeColor: string;
  // 自定义标注（右上角角标）
  trend: string;
  reverseTrend: boolean;
  // 目标追踪
  enableTarget: boolean;
  targetSource: 'fixed' | 'field';
  targetValue: number;
  targetFieldId: string;
  targetAggregation: Aggregation;
  completionLabel: string;
  showProgressBar: boolean;
  // 预警
  enableThreshold: boolean;
  threshold: number;
  logic: 'low_good' | 'high_good';
}

export const DEFAULT_CONFIG: Config = {
  tableId: '',
  fieldId: '',
  aggregation: 'sum',
  title: '',
  unit: '',
  decimals: 2,
  numberUnit: 'none',
  subText: '',
  themeColor: '#3370ff',
  trend: '',
  reverseTrend: false,
  enableTarget: false,
  targetSource: 'fixed',
  targetValue: 100,
  targetFieldId: '',
  targetAggregation: 'sum',
  completionLabel: '完成率',
  showProgressBar: true,
  enableThreshold: false,
  threshold: 0,
  logic: 'low_good',
};
