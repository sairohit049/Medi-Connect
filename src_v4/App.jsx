import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";

import AppRoutes from "./routes/AppRoutes";

// One theme for the whole app (login screens, every dashboard, every page).
const theme = {
  token: {
    colorPrimary: "#0d9488",
    borderRadius: 10,
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  components: {
    Layout: { siderBg: "#0f2a2e", headerBg: "#ffffff", bodyBg: "#f4f7f9" },
    Menu: { darkItemBg: "#0f2a2e", darkItemSelectedBg: "#0d9488" },
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
