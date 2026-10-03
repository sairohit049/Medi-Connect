import React, { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Card, List, Badge, Avatar, Button, Empty, Typography, Popconfirm, Flex, message } from "antd";
import { BellOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/ui";

const { Text } = Typography;

const refreshBell = () => window.dispatchEvent(new Event("notifications-changed"));

const NotificationsPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) message.error(error.message);
    setItems(data || []);
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id) => {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    if (error) return message.error(error.message);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    refreshBell();
  };

  const markAllRead = async () => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    if (error) return message.error(error.message);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    refreshBell();
  };

  const remove = async (id) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) return message.error(error.message);
    setItems((prev) => prev.filter((n) => n.id !== id));
    refreshBell();
  };

  const unread = items.filter((n) => !n.is_read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={unread ? `${unread} unread` : "You're all caught up"}
        extra={
          <Button icon={<CheckOutlined />} disabled={!unread} onClick={markAllRead}>
            Mark all as read
          </Button>
        }
      />

      <Card style={{ borderRadius: 14 }}>
        <List
          loading={loading}
          dataSource={items}
          locale={{ emptyText: <Empty description="No notifications yet" /> }}
          renderItem={(n) => (
            <List.Item
              actions={[
                !n.is_read && (
                  <Button key="read" type="link" onClick={() => markRead(n.id)}>
                    Mark read
                  </Button>
                ),
                <Popconfirm key="del" title="Delete this notification?" onConfirm={() => remove(n.id)}>
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={!n.is_read}>
                    <Avatar style={{ background: n.is_read ? "#cbd5e1" : "#0d9488" }} icon={<BellOutlined />} />
                  </Badge>
                }
                title={<Text strong={!n.is_read}>{n.title}</Text>}
                description={
                  <Flex vertical>
                    <span>{n.message}</span>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(n.created_at).format("DD MMM YYYY, hh:mm A")}
                    </Text>
                  </Flex>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </>
  );
};

export default NotificationsPage;
