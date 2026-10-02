import React, { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Card, Table, Button, Modal, Form, Select, DatePicker, Input, Dropdown, Flex, message } from "antd";
import { PlusOutlined, DownOutlined, SearchOutlined } from "@ant-design/icons";
import {
  fetchAppointmentsDetailed, createAppointment, setAppointmentStatus, TIME_SLOTS,
} from "../../services/appointmentService";
import { fetchPatientsWithProfiles } from "../../services/directoryService";
import { fetchDoctorsWithNames } from "../../services/doctorService";
import { PageHeader, StatusTag, fmtDate, fmtTime } from "../../components/ui";

const STATUS_ACTIONS = [
  { key: "confirmed", label: "Confirm" },
  { key: "checked_in", label: "Check in" },
  { key: "completed", label: "Mark completed" },
  { key: "cancelled", label: "Cancel", danger: true },
];

const Appointments = () => {
  const [form] = Form.useForm();
  const [rows, setRows] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState();
  const [dateFilter, setDateFilter] = useState(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, patientList, doctorList] = await Promise.all([
        fetchAppointmentsDetailed(),
        fetchPatientsWithProfiles(),
        fetchDoctorsWithNames(),
      ]);
      setRows(list);
      setPatients(patientList);
      setDoctors(doctorList);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      await createAppointment({
        patient_id: values.patient_id,
        doctor_id: values.doctor_id,
        appointment_date: values.date.format("YYYY-MM-DD"),
        appointment_time: values.time,
        reason: values.reason?.trim() || "General consultation",
        status: "confirmed",
      });
      message.success("Appointment booked");
      setOpen(false);
      form.resetFields();
      load();
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (record, status) => {
    try {
      await setAppointmentStatus(record, status);
      setRows((prev) => prev.map((a) => (a.id === record.id ? { ...a, status } : a)));
      message.success(`Marked as ${status.replace("_", " ")}`);
    } catch (error) {
      message.error(error.message);
    }
  };

  const filtered = rows.filter(
    (a) =>
      (!statusFilter || a.status === statusFilter) &&
      (!dateFilter || a.appointment_date === dateFilter.format("YYYY-MM-DD")) &&
      `${a.patient_name} ${a.doctor_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: "Date", dataIndex: "appointment_date", render: fmtDate },
    { title: "Time", dataIndex: "appointment_time", render: fmtTime },
    { title: "Patient", dataIndex: "patient_name", render: (v) => <strong>{v}</strong> },
    { title: "Doctor", dataIndex: "doctor_name", render: (v) => `Dr. ${v}` },
    { title: "Reason", dataIndex: "reason", ellipsis: true },
    { title: "Status", dataIndex: "status", render: (s) => <StatusTag status={s} /> },
    {
      title: "",
      render: (_, r) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: STATUS_ACTIONS.filter((a) => a.key !== r.status),
            onClick: ({ key }) => changeStatus(r, key),
          }}
        >
          <Button size="small">Update <DownOutlined /></Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle={`${rows.length} total`}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Book appointment</Button>}
      />

      <Card style={{ borderRadius: 14 }}>
        <Flex gap={12} wrap="wrap" style={{ marginBottom: 16 }}>
          <Input allowClear prefix={<SearchOutlined />} placeholder="Search patient or doctor" style={{ width: 260 }} onChange={(e) => setSearch(e.target.value)} />
          <DatePicker value={dateFilter} onChange={setDateFilter} placeholder="Filter by date" />
          <Select
            allowClear
            placeholder="Status"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={["pending", "scheduled", "confirmed", "checked_in", "completed", "cancelled"].map((v) => ({ value: v, label: v.replace("_", " ") }))}
          />
        </Flex>
        <Table rowKey="id" loading={loading} columns={columns} dataSource={filtered} pagination={{ pageSize: 8 }} scroll={{ x: "max-content" }} />
      </Card>

      <Modal
        title="Book appointment"
        open={open}
        forceRender
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Book"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="patient_id" label="Patient" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Select patient"
              options={patients.map((p) => ({ value: p.id, label: `${p.full_name}${p.phone ? ` (${p.phone})` : ""}` }))}
            />
          </Form.Item>
          <Form.Item name="doctor_id" label="Doctor" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Select doctor"
              options={doctors.map((d) => ({ value: d.id, label: `Dr. ${d.full_name} - ${d.specialization || "Doctor"}` }))}
            />
          </Form.Item>
          <Flex gap={12}>
            <Form.Item name="date" label="Date" rules={[{ required: true }]} style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} disabledDate={(d) => d && d.isBefore(dayjs().startOf("day"))} />
            </Form.Item>
            <Form.Item name="time" label="Time" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select placeholder="Select slot" options={TIME_SLOTS.map((t) => ({ value: t, label: t }))} />
            </Form.Item>
          </Flex>
          <Form.Item name="reason" label="Reason for visit">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Appointments;
