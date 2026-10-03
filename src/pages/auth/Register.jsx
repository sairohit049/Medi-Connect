import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import { MailOutlined, LockOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { createAccount } from "../../services/userService";
import { ensurePatientRecord } from "../../services/patientService";
import { AuthShell } from "../../components/ui";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ full_name, email, phone, password }) => {
    setLoading(true);
    try {
      const profile = await createAccount({ full_name, email, phone, password, role: "patient" });
      await ensurePatientRecord(profile.id);

      message.success("Account created. Please sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      message.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      variant="patient"
      title="Create account"
      subtitle="Register as a MediConnect patient"
      footer={
        <div style={{ textAlign: "center" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      }
    >
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item name="full_name" label="Full name" rules={[{ required: true, whitespace: true, message: "Enter your full name" }]}>
          <Input size="large" prefix={<UserOutlined />} autoComplete="name" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Enter a valid email" }]}>
          <Input size="large" prefix={<MailOutlined />} autoComplete="email" />
        </Form.Item>
        <Form.Item name="phone" label="Phone" rules={[{ required: true, whitespace: true, message: "Enter your phone number" }]}>
          <Input size="large" prefix={<PhoneOutlined />} autoComplete="tel" />
        </Form.Item>
        <Form.Item name="password" label="Password" hasFeedback rules={[{ required: true, min: 6, message: "At least 6 characters" }]}>
          <Input.Password size="large" prefix={<LockOutlined />} autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="Confirm password"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Confirm your password" },
            ({ getFieldValue }) => ({
              validator: (_, value) =>
                !value || getFieldValue("password") === value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Passwords do not match")),
            }),
          ]}
        >
          <Input.Password size="large" prefix={<LockOutlined />} autoComplete="new-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          Create account
        </Button>
      </Form>
    </AuthShell>
  );
};

export default Register;
