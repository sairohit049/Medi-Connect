import React, { useCallback, useEffect, useState } from "react";
import { Card, Table, Button, Modal, Form, InputNumber, Select, Input, Tag, Space, message } from "antd";
import { LoginOutlined, DollarOutlined } from "@ant-design/icons";
import { supabase } from "../../services/supabase";
import { fetchAppointmentsDetailed, setAppointmentStatus } from "../../services/appointmentService";
import { PageHeader, StatusTag, fmtTime, fmtDate, todayString } from "../../components/ui";

const WAITING = ["pending", "scheduled", "confirmed"];

const CheckIn = () => {
  const [form] = Form.useForm();
  const [rows, setRows] = useState([]);
  const [paid, setPaid] = useState({}); // appointment_id -> payment row
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAppointmentsDetailed({ date: todayString() });
      setRows(list.sort((a, b) => String(a.appointment_time).localeCompare(String(b.appointment_time))));

      if (list.length) {
        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .in("appointment_id", list.map((a) => a.id))
          .eq("payment_status", "paid");
        if (error) throw error;

        const map = {};
        (data || []).forEach((p) => (map[p.appointment_id] = p));
        setPaid(map);
      } else {
        setPaid({});
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const checkIn = async (record) => {
    try {
      await setAppointmentStatus(record, "checked_in");
      setRows((prev) => prev.map((a) => (a.id === record.id ? { ...a, status: "checked_in" } : a)));
      message.success(`${record.patient_name} checked in`);
    } catch (error) {
      message.error(error.message);
    }
  };

  const openPayment = (record) => {
    setPaying(record);
    form.setFieldsValue({ amount: record.consultation_fee ?? 0, payment_method: "Cash", transaction_id: undefined });
  };

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("payments").insert([
        {
          appointment_id: paying.id,
          patient_id: paying.patient_id,
          amount: values.amount,
          payment_status: "paid",
          payment_method: values.payment_method,
          transaction_id: values.transaction_id || null,
          paid_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;

      message.success("Payment recorded");
      setPaying(null);
      load();
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: "Time", dataIndex: "appointment_time", render: fmtTime },
    { title: "Patient", dataIndex: "patient_name", render: (v) => <strong>{v}</strong> },
    { title: "Doctor", dataIndex: "doctor_name", render: (v) => `Dr. ${v}` },
    { title: "Status", dataIndex: "status", render: (s) => <StatusTag status={s} /> },
    {
      title: "Payment",
      render: (_, r) =>
        paid[r.id] ? <Tag color="green">Paid ₹{paid[r.id].amount}</Tag> : <Tag color="orange">Unpaid</Tag>,
    },
    {
      title: "",
      render: (_, r) => (
        <Space>
          {WAITING.includes(r.status) && (
            <Button type="primary" size="small" icon={<LoginOutlined />} onClick={() => checkIn(r)}>
              Check in
            </Button>
          )}
          {!paid[r.id] && r.status !== "cancelled" && (
            <Button size="small" icon={<DollarOutlined />} onClick={() => openPayment(r)}>
              Collect payment
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Check-in & payments" subtitle={`Today · ${fmtDate(todayString())}`} />

      <Card style={{ borderRadius: 14 }}>
        <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} pagination={false} scroll={{ x: "max-content" }} locale={{ emptyText: "No appointments today" }} />
      </Card>

      <Modal
        title={`Collect payment - ${paying?.patient_name || ""}`}
        open={!!paying}
        forceRender
        onCancel={() => setPaying(null)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Record payment"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="payment_method" label="Method" rules={[{ required: true }]}>
            <Select options={["Cash", "Card", "UPI"].map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item name="transaction_id" label="Transaction ID (optional)">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CheckIn;
