import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Table, Button, Result, Typography, message } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import { getDoctorByUserId } from "../../services/directoryService";
import { fetchAppointmentsDetailed } from "../../services/appointmentService";
import { HeroBanner, StatCard, StatusTag, fmtDate, fmtTime, todayString } from "../../components/ui";

const { Text } = Typography;

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const doctorRow = await getDoctorByUserId(user.id);

        if (!doctorRow) return;

        const [list, recordRes] = await Promise.all([
          fetchAppointmentsDetailed({ doctorId: doctorRow.id }),
          supabase
            .from("medical_records")
            .select("id", { count: "exact", head: true })
            .eq("doctor_id", doctorRow.id),
        ]);

        if (!active) return;
        setDoctor(doctorRow);
        setAppointments(list);
        setRecords(recordRes.count || 0);
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

  if (!loading && !doctor) {
    return (
      <Result
        status="info"
        title="Complete your doctor profile"
        subTitle="Add your specialization and fee so patients can find and book you."
        extra={
          <Button type="primary" onClick={() => navigate("/doctor/profile")}>
            Set up profile
          </Button>
        }
      />
    );
  }

  const today = todayString();
  const active = appointments.filter((a) => !["completed", "cancelled"].includes(a.status));
  const todays = appointments.filter((a) => a.appointment_date === today && a.status !== "cancelled");
  const pending = appointments.filter((a) => a.status === "pending");
  const patientCount = new Set(appointments.map((a) => a.patient_id)).size;

  const upcoming = active
    .filter((a) => a.appointment_date >= today)
    .sort((a, b) =>
      `${a.appointment_date} ${a.appointment_time}`.localeCompare(`${b.appointment_date} ${b.appointment_time}`)
    )
    .slice(0, 8);

  const columns = [
    { title: "Date", dataIndex: "appointment_date", render: fmtDate },
    { title: "Time", dataIndex: "appointment_time", render: fmtTime },
    { title: "Patient", dataIndex: "patient_name", render: (v) => <Text strong>{v}</Text> },
    { title: "Reason", dataIndex: "reason", ellipsis: true },
    { title: "Status", dataIndex: "status", render: (s) => <StatusTag status={s} /> },
    {
      title: "",
      render: (_, r) => (
        <Button size="small" onClick={() => navigate(`/doctor/patients/${r.patient_id}`)}>
          View patient
        </Button>
      ),
    },
  ];

  return (
    <>
      <HeroBanner
        variant="doctor"
        art="records"
        title={`Welcome, Dr. ${user.full_name}`}
        subtitle={
          loading
            ? "Checking your schedule..."
            : todays.length
            ? `You have ${todays.length} appointment${todays.length > 1 ? "s" : ""} today${pending.length ? `, and ${pending.length} waiting for your confirmation` : ""}.`
            : `${doctor?.specialization || "Doctor"}. Nothing scheduled for today yet.`
        }
        actions={
          <>
            <Button size="large" onClick={() => navigate("/doctor/appointments")}>
              View appointments
            </Button>
            <Button size="large" ghost onClick={() => navigate("/doctor/prescriptions")}>
              Write prescription
            </Button>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard loading={loading} title="Today's appointments" value={todays.length} icon={<CalendarOutlined />} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard loading={loading} title="Awaiting confirmation" value={pending.length} icon={<ClockCircleOutlined />} color="#f59e0b" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard loading={loading} title="Patients seen" value={patientCount} icon={<TeamOutlined />} color="#6366f1" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard loading={loading} title="Records written" value={records} icon={<FileTextOutlined />} color="#ec4899" />
        </Col>
      </Row>

      <Card
        title="Upcoming appointments"
        style={{ marginTop: 16, borderRadius: 14 }}
        extra={<Button type="link" onClick={() => navigate("/doctor/appointments")}>Manage all</Button>}
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={upcoming}
          pagination={false}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "No upcoming appointments" }}
        />
      </Card>
    </>
  );
};

export default DoctorDashboard;
