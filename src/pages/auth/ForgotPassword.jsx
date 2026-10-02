import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Avatar, Typography, Flex, message } from "antd";
import { KeyOutlined, MailOutlined, PhoneOutlined, LockOutlined } from "@ant-design/icons";
import { resetPassword } from "../../services/authService";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ email, phone, password }) => {
    setLoading(true);
    try {
      await resetPassword(email, phone, password);
      message.success("Password updated. Please sign in.");
      navigate("/login", { replace: true });
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
          <Avatar size={60} icon={<KeyOutlined />} style={{ background: "#0d9488" }} />
          <Title level={3} style={{ margin: 0 }}>Reset password</Title>
          <Text type="secondary" style={{ textAlign: "center" }}>
            Enter your email and the phone number on your account
          </Text>
        </Flex>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input size="large" prefix={<MailOutlined />} />
          </Form.Item>
          <Form.Item name="phone" label="Phone number" rules={[{ required: true }]}>
            <Input size="large" prefix={<PhoneOutlined />} />
          </Form.Item>
          <Form.Item name="password" label="New password" rules={[{ required: true, min: 6 }]} hasFeedback>
            <Input.Password size="large" prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Confirm new password"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator: (_, value) =>
                  !value || getFieldValue("password") === value
                    ? Promise.resolve()
                    : Promise.reject(new Error("Passwords do not match")),
              }),
            ]}
          >
            <Input.Password size="large" prefix={<LockOutlined />} />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            Update password
          </Button>
        </Form>

        <Flex justify="center" style={{ marginTop: 16 }}>
          <Link to="/login">Back to login</Link>
        </Flex>
      </Card>
    </div>
  );
};

export default ForgotPassword;
