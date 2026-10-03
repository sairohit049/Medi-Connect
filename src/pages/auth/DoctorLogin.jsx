import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Flex, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { loginWithRoles } from "../../services/authService";
import { useAuth, homeFor } from "../../context/AuthContext";
import { AuthShell } from "../../components/ui";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ email, password }) => {
    setLoading(true);
    try {
      const profile = await loginWithRoles(email, password, ["doctor"]);

      if (!profile) {
        message.error("Invalid doctor email or password");
        return;
      }

      login(profile);
      message.success(`Welcome, Dr. ${profile.full_name}`);
      navigate(homeFor(profile.role), { replace: true });
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      variant="doctor"
      title="Doctor login"
      subtitle="Sign in to manage your patients"
      footer={
        <Flex justify="space-between">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/login">Patient login</Link>
        </Flex>
      }
    >
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Enter a valid email" }]}>
          <Input size="large" prefix={<MailOutlined />} autoComplete="email" placeholder="doctor@hospital.com" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: "Enter your password" }]}>
          <Input.Password size="large" prefix={<LockOutlined />} autoComplete="current-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          Sign in as doctor
        </Button>
      </Form>
    </AuthShell>
  );
};

export default DoctorLogin;
