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
    if (dashboard.state === DashboardState.Create) {
      // Create 态没有已保存配置，直接标记完成
      setConfigLoaded(true);
      return;
    }

    dashboard
      .getConfig()
      .then((data) => {
        // data 结构：{ customConfig: {...}, dataConditions: [] }
        const saved = data?.customConfig;
        if (saved && typeof saved === 'object' && Object.keys(saved).length > 0) {
          setConfig((prev) => ({ ...prev, ...saved }));
        }
      })
      .catch((err) => console.error('[KPICard] getConfig failed:', err))
      .finally(() => setConfigLoaded(true)); // 无论成功与否，都解除 ConfigPanel 阻塞

    const off = dashboard.onConfigChange((r) => {
      const saved = r.data?.customConfig;
      if (saved && typeof saved === 'object') {
        setConfig((prev) => ({ ...prev, ...saved }));
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
        {configLoaded && (
          // key=tableId：当 getConfig() 异步加载完成、tableId 从空变为真实值时
          // 强制重建 ConfigPanel，确保 useState(config) 拿到最新配置
          <ConfigPanel
            key={config.tableId || '__empty__'}
            config={config}
            onSave={handleSaveConfig}
          />
        )}
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
