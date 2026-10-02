import React, { useState } from "react";
import { Card, Form, Input, Select, DatePicker, Button, Row, Col, Result, Typography, message } from "antd";
import { supabase } from "../../services/supabase";
import { createAccount } from "../../services/userService";
import { PageHeader } from "../../components/ui";

const { Text } = Typography;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((v) => ({ value: v, label: v }));

const PatientRegistration = () => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const profile = await createAccount({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: "patient",
      });

      const { error } = await supabase.from("patients").insert([
        {
          user_id: profile.id,
          date_of_birth: values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : null,
          gender: values.gender || null,
          blood_group: values.blood_group || null,
          address: values.address || null,
          emergency_contact: values.emergency_contact || null,
          emergency_phone: values.emergency_phone || null,
        },
      ]);

      if (error) {
        await supabase.from("profiles").delete().eq("id", profile.id); // undo
        throw error;
      }

      setCreated({ name: values.full_name, email: values.email.trim().toLowerCase(), password: values.password });
      form.resetFields();
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (created) {
    return (
      <Result
        status="success"
        title={`${created.name} is registered`}
        subTitle={
          <>
            <Text>Login email: <Text strong copyable>{created.email}</Text></Text>
            <br />
            <Text>Temporary password: <Text strong copyable>{created.password}</Text></Text>
          </>
        }
        extra={<Button type="primary" onClick={() => setCreated(null)}>Register another patient</Button>}
      />
    );
  }

  return (
    <>
      <PageHeader title="Register patient" subtitle="Create a patient account and medical profile at the front desk" />

      <Card style={{ borderRadius: 14 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="full_name" label="Full name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="phone" label="Phone" rules={[{ required: true, message: "Phone is required" }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="password" label="Temporary password" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="date_of_birth" label="Date of birth"><DatePicker style={{ width: "100%" }} disabledDate={(d) => d && d.isAfter(new Date())} /></Form.Item></Col>
            <Col xs={12} md={8}><Form.Item name="gender" label="Gender"><Select allowClear options={["Male", "Female", "Other"].map((v) => ({ value: v, label: v }))} /></Form.Item></Col>
            <Col xs={12} md={8}><Form.Item name="blood_group" label="Blood group"><Select allowClear options={BLOOD_GROUPS} /></Form.Item></Col>
            <Col xs={24}><Form.Item name="address" label="Address"><Input.TextArea rows={2} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="emergency_contact" label="Emergency contact name"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="emergency_phone" label="Emergency contact phone"><Input /></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit" loading={saving} size="large">Register patient</Button>
        </Form>
      </Card>
    </>
  );
};

export default PatientRegistration;
