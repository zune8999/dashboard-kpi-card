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

// 完成率格式化：去掉 .0 尾数，超过 999% 显示 >999%
function formatRate(rate: number): string {
  if (rate > 999.9) return '>999%';
  const fixed = rate.toFixed(1);
  return (fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed) + '%';
}

// 量级乘数：用于将"显示单位"换算回原始数值
function getUnitMultiplier(numberUnit: NumberUnit): number {
  if (numberUnit === 'wan') return 10000;
  if (numberUnit === 'yi') return 100000000;
  return 1;
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
  // 固定值时：用户在配置面板输入的是"显示单位"（如15亿），需乘以量级乘数还原为原始数值
  const unitMultiplier = getUnitMultiplier(config.numberUnit);
  const effectiveTarget = config.enableTarget
    ? (config.targetSource === 'fixed' ? config.targetValue * unitMultiplier : targetData)
    : null;

  // target <= 0 时隐藏（无业务意义）
  const completionRate = effectiveTarget !== null && effectiveTarget > 0
    ? (value / effectiveTarget) * 100
    : null;

  const showTarget = config.enableTarget && effectiveTarget !== null && effectiveTarget > 0 && completionRate !== null;

  // 进度条分段：超额时用双色（主题色 + 警告色）
  const isOverflow = completionRate !== null && completionRate > 100;
  const baseSegment = completionRate !== null
    ? (isOverflow ? (100 / completionRate) * 100 : Math.min(completionRate, 100))
    : 0;
  const overflowSegment = isOverflow ? ((completionRate! - 100) / completionRate!) * 100 : 0;

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
              <strong className={isOverflow ? 'overflow' : ''}>
                {formatRate(completionRate!)}
              </strong>
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
                style={{ width: `${baseSegment}%`, backgroundColor: config.themeColor }}
              />
              {isOverflow && (
                <div
                  className="kpi-progress-overflow"
                  style={{ width: `${overflowSegment}%` }}
                />
              )}
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
