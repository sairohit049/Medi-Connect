import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Divider, Flex, message } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { supabase } from "../../services/supabase";
import { loginWithRoles } from "../../services/authService";
import { ensurePatientRecord } from "../../services/patientService";
import { useAuth, homeFor } from "../../context/AuthContext";
import { AuthShell } from "../../components/ui";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ email, password }) => {
    setLoading(true);
    try {
      const profile = await loginWithRoles(email, password, ["patient"]);

      if (!profile) {
        message.error("Invalid email or password. Doctors and staff: use your own login below.");
        return;
      }

      // Older accounts may not have a patients row yet - create it if missing
      await ensurePatientRecord(profile.id);

      login(profile);
      message.success(`Welcome back, ${profile.full_name}!`);
      navigate(homeFor(profile.role), { replace: true });
    } catch (error) {
      message.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) message.error(error.message);
  };

  return (
    <AuthShell
      variant="patient"
      title="Welcome back"
      subtitle="Sign in to your patient account"
      footer={
        <Flex vertical align="center" gap={8}>
          <span>
            Don't have an account? <Link to="/register">Create account</Link>
          </span>
          <span>
            <Link to="/forgot-password">Forgot password?</Link>
            {" · "}
            <Link to="/doctor/login">Doctor login</Link>
            {" · "}
            <Link to="/staff/login">Staff login</Link>
          </span>
        </Flex>
      }
    >
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Enter a valid email" }]}>
          <Input size="large" prefix={<MailOutlined />} autoComplete="email" placeholder="you@example.com" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: "Enter your password" }]}>
          <Input.Password size="large" prefix={<LockOutlined />} autoComplete="current-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          Sign in
        </Button>
      </Form>

      <Divider plain>or</Divider>

      <Button size="large" block icon={<GoogleOutlined />} onClick={handleGoogleLogin}>
        Continue with Google
      </Button>
    </AuthShell>
  );
};

export default Login;
