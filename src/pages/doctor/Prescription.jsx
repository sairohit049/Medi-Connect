import React, { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import {
  Row, Col, Card, Form, Input, Select, DatePicker, Button, Table, Alert, Popconfirm, Result, message,
} from "antd";
import { PlusOutlined, DeleteOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import { getDoctorByUserId, fetchPatientNames } from "../../services/directoryService";
import { fetchAppointmentsDetailed } from "../../services/appointmentService";
import { notifyPatientById } from "../../services/notificationService";
import { PageHeader, fmtDate } from "../../components/ui";

const FREQUENCIES = [
  "Once daily", "Twice daily", "Three times daily", "Four times daily",
  "Every 8 hours", "At bedtime", "Only when needed",
].map((value) => ({ value, label: value }));

const Prescription = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const selectedPatient = Form.useWatch("patient_id", form);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);

  const load = useCallback(async () => {
    try {
      const doctorRow = await getDoctorByUserId(user.id);
      if (!doctorRow) return;

      const [appts, rx] = await Promise.all([
        fetchAppointmentsDetailed({ doctorId: doctorRow.id }),
        supabase
          .from("prescriptions")
          .select("*")
          .eq("doctor_id", doctorRow.id)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (rx.error) throw rx.error;

      const names = await fetchPatientNames((rx.data || []).map((r) => r.patient_id));

      setDoctor(doctorRow);
      setAppointments(appts);
      setHistory((rx.data || []).map((r) => ({ ...r, patient_name: names[r.patient_id] || "Patient" })));
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    load();
  }, [load]);

  // One entry per patient who has booked with this doctor
  const patientOptions = Object.values(
    appointments.reduce((acc, a) => {
      acc[a.patient_id] = { value: a.patient_id, label: a.patient_name };
      return acc;
    }, {})
  );

  const appointmentOptions = appointments
    .filter((a) => a.patient_id === selectedPatient)
    .map((a) => ({ value: a.id, label: `${fmtDate(a.appointment_date)} - ${a.reason || "Consultation"}` }));

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const rows = values.medicines.map((m) => ({
        patient_id: values.patient_id,
        doctor_id: doctor.id,
        appointment_id: values.appointment_id || null,
        medicine_name: m.medicine_name.trim(),
        dosage: m.dosage || null,
        frequency: m.frequency || null,
        duration: m.duration || null,
        instructions: m.instructions || null,
        prescribed_date: values.prescribed_date.format("YYYY-MM-DD"),
      }));

      const { error } = await supabase.from("prescriptions").insert(rows);
      if (error) throw error;

      await notifyPatientById(
        values.patient_id,
        "New prescription",
        `Dr. ${user.full_name} prescribed ${rows.length} medicine${rows.length > 1 ? "s" : ""} for you.`
      );

      message.success("Prescription saved");
      form.resetFields();
      form.setFieldsValue({ medicines: [{}], prescribed_date: dayjs() });
      load();
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    const { error } = await supabase.from("prescriptions").delete().eq("id", id);
    if (error) return message.error(error.message);
    setHistory((prev) => prev.filter((r) => r.id !== id));
  };

  if (!loading && !doctor) {
    return (
      <Result
        status="info"
        title="Complete your doctor profile first"
        extra={<Link to="/doctor/profile"><Button type="primary">Go to profile</Button></Link>}
      />
    );
  }

  const columns = [
    { title: "Date", dataIndex: "prescribed_date", render: fmtDate },
    { title: "Patient", dataIndex: "patient_name" },
    { title: "Medicine", dataIndex: "medicine_name" },
    { title: "Dosage", dataIndex: "dosage" },
    { title: "Frequency", dataIndex: "frequency" },
    { title: "Duration", dataIndex: "duration" },
    {
      title: "",
      render: (_, r) => (
        <Popconfirm title="Delete this prescription?" onConfirm={() => remove(r.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Prescriptions" subtitle="Write a prescription and the patient is notified instantly" />

      <Card title="New prescription" style={{ borderRadius: 14 }} loading={loading}>
        {patientOptions.length === 0 && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="Patients appear here once they have booked an appointment with you."
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ prescribed_date: dayjs(), medicines: [{}] }}
        >
          <Row gutter={16}>
            <Col xs={24} md={10}>
              <Form.Item name="patient_id" label="Patient" rules={[{ required: true, message: "Select a patient" }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select patient"
                  options={patientOptions}
                  onChange={() => form.setFieldValue("appointment_id", undefined)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={9}>
              <Form.Item name="appointment_id" label="Appointment (optional)">
                <Select allowClear placeholder="Link to an appointment" options={appointmentOptions} disabled={!selectedPatient} />
              </Form.Item>
            </Col>
            <Col xs={24} md={5}>
              <Form.Item name="prescribed_date" label="Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.List name="medicines">
            {(fields, { add, remove: removeField }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 12, background: "#f8fafc" }}
                    extra={
                      fields.length > 1 && (
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeField(name)} />
                      )
                    }
                  >
                    <Row gutter={12}>
                      <Col xs={24} md={8}>
                        <Form.Item {...rest} name={[name, "medicine_name"]} label="Medicine" rules={[{ required: true, message: "Required" }]}>
                          <Input prefix={<MedicineBoxOutlined />} placeholder="e.g. Paracetamol 500mg" />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={4}>
                        <Form.Item {...rest} name={[name, "dosage"]} label="Dosage">
                          <Input placeholder="1 tablet" />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Item {...rest} name={[name, "frequency"]} label="Frequency">
                          <Select allowClear placeholder="How often" options={FREQUENCIES} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item {...rest} name={[name, "duration"]} label="Duration">
                          <Input placeholder="5 days" />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item {...rest} name={[name, "instructions"]} label="Instructions" style={{ marginBottom: 0 }}>
                          <Input placeholder="e.g. Take after food" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}

                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add({})} style={{ marginBottom: 16 }}>
                  Add another medicine
                </Button>
              </>
            )}
          </Form.List>

          <Button type="primary" htmlType="submit" loading={saving} size="large">
            Save prescription
          </Button>
        </Form>
      </Card>

      <Card title="Prescription history" style={{ marginTop: 16, borderRadius: 14 }}>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={history}
          pagination={{ pageSize: 8 }}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </>
  );
};

export default Prescription;
