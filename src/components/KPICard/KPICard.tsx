import type { Config, NumberUnit } from '../../types';
import './KPICard.scss';

interface KPICardProps {
  config: Config;
  data: number | null;
  targetData: number | null; // 目标字段聚合值（targetSource==='field' 时由 App 传入）
}

// 数值格式化：支持量级转换（万/亿）+ 可配小数位
function formatValue(value: number, decimals: number, numberUnit: NumberUnit): string {
  let v = value;
  let suffix = '';
  if (numberUnit === 'wan') { v = value / 10000; suffix = '万'; }
  else if (numberUnit === 'yi') { v = value / 100000000; suffix = '亿'; }
  return v.toLocaleString('zh-CN', { maximumFractionDigits: decimals, minimumFractionDigits: 0 }) + suffix;
}

export function KPICard({ config, data, targetData }: KPICardProps) {
  const value = data ?? 0;

  // 预警状态
  let status = 'default';
  let statusText = '统计中';
  if (config.enableThreshold && data !== null) {
    const isSafe = config.logic === 'low_good'
      ? value <= config.threshold
      : value >= config.threshold;
    status = isSafe ? 'safe' : 'danger';
    statusText = isSafe ? '安全' : '预警';
  }

  // 标注方向（右上角角标颜色）
  const trendUp = config.trend ? !config.trend.includes('-') : true;
  const trendClass = trendUp !== config.reverseTrend ? 'up' : 'down';

  // 目标追踪
  const effectiveTarget = config.enableTarget
    ? (config.targetSource === 'fixed' ? config.targetValue : targetData)
    : null;
  const completionRate = effectiveTarget !== null && effectiveTarget !== 0
    ? (value / effectiveTarget) * 100
    : null;
  const progressPct = completionRate !== null ? Math.min(Math.max(completionRate, 0), 100) : 0;
  const showTarget = config.enableTarget && effectiveTarget !== null && completionRate !== null;

  const hasFooter = config.subText || config.enableThreshold;

  return (
    <div className="kpi-card" style={{ borderLeftColor: config.themeColor, containerType: 'size' }}>
      {/* 标题行 + 自定义标注 */}
      <div className="kpi-header">
        <span className="kpi-label">{config.title}</span>
        {config.trend && (
          <span className={`kpi-trend ${trendClass}`}>{config.trend}</span>
        )}
      </div>

      {/* 主指标值 */}
      <div className="kpi-value-row">
        <span className="kpi-value">
          {formatValue(value, config.decimals, config.numberUnit)}
        </span>
        {config.unit && <span className="kpi-unit">{config.unit}</span>}
      </div>

      {/* 目标追踪：完成率 + 进度条 */}
      {showTarget && (
        <div className="kpi-target-section">
          <div className="kpi-target-row">
            <span className="kpi-completion-rate">
              {config.completionLabel}&nbsp;
              <strong>{completionRate!.toFixed(1)}%</strong>
            </span>
            <span className="kpi-target-value">
              目标&nbsp;{formatValue(effectiveTarget!, config.decimals, config.numberUnit)}
              {config.unit}
            </span>
          </div>
          {config.showProgressBar && (
            <div className="kpi-progress-bar">
              <div
                className="kpi-progress-fill"
                style={{ width: `${progressPct}%`, backgroundColor: config.themeColor }}
              />
            </div>
          )}
        </div>
      )}

      {/* 底部：自定义说明文案 + 预警 badge */}
      {hasFooter && (
        <div className="kpi-footer">
          <span className="kpi-sub">{config.subText}</span>
          {config.enableThreshold && (
            <span className={`kpi-badge ${status}`}>{statusText}</span>
          )}
        </div>
      )}
    </div>
  );
}
