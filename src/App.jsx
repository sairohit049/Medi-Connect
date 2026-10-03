import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";

import AppRoutes from "./routes/AppRoutes";

// One theme for the whole app (login screens, every dashboard, every page).
const theme = {
  token: {
    colorPrimary: "#0d9488",
    colorLink: "#0f766e",
    colorInfo: "#2b7bbf",
    colorWarning: "#e0a106",
    colorError: "#dc4a3d",
    colorBgLayout: "#eef5f5",
    colorTextBase: "#1f3537",
    borderRadius: 10,
    controlHeight: 38,
    fontFamily: "'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  components: {
    Layout: { siderBg: "#0b2b2e", headerBg: "#ffffff", bodyBg: "#eef5f5" },
    Menu: {
      darkItemBg: "transparent",
      darkSubMenuItemBg: "transparent",
      darkItemColor: "rgba(255,255,255,0.74)",
      darkItemHoverBg: "rgba(255,255,255,0.09)",
      darkItemHoverColor: "#ffffff",
      darkItemSelectedBg: "#0d9488",
      itemBorderRadius: 10,
      itemHeight: 44,
    },
    Table: { headerBg: "#f0f7f6", headerColor: "#25494b", rowHoverBg: "#f5fbfa", borderColor: "#e6f0ef" },
    Button: { primaryShadow: "0 6px 14px -6px rgba(13,148,136,0.55)", fontWeight: 600 },
    Segmented: { itemSelectedBg: "#ffffff", trackBg: "#e3efee" },
    Tabs: { inkBarColor: "#0d9488" },
  },
};

const App = () => (
  <ConfigProvider theme={theme}>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </ConfigProvider>
);

export default App;
