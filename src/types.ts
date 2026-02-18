export interface Config {
  tableId: string;
  viewId: string;
  fieldId: string;
  title: string;
  unit: string;
  subText: string;
  themeColor: string;
  enableThreshold: boolean;
  threshold: number;
  logic: 'low_good' | 'high_good';
  trend: string;
  reverseTrend: boolean;
}

export const DEFAULT_CONFIG: Config = {
  tableId: '',
  viewId: '',
  fieldId: '',
  title: '指标名称',
  unit: '%',
  subText: '目标值: 5.5%',
  themeColor: '#3b82f6',
  enableThreshold: true,
  threshold: 5.5,
  logic: 'low_good',
  trend: '+0.32%',
  reverseTrend: false,
};