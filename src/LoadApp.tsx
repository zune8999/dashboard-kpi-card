import { useState, useEffect } from "react";
import { bridge } from "@lark-base-open/js-sdk";

/**
 * 从飞书同步语言设置，避免初始渲染时语言闪烁。
 * 语言就绪前不渲染子组件。
 */
export function LoadApp({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // getLanguage 属于 bridge，不属于 dashboard
    bridge
      .getLanguage()
      .then((lang) => {
        const locale = lang === "zh" ? "zh" : lang === "ja" ? "ja" : "en";
        document.documentElement.setAttribute("lang", locale);
      })
      .catch(() => {
        // 飞书环境外（本地开发）时可能失败，降级使用默认语言
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
