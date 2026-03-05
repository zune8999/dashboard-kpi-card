import { dashboard } from "@lark-base-open/js-sdk";
import { useState, useLayoutEffect } from "react";

function updateTheme(theme: string) {
  const root = document.querySelector("body");
  if (root) {
    root.setAttribute("theme-mode", theme);
  }
}

// 主题跟随飞书仪表盘
export function useTheme() {
  const [bgColor, setBgColor] = useState("#ffffff");
  
  useLayoutEffect(() => {
    dashboard.getTheme().then((res) => {
      setBgColor(res.chartBgColor);
      updateTheme(res.theme.toLocaleLowerCase());
    });
    
    const off = dashboard.onThemeChange((res) => {
      setBgColor(res.data.chartBgColor);
      updateTheme(res.data.theme.toLocaleLowerCase());
    });
    
    return () => off();
  }, []);
  
  return { bgColor };
}