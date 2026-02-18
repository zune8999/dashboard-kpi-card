import type { Config } from '../types';
import './KPICard.css';

interface KPICardProps {
  config: Config;
  data: number | null;
  isDark: boolean;
}

export function KPICard({ config, data, isDark }: KPICardProps) {
  const value = data ?? 0;
  
  // 计算状态
  let status = 'default';
  if (config.enableThreshold) {
    const isSafe = config.logic === 'low_good' 
      ? value <= config.threshold 
      : value >= config.threshold;
    status = isSafe ? 'safe' : 'danger';
  }

  // 趋势样式
  const trendUp = !config.trend.includes('-');
  const trendClass = trendUp !== config.reverseTrend ? 'up' : 'down';

  return (
    <div 
      className={`kpi-card ${isDark ? 'dark' : 'light'}`}
      style={{ borderLeftColor: config.themeColor }}
    >
      <div className="header">
        <span className="label">{config.title}</span>
        <span className={`trend ${trendClass}`}>{config.trend}</span>
      </div>

      <div className="value-row">
        <span className="value">{value.toFixed(2)}</span>
        <span className="unit">{config.unit}</span>
      </div>

      <div className="footer">
        <span className="sub">{config.subText}</span>
        <span className={`badge ${status}`}>
          {status === 'safe' ? '安全' : status === 'danger' ? '预警' : '统计中'}
        </span>
      </div>
    </div>
  );
}