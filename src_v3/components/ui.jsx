import React from "react";
import dayjs from "dayjs";
import { Card, Statistic, Tag, Typography, Flex } from "antd";

const { Title, Text } = Typography;

export const BRAND = "#0d9488";

export const todayString = () => dayjs().format("YYYY-MM-DD");
export const fmtDate = (value) => (value ? dayjs(value).format("DD MMM YYYY") : "-");
export const fmtTime = (value) => (value ? String(value).slice(0, 5) : "-");

export const PageHeader = ({ title, subtitle, extra }) => (
  <Flex
    justify="space-between"
    align="center"
    wrap="wrap"
    gap={12}
    style={{ marginBottom: 20 }}
  >
    <div>
      <Title level={3} style={{ margin: 0 }}>
        {title}
      </Title>
      {subtitle && <Text type="secondary">{subtitle}</Text>}
    </div>
    {extra}
  </Flex>
);

export const StatCard = ({ title, value, icon, color = BRAND, loading }) => (
  <Card loading={loading} hoverable style={{ borderRadius: 14 }}>
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
