import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Button, Segmented, Popconfirm, Flex, Typography, message } from "antd";
import { useAuth } from "../../context/AuthContext";
import { getDoctorByUserId } from "../../services/directoryService";
import { fetchAppointmentsDetailed, setAppointmentStatus } from "../../services/appointmentService";
import { PageHeader, StatusTag, EmptyState, CARD_STYLE, fmtDate, fmtTime, todayString } from "../../components/ui";

const { Text } = Typography;

const ACTIVE = ["confirmed", "scheduled", "checked_in"];

const DoctorAppointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const doctorRow = await getDoctorByUserId(user.id);
      setDoctor(doctorRow);
      if (doctorRow) setAppointments(await fetchAppointmentsDetailed({ doctorId: doctorRow.id }));
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

  const groups = useMemo(
    () => ({
      all: appointments,
      today: appointments.filter((a) => a.appointment_date === today && a.status !== "cancelled"),
      pending: appointments.filter((a) => a.status === "pending"),
      confirmed: appointments.filter((a) => ACTIVE.includes(a.status)),
      completed: appointments.filter((a) => a.status === "completed"),
      cancelled: appointments.filter((a) => a.status === "cancelled"),
    }),
    [appointments, today]
  );

  const changeStatus = async (appointment, status) => {
    setBusyId(appointment.id);
    try {
      await setAppointmentStatus(appointment, status);
      setAppointments((prev) => prev.map((a) => (a.id === appointment.id ? { ...a, status } : a)));
      message.success(`Appointment marked as ${status.replace("_", " ")}`);
    } catch (error) {
      message.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "appointment_date",
      render: fmtDate,
      sorter: (a, b) => a.appointment_date.localeCompare(b.appointment_date),
    },
    { title: "Time", dataIndex: "appointment_time", render: fmtTime },
    {
      title: "Patient",
      render: (_, r) => (
        <>
          <Text strong>{r.patient_name}</Text>
          {r.patient_phone && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {r.patient_phone}
              </Text>
            </>
          )}
        </>
      ),
    },
    { title: "Reason", dataIndex: "reason", ellipsis: true },
    { title: "Status", dataIndex: "status", render: (s) => <StatusTag status={s} /> },
    {
      title: "Actions",
      render: (_, r) => (
        <Flex gap={8} wrap="wrap">
          {r.status === "pending" && (
            <>
              <Button size="small" type="primary" loading={busyId === r.id} onClick={() => changeStatus(r, "confirmed")}>
                Confirm
              </Button>
              <Popconfirm title="Cancel this appointment?" okButtonProps={{ danger: true }} onConfirm={() => changeStatus(r, "cancelled")}>
                <Button size="small" danger>
                  Cancel
                </Button>
              </Popconfirm>
            </>
          )}
          {ACTIVE.includes(r.status) && (
            <Button size="small" type="primary" loading={busyId === r.id} onClick={() => changeStatus(r, "completed")}>
              Mark completed
            </Button>
          )}
          <Button size="small" onClick={() => navigate(`/doctor/patients/${r.patient_id}`)}>
            Patient details
          </Button>
        </Flex>
      ),
    },
  ];

  if (!loading && !doctor) {
    return (
      <EmptyState
        title="Complete your doctor profile first"
        description="Patients can only book you once your profile exists."
        action={
          <Button type="primary" onClick={() => navigate("/doctor/profile")}>
            Go to profile
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader title="Appointments" subtitle="View and manage your patient appointments" />

      <Card style={CARD_STYLE}>
        <div style={{ overflowX: "auto", marginBottom: 16 }}>
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: `All (${groups.all.length})` },
              { value: "today", label: `Today (${groups.today.length})` },
              { value: "pending", label: `Pending (${groups.pending.length})` },
              { value: "confirmed", label: `Confirmed (${groups.confirmed.length})` },
              { value: "completed", label: `Completed (${groups.completed.length})` },
              { value: "cancelled", label: `Cancelled (${groups.cancelled.length})` },
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
          locale={{ emptyText: "No appointments here" }}
        />
      </Card>
    </>
  );
};

export default DoctorAppointments;
