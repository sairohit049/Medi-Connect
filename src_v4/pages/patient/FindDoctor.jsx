import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row, Col, Card, Input, Select, Button, Tag, Drawer, Descriptions, Skeleton, Flex, Typography, message,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ReadOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { fetchDoctorsWithNames } from "../../services/doctorService";
import { PageHeader, EmptyState, BRAND, CARD_STYLE } from "../../components/ui";

const { Text, Title, Paragraph } = Typography;

const FindDoctor = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;

    fetchDoctorsWithNames()
      .then((data) => active && setDoctors(data || []))
      .catch((error) => message.error(error.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const specializations = useMemo(
    () => ["All", ...new Set(doctors.map((d) => d.specialization).filter(Boolean))],
    [doctors]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesText =
        !term ||
        [doctor.full_name, doctor.specialization, doctor.qualification].some((value) =>
          value?.toLowerCase().includes(term)
        );
      const matchesSpec = specialization === "All" || doctor.specialization === specialization;
      return matchesText && matchesSpec;
    });
  }, [doctors, search, specialization]);

  const book = (doctor) => navigate(`/patient/book-appointment?doctor=${doctor.id}`);

  return (
    <>
      <PageHeader title="Find a doctor" subtitle="Find the right healthcare professional for your needs" />

      <Card style={{ ...CARD_STYLE, marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={16}>
            <Input
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              placeholder="Search by name, specialization or qualification"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              size="large"
              style={{ width: "100%" }}
              value={specialization}
              onChange={setSpecialization}
              options={specializations.map((value) => ({ value, label: value }))}
            />
          </Col>
        </Row>
      </Card>

      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Title level={5} style={{ margin: 0 }}>
          Available doctors
        </Title>
        <Tag color="teal">{filtered.length} found</Tag>
      </Flex>

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
        <EmptyState title="No doctors found" description="Try changing your search or specialization." />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((doctor) => (
            <Col key={doctor.id} xs={24} md={12} xl={8}>
              <Card
                hoverable
                style={{ ...CARD_STYLE, height: "100%" }}
                actions={[
                  <Button key="view" type="link" onClick={() => setSelected(doctor)}>
                    View profile
                  </Button>,
                  <Button key="book" type="link" icon={<CalendarOutlined />} onClick={() => book(doctor)}>
                    Book
                  </Button>,
                ]}
              >
                <Flex align="center" gap={14} style={{ marginBottom: 14 }}>
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: BRAND,
                      color: "#fff",
                      fontSize: 24,
                    }}
                  >
                    <UserOutlined />
                  </Flex>
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      Dr. {doctor.full_name}
                    </Title>
                    <Tag color="cyan" style={{ marginTop: 4 }}>
                      {doctor.specialization || "General Physician"}
                    </Tag>
                  </div>
                </Flex>

                <Flex vertical gap={6}>
                  <Text>
                    <ReadOutlined /> {doctor.qualification || "Qualification not listed"}
                  </Text>
                  <Text>
                    <TrophyOutlined />{" "}
                    {doctor.experience != null ? `${doctor.experience} years experience` : "Experience not listed"}
                  </Text>
                  <Text>
                    <ClockCircleOutlined /> {doctor.availability || "Availability not listed"}
                  </Text>
                  <div>
                    <Tag color="gold">
                      {doctor.consultation_fee != null ? `Fee ₹${doctor.consultation_fee}` : "Fee on request"}
                    </Tag>
                  </div>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        width={420}
        title={selected ? `Dr. ${selected.full_name}` : ""}
        footer={
          selected && (
            <Button type="primary" size="large" block icon={<CalendarOutlined />} onClick={() => book(selected)}>
              Book appointment
            </Button>
          )
        }
      >
        {selected && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Specialization">
                {selected.specialization || "General Physician"}
              </Descriptions.Item>
              <Descriptions.Item label="Qualification">{selected.qualification || "-"}</Descriptions.Item>
              <Descriptions.Item label="Experience">
                {selected.experience != null ? `${selected.experience} years` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Consultation fee">
                {selected.consultation_fee != null ? `₹${selected.consultation_fee}` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Availability">{selected.availability || "-"}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 20 }}>
              About
            </Title>
            <Paragraph type={selected.about ? undefined : "secondary"}>
              {selected.about || "This doctor has not added an introduction yet."}
            </Paragraph>
          </>
        )}
      </Drawer>
    </>
  );
};

export default FindDoctor;
