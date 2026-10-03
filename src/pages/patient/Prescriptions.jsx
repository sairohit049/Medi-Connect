import React, { useEffect, useState } from "react";
import { Card, Table, Typography, message } from "antd";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import { ensurePatientRecord } from "../../services/patientService";
import { fetchDoctorNames } from "../../services/directoryService";
import { PageHeader, EmptyState, CARD_STYLE, fmtDate } from "../../components/ui";

const { Text } = Typography;

const Prescriptions = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const patient = await ensurePatientRecord(user.id);

        const { data, error } = await supabase
          .from("prescriptions")
          .select("*")
          .eq("patient_id", patient.id)
          .order("created_at", { ascending: false });
        if (error) throw error;

        const doctors = await fetchDoctorNames((data || []).map((r) => r.doctor_id));
        if (active) {
          setRows(
            (data || []).map((r) => ({
              ...r,
              // Doctors save this as `medicine_name`; older rows may use the other names
              medicine: r.medicine_name || r.medicine || r.medication,
              doctor_name: doctors[r.doctor_id]?.name,
            }))
          );
        }
      } catch (error) {
        message.error(error.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [user.id]);

  const columns = [
    { title: "Date", render: (_, r) => fmtDate(r.prescribed_date || r.created_at) },
    { title: "Medicine", dataIndex: "medicine", render: (v) => <Text strong>{v || "-"}</Text> },
    { title: "Dosage", dataIndex: "dosage", render: (v) => v || "-" },
    { title: "Frequency", dataIndex: "frequency", render: (v) => v || "-" },
    { title: "Duration", dataIndex: "duration", render: (v) => v || "-" },
    { title: "Instructions", dataIndex: "instructions", render: (v) => v || "-" },
    { title: "Prescribed by", dataIndex: "doctor_name", render: (v) => (v ? `Dr. ${v}` : "-") },
  ];

  return (
    <>
      <PageHeader title="Prescriptions" subtitle="Medicines prescribed to you by your doctors" />

      {!loading && rows.length === 0 ? (
        <EmptyState
          kind="pills"
          title="No prescriptions yet"
          description="Your prescriptions will appear here once your doctor adds them."
        />
      ) : (
        <Card style={CARD_STYLE}>
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={rows}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            scroll={{ x: "max-content" }}
          />
        </Card>
      )}
    </>
  );
};

export default Prescriptions;
