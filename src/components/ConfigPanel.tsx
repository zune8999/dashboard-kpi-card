import { useEffect, useState } from 'react';
import { bitable } from '@lark-base-open/js-sdk';
import type { Config } from '../types';
import './ConfigPanel.css';

interface ConfigPanelProps {
  config: Config;
  onChange: (config: Partial<Config>) => void;
  isDark: boolean;
}

export function ConfigPanel({ config, onChange, isDark }: ConfigPanelProps) {
  const [tables, setTables] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (config.tableId) {
      loadFields(config.tableId);
    }
  }, [config.tableId]);

  const loadTables = async () => {
    try {
      const list = await bitable.base.getTableMetaList();
      setTables(list);
    } catch (err) {
      console.error('加载数据表失败:', err);
    }
  };

  const loadFields = async (tableId: string) => {
    try {
      const table = await bitable.base.getTableById(tableId);
      const list = await table.getFieldMetaList();
      const numberFields = list.filter((f: any) => f.type === 2 || f.type === 24);
      setFields(numberFields);
    } catch (err) {
      console.error('加载字段失败:', err);
    }
  };

  const handleTableChange = (tableId: string) => {
    onChange({ tableId, fieldId: '' });
  };

  const handleFieldChange = (fieldId: string) => {
    onChange({ fieldId });
  };

  return (
    <div className={`config-panel ${isDark ? 'dark' : 'light'}`}>
      <div className="section">
        <h4>数据源</h4>
        
        <div className="field">
          <label>数据表</label>
          <select value={config.tableId} onChange={(e) => handleTableChange(e.target.value)}>
            <option value="">请选择</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>数值字段</label>
          <select 
            value={config.fieldId} 
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled={!config.tableId}
          >
            <option value="">请选择</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="section">
        <h4>样式设置</h4>
        
        <div className="field">
          <label>标题</label>
          <input 
            type="text" 
            value={config.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div className="field">
          <label>单位</label>
          <input 
            type="text" 
            value={config.unit}
            onChange={(e) => onChange({ unit: e.target.value })}
          />
        </div>

        <div className="field">
          <label>趋势</label>
          <input 
            type="text" 
            value={config.trend}
            onChange={(e) => onChange({ trend: e.target.value })}
            placeholder="+0.32%"
          />
        </div>

        <div className="field">
          <label>主题色</label>
          <div className="colors">
            {['#3b82f6', '#a855f7', '#f97316', '#06b6d4', '#10b981', '#ef4444'].map((c) => (
              <div
                key={c}
                className={`color ${config.themeColor === c ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => onChange({ themeColor: c })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <h4>预警设置</h4>
        
        <div className="field row">
          <label>启用预警</label>
          <input 
            type="checkbox"
            checked={config.enableThreshold}
            onChange={(e) => onChange({ enableThreshold: e.target.checked })}
          />
        </div>

        {config.enableThreshold && (
          <>
            <div className="field">
              <label>评价方向</label>
              <select 
                value={config.logic}
                onChange={(e) => onChange({ logic: e.target.value as any })}
              >
                <option value="low_good">越低越好</option>
                <option value="high_good">越高越好</option>
              </select>
            </div>

            <div className="field">
              <label>阈值</label>
              <input 
                type="number"
                value={config.threshold}
                onChange={(e) => onChange({ threshold: parseFloat(e.target.value) || 0 })}
                step="0.1"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}