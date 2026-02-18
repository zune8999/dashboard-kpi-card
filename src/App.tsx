import { dashboard, DashboardState } from "@lark-base-open/js-sdk";
import "@lark-base-open/js-sdk/dist/style/dashboard.css";
import { useState, useEffect } from "react";
import { useTheme } from "./hooks";
import { ConfigPanel } from "./components/ConfigPanel/ConfigPanel";
import { KPICard } from "./components/KPICard/KPICard";
import { fetchData } from "./services/dataService";
import { DEFAULT_CONFIG, type Config } from "./types";
import "./App.scss";

export default function App() {
  const { bgColor } = useTheme();
  const isConfig =
    dashboard.state === DashboardState.Config ||
    dashboard.state === DashboardState.Create;

  // 配置状态
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  
  // 从飞书加载配置
  useEffect(() => {
    if (dashboard.state === DashboardState.Create) return;
    
    dashboard.getConfig().then((data) => {
      if (data?.customConfig) {
        setConfig((prev) => ({ ...prev, ...data.customConfig }));
      }
    });
    
    const off = dashboard.onConfigChange((r) => {
      if (r.data?.customConfig) {
        setConfig((prev) => ({ ...prev, ...r.data.customConfig }));
      }
    });
    
    return () => off();
  }, []);

  // 数据加载
  const [data, setData] = useState<number | null>(null);
  useEffect(() => {
    if (!config.tableId || !config.fieldId) return;
    
    fetchData(config.tableId, config.fieldId).then((values) => {
      if (values.length > 0) {
        // 取最新值
        setData(values[values.length - 1]);
      }
    });
  }, [config.tableId, config.fieldId]);

  // 配置更新后通知渲染完成
  useEffect(() => {
    const timer = setTimeout(() => dashboard.setRendered(), 3000);
    return () => clearTimeout(timer);
  }, [data]);

  const handleSaveConfig = (newConfig: Config) => {
    setConfig(newConfig);
    dashboard.saveConfig({ 
      customConfig: newConfig, 
      dataConditions: [] 
    });
  };

  return (
    <main style={{ backgroundColor: bgColor, width: "100%", height: "100%" }}>
      <div className="content">
        <KPICard config={config} data={data} />
      </div>
      
      {isConfig && (
        <ConfigPanel 
          config={config} 
          onSave={handleSaveConfig} 
        />
      )}
    </main>
  );
}