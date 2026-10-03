import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Drawer, Flex, Grid, Typography } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  MedicineBoxFilled,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  BarChartOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  SolutionOutlined,
  IdcardOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useAuth, homeFor } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import { BRAND, BRAND_DARK } from "../components/ui";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

const MENUS = {
  patient: [
    { key: "/patient/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/patient/doctors", icon: <TeamOutlined />, label: "Find Doctor" },
    { key: "/patient/book-appointment", icon: <CalendarOutlined />, label: "Book Appointment" },
    { key: "/patient/appointments", icon: <ScheduleOutlined />, label: "My Appointments" },
    { key: "/patient/records", icon: <FileTextOutlined />, label: "Medical Records" },
    { key: "/patient/prescriptions", icon: <MedicineBoxOutlined />, label: "Prescriptions" },
    { key: "/patient/notifications", icon: <BellOutlined />, label: "Notifications" },
    { key: "/patient/profile", icon: <UserOutlined />, label: "My Profile" },
  ],
  doctor: [
    { key: "/doctor/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/doctor/appointments", icon: <ScheduleOutlined />, label: "Appointments" },
    { key: "/doctor/patients", icon: <TeamOutlined />, label: "My Patients" },
    { key: "/doctor/prescriptions", icon: <MedicineBoxOutlined />, label: "Prescriptions" },
    { key: "/doctor/notifications", icon: <BellOutlined />, label: "Notifications" },
    { key: "/doctor/profile", icon: <UserOutlined />, label: "My Profile" },
  ],
  admin: [
    { key: "/admin/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/admin/doctors", icon: <SolutionOutlined />, label: "Doctors" },
    { key: "/admin/patients", icon: <TeamOutlined />, label: "Patients" },
    { key: "/admin/receptionists", icon: <IdcardOutlined />, label: "Receptionists" },
    { key: "/admin/reports", icon: <BarChartOutlined />, label: "Reports" },
  ],
  receptionist: [
    { key: "/receptionist/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/receptionist/appointments", icon: <ScheduleOutlined />, label: "Appointments" },
    { key: "/receptionist/check-in", icon: <CheckCircleOutlined />, label: "Check-in & Payments" },
    { key: "/receptionist/register-patient", icon: <UserAddOutlined />, label: "Register Patient" },
  ],
};

const NOTIFICATION_PATH = {
  patient: "/patient/notifications",
  doctor: "/doctor/notifications",
};

const PROFILE_PATH = {
  patient: "/patient/profile",
  doctor: "/doctor/profile",
};

const LOGIN_PATH = {
  doctor: "/doctor/login",
  admin: "/staff/login",
  receptionist: "/staff/login",
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const screens = Grid.useBreakpoint();
  const isMobile = screens.lg === false;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [refreshTick, setRefreshTick] = useState(0);

  const items = MENUS[user?.role] || [];
  const current = [...items]
    .sort((a, b) => b.key.length - a.key.length)
    .find((item) => pathname.startsWith(item.key));

  // Close the mobile menu whenever the page changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Pages tell the layout when notifications change so the bell badge stays accurate
  useEffect(() => {
    const bump = () => setRefreshTick((tick) => tick + 1);
    window.addEventListener("notifications-changed", bump);
    return () => window.removeEventListener("notifications-changed", bump);
  }, []);

  useEffect(() => {
    if (!user?.id || !NOTIFICATION_PATH[user.role]) return undefined;

    let active = true;

    const loadUnread = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (active) setUnread(count || 0);
    };

    loadUnread();
    return () => {
      active = false;
    };
  }, [user?.id, user?.role, pathname, refreshTick]);

  const handleLogout = async () => {
    const role = user?.role;
    await logout();
    navigate(LOGIN_PATH[role] || "/login", { replace: true });
  };

  const dropdownItems = [
    ...(PROFILE_PATH[user?.role]
      ? [{ key: "profile", icon: <UserOutlined />, label: "My Profile" }]
      : []),
    { key: "logout", icon: <LogoutOutlined />, label: "Log out", danger: true },
  ];

  const brand = (
    <Flex
      align="center"
      gap={10}
      style={{ padding: "20px 22px", cursor: "pointer" }}
      onClick={() => navigate(homeFor(user?.role))}
    >
      <MedicineBoxFilled style={{ fontSize: 28, color: "#5eead4" }} />
      <Title level={4} style={{ margin: 0, color: "#fff" }}>
        MediConnect
      </Title>
    </Flex>
  );

  const menu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={current ? [current.key] : []}
      items={items}
      onClick={({ key }) => navigate(key)}
      style={{ borderInlineEnd: 0 }}
    />
  );

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      {/* Desktop sidebar: stays in place while the page scrolls */}
      {!isMobile && (
        <Sider
          width={250}
          theme="dark"
          style={{ height: "100vh", position: "sticky", top: 0, overflow: "auto" }}
        >
          {brand}
          {menu}
        </Sider>
      )}

      {/* Mobile sidebar: slides in from the hamburger button */}
      {isMobile && (
        <Drawer
          placement="left"
          width={260}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          closable={false}
          styles={{ header: { display: "none" }, body: { padding: 0, background: BRAND_DARK } }}
        >
          {brand}
          {menu}
        </Drawer>
      )}

      <Layout style={{ minWidth: 0 }}>
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "0 14px" : "0 24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <Flex align="center" gap={12}>
            {isMobile && (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
            )}
            <Title level={4} style={{ margin: 0 }}>
              {current?.label}
            </Title>
          </Flex>

          <Flex align="center" gap={isMobile ? 12 : 18}>
            {NOTIFICATION_PATH[user?.role] && (
              <Badge count={unread} size="small">
                <Button
                  shape="circle"
                  icon={<BellOutlined />}
                  onClick={() => navigate(NOTIFICATION_PATH[user.role])}
                />
              </Badge>
            )}

            <Dropdown
              trigger={["click"]}
              menu={{
                items: dropdownItems,
                onClick: ({ key }) =>
                  key === "logout" ? handleLogout() : navigate(PROFILE_PATH[user?.role]),
              }}
            >
              <Flex align="center" gap={10} style={{ cursor: "pointer" }}>
                <Avatar style={{ background: BRAND }}>
                  {(user?.full_name || "U").charAt(0).toUpperCase()}
                </Avatar>
                {!isMobile && (
                  <div style={{ lineHeight: 1.2 }}>
                    <Text strong>{user?.full_name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12, textTransform: "capitalize" }}>
                      {user?.role}
                    </Text>
                  </div>
                )}
              </Flex>
            </Dropdown>
          </Flex>
        </Header>

        <Content style={{ padding: isMobile ? 14 : 24 }}>
          <div style={{ maxWidth: 1360, margin: "0 auto" }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
