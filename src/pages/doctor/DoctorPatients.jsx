import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Input, Button, Tag, Skeleton, Flex, Typography, message } from "antd";
import { SearchOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { getDoctorByUserId, fetchPatientsByIds } from "../../services/directoryService";
import { fetchAppointmentsDetailed } from "../../services/appointmentService";
import { PageHeader, PersonAvatar, EmptyState, CARD_STYLE, fmtDate } from "../../components/ui";

const { Text, Title } = Typography;

const DoctorPatients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const doctorRow = await getDoctorByUserId(user.id);
        if (!doctorRow) return;

        // fetchAppointmentsDetailed returns newest first, so the first one we meet is the latest visit
        const appointments = await fetchAppointmentsDetailed({ doctorId: doctorRow.id });
        const rows = await fetchPatientsByIds(appointments.map((a) => a.patient_id));

        const combined = rows.map((patient) => {
          const own = appointments.filter((a) => a.patient_id === patient.id);
          return { ...patient, visits: own.length, lastVisit: own[0]?.appointment_date };
        });

        if (active) {
          setDoctor(doctorRow);
          setPatients(combined);
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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((p) => [p.full_name, p.email, p.phone].some((v) => v?.toLowerCase().includes(term)));
  }, [patients, search]);

  if (!loading && !doctor) {
    return (
      <EmptyState
        kind="records"
        title="Complete your doctor profile first"
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
      <PageHeader title="My patients" subtitle="Patients who have appointments with you" />

      <Card style={{ ...CARD_STYLE, marginBottom: 16 }}>
        <Input
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Search by name, email or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((n) => (
            <Col key={n} xs={24} md={12} xl={8}>
              <Card style={CARD_STYLE}>
                <Skeleton active avatar paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : filtered.length === 0 ? (
        <EmptyState
          kind="patients"
          title={patients.length ? "No matching patients" : "No patients yet"}
          description={patients.length ? "Try a different search." : "Patients with appointments will appear here."}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((patient) => (
            <Col key={patient.id} xs={24} md={12} xl={8}>
              <Card
                hoverable
                style={{ ...CARD_STYLE, height: "100%" }}
                actions={[
                  <Button key="view" type="link" onClick={() => navigate(`/doctor/patients/${patient.id}`)}>
                    View patient
                  </Button>,
                ]}
              >
                <Flex align="center" gap={12} style={{ marginBottom: 14 }}>
                  <PersonAvatar name={patient.full_name} size={52} />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      {patient.full_name}
                    </Title>
                    <Flex gap={4} style={{ marginTop: 4 }}>
                      <Tag color="teal" style={{ margin: 0 }}>
                        Patient
                      </Tag>
                      {patient.blood_group && (
                        <Tag color="red" style={{ margin: 0 }}>
                          {patient.blood_group}
                        </Tag>
                      )}
                    </Flex>
                  </div>
                </Flex>

                <Flex vertical gap={6}>
                  <Text>
                    <MailOutlined /> {patient.email || "-"}
                  </Text>
                  <Text>
                    <PhoneOutlined /> {patient.phone || "-"}
                  </Text>
                  <Text type="secondary">
                    {patient.visits} appointment{patient.visits === 1 ? "" : "s"}
                    {patient.lastVisit ? ` · last on ${fmtDate(patient.lastVisit)}` : ""}
                  </Text>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default DoctorPatients;
