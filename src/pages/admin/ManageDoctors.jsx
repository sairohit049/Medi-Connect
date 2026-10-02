import React, { useCallback, useEffect, useState } from "react";
import { Card, Table, Button, Modal, Form, Input, InputNumber, Row, Col, Popconfirm, Space, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { supabase } from "../../services/supabase";
import { fetchDoctorsWithNames } from "../../services/doctorService";
import { createAccount } from "../../services/userService";
import { PageHeader } from "../../components/ui";

const ManageDoctors = () => {
  const [form] = Form.useForm();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchDoctorsWithNames());
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (record) => {
    setEditing(record || null);
    form.resetFields();
    if (record) form.setFieldsValue(record);
    setOpen(true);
  };

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const details = {
        specialization: values.specialization,
        qualification: values.qualification || null,
        experience: values.experience ?? null,
        consultation_fee: values.consultation_fee ?? null,
        availability: values.availability || null,
        about: values.about || null,
      };

      if (editing) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ full_name: values.full_name.trim(), phone: values.phone || null })
          .eq("id", editing.user_id);
        if (profileError) throw profileError;

        const { error } = await supabase.from("doctors").update(details).eq("id", editing.id);
        if (error) throw error;
        message.success("Doctor updated");
      } else {
        const profile = await createAccount({ ...values, role: "doctor" });
        const { error } = await supabase.from("doctors").insert([{ user_id: profile.id, ...details }]);

        if (error) {
          await supabase.from("profiles").delete().eq("id", profile.id); // undo
          throw error;
        }
        message.success("Doctor added");
      }

      setOpen(false);
      load();
    } catch (error) {
      message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (record) => {
    const { error } = await supabase.from("doctors").delete().eq("id", record.id);
    if (error) {
      return message.error(`Cannot delete - this doctor probably has appointments. (${error.message})`);
    }
    await supabase.from("profiles").delete().eq("id", record.user_id);
    message.success("Doctor removed");
    load();
  };

  const filtered = rows.filter((d) =>
    `${d.full_name} ${d.email} ${d.specialization}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: "Name", dataIndex: "full_name", render: (v) => <strong>Dr. {v}</strong> },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Specialization", dataIndex: "specialization" },
    { title: "Qualification", dataIndex: "qualification" },
    { title: "Exp (yrs)", dataIndex: "experience" },
    { title: "Fee (₹)", dataIndex: "consultation_fee" },
    {
      title: "",
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(r)} />
          <Popconfirm title="Delete this doctor?" onConfirm={() => remove(r)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Doctors"
        subtitle={`${rows.length} registered`}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Add doctor</Button>}
      />

      <Card style={{ borderRadius: 14 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search by name, email or specialization"
          style={{ maxWidth: 360, marginBottom: 16 }}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Table rowKey="id" loading={loading} columns={columns} dataSource={filtered} pagination={{ pageSize: 8 }} scroll={{ x: "max-content" }} />
      </Card>

      <Modal
        title={editing ? "Edit doctor" : "Add doctor"}
        open={open}
        forceRender
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText={editing ? "Save" : "Create doctor"}
        width={680}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="full_name" label="Full name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="phone" label="Phone"><Input /></Form.Item></Col>
            {!editing && (
              <>
                <Col xs={24} md={12}><Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="password" label="Temporary password" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item></Col>
              </>
            )}
            <Col xs={24} md={12}><Form.Item name="specialization" label="Specialization" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="qualification" label="Qualification"><Input /></Form.Item></Col>
            <Col xs={12} md={8}><Form.Item name="experience" label="Experience (yrs)"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
            <Col xs={12} md={8}><Form.Item name="consultation_fee" label="Fee (₹)"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="availability" label="Availability"><Input placeholder="Mon - Sat, 10 - 5" /></Form.Item></Col>
            <Col xs={24}><Form.Item name="about" label="About"><Input.TextArea rows={3} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ManageDoctors;
