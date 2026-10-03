import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import { KeyOutlined, MailOutlined, PhoneOutlined, LockOutlined } from "@ant-design/icons";
import { resetPassword } from "../../services/authService";
import { AuthShell } from "../../components/ui";

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
    <AuthShell
      icon={<KeyOutlined />}
      title="Reset password"
      subtitle="Enter your email and the phone number on your account"
      footer={
        <div style={{ textAlign: "center" }}>
          <Link to="/login">Back to login</Link>
        </div>
      }
    >
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Enter a valid email" }]}>
          <Input size="large" prefix={<MailOutlined />} />
        </Form.Item>
        <Form.Item name="phone" label="Phone number" rules={[{ required: true, message: "Enter your phone number" }]}>
          <Input size="large" prefix={<PhoneOutlined />} />
        </Form.Item>
        <Form.Item name="password" label="New password" hasFeedback rules={[{ required: true, min: 6, message: "At least 6 characters" }]}>
          <Input.Password size="large" prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="Confirm new password"
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
          <Input.Password size="large" prefix={<LockOutlined />} />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          Update password
        </Button>
      </Form>
    </AuthShell>
  );
};

export default ForgotPassword;
