import React from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Card, Statistic, Tag, Typography, Flex, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Logo, EmptyArt, HeroDecor, AuthArt, accentFor } from "./art";

const { Title, Text } = Typography;

/* ---------- design tokens (one place, used everywhere) ---------- */
export const BRAND = "#0d9488";
export const BRAND_DARK = "#0b2b2e";
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
    <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 20 }}>
      <Flex align="center" gap={12}>
        {back && <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate(back)} />}
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

/* ---------- coloured welcome banner at the top of each dashboard ---------- */
const HERO_GRADIENTS = {
  patient: ["#0a4a46", "#0d9488"],
  doctor: ["#14407a", "#2b86c5"],
  admin: ["#35266b", "#7c5cd6"],
  receptionist: ["#8f3410", "#d9531e"],
};

export const HeroBanner = ({ variant = "patient", art = "calendar", title, subtitle, actions }) => {
  const [from, to] = HERO_GRADIENTS[variant] || HERO_GRADIENTS.patient;

  return (
    <div className="hero" style={{ background: `linear-gradient(115deg, ${from} 0%, ${to} 100%)` }}>
      <div className="hero-copy">
        <h2 className="hero-title">{title}</h2>
        {subtitle && <p className="hero-sub">{subtitle}</p>}
        {actions && <Flex gap={10} wrap="wrap" style={{ marginTop: 18 }}>{actions}</Flex>}
      </div>
      <HeroDecor kind={art} />
    </div>
  );
};

/* ---------- dashboard stat tile ---------- */
export const StatCard = ({ title, value, icon, color = BRAND, loading }) => (
  <Card
    loading={loading}
    hoverable
    style={{
      ...CARD_STYLE,
      background: `radial-gradient(circle at 100% 0%, ${color}1f, transparent 58%), #fff`,
    }}
  >
    <Flex align="center" justify="space-between" gap={12}>
      <Statistic title={title} value={value} />
      <div
        style={{
          width: 52,
          height: 52,
          flexShrink: 0,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          background: `linear-gradient(135deg, ${color}, ${color}b8)`,
          color: "#fff",
          fontSize: 23,
          boxShadow: `0 10px 20px -10px ${color}`,
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
  <Tag color={STATUS_COLORS[status] || "default"} style={{ textTransform: "capitalize", borderRadius: 20, paddingInline: 10 }}>
    {(status || "pending").replace("_", " ")}
  </Tag>
);

/* ---------- empty state with an illustration ---------- */
export const EmptyState = ({ kind = "search", title, description, action }) => (
  <Card style={CARD_STYLE}>
    <Flex vertical align="center" style={{ padding: "20px 12px", textAlign: "center" }}>
      <EmptyArt kind={kind} size={170} />
      <Title level={5} style={{ margin: "8px 0 4px" }}>
        {title}
      </Title>
      {description && (
        <Text type="secondary" style={{ maxWidth: 380 }}>
          {description}
        </Text>
      )}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </Flex>
  </Card>
);

/* ---------- round avatar with the person's initial (colour picked from the name) ---------- */
export const PersonAvatar = ({ name, size = 44, color }) => {
  const base = color || accentFor(name).accent;

  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.4,
        fontFamily: "var(--font-display)",
        background: `linear-gradient(135deg, ${base}, ${base}b0)`,
        boxShadow: `0 8px 16px -10px ${base}`,
      }}
    >
      {(name || "?").trim().charAt(0).toUpperCase()}
    </div>
  );
};

/* ---------- label + value block used on record / detail cards ---------- */
export const LabeledText = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
      {label}
    </Text>
    <div style={{ whiteSpace: "pre-wrap" }}>{children || <Text type="secondary">-</Text>}</div>
  </div>
);

/* ---------- split-screen shell for every login / register / reset screen ---------- */
const AUTH_VARIANTS = {
  patient: {
    gradient: "linear-gradient(150deg, #0b2b2e 0%, #0f5f5a 55%, #0d9488 100%)",
    headline: "Care, booked in a minute",
    text: "Find a doctor, pick a time that suits you, and keep every record and prescription in one place.",
  },
  doctor: {
    gradient: "linear-gradient(150deg, #0d2742 0%, #1b4b86 55%, #2b86c5 100%)",
    headline: "Your day, at a glance",
    text: "Confirm visits, review patient histories and write prescriptions without switching screens.",
  },
  staff: {
    gradient: "linear-gradient(150deg, #1d1540 0%, #43348f 55%, #7c5cd6 100%)",
    headline: "Keep the front desk moving",
    text: "Register patients, check them in and keep the day's schedule on track.",
  },
};

export const AuthShell = ({ variant = "patient", title, subtitle, children, footer, width = 400 }) => {
  const v = AUTH_VARIANTS[variant] || AUTH_VARIANTS.patient;

  return (
    <div className="auth-split">
      <aside className="auth-art" style={{ background: v.gradient }}>
        <Flex align="center" gap={10}>
          <Logo size={40} />
          <span className="brand-word">MediConnect</span>
        </Flex>

        <div className="auth-art-body">
          <div className="auth-headline">{v.headline}</div>
          <p className="auth-lede">{v.text}</p>
          <AuthArt />
        </div>
      </aside>

      <main className="auth-form">
        <div className="auth-form-inner" style={{ maxWidth: width }}>
          <Flex align="center" gap={10} className="auth-mobile-brand">
            <Logo size={36} />
            <span className="brand-word brand-word--dark">MediConnect</span>
          </Flex>

          <Title level={2} style={{ margin: "0 0 4px" }}>
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
              {subtitle}
            </Text>
          )}

          {children}

          {footer && <div style={{ marginTop: 22 }}>{footer}</div>}
        </div>
      </main>
    </div>
  );
};
