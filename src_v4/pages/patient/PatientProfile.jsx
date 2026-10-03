import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Row, Col, Card, Form, Input, Select, DatePicker, Button, Tag, Flex, Divider, Typography, message } from "antd";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import { ensurePatientRecord } from "../../services/patientService";
import { PageHeader, PersonAvatar, CARD_STYLE, fmtDate } from "../../components/ui";

const { Title, Text } = Typography;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((v) => ({ value: v, label: v }));
const GENDERS = ["Male", "Female", "Other"].map((v) => ({ value: v, label: v }));

const PatientProfile = () => {
  const { user, login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState(null);
  const [email, setEmail] = useState(user.email);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [row, profileRes] = await Promise.all([
          ensurePatientRecord(user.id),
          supabase.from("profiles").select("full_name, phone, email").eq("id", user.id).maybeSingle(),
        ]);
        if (!active) return;

        setPatient(row);
        setEmail(profileRes.data?.email || user.email);
        form.setFieldsValue({
          full_name: profileRes.data?.full_name,
          phone: profileRes.data?.phone,
          date_of_birth: row.date_of_birth ? dayjs(row.date_of_birth) : null,
          gender: row.gender || undefined,
          blood_group: row.blood_group || undefined,
          address: row.address,
          emergency_contact: row.emergency_contact,
          emergency_phone: row.emergency_phone,
        });
      } catch (error) {
        message.error(error.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [user.id, user.email, form]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: values.full_name.trim(), phone: values.phone.trim() })
        .eq("id", user.id);
      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from("patients")
        .update({
          date_of_birth: values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : null,
          gender: values.gender || null,
          blood_group: values.blood_group || null,
          address: values.address || null,
          emergency_contact: values.emergency_contact || null,
          emergency_phone: values.emergency_phone || null,
        })
        .eq("id", patient.id)
        .select()
        .single();
      if (error) throw error;

      setPatient(data);
      login({ ...user, full_name: values.full_name.trim(), phone: values.phone.trim() });
      message.success("Profile updated");
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const watchedName = Form.useWatch("full_name", form) || user.full_name;

  return (
    <>
      <PageHeader title="My profile" subtitle="Keep your details up to date so doctors have the right information" />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card style={{ ...CARD_STYLE, textAlign: "center" }} loading={loading}>
            <PersonAvatar name={watchedName} size={96} />
            <Title level={4} style={{ marginBottom: 0, marginTop: 12 }}>
              {watchedName}
            </Title>
            <Text type="secondary">{email}</Text>
            <Flex justify="center" gap={8} wrap="wrap" style={{ marginTop: 12 }}>
              <Tag color="teal">Patient</Tag>
              {patient?.blood_group && <Tag color="red">{patient.blood_group}</Tag>}
              {patient?.gender && <Tag>{patient.gender}</Tag>}
            </Flex>
            {patient?.created_at && (
              <Text type="secondary" style={{ display: "block", marginTop: 14, fontSize: 12 }}>
                Member since {fmtDate(patient.created_at)}
              </Text>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Edit details" style={CARD_STYLE} loading={loading}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Divider orientation="left" style={{ marginTop: 0 }}>
                Personal
              </Divider>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="full_name" label="Full name" rules={[{ required: true, whitespace: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="phone" label="Phone" rules={[{ required: true, whitespace: true, message: "Phone is required" }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Email" extra="Email cannot be changed">
                    <Input value={email} disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="date_of_birth" label="Date of birth">
                    <DatePicker style={{ width: "100%" }} disabledDate={(d) => d && d.isAfter(dayjs())} />
                  </Form.Item>
                </Col>
                <Col xs={12} md={12}>
                  <Form.Item name="gender" label="Gender">
                    <Select allowClear options={GENDERS} placeholder="Select" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={12}>
                  <Form.Item name="blood_group" label="Blood group">
                    <Select allowClear options={BLOOD_GROUPS} placeholder="Select" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="address" label="Address">
                    <Input.TextArea rows={2} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Emergency contact</Divider>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="emergency_contact" label="Contact name">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="emergency_phone" label="Contact phone">
                    <Input />
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

export default PatientProfile;
