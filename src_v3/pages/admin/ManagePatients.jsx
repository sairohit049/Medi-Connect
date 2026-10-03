import React, { useCallback, useEffect, useState } from "react";
import { Card, Table, Button, Input, Drawer, Descriptions, Popconfirm, Space, Tag, message } from "antd";
import { EyeOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { supabase } from "../../services/supabase";
import { fetchPatientsWithProfiles } from "../../services/directoryService";
import { PageHeader, fmtDate } from "../../components/ui";

const ManagePatients = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchPatientsWithProfiles());
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (record) => {
    const { error } = await supabase.from("patients").delete().eq("id", record.id);
    if (error) {
      return message.error(`Cannot delete - this patient has appointments or records. (${error.message})`);
    }
    await supabase.from("profiles").delete().eq("id", record.user_id);
    message.success("Patient removed");
    load();
  };

  const filtered = rows.filter((p) =>
    `${p.full_name} ${p.email} ${p.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: "Name", dataIndex: "full_name", render: (v) => <strong>{v}</strong> },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Gender", dataIndex: "gender" },
    { title: "Blood group", dataIndex: "blood_group", render: (v) => (v ? <Tag color="red">{v}</Tag> : "-") },
    { title: "Registered", dataIndex: "created_at", render: fmtDate },
    {
      title: "",
      render: (_, r) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setSelected(r)} />
          <Popconfirm title="Delete this patient?" onConfirm={() => remove(r)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Patients" subtitle={`${rows.length} registered`} />

      <Card style={{ borderRadius: 14 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search by name, email or phone"
          style={{ maxWidth: 360, marginBottom: 16 }}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Table rowKey="id" loading={loading} columns={columns} dataSource={filtered} pagination={{ pageSize: 8 }} scroll={{ x: "max-content" }} />
      </Card>

      <Drawer title={selected?.full_name} open={!!selected} onClose={() => setSelected(null)} size="default">
        {selected && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Email">{selected.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selected.phone || "-"}</Descriptions.Item>
            <Descriptions.Item label="Date of birth">{fmtDate(selected.date_of_birth)}</Descriptions.Item>
            <Descriptions.Item label="Gender">{selected.gender || "-"}</Descriptions.Item>
            <Descriptions.Item label="Blood group">{selected.blood_group || "-"}</Descriptions.Item>
            <Descriptions.Item label="Address">{selected.address || "-"}</Descriptions.Item>
            <Descriptions.Item label="Emergency contact">{selected.emergency_contact || "-"}</Descriptions.Item>
            <Descriptions.Item label="Emergency phone">{selected.emergency_phone || "-"}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  );
};

export default ManagePatients;
