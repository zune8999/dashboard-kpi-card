import type { Config } from '../types';
import './KPICard.scss';

interface KPICardProps {
  config: Config;
  data: number | null;
}

export function KPICard({ config, data }: KPICardProps) {
  const value = data ?? 0;
  
  // 计算状态
  let status = 'default';
  let statusText = '统计中';
  if (config.enableThreshold && data !== null) {
    const isSafe = config.logic === 'low_good' 
      ? value <= config.threshold 
      : value >= config.threshold;
    status = isSafe ? 'safe' : 'danger';
    statusText = isSafe ? '安全' : '预警';
  }

  // 趋势样式
  const trendUp = !config.trend.includes('-');
  const trendClass = trendUp !== config.reverseTrend ? 'up' : 'down';

  return (
    <div className="kpi-card" style={{ borderLeftColor: config.themeColor }}>
      <div className="kpi-header">
        <span className="kpi-label">{config.title}</span>
        <span className={`kpi-trend ${trendClass}`}>{config.trend}</span>
      </div>

      <div className="kpi-value-row">
        <span className="kpi-value">{value.toFixed(2)}</span>
        <span className="kpi-unit">{config.unit}</span>
      </div>

      <div className="kpi-footer">
        <span className="kpi-sub">{config.subText}</span>
        <span className={`kpi-badge ${status}`}>{statusText}</span>
      </div>
    </div>
  );
}