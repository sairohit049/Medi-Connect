import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Table, Button, message } from "antd";
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, SafetyCertificateOutlined, UserAddOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { fetchAppointmentsDetailed } from "../../services/appointmentService";
import { HeroBanner, StatCard, StatusTag, fmtDate, fmtTime, todayString } from "../../components/ui";

const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await fetchAppointmentsDetailed({ date: todayString() });
        setToday(list.sort((a, b) => String(a.appointment_time).localeCompare(String(b.appointment_time))));
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const countOf = (...statuses) => today.filter((a) => statuses.includes(a.status)).length;

  const columns = [
    { title: "Time", dataIndex: "appointment_time", render: fmtTime },
    { title: "Patient", dataIndex: "patient_name" },
    { title: "Doctor", dataIndex: "doctor_name", render: (v) => `Dr. ${v}` },
    { title: "Reason", dataIndex: "reason", ellipsis: true },
    { title: "Status", dataIndex: "status", render: (s) => <StatusTag status={s} /> },
  ];

  return (
    <>
      <HeroBanner
        variant="receptionist"
        art="patients"
        title={`Hello, ${user.full_name}`}
        subtitle={
          loading
            ? `Front desk for ${fmtDate(todayString())}.`
            : `Front desk for ${fmtDate(todayString())}. ${today.length} appointment${today.length === 1 ? "" : "s"} on the schedule.`
        }
        actions={
          <>
            <Button size="large" onClick={() => navigate("/receptionist/appointments")}>
              Book appointment
            </Button>
            <Button size="large" ghost icon={<UserAddOutlined />} onClick={() => navigate("/receptionist/register-patient")}>
              Register patient
            </Button>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}><StatCard loading={loading} title="Today's appointments" value={today.length} icon={<CalendarOutlined />} /></Col>
        <Col xs={24} sm={12} xl={6}><StatCard loading={loading} title="Waiting to arrive" value={countOf("pending", "scheduled", "confirmed")} icon={<ClockCircleOutlined />} color="#f59e0b" /></Col>
        <Col xs={24} sm={12} xl={6}><StatCard loading={loading} title="Checked in" value={countOf("checked_in")} icon={<SafetyCertificateOutlined />} color="#06b6d4" /></Col>
        <Col xs={24} sm={12} xl={6}><StatCard loading={loading} title="Completed" value={countOf("completed")} icon={<CheckCircleOutlined />} color="#8b5cf6" /></Col>
      </Row>

      <Card title="Today's schedule" style={{ marginTop: 16, borderRadius: 14 }} extra={<Button type="link" onClick={() => navigate("/receptionist/check-in")}>Open check-in</Button>}>
        <Table rowKey="id" loading={loading} columns={columns} dataSource={today} pagination={false} scroll={{ x: "max-content" }} locale={{ emptyText: "No appointments today" }} />
      </Card>
    </>
  );
};

export default ReceptionistDashboard;
