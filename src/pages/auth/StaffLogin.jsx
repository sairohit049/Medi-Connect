import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Segmented, Avatar, Typography, Flex, message } from "antd";
import { MedicineBoxFilled, MailOutlined, LockOutlined } from "@ant-design/icons";
import { loginWithRoles } from "../../services/authService";
import { useAuth, homeFor } from "../../context/AuthContext";

const { Title, Text } = Typography;

const StaffLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ role, email, password }) => {
    setLoading(true);
    try {
      const profile = await loginWithRoles(email, password, [role]);

      if (!profile) {
        message.error(`Invalid ${role} email or password`);
        return;
      }

      login(profile);
      navigate(homeFor(profile.role), { replace: true });
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 16,
        background: "linear-gradient(135deg, #0f2a2e, #0d9488)",
      }}
    >
      <Card style={{ width: 420, maxWidth: "100%", borderRadius: 18 }}>
        <Flex vertical align="center" gap={4} style={{ marginBottom: 20 }}>
          <Avatar size={60} icon={<MedicineBoxFilled />} style={{ background: "#0d9488" }} />
          <Title level={3} style={{ margin: 0 }}>Staff login</Title>
          <Text type="secondary">Admin and receptionist access</Text>
        </Flex>

        <Form layout="vertical" onFinish={onFinish} initialValues={{ role: "admin" }}>
          <Form.Item name="role">
            <Segmented
              block
              options={[
                { label: "Admin", value: "admin" },
                { label: "Receptionist", value: "receptionist" },
              ]}
            />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input size="large" prefix={<MailOutlined />} placeholder="you@hospital.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password size="large" prefix={<LockOutlined />} />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            Sign in
          </Button>
        </Form>

        <Flex justify="space-between" style={{ marginTop: 16 }}>
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/login">Patient login</Link>
        </Flex>
      </Card>
    </div>
  );
};

export default StaffLogin;
