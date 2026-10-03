import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Table, Button, Flex, Typography, message } from "antd";
import {
  CalendarOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import { ensurePatientRecord } from "../../services/patientService";
import { fetchAppointmentsDetailed } from "../../services/appointmentService";
import { PageHeader, StatCard, StatusTag, fmtDate, fmtTime, todayString } from "../../components/ui";

const { Text, Title } = Typography;

const countOf = (table, column, value) =>
  supabase.from(table).select("id", { count: "exact", head: true }).eq(column, value);

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [counts, setCounts] = useState({ records: 0, prescriptions: 0, unread: 0 });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const patient = await ensurePatientRecord(user.id);

        const [list, records, prescriptions, unread] = await Promise.all([
          fetchAppointmentsDetailed({ patientId: patient.id }),
          countOf("medical_records", "patient_id", patient.id),
          countOf("prescriptions", "patient_id", patient.id),
          countOf("notifications", "user_id", user.id).eq("is_read", false),
        ]);

        if (!active) return;
        setAppointments(list);
        setCounts({
          records: records.count || 0,
          prescriptions: prescriptions.count || 0,
          unread: unread.count || 0,
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
  }, [user.id]);

  const today = todayString();
  const upcoming = appointments
    .filter((a) => a.appointment_date >= today && !["completed", "cancelled"].includes(a.status))
    .sort((a, b) =>
      `${a.appointment_date} ${a.appointment_time}`.localeCompare(`${b.appointment_date} ${b.appointment_time}`)
    );

  const columns = [
    { title: "Date", dataIndex: "appointment_date", render: fmtDate },
    { title: "Time", dataIndex: "appointment_time", render: fmtTime },
    {
      title: "Doctor",
      render: (_, r) => (
        <>
          <Text strong>Dr. {r.doctor_name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{r.specialization}</Text>
        </>
      ),
    },
    { title: "Reason", dataIndex: "reason", ellipsis: true },
    { title: "Status", dataIndex: "status", render: (s) => <StatusTag status={s} /> },
  ];

  return (
    <>
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 16,
          background: "linear-gradient(120deg, #0f766e, #14b8a6)",
          border: "none",
        }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
          <div>
            <Title level={3} style={{ color: "#fff", margin: 0 }}>
              {greeting()}, {user.full_name}
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.85)" }}>
              {upcoming.length
                ? `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? "s" : ""}.`
                : "No upcoming appointments. Book one whenever you're ready."}
            </Text>
          </div>
          <Button size="large" onClick={() => navigate("/patient/book-appointment")}>
            Book appointment
          </Button>
        </Flex>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard loading={loading} title="Upcoming appointments" value={upcoming.length} icon={<CalendarOutlined />} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard loading={loading} title="Medical records" value={counts.records} icon={<FileTextOutlined />} color="#6366f1" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard loading={loading} title="Prescriptions" value={counts.prescriptions} icon={<MedicineBoxOutlined />} color="#ec4899" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard loading={loading} title="Unread notifications" value={counts.unread} icon={<BellOutlined />} color="#f59e0b" />
        </Col>
      </Row>

      <Card
        title="Upcoming appointments"
        style={{ marginTop: 16, borderRadius: 14 }}
        extra={<Button type="link" onClick={() => navigate("/patient/appointments")}>See all</Button>}
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={upcoming.slice(0, 5)}
          pagination={false}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "Nothing scheduled" }}
        />
      </Card>
    </>
  );
};

export default PatientDashboard;
