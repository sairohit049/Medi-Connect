import React, { useEffect, useState } from "react";
import { Row, Col, Card, Tag, Skeleton, Flex, Typography, message } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import { ensurePatientRecord } from "../../services/patientService";
import { fetchDoctorNames } from "../../services/directoryService";
import { PageHeader, EmptyState, LabeledText, CARD_STYLE, fmtDate } from "../../components/ui";

const { Text } = Typography;

const MedicalRecords = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const patient = await ensurePatientRecord(user.id);

        const { data, error } = await supabase
          .from("medical_records")
          .select("*")
          .eq("patient_id", patient.id)
          .order("created_at", { ascending: false });
        if (error) throw error;

        const doctors = await fetchDoctorNames((data || []).map((r) => r.doctor_id));
        if (active) setRecords((data || []).map((r) => ({ ...r, doctor: doctors[r.doctor_id] })));
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

  return (
    <>
      <PageHeader title="Medical records" subtitle="Your medical history, added by your doctors" />

      {loading ? (
        <Card style={CARD_STYLE}>
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      ) : records.length === 0 ? (
        <EmptyState
          title="No medical records yet"
          description="Records appear here after a doctor adds them to your file."
        />
      ) : (
        <Row gutter={[16, 16]}>
          {records.map((record) => (
            <Col key={record.id} xs={24} xl={12}>
              <Card
                style={{ ...CARD_STYLE, height: "100%" }}
                title={
                  <Flex align="center" gap={8}>
                    <FileTextOutlined style={{ color: "#0d9488" }} />
                    {fmtDate(record.record_date || record.created_at)}
                  </Flex>
                }
                extra={record.doctor && <Tag color="cyan">Dr. {record.doctor.name}</Tag>}
              >
                <LabeledText label="Diagnosis">
                  <Text strong>{record.diagnosis}</Text>
                </LabeledText>
                <LabeledText label="Treatment">{record.treatment}</LabeledText>
                <LabeledText label="Doctor's notes">{record.notes}</LabeledText>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default MedicalRecords;
