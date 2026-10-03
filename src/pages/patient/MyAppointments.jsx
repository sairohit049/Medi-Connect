import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Button, Segmented, Popconfirm, Typography, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { ensurePatientRecord } from "../../services/patientService";
import { fetchAppointmentsDetailed, setAppointmentStatus } from "../../services/appointmentService";
import { notifyDoctorById } from "../../services/notificationService";
import { PageHeader, StatusTag, EmptyState, CARD_STYLE, fmtDate, fmtTime, todayString } from "../../components/ui";

const { Text } = Typography;

const OPEN = ["pending", "confirmed", "scheduled"];

const MyAppointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("upcoming");

  const load = useCallback(async () => {
    try {
      const patient = await ensurePatientRecord(user.id);
      setAppointments(await fetchAppointmentsDetailed({ patientId: patient.id }));
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const today = todayString();

  const groups = useMemo(() => {
    const isUpcoming = (a) => a.appointment_date >= today && ["pending", "confirmed", "scheduled", "checked_in"].includes(a.status);
    return {
      all: appointments,
      upcoming: appointments.filter(isUpcoming),
      past: appointments.filter((a) => !isUpcoming(a) && a.status !== "cancelled"),
      cancelled: appointments.filter((a) => a.status === "cancelled"),
    };
  }, [appointments, today]);

  const cancel = async (appointment) => {
    try {
      await setAppointmentStatus(appointment, "cancelled");
      await notifyDoctorById(
        appointment.doctor_id,
        "Appointment cancelled",
        `${user.full_name} cancelled the appointment on ${fmtDate(appointment.appointment_date)} at ${fmtTime(appointment.appointment_time)}.`
      );
      setAppointments((prev) => prev.map((a) => (a.id === appointment.id ? { ...a, status: "cancelled" } : a)));
      message.success("Appointment cancelled");
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    { title: "Date", dataIndex: "appointment_date", render: fmtDate },
    { title: "Time", dataIndex: "appointment_time", render: fmtTime },
    {
      title: "Doctor",
      render: (_, r) => (
        <>
          <Text strong>Dr. {r.doctor_name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.specialization}
          </Text>
        </>
      ),
    },
    { title: "Reason", dataIndex: "reason", ellipsis: true },
    { title: "Status", dataIndex: "status", render: (s) => <StatusTag status={s} /> },
    {
      title: "",
      align: "right",
      render: (_, r) =>
        OPEN.includes(r.status) && r.appointment_date >= today ? (
          <Popconfirm title="Cancel this appointment?" okText="Yes, cancel" okButtonProps={{ danger: true }} onConfirm={() => cancel(r)}>
            <Button size="small" danger>
              Cancel
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  const bookButton = (
    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/patient/book-appointment")}>
      Book appointment
    </Button>
  );

  return (
    <>
      <PageHeader title="My appointments" subtitle="View and manage your appointments" extra={bookButton} />

      {!loading && appointments.length === 0 ? (
        <EmptyState
          kind="calendar"
          title="No appointments yet"
          description="Book your first appointment with one of our doctors."
          action={bookButton}
        />
      ) : (
        <Card style={CARD_STYLE}>
          <div style={{ overflowX: "auto", marginBottom: 16 }}>
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { value: "upcoming", label: `Upcoming (${groups.upcoming.length})` },
                { value: "past", label: `Past (${groups.past.length})` },
                { value: "cancelled", label: `Cancelled (${groups.cancelled.length})` },
                { value: "all", label: `All (${groups.all.length})` },
              ]}
            />
          </div>

          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={groups[filter]}
            pagination={{ pageSize: 8, hideOnSinglePage: true }}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Nothing here" }}
          />
        </Card>
      )}
    </>
  );
};

export default MyAppointments;
