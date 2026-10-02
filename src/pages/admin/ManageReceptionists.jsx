import React, { useCallback, useEffect, useState } from "react";
import { Card, Table, Button, Modal, Form, Input, Row, Col, Popconfirm, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "../../services/supabase";
import { createAccount, fetchProfilesMap } from "../../services/userService";
import { PageHeader, fmtDate } from "../../components/ui";

const ManageReceptionists = () => {
  const [form] = Form.useForm();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("receptionists").select("*").order("created_at", { ascending: false });
      if (error) throw error;

      const profiles = await fetchProfilesMap((data || []).map((r) => r.user_id));
      setRows(
        (data || []).map((r) => ({
          ...r,
          full_name: profiles[r.user_id]?.full_name || "-",
          email: profiles[r.user_id]?.email || "-",
          phone: profiles[r.user_id]?.phone || "-",
        }))
      );
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
      const profile = await createAccount({ ...values, role: "receptionist" });

      const { error } = await supabase.from("receptionists").insert([
        { user_id: profile.id, employee_id: values.employee_id || null, department: values.department || null },
      ]);

      if (error) {
        await supabase.from("profiles").delete().eq("id", profile.id); // undo
        throw error;
      }

      message.success("Receptionist added");
      setOpen(false);
      form.resetFields();
      load();
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (record) => {
    const { error } = await supabase.from("receptionists").delete().eq("id", record.id);
    if (error) return message.error(error.message);
    await supabase.from("profiles").delete().eq("id", record.user_id);
    message.success("Receptionist removed");
    load();
  };

  const columns = [
    { title: "Name", dataIndex: "full_name", render: (v) => <strong>{v}</strong> },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Employee ID", dataIndex: "employee_id" },
    { title: "Department", dataIndex: "department" },
    { title: "Added", dataIndex: "created_at", render: fmtDate },
    {
      title: "",
      render: (_, r) => (
        <Popconfirm title="Remove this receptionist?" onConfirm={() => remove(r)}>
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Receptionists"
        subtitle={`${rows.length} on staff`}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Add receptionist</Button>}
      />

      <Card style={{ borderRadius: 14 }}>
        <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} pagination={{ pageSize: 8 }} scroll={{ x: "max-content" }} />
      </Card>

      <Modal
        title="Add receptionist"
        open={open}
        forceRender
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Create"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24}><Form.Item name="full_name" label="Full name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="phone" label="Phone"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="employee_id" label="Employee ID"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="department" label="Department"><Input placeholder="Front Desk" /></Form.Item></Col>
            <Col xs={24}><Form.Item name="password" label="Temporary password" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ManageReceptionists;
