import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Form, Input, DatePicker, Button, Flex, Skeleton, Typography, message } from "antd";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import { getDoctorByUserId, fetchPatientsByIds } from "../../services/directoryService";
import { notifyPatientById } from "../../services/notificationService";
import { PageHeader, PersonAvatar, EmptyState, CARD_STYLE } from "../../components/ui";

const { Text, Title } = Typography;

const Diagnosis = () => {
  const { user } = useAuth();
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    let active = true;

    fetchPatientsByIds([patientId])
      .then((rows) => active && setPatient(rows[0] || null))
      .catch((error) => message.error(error.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [patientId]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const doctor = await getDoctorByUserId(user.id);

      const { error } = await supabase.from("medical_records").insert([
        {
          patient_id: patientId,
          doctor_id: doctor?.id || null,
          diagnosis: values.diagnosis.trim(),
          treatment: values.treatment?.trim() || "",
          notes: values.notes?.trim() || "",
          record_date: values.record_date.format("YYYY-MM-DD"),
        },
      ]);
      if (error) throw error;

      await notifyPatientById(patientId, "New medical record", `Dr. ${user.full_name} added a new record to your file.`);

      message.success("Medical record saved");
      navigate(`/doctor/patients/${patientId}`);
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!loading && !patient) {
    return (
      <EmptyState
        kind="search"
        title="Patient not found"
        action={
          <Button type="primary" onClick={() => navigate("/doctor/patients")}>
            Back to my patients
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        back={`/doctor/patients/${patientId}`}
        title="Diagnosis & medical record"
        subtitle="Create a medical record for this patient"
      />

      <Card style={{ ...CARD_STYLE, marginBottom: 16 }} loading={loading}>
        {patient && (
          <Flex align="center" gap={14}>
            <PersonAvatar name={patient.full_name} size={52} />
            <div>
              <Title level={5} style={{ margin: 0 }}>
                {patient.full_name}
              </Title>
              <Text type="secondary">{patient.email}</Text>
            </div>
          </Flex>
        )}
      </Card>

      <Card title="Medical information" style={CARD_STYLE}>
        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ record_date: dayjs() }}>
            <Form.Item
              name="diagnosis"
              label="Diagnosis"
              rules={[{ required: true, whitespace: true, message: "Please enter the diagnosis" }]}
            >
              <Input.TextArea rows={3} placeholder="Enter diagnosis" />
            </Form.Item>

            <Form.Item name="treatment" label="Treatment">
              <Input.TextArea rows={3} placeholder="Enter recommended treatment" />
            </Form.Item>

            <Form.Item name="notes" label="Doctor's notes">
              <Input.TextArea rows={4} placeholder="Enter additional notes" />
            </Form.Item>

            <Form.Item name="record_date" label="Record date" rules={[{ required: true, message: "Select the record date" }]}>
              <DatePicker style={{ width: 220 }} disabledDate={(d) => d && d.isAfter(dayjs())} />
            </Form.Item>

            <Flex gap={8}>
              <Button onClick={() => navigate(`/doctor/patients/${patientId}`)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                Save medical record
              </Button>
            </Flex>
          </Form>
        )}
      </Card>
    </>
  );
};

export default Diagnosis;
