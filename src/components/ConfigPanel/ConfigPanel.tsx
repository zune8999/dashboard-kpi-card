import { useState, useEffect } from 'react';
import { Form, Button, Switch } from '@douyinfe/semi-ui';
import type { Config, Aggregation, NumberUnit } from '../../types';
import { getTableList, getFieldMetas } from '../../services/dataService';
import './ConfigPanel.scss';

interface ConfigPanelProps {
  config: Config;
  onSave: (config: Config) => void;
}

const PRESET_COLORS = [
  '#3370ff', '#626aef', '#a855f7', '#ec4899',
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#06b6d4', '#6b7280',
];

const AGGREGATION_OPTIONS = [
  { label: '求和（SUM）', value: 'sum' },
  { label: '平均值（AVG）', value: 'avg' },
  { label: '最大值（MAX）', value: 'max' },
  { label: '最小值（MIN）', value: 'min' },
  { label: '最新值（LAST）', value: 'last' },
];

const NUMBER_UNIT_OPTIONS = [
  { label: '不转换', value: 'none' },
  { label: '万', value: 'wan' },
  { label: '亿', value: 'yi' },
];

export function ConfigPanel({ config, onSave }: ConfigPanelProps) {
  const [tables, setTables] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [localConfig, setLocalConfig] = useState<Config>(config);

  const set = (patch: Partial<Config>) =>
    setLocalConfig((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    getTableList().then(setTables).catch(console.error);
  }, []);

  useEffect(() => {
    if (!localConfig.tableId) { setFields([]); return; }
    getFieldMetas(localConfig.tableId)
      .then((metas) => setFields(metas.filter((f: any) => f.type === 2 || f.type === 24)))
      .catch(console.error);
  }, [localConfig.tableId]);

  const isValid = !!localConfig.tableId && !!localConfig.fieldId;

  return (
    <div className="config-panel">
      <Form layout="vertical">

        {/* ── 数据源 ── */}
        <Form.Section text="数据源">
          <Form.Select
            field="tableId"
            label="数据表"
            placeholder="请选择数据表"
            value={localConfig.tableId}
            onChange={(v) => set({ tableId: v as string, fieldId: '', targetFieldId: '' })}
            optionList={tables.map((t) => ({ label: t.name, value: t.id }))}
          />
          <Form.Select
            field="aggregation"
            label="聚合方式"
            value={localConfig.aggregation}
            onChange={(v) => set({ aggregation: v as Aggregation })}
            optionList={AGGREGATION_OPTIONS}
          />
          <Form.Select
            field="fieldId"
            label="数值字段"
            placeholder="请先选择数据表"
            value={localConfig.fieldId}
            onChange={(v) => set({ fieldId: v as string })}
            optionList={fields.map((f) => ({ label: f.name, value: f.id }))}
            disabled={!localConfig.tableId}
          />
        </Form.Section>

        {/* ── 显示 ── */}
        <Form.Section text="显示">
          <Form.Input
            field="title"
            label="标题"
            placeholder="如：年度签约额"
            value={localConfig.title}
            onChange={(v) => set({ title: v })}
          />
          <div className="form-row">
            <Form.Select
              field="numberUnit"
              label="数字量级"
              value={localConfig.numberUnit}
              onChange={(v) => set({ numberUnit: v as NumberUnit })}
              optionList={NUMBER_UNIT_OPTIONS}
              style={{ flex: 1 }}
            />
            <Form.InputNumber
              field="decimals"
              label="小数位数"
              value={localConfig.decimals}
              onChange={(v) => set({ decimals: v as number })}
              min={0}
              max={6}
              style={{ flex: 1 }}
            />
          </div>
          <Form.Input
            field="unit"
            label="单位"
            placeholder="如：元、%（留空不显示）"
            value={localConfig.unit}
            onChange={(v) => set({ unit: v })}
          />
          <Form.Input
            field="subText"
            label="底部说明文案"
            placeholder="如：数据截止昨日，留空不显示"
            value={localConfig.subText}
            onChange={(v) => set({ subText: v })}
          />
        </Form.Section>

        {/* ── 目标追踪 ── */}
        <Form.Section text="目标追踪">
          <div className="switch-row">
            <span className="switch-row-label">启用目标追踪</span>
            <Switch
              checked={localConfig.enableTarget}
              onChange={(v) => set({ enableTarget: v })}
            />
          </div>

          {localConfig.enableTarget && (
            <>
              <Form.Select
                field="targetSource"
                label="目标值来源"
                value={localConfig.targetSource}
                onChange={(v) => set({ targetSource: v as 'fixed' | 'field', targetFieldId: '' })}
                optionList={[
                  { label: '手动输入固定值', value: 'fixed' },
                  { label: '从字段读取', value: 'field' },
                ]}
              />

              {localConfig.targetSource === 'fixed' ? (
                <Form.InputNumber
                  field="targetValue"
                  label="目标值"
                  value={localConfig.targetValue}
                  onChange={(v) => set({ targetValue: v as number })}
                  step={1}
                  placeholder="请输入目标数值"
                />
              ) : (
                <>
                  <Form.Select
                    field="targetFieldId"
                    label="目标字段"
                    placeholder="请选择目标数值字段"
                    value={localConfig.targetFieldId}
                    onChange={(v) => set({ targetFieldId: v as string })}
                    optionList={fields.map((f) => ({ label: f.name, value: f.id }))}
                    disabled={!localConfig.tableId}
                  />
                  <Form.Select
                    field="targetAggregation"
                    label="目标聚合方式"
                    value={localConfig.targetAggregation}
                    onChange={(v) => set({ targetAggregation: v as Aggregation })}
                    optionList={AGGREGATION_OPTIONS}
                  />
                </>
              )}

              <Form.Input
                field="completionLabel"
                label="完成率标签"
                value={localConfig.completionLabel}
                onChange={(v) => set({ completionLabel: v })}
                placeholder="如：完成率、达标率、使用率"
              />

              <div className="switch-row">
                <span className="switch-row-label">显示进度条</span>
                <Switch
                  checked={localConfig.showProgressBar}
                  onChange={(v) => set({ showProgressBar: v })}
                />
              </div>
            </>
          )}
        </Form.Section>

        {/* ── 预警 ── */}
        <Form.Section text="预警">
          <div className="switch-row">
            <span className="switch-row-label">启用预警</span>
            <Switch
              checked={localConfig.enableThreshold}
              onChange={(v) => set({ enableThreshold: v })}
            />
          </div>

          {localConfig.enableThreshold && (
            <>
              <Form.Select
                field="logic"
                label="评价方向"
                value={localConfig.logic}
                onChange={(v) => set({ logic: v as Config['logic'] })}
                optionList={[
                  { label: '越低越好（高于阈值则预警）', value: 'low_good' },
                  { label: '越高越好（低于阈值则预警）', value: 'high_good' },
                ]}
              />
              <Form.InputNumber
                field="threshold"
                label="预警阈值"
                value={localConfig.threshold}
                onChange={(v) => set({ threshold: v as number })}
                step={0.1}
              />
            </>
          )}
        </Form.Section>

        {/* ── 自定义标注 ── */}
        <Form.Section text="自定义标注">
          <Form.Input
            field="trend"
            label="角标文案"
            placeholder="显示在右上角，如：+12.5%  ↑ 较上月，留空隐藏"
            value={localConfig.trend}
            onChange={(v) => set({ trend: v })}
          />
          <div className="switch-row">
            <div className="switch-row-text">
              <span className="switch-row-label">下降为正向</span>
              <span className="switch-row-desc">如成本降低是好事，开启后含"-"的标注显示绿色</span>
            </div>
            <Switch
              checked={localConfig.reverseTrend}
              onChange={(v) => set({ reverseTrend: v })}
            />
          </div>
        </Form.Section>

        {/* ── 外观 ── */}
        <Form.Section text="外观">
          <div className="form-item-custom">
            <div className="form-item-label">主题颜色</div>
            <div className="color-swatches">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch${localConfig.themeColor === c ? ' active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => set({ themeColor: c })}
                />
              ))}
              <label
                className={`color-swatch color-swatch-custom${!PRESET_COLORS.includes(localConfig.themeColor) ? ' active' : ''}`}
                style={{ backgroundColor: localConfig.themeColor }}
                title="自定义颜色"
              >
                <input
                  type="color"
                  value={localConfig.themeColor}
                  onChange={(e) => set({ themeColor: e.target.value })}
                  className="color-native-input"
                />
              </label>
            </div>
            <div className="color-hex-row">
              <span className="color-hex-preview" style={{ backgroundColor: localConfig.themeColor }} />
              <span className="color-hex-text">{localConfig.themeColor.toUpperCase()}</span>
            </div>
          </div>
        </Form.Section>

        <Button
          type="primary"
          theme="solid"
          block
          onClick={() => onSave(localConfig)}
          disabled={!isValid}
        >
          确认
        </Button>
      </Form>
    </div>
  );
}
