import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Segmented, Flex, message } from "antd";
import { MailOutlined, LockOutlined, IdcardOutlined } from "@ant-design/icons";
import { loginWithRoles } from "../../services/authService";
import { useAuth, homeFor } from "../../context/AuthContext";
import { AuthShell } from "../../components/ui";

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
    <AuthShell
      icon={<IdcardOutlined />}
      title="Staff login"
      subtitle="Admin and receptionist access"
      footer={
        <Flex justify="space-between">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/login">Patient login</Link>
        </Flex>
      }
    >
      <Form layout="vertical" onFinish={onFinish} initialValues={{ role: "admin" }} requiredMark={false}>
        <Form.Item name="role">
          <Segmented
            block
            options={[
              { label: "Admin", value: "admin" },
              { label: "Receptionist", value: "receptionist" },
            ]}
          />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Enter a valid email" }]}>
          <Input size="large" prefix={<MailOutlined />} autoComplete="email" placeholder="you@hospital.com" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: "Enter your password" }]}>
          <Input.Password size="large" prefix={<LockOutlined />} autoComplete="current-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          Sign in
        </Button>
      </Form>
    </AuthShell>
  );
};

export default StaffLogin;
