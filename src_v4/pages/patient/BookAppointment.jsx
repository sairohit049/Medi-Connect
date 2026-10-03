import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Row, Col, Card, Form, Input, Select, DatePicker, Button, Flex, Tag, Descriptions, Alert, Typography, message } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import { fetchDoctorsWithNames } from "../../services/doctorService";
import { ensurePatientRecord } from "../../services/patientService";
import { createAppointment, TIME_SLOTS } from "../../services/appointmentService";
import { PageHeader, CARD_STYLE, slotLabel } from "../../components/ui";

const { Text } = Typography;

// Form.Item hands this component `value` / `onChange`
const SlotPicker = ({ value, onChange, isDisabled }) => (
  <Flex wrap="wrap" gap={8}>
    {TIME_SLOTS.map((slot) => (
      <Button
        key={slot}
        type={value === slot ? "primary" : "default"}
        disabled={isDisabled(slot)}
        onClick={() => onChange?.(slot)}
      >
        {slotLabel(slot)}
      </Button>
    ))}
  </Flex>
);

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  const doctorId = Form.useWatch("doctor_id", form);
  const date = Form.useWatch("date", form);

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [booked, setBooked] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Load doctors, and pre-select one when we arrive from "Find doctor"
  useEffect(() => {
    let active = true;

    fetchDoctorsWithNames()
      .then((data) => {
        if (!active) return;
        setDoctors(data || []);

        const wanted = searchParams.get("doctor");
        const match = (data || []).find((d) => String(d.id) === wanted);
        if (match) form.setFieldValue("doctor_id", match.id);
      })
      .catch((error) => message.error(error.message))
      .finally(() => active && setLoadingDoctors(false));

    return () => {
      active = false;
    };
  }, [form, searchParams]);

  // Slots already taken for this doctor on this day
  useEffect(() => {
    if (!doctorId || !date) {
      setBooked([]);
      return undefined;
    }

    let active = true;

    supabase
      .from("appointments")
      .select("appointment_time")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", date.format("YYYY-MM-DD"))
      .neq("status", "cancelled")
      .then(({ data }) => {
        if (active) setBooked((data || []).map((row) => String(row.appointment_time).slice(0, 5)));
      });

    return () => {
      active = false;
    };
  }, [doctorId, date]);

  const doctor = doctors.find((d) => d.id === doctorId);

  const isSlotDisabled = (slot) => {
    if (!date) return true;
    if (booked.includes(slot)) return true;
    return dayjs(`${date.format("YYYY-MM-DD")} ${slot}`).isBefore(dayjs());
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const patient = await ensurePatientRecord(user.id);

      await createAppointment({
        patient_id: patient.id,
        doctor_id: values.doctor_id,
        appointment_date: values.date.format("YYYY-MM-DD"),
        appointment_time: values.time,
        reason: values.reason.trim(),
      });

      message.success("Appointment requested. The doctor will confirm it shortly.");
      navigate("/patient/appointments");
    } catch (error) {
      message.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Book an appointment" subtitle="Choose a doctor, a day and a time that suits you" />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card style={CARD_STYLE}>
            {!loadingDoctors && doctors.length === 0 && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message="No doctors are listed yet. Please check back soon."
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onValuesChange={(changed) => {
                if ("doctor_id" in changed || "date" in changed) form.setFieldValue("time", undefined);
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={14}>
                  <Form.Item name="doctor_id" label="Doctor" rules={[{ required: true, message: "Choose a doctor" }]}>
                    <Select
                      showSearch
                      size="large"
                      loading={loadingDoctors}
                      optionFilterProp="label"
                      placeholder="Choose a doctor"
                      options={doctors.map((d) => ({
                        value: d.id,
                        label: `Dr. ${d.full_name}${d.specialization ? ` - ${d.specialization}` : ""}`,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={10}>
                  <Form.Item name="date" label="Date" rules={[{ required: true, message: "Pick a date" }]}>
                    <DatePicker
                      size="large"
                      style={{ width: "100%" }}
                      disabledDate={(d) => d && d.isBefore(dayjs().startOf("day"))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="time"
                label="Time slot"
                extra={!date ? "Pick a date to see available times" : "Greyed-out times are already booked or have passed"}
                rules={[{ required: true, message: "Pick a time slot" }]}
              >
                <SlotPicker isDisabled={isSlotDisabled} />
              </Form.Item>

              <Form.Item
                name="reason"
                label="Reason for visit"
                rules={[{ required: true, whitespace: true, message: "Briefly describe the reason for your visit" }]}
              >
                <Input.TextArea rows={4} maxLength={300} showCount placeholder="Briefly describe the reason for your visit" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={submitting}
                disabled={doctors.length === 0}
              >
                Request appointment
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Your doctor" style={CARD_STYLE}>
            {doctor ? (
              <>
                <Text strong style={{ fontSize: 16 }}>
                  Dr. {doctor.full_name}
                </Text>
                <div style={{ margin: "6px 0 14px" }}>
                  <Tag color="cyan">{doctor.specialization || "General Physician"}</Tag>
                </div>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Qualification">{doctor.qualification || "-"}</Descriptions.Item>
                  <Descriptions.Item label="Experience">
                    {doctor.experience != null ? `${doctor.experience} years` : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Fee">
                    {doctor.consultation_fee != null ? `₹${doctor.consultation_fee}` : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label={<ClockCircleOutlined />}>{doctor.availability || "-"}</Descriptions.Item>
                </Descriptions>
              </>
            ) : (
              <Text type="secondary">Select a doctor to see their details here.</Text>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default BookAppointment;
