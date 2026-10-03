import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Card, Descriptions, Tabs, Table, Button, Tag, Flex, Skeleton, Typography, message } from "antd";
import { PlusOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import { getDoctorByUserId, fetchPatientsByIds, fetchDoctorNames } from "../../services/directoryService";
import { fetchAppointmentsDetailed } from "../../services/appointmentService";
import {
  PageHeader, PersonAvatar, EmptyState, LabeledText, StatusTag, CARD_STYLE, fmtDate, fmtTime,
} from "../../components/ui";

const { Text, Title } = Typography;

const PatientDetails = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const [patientRows, doctorRow] = await Promise.all([
          fetchPatientsByIds([patientId]),
          getDoctorByUserId(user.id),
        ]);

        const [recordRes, rxRes, appts] = await Promise.all([
          supabase.from("medical_records").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }),
          supabase.from("prescriptions").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }),
          doctorRow ? fetchAppointmentsDetailed({ doctorId: doctorRow.id, patientId }) : Promise.resolve([]),
        ]);

        if (recordRes.error) throw recordRes.error;
        if (rxRes.error) throw rxRes.error;

        const doctors = await fetchDoctorNames([
          ...(recordRes.data || []).map((r) => r.doctor_id),
          ...(rxRes.data || []).map((r) => r.doctor_id),
        ]);

        if (!active) return;
        setPatient(patientRows[0] || null);
        setRecords((recordRes.data || []).map((r) => ({ ...r, doctor: doctors[r.doctor_id] })));
        setPrescriptions((rxRes.data || []).map((r) => ({ ...r, doctor: doctors[r.doctor_id] })));
        setAppointments(appts);
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
  }, [patientId, user.id]);

  if (!loading && !patient) {
    return (
      <EmptyState
        title="Patient not found"
        action={
          <Button type="primary" onClick={() => navigate("/doctor/patients")}>
            Back to my patients
          </Button>
        }
      />
    );
  }

  const actions = (
    <Flex gap={8} wrap="wrap">
      <Button icon={<MedicineBoxOutlined />} onClick={() => navigate(`/doctor/prescriptions?patient=${patientId}`)}>
        Write prescription
      </Button>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/doctor/patients/${patientId}/diagnosis`)}>
        Add diagnosis
      </Button>
    </Flex>
  );

  const recordsTab =
    records.length === 0 ? (
      <Text type="secondary">No medical records for this patient yet.</Text>
    ) : (
      <Flex vertical gap={12}>
        {records.map((record) => (
          <Card
            key={record.id}
            size="small"
            title={fmtDate(record.record_date || record.created_at)}
            extra={record.doctor && <Tag color="cyan">Dr. {record.doctor.name}</Tag>}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <LabeledText label="Diagnosis">
                  <Text strong>{record.diagnosis}</Text>
                </LabeledText>
              </Col>
              <Col xs={24} md={12}>
                <LabeledText label="Treatment">{record.treatment}</LabeledText>
              </Col>
              <Col xs={24}>
                <LabeledText label="Notes">{record.notes}</LabeledText>
              </Col>
            </Row>
          </Card>
        ))}
      </Flex>
    );

  const prescriptionsTab = (
    <Table
      rowKey="id"
      size="small"
      dataSource={prescriptions}
      pagination={{ pageSize: 6, hideOnSinglePage: true }}
      scroll={{ x: "max-content" }}
      locale={{ emptyText: "No prescriptions yet" }}
      columns={[
        { title: "Date", render: (_, r) => fmtDate(r.prescribed_date || r.created_at) },
        { title: "Medicine", dataIndex: "medicine_name", render: (v) => <Text strong>{v || "-"}</Text> },
        { title: "Dosage", dataIndex: "dosage", render: (v) => v || "-" },
        { title: "Frequency", dataIndex: "frequency", render: (v) => v || "-" },
        { title: "Duration", dataIndex: "duration", render: (v) => v || "-" },
        { title: "By", render: (_, r) => (r.doctor ? `Dr. ${r.doctor.name}` : "-") },
      ]}
    />
  );

  const appointmentsTab = (
    <Table
      rowKey="id"
      size="small"
      dataSource={appointments}
      pagination={{ pageSize: 6, hideOnSinglePage: true }}
      scroll={{ x: "max-content" }}
      locale={{ emptyText: "No appointments with you yet" }}
      columns={[
        { title: "Date", dataIndex: "appointment_date", render: fmtDate },
        { title: "Time", dataIndex: "appointment_time", render: fmtTime },
        { title: "Reason", dataIndex: "reason", ellipsis: true },
        { title: "Status", dataIndex: "status", render: (s) => <StatusTag status={s} /> },
      ]}
    />
  );

  return (
    <>
      <PageHeader
        back="/doctor/patients"
        title="Patient details"
        subtitle="Patient information and medical history"
        extra={actions}
      />

      <Card style={{ ...CARD_STYLE, marginBottom: 16 }} loading={loading}>
        {patient && (
          <>
            <Flex align="center" gap={16} style={{ marginBottom: 20 }}>
              <PersonAvatar name={patient.full_name} size={64} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {patient.full_name}
                </Title>
                <Flex gap={6} style={{ marginTop: 4 }}>
                  <Tag color="teal">Patient</Tag>
                  {patient.blood_group && <Tag color="red">{patient.blood_group}</Tag>}
                </Flex>
              </div>
            </Flex>

            <Descriptions column={{ xs: 1, md: 2 }} size="small" bordered>
              <Descriptions.Item label="Email">{patient.email || "-"}</Descriptions.Item>
              <Descriptions.Item label="Phone">{patient.phone || "-"}</Descriptions.Item>
              <Descriptions.Item label="Date of birth">{fmtDate(patient.date_of_birth)}</Descriptions.Item>
              <Descriptions.Item label="Gender">{patient.gender || "-"}</Descriptions.Item>
              <Descriptions.Item label="Blood group">{patient.blood_group || "-"}</Descriptions.Item>
              <Descriptions.Item label="Registered">{fmtDate(patient.created_at)}</Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {patient.address || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Emergency contact">{patient.emergency_contact || "-"}</Descriptions.Item>
              <Descriptions.Item label="Emergency phone">{patient.emergency_phone || "-"}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>

      <Card style={CARD_STYLE}>
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <Tabs
            items={[
              { key: "records", label: `Medical records (${records.length})`, children: recordsTab },
              { key: "prescriptions", label: `Prescriptions (${prescriptions.length})`, children: prescriptionsTab },
              { key: "appointments", label: `Appointments (${appointments.length})`, children: appointmentsTab },
            ]}
          />
        )}
      </Card>
    </>
  );
};

export default PatientDetails;
