import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Table, Progress, Button, Flex, Typography, message } from "antd";
import {
  TeamOutlined, SolutionOutlined, IdcardOutlined, CalendarOutlined, DollarOutlined, ScheduleOutlined,
} from "@ant-design/icons";
import { supabase } from "../../services/supabase";
import { fetchAppointmentsDetailed } from "../../services/appointmentService";
import { HeroBanner, StatCard, StatusTag, fmtDate, fmtTime, todayString } from "../../components/ui";

const { Text } = Typography;

const count = (table) => supabase.from(table).select("id", { count: "exact", head: true });

const STATUS_COLORS = {
  pending: "#f59e0b", scheduled: "#3b82f6", confirmed: "#22c55e",
  checked_in: "#06b6d4", completed: "#8b5cf6", cancelled: "#ef4444",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ patients: 0, doctors: 0, receptionists: 0, appointments: 0, today: 0, revenue: 0 });
  const [byStatus, setByStatus] = useState({});
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [patients, doctors, receptionists, all, today, payments, latest] = await Promise.all([
          count("patients"),
          count("doctors"),
          count("receptionists"),
          supabase.from("appointments").select("status"),
          count("appointments").eq("appointment_date", todayString()),
          supabase.from("payments").select("amount").eq("payment_status", "paid"),
          fetchAppointmentsDetailed({ limit: 8 }),
        ]);

        const statuses = {};
        (all.data || []).forEach((a) => {
          const key = a.status || "pending";
          statuses[key] = (statuses[key] || 0) + 1;
        });

        setStats({
          patients: patients.count || 0,
          doctors: doctors.count || 0,
          receptionists: receptionists.count || 0,
          appointments: (all.data || []).length,
          today: today.count || 0,
          revenue: (payments.data || []).reduce((sum, p) => sum + Number(p.amount || 0), 0),
        });
        setByStatus(statuses);
        setRecent(latest);
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const columns = [
    { title: "Date", dataIndex: "appointment_date", render: fmtDate },
    { title: "Time", dataIndex: "appointment_time", render: fmtTime },
    { title: "Patient", dataIndex: "patient_name" },
    { title: "Doctor", dataIndex: "doctor_name", render: (v) => `Dr. ${v}` },
    { title: "Status", dataIndex: "status", render: (s) => <StatusTag status={s} /> },
  ];

  const total = stats.appointments || 1;

  return (
    <>
      <HeroBanner
        variant="admin"
        art="chart"
        title="Hospital overview"
        subtitle={
          loading
            ? "Live numbers from your database."
            : `${stats.today} appointment${stats.today === 1 ? "" : "s"} today across ${stats.doctors} doctor${stats.doctors === 1 ? "" : "s"}. Live numbers from your database.`
        }
        actions={
          <Button size="large" onClick={() => navigate("/admin/reports")}>
            Open reports
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={8}><StatCard loading={loading} title="Patients" value={stats.patients} icon={<TeamOutlined />} /></Col>
        <Col xs={24} sm={12} xl={8}><StatCard loading={loading} title="Doctors" value={stats.doctors} icon={<SolutionOutlined />} color="#6366f1" /></Col>
        <Col xs={24} sm={12} xl={8}><StatCard loading={loading} title="Receptionists" value={stats.receptionists} icon={<IdcardOutlined />} color="#ec4899" /></Col>
        <Col xs={24} sm={12} xl={8}><StatCard loading={loading} title="Total appointments" value={stats.appointments} icon={<CalendarOutlined />} color="#0ea5e9" /></Col>
        <Col xs={24} sm={12} xl={8}><StatCard loading={loading} title="Today's appointments" value={stats.today} icon={<ScheduleOutlined />} color="#f59e0b" /></Col>
        <Col xs={24} sm={12} xl={8}><StatCard loading={loading} title="Revenue collected (₹)" value={stats.revenue} icon={<DollarOutlined />} color="#22c55e" /></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={9}>
          <Card title="Appointments by status" style={{ borderRadius: 14 }} loading={loading}>
            <Flex vertical gap={14}>
              {Object.keys(byStatus).length === 0 && <Text type="secondary">No appointments yet</Text>}
              {Object.entries(byStatus).map(([status, n]) => (
                <div key={status}>
                  <Flex justify="space-between">
                    <StatusTag status={status} />
                    <Text strong>{n}</Text>
                  </Flex>
                  <Progress percent={Math.round((n / total) * 100)} strokeColor={STATUS_COLORS[status]} />
                </div>
              ))}
            </Flex>
          </Card>
        </Col>

        <Col xs={24} xl={15}>
          <Card
            title="Recent appointments"
            style={{ borderRadius: 14 }}
            extra={<Button type="link" onClick={() => navigate("/admin/reports")}>Reports</Button>}
          >
            <Table rowKey="id" loading={loading} columns={columns} dataSource={recent} pagination={false} scroll={{ x: "max-content" }} />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminDashboard;
