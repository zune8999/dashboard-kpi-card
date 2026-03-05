import { dashboard, DashboardState } from "@lark-base-open/js-sdk";
import "@lark-base-open/js-sdk/dist/style/dashboard.css";
import { useState, useEffect } from "react";
import { useTheme } from "./hooks";
import { ConfigPanel } from "./components/ConfigPanel/ConfigPanel";
import { KPICard } from "./components/KPICard/KPICard";
import { fetchData } from "./services/dataService";
import { DEFAULT_CONFIG, type Config } from "./types";
import "./App.scss";

// 本地开发时设为 true 使用 Mock 数据，上线前改为 false
const USE_MOCK_DATA = false;

const MOCK_DATA: number = 4258000;
const MOCK_TARGET: number = 5000000;

export default function App() {
  const { bgColor } = useTheme();
  const isConfig =
    dashboard.state === DashboardState.Config ||
    dashboard.state === DashboardState.Create;

  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(
    dashboard.state === DashboardState.Create
  );

  // 从飞书加载配置
  useEffect(() => {
    if (dashboard.state === DashboardState.Create) return;

    dashboard.getConfig().then((data) => {
      if (data?.customConfig) {
        setConfig((prev) => ({ ...prev, ...data.customConfig }));
      }
      setConfigLoaded(true);
    });

    const off = dashboard.onConfigChange((r) => {
      if (r.data?.customConfig) {
        setConfig((prev) => ({ ...prev, ...r.data.customConfig }));
      }
    });

    return () => off();
  }, []);

  // 主指标数据
  const [data, setData] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConfig) return;
    if (USE_MOCK_DATA) { setData(MOCK_DATA); return; }
    if (!config.tableId || !config.fieldId) return;

    setLoading(true);
    fetchData(config.tableId, config.fieldId, config.aggregation)
      .then(setData)
      .finally(() => setLoading(false));
  }, [config.tableId, config.fieldId, config.aggregation]);

  // 目标值数据（仅当 targetSource === 'field' 时需要远程获取）
  const [targetData, setTargetData] = useState<number | null>(null);

  useEffect(() => {
    if (isConfig) return;
    if (USE_MOCK_DATA) { setTargetData(MOCK_TARGET); return; }
    if (!config.enableTarget || config.targetSource !== 'field') {
      setTargetData(null);
      return;
    }
    if (!config.tableId || !config.targetFieldId) return;

    fetchData(config.tableId, config.targetFieldId, config.targetAggregation)
      .then(setTargetData)
      .catch(() => setTargetData(null));
  }, [
    config.enableTarget,
    config.targetSource,
    config.tableId,
    config.targetFieldId,
    config.targetAggregation,
  ]);

  // 数据就绪后通知飞书截图（仅 View 状态）
  useEffect(() => {
    if (isConfig) return;
    if (loading) return;
    const timer = setTimeout(() => dashboard.setRendered(), 3000);
    return () => clearTimeout(timer);
  }, [loading, data]);

  const handleSaveConfig = (newConfig: Config) => {
    setConfig(newConfig);
    dashboard.saveConfig({ customConfig: newConfig, dataConditions: [] });
  };

  if (isConfig) {
    return (
      <main style={{ backgroundColor: bgColor, width: "100%", height: "100%", overflow: "auto" }}>
        {configLoaded && <ConfigPanel config={config} onSave={handleSaveConfig} />}
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: bgColor, width: "100%", height: "100%", overflow: "hidden" }}>
      {loading ? (
        <div className="loading-tip">加载中...</div>
      ) : (
        <KPICard config={config} data={data} targetData={targetData} />
      )}
    </main>
  );
}
