import React, { useEffect, useState } from "react";
import { Row, Col, Card, Form, Input, InputNumber, Button, Avatar, Tag, Flex, Typography, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import { getDoctorByUserId } from "../../services/directoryService";
import { PageHeader } from "../../components/ui";

const { Title, Text } = Typography;

const DoctorProfile = () => {
  const { user, login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [row, profileRes] = await Promise.all([
          getDoctorByUserId(user.id),
          supabase.from("profiles").select("full_name, phone, email").eq("id", user.id).maybeSingle(),
        ]);

        setDoctor(row);
        form.setFieldsValue({
          full_name: profileRes.data?.full_name,
          phone: profileRes.data?.phone,
          specialization: row?.specialization,
          qualification: row?.qualification,
          experience: row?.experience,
          consultation_fee: row?.consultation_fee,
          availability: row?.availability,
          about: row?.about,
        });
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user.id, form]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: values.full_name.trim(), phone: values.phone || null })
        .eq("id", user.id);
      if (profileError) throw profileError;

      const details = {
        specialization: values.specialization,
        qualification: values.qualification || null,
        experience: values.experience ?? null,
        consultation_fee: values.consultation_fee ?? null,
        availability: values.availability || null,
        about: values.about || null,
      };

      // The doctors row may not exist yet (nothing creates it automatically)
      const request = doctor
        ? supabase.from("doctors").update(details).eq("id", doctor.id).select().single()
        : supabase.from("doctors").insert([{ user_id: user.id, ...details }]).select().single();

      const { data, error } = await request;
      if (error) throw error;

      setDoctor(data);
      login({ ...user, full_name: values.full_name.trim(), phone: values.phone });
      message.success("Profile saved");
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="My Profile" subtitle="This is what patients see when they search for doctors" />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 14, textAlign: "center" }} loading={loading}>
            <Avatar size={96} icon={<UserOutlined />} style={{ background: "#0d9488" }}>
              {(user.full_name || "D").charAt(0).toUpperCase()}
            </Avatar>
            <Title level={4} style={{ marginBottom: 0, marginTop: 12 }}>Dr. {user.full_name}</Title>
            <Text type="secondary">{user.email}</Text>
            <Flex justify="center" gap={8} wrap="wrap" style={{ marginTop: 12 }}>
              {doctor?.specialization && <Tag color="teal">{doctor.specialization}</Tag>}
              {doctor?.experience != null && <Tag>{doctor.experience} yrs experience</Tag>}
              {doctor?.consultation_fee != null && <Tag color="gold">Fee ₹{doctor.consultation_fee}</Tag>}
            </Flex>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Edit details" style={{ borderRadius: 14 }} loading={loading}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="full_name" label="Full name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="phone" label="Phone">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="specialization" label="Specialization" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="e.g. Cardiologist" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="qualification" label="Qualification">
                    <Input placeholder="e.g. MBBS, MD" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Item name="experience" label="Experience (years)">
                    <InputNumber min={0} max={70} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Item name="consultation_fee" label="Consultation fee (₹)">
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="availability" label="Availability">
                    <Input placeholder="Mon - Sat, 10 AM - 5 PM" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="about" label="About">
                    <Input.TextArea rows={4} placeholder="A short introduction for patients" />
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" htmlType="submit" loading={saving}>
                Save changes
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default DoctorProfile;
