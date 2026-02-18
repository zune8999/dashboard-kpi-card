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