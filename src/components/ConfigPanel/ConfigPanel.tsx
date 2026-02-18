import { useState, useEffect } from 'react';
import { Form, Select, Input, Switch, Button } from '@douyinfe/semi-ui';
import type { Config } from '../../types';
import { getTableList, getFieldMetas } from '../../services/dataService';
import './ConfigPanel.scss';

interface ConfigPanelProps {
  config: Config;
  onSave: (config: Config) => void;
}

export function ConfigPanel({ config, onSave }: ConfigPanelProps) {
  const [tables, setTables] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [localConfig, setLocalConfig] = useState<Config>(config);

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (localConfig.tableId) {
      loadFields(localConfig.tableId);
    }
  }, [localConfig.tableId]);

  const loadTables = async () => {
    try {
      const list = await getTableList();
      setTables(list);
    } catch (err) {
      console.error('加载数据表失败:', err);
    }
  };

  const loadFields = async (tableId: string) => {
    try {
      const list = await getFieldMetas(tableId);
      // 只保留数字类型字段
      const numberFields = list.filter((f: any) => f.type === 2 || f.type === 24);
      setFields(numberFields);
    } catch (err) {
      console.error('加载字段失败:', err);
    }
  };

  const handleSave = () => {
    onSave(localConfig);
  };

  const isValid = localConfig.tableId && localConfig.fieldId;

  return (
    <div className="config-panel">
      <Form layout="vertical">
        <Form.Section text="数据源">
          <Form.Select
            field="tableId"
            label="数据表"
            placeholder="请选择数据表"
            value={localConfig.tableId}
            onChange={(value) => setLocalConfig((prev) => ({ ...prev, tableId: value as string, fieldId: '' }))}
            optionList={tables.map((t) => ({ label: t.name, value: t.id }))}
          />
          
          <Form.Select
            field="fieldId"
            label="数值字段"
            placeholder="请选择字段"
            value={localConfig.fieldId}
            onChange={(value) => setLocalConfig((prev) => ({ ...prev, fieldId: value as string }))}
            optionList={fields.map((f) => ({ label: f.name, value: f.id }))}
            disabled={!localConfig.tableId}
          />
        </Form.Section>

        <Form.Section text="样式设置">
          <Form.Input
            field="title"
            label="标题"
            value={localConfig.title}
            onChange={(value) => setLocalConfig((prev) => ({ ...prev, title: value }))}
          />
          
          <Form.Input
            field="unit"
            label="单位"
            value={localConfig.unit}
            onChange={(value) => setLocalConfig((prev) => ({ ...prev, unit: value }))}
          />
          
          <Form.Input
            field="subText"
            label="底部文案"
            value={localConfig.subText}
            onChange={(value) => setLocalConfig((prev) => ({ ...prev, subText: value }))}
          />
          
          <Form.Input
            field="trend"
            label="趋势值"
            value={localConfig.trend}
            onChange={(value) => setLocalConfig((prev) => ({ ...prev, trend: value }))}
          />
          
          <Form.Select
            field="themeColor"
            label="主题颜色"
            value={localConfig.themeColor}
            onChange={(value) => setLocalConfig((prev) => ({ ...prev, themeColor: value as string }))}
            optionList={[
              { label: '蓝色', value: '#3b82f6' },
              { label: '紫色', value: '#a855f7' },
              { label: '橙色', value: '#f97316' },
              { label: '青色', value: '#06b6d4' },
              { label: '绿色', value: '#10b981' },
              { label: '红色', value: '#ef4444' },
            ]}
          />
        </Form.Section>

        <Form.Section text="预警设置">
          <Form.Switch
            field="enableThreshold"
            label="启用预警"
            checked={localConfig.enableThreshold}
            onChange={(checked) => setLocalConfig((prev) => ({ ...prev, enableThreshold: checked }))}
          />
          
          {localConfig.enableThreshold && (
            <>
              <Form.Select
                field="logic"
                label="评价方向"
                value={localConfig.logic}
                onChange={(value) => setLocalConfig((prev) => ({ ...prev, logic: value as any }))}
                optionList={[
                  { label: '数值越低越好', value: 'low_good' },
                  { label: '数值越高越好', value: 'high_good' },
                ]}
              />
              
              <Form.InputNumber
                field="threshold"
                label="预警阈值"
                value={localConfig.threshold}
                onChange={(value) => setLocalConfig((prev) => ({ ...prev, threshold: value as number }))}
                step={0.1}
              />
            </>
          )}
        </Form.Section>

        <Button 
          type="primary" 
          theme="solid" 
          block 
          onClick={handleSave}
          disabled={!isValid}
        >
          确认
        </Button>
      </Form>
    </div>
  );
}