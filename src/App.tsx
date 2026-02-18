import { useEffect, useState, useCallback } from 'react';
import { dashboard, DashboardState, bitable, ThemeModeType } from '@lark-base-open/js-sdk';
import { ConfigPanel } from './components/ConfigPanel';
import { KPICard } from './components/KPICard';
import { Loading } from './components/Loading';
import type { Config } from './types';
import './App.css';

const defaultConfig: Config = {
  tableId: '',
  viewId: '',
  fieldId: '',
  title: '指标名称',
  unit: '%',
  subText: '目标值: 5.5%',
  themeColor: '#3b82f6',
  enableThreshold: true,
  threshold: 5.5,
  logic: 'low_good',
  trend: '+0.32%',
  reverseTrend: false,
};

function App() {
  const [state, setState] = useState<DashboardState>(DashboardState.Creating);
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [data, setData] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<ThemeModeType>(ThemeModeType.LIGHT);

  // 初始化主题
  useEffect(() => {
    const initTheme = async () => {
      const res = await dashboard.getTheme();
      setTheme(res.theme);
      document.body.setAttribute('theme-mode', res.theme.toLowerCase());
    };
    initTheme();

    dashboard.onThemeChange((res) => {
      setTheme(res.data.theme);
      document.body.setAttribute('theme-mode', res.data.theme.toLowerCase());
    });
  }, []);

  // 初始化
  useEffect(() => {
    const init = async () => {
      const currentState = await dashboard.getState();
      setState(currentState);

      if (currentState !== DashboardState.Create) {
        const savedConfig = await dashboard.getConfig();
        if (savedConfig) {
          setConfig((prev) => ({ ...prev, ...savedConfig }));
        }
        await loadData();
      }

      // 告知服务端渲染完成
      setTimeout(() => {
        dashboard.setRendered();
      }, 500);
    };

    init();

    // 监听状态变化
    dashboard.onStateChange((event) => {
      setState(event.data.state);
    });

    // 监听配置变化
    dashboard.onConfigChange((event) => {
      const newConfig = event.data;
      setConfig((prev) => ({ ...prev, ...newConfig }));
      loadData();
    });
  }, []);

  const loadData = useCallback(async () => {
    if (state === DashboardState.Create) return;

    setLoading(true);
    setError('');

    try {
      const result = await dashboard.getData();
      const value = calculateValue(result as any);
      setData(value);
    } catch (err: any) {
      setError('数据加载失败: ' + err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [state]);

  const calculateValue = (result: any): number => {
    if (!result?.data?.length) return 0;
    const values = result.data.map((row: any) => {
      const val = Array.isArray(row) ? row[0] : row;
      return parseFloat(val) || 0;
    });
    return values[values.length - 1] || 0;
  };

  const updateConfig = async (newConfig: Partial<Config>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    await dashboard.setConfig(updated);
  };

  const isDark = theme === ThemeModeType.DARK;
  const isConfig = state === DashboardState.Config || state === DashboardState.Create;

  return (
    <div className={`main ${isConfig ? 'main-config' : ''} ${isDark ? 'dark' : 'light'}`}>
      <div className="content">
        {loading && <Loading />}
        {error && <div className="error">{error}</div>}
        {!loading && !error && <KPICard config={config} data={data} isDark={isDark} />}
      </div>
      
      {isConfig && (
        <ConfigPanel config={config} onChange={updateConfig} isDark={isDark} />
      )}
    </div>
  );
}

export default App;