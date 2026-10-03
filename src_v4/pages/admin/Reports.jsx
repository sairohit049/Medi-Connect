import React, { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Row, Col, Card, Table, DatePicker, Button, Statistic, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { supabase } from "../../services/supabase";
import { fetchAppointmentsDetailed } from "../../services/appointmentService";
import { PageHeader, StatusTag, fmtDate, fmtTime } from "../../components/ui";

const { RangePicker } = DatePicker;

const Reports = () => {
  const [range, setRange] = useState([dayjs().subtract(30, "day"), dayjs()]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [revenue, setRevenue] = useState(0);

  const load = useCallback(async () => {
    if (!range?.[0] || !range?.[1]) return;
    setLoading(true);
    try {
      const from = range[0].format("YYYY-MM-DD");
      const to = range[1].format("YYYY-MM-DD");

      const [list, payments] = await Promise.all([
        fetchAppointmentsDetailed({ from, to }),
        supabase
          .from("payments")
          .select("amount")
          .eq("payment_status", "paid")
          .gte("created_at", range[0].startOf("day").toISOString())
          .lte("created_at", range[1].endOf("day").toISOString()),
      ]);

      setAppointments(list);
      setRevenue((payments.data || []).reduce((sum, p) => sum + Number(p.amount || 0), 0));
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const countStatus = (status) => appointments.filter((a) => a.status === status).length;

  // Per-doctor summary
  const perDoctor = Object.values(
    appointments.reduce((acc, a) => {
      const row = (acc[a.doctor_id] ||= { id: a.doctor_id, doctor: a.doctor_name, total: 0, completed: 0, cancelled: 0 });
      row.total += 1;
      if (a.status === "completed") row.completed += 1;
      if (a.status === "cancelled") row.cancelled += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  const exportCsv = () => {
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = ["Date", "Time", "Patient", "Doctor", "Reason", "Status"];
    const lines = appointments.map((a) =>
      [a.appointment_date, fmtTime(a.appointment_time), a.patient_name, a.doctor_name, a.reason, a.status].map(escape).join(",")
    );

    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `appointments_${range[0].format("YYYYMMDD")}_${range[1].format("YYYYMMDD")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const doctorColumns = [
    { title: "Doctor", dataIndex: "doctor", render: (v) => `Dr. ${v}` },
    { title: "Appointments", dataIndex: "total", sorter: (a, b) => a.total - b.total },
    { title: "Completed", dataIndex: "completed" },
    { title: "Cancelled", dataIndex: "cancelled" },
  ];

  const listColumns = [
    { title: "Date", dataIndex: "appointment_date", render: fmtDate },
    { title: "Time", dataIndex: "appointment_time", render: fmtTime },
    { title: "Patient", dataIndex: "patient_name" },
    { title: "Doctor", dataIndex: "doctor_name" },
    { title: "Status", dataIndex: "status", render: (s) => <StatusTag status={s} /> },
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Appointments and revenue for a date range"
        extra={
          <>
            <RangePicker value={range} onChange={setRange} allowClear={false} />
            <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={!appointments.length} style={{ marginLeft: 8 }}>
              Export CSV
            </Button>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={12} xl={5}><Card loading={loading}><Statistic title="Total" value={appointments.length} /></Card></Col>
        <Col xs={12} xl={5}><Card loading={loading}><Statistic title="Completed" value={countStatus("completed")} /></Card></Col>
        <Col xs={12} xl={5}><Card loading={loading}><Statistic title="Pending" value={countStatus("pending")} /></Card></Col>
        <Col xs={12} xl={5}><Card loading={loading}><Statistic title="Cancelled" value={countStatus("cancelled")} /></Card></Col>
        <Col xs={24} xl={4}><Card loading={loading}><Statistic title="Revenue (₹)" value={revenue} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={10}>
          <Card title="By doctor" style={{ borderRadius: 14 }}>
            <Table rowKey="id" loading={loading} columns={doctorColumns} dataSource={perDoctor} pagination={false} size="small" />
          </Card>
        </Col>
        <Col xs={24} xl={14}>
          <Card title="All appointments in range" style={{ borderRadius: 14 }}>
            <Table rowKey="id" loading={loading} columns={listColumns} dataSource={appointments} pagination={{ pageSize: 6 }} size="small" scroll={{ x: "max-content" }} />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Reports;
