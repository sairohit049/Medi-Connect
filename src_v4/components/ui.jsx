import React from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Card, Statistic, Tag, Typography, Flex, Empty, Button, Avatar } from "antd";
import { ArrowLeftOutlined, MedicineBoxFilled } from "@ant-design/icons";

const { Title, Text } = Typography;

/* ---------- design tokens (one place, used everywhere) ---------- */
export const BRAND = "#0d9488";
export const BRAND_DARK = "#0f2a2e";
export const CARD_STYLE = { borderRadius: 14 };

/* ---------- formatting helpers ---------- */
export const todayString = () => dayjs().format("YYYY-MM-DD");
export const fmtDate = (value) => (value ? dayjs(value).format("DD MMM YYYY") : "-");
export const fmtTime = (value) => (value ? String(value).slice(0, 5) : "-");
export const fmtDateTime = (value) => (value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "-");
export const slotLabel = (slot) => dayjs(`2000-01-01 ${slot}`).format("hh:mm A");

/* ---------- page header (optional back button) ---------- */
export const PageHeader = ({ title, subtitle, extra, back }) => {
  const navigate = useNavigate();

  return (
    <Flex
      justify="space-between"
      align="center"
      wrap="wrap"
      gap={12}
      style={{ marginBottom: 20 }}
    >
      <Flex align="center" gap={12}>
        {back && (
          <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate(back)} />
        )}
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && <Text type="secondary">{subtitle}</Text>}
        </div>
      </Flex>
      {extra}
    </Flex>
  );
};

/* ---------- dashboard stat tile ---------- */
export const StatCard = ({ title, value, icon, color = BRAND, loading }) => (
  <Card loading={loading} hoverable style={CARD_STYLE}>
    <Flex align="center" justify="space-between">
      <Statistic title={title} value={value} />
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          background: `${color}1a`,
          color,
          fontSize: 22,
        }}
      >
        {icon}
      </div>
    </Flex>
  </Card>
);

/* ---------- appointment status chip ---------- */
const STATUS_COLORS = {
  pending: "gold",
  scheduled: "blue",
  confirmed: "green",
  checked_in: "cyan",
  completed: "purple",
  cancelled: "red",
};

export const StatusTag = ({ status }) => (
  <Tag color={STATUS_COLORS[status] || "default"} style={{ textTransform: "capitalize" }}>
    {(status || "pending").replace("_", " ")}
  </Tag>
);

/* ---------- empty state (replaces the old emoji "no data" cards) ---------- */
export const EmptyState = ({ title, description, action }) => (
  <Card style={CARD_STYLE}>
    <Empty
      description={
        <>
          <Text strong>{title}</Text>
          {description && (
            <>
              <br />
              <Text type="secondary">{description}</Text>
            </>
          )}
        </>
      }
    >
      {action}
    </Empty>
  </Card>
);

/* ---------- round avatar with the person's initial ---------- */
export const PersonAvatar = ({ name, size = 44, color = BRAND }) => (
  <Avatar size={size} style={{ background: color, flexShrink: 0 }}>
    {(name || "?").trim().charAt(0).toUpperCase()}
  </Avatar>
);

/* ---------- label + value block used on record / detail cards ---------- */
export const LabeledText = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
      {label}
    </Text>
    <div style={{ whiteSpace: "pre-wrap" }}>{children || <Text type="secondary">-</Text>}</div>
  </div>
);

/* ---------- shared shell for every login / register / reset screen ---------- */
export const AuthShell = ({ icon, title, subtitle, children, footer, width = 420 }) => (
  <div
    style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 16,
      background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
    }}
  >
    <div style={{ width, maxWidth: "100%" }}>
      <Flex align="center" justify="center" gap={10} style={{ marginBottom: 16 }}>
        <MedicineBoxFilled style={{ fontSize: 30, color: "#5eead4" }} />
        <Title level={3} style={{ margin: 0, color: "#fff" }}>
          MediConnect
        </Title>
      </Flex>

      <Card style={{ borderRadius: 18 }}>
        <Flex vertical align="center" gap={4} style={{ marginBottom: 20, textAlign: "center" }}>
          <Avatar size={56} icon={icon || <MedicineBoxFilled />} style={{ background: BRAND }} />
          <Title level={3} style={{ margin: "8px 0 0" }}>
            {title}
          </Title>
          {subtitle && <Text type="secondary">{subtitle}</Text>}
        </Flex>

        {children}

        {footer && <div style={{ marginTop: 16 }}>{footer}</div>}
      </Card>
    </div>
  </div>
);
