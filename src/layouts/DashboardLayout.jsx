import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Flex, Typography } from "antd";
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
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";

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

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [unread, setUnread] = useState(0);

  const items = MENUS[user?.role] || [];
  const current = [...items]
    .sort((a, b) => b.key.length - a.key.length)
    .find((item) => pathname.startsWith(item.key));

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
  }, [user?.id, user?.role, pathname]);

  const handleLogout = async () => {
    await logout();
    navigate(
      user?.role === "doctor" ? "/doctor/login" : ["admin", "receptionist"].includes(user?.role) ? "/staff/login" : "/login",
      { replace: true }
    );
  };

  const dropdownItems = [
    ...(PROFILE_PATH[user?.role]
      ? [{ key: "profile", icon: <UserOutlined />, label: "My Profile" }]
      : []),
    { key: "logout", icon: <LogoutOutlined />, label: "Log out", danger: true },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth={0} width={250} theme="dark">
        <Flex align="center" gap={10} style={{ padding: "20px 22px" }}>
          <MedicineBoxFilled style={{ fontSize: 28, color: "#5eead4" }} />
          <Title level={4} style={{ margin: 0, color: "#fff" }}>
            MediConnect
          </Title>
        </Flex>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={current ? [current.key] : []}
          items={items}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            {current?.label}
          </Title>

          <Flex align="center" gap={18}>
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
                <Avatar style={{ background: "#0d9488" }}>
                  {(user?.full_name || "U").charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ lineHeight: 1.2 }}>
                  <Text strong>{user?.full_name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12, textTransform: "capitalize" }}>
                    {user?.role}
                  </Text>
                </div>
              </Flex>
            </Dropdown>
          </Flex>
        </Header>

        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
