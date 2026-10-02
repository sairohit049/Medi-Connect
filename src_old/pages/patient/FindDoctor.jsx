import React, { useEffect, useState } from "react";
import {Container, Row, Col,Card, Button, Form,InputGroup,Spinner,Badge,} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../../services/supabase";

const FindDoctor = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [search, specialization, doctors]);

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*");

      if (error) {
        console.error("Doctor Error:", error);

        Swal.fire({
          icon: "error",
          title: "Unable to Load Doctors",
          text: error.message,
        });

        return;
      }

      setDoctors(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let result = [...doctors];

    if (search.trim() !== "") {
      result = result.filter((doctor) =>
        doctor.specialization
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        doctor.qualification
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (specialization !== "All") {
      result = result.filter(
        (doctor) =>
          doctor.specialization === specialization
      );
    }

    setFilteredDoctors(result);
  };

  const specializations = [
    "All",
    ...new Set(
      doctors
        .map((doctor) => doctor.specialization)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="bg-light min-vh-100">

      {/* Header */}

      <nav className="navbar navbar-dark bg-primary px-4">

        <span className="navbar-brand fw-bold">
          🏥 MEDICONNECT
        </span>

        <Button
          variant="light"
          size="sm"
          onClick={() =>
            navigate("/patient/dashboard")
          }
        >
          ← Dashboard
        </Button>

      </nav>


      {/* Main */}

      <Container className="py-5">

        <div className="mb-4">

          <h2 className="fw-bold">
            Find a Doctor
          </h2>

          <p className="text-muted">
            Find the right healthcare professional
            for your needs.
          </p>

        </div>


        {/* Search */}

        <Card className="border-0 shadow-sm mb-4">

          <Card.Body>

            <Row className="g-3">

              <Col md={8}>

                <InputGroup>

                  <InputGroup.Text>
                    🔍
                  </InputGroup.Text>

                  <Form.Control
                    type="text"
                    placeholder="Search by specialization or qualification..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />

                </InputGroup>

              </Col>


              <Col md={4}>

                <Form.Select
                  value={specialization}
                  onChange={(e) =>
                    setSpecialization(e.target.value)
                  }
                >

                  {specializations.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}

                </Form.Select>

              </Col>

            </Row>

          </Card.Body>

        </Card>


        {/* Doctor Count */}

        <div className="d-flex justify-content-between align-items-center mb-3">

          <h5 className="mb-0">
            Available Doctors
          </h5>

          <Badge bg="primary">
            {filteredDoctors.length} Doctors
          </Badge>

        </div>


        {/* Loading */}

        {loading && (
          <div className="text-center py-5">

            <Spinner animation="border" />

            <p className="mt-3 text-muted">
              Loading doctors...
            </p>

          </div>
        )}


        {/* No Doctors */}

        {!loading &&
          filteredDoctors.length === 0 && (

            <Card className="border-0 shadow-sm">

              <Card.Body className="text-center py-5">

                <div
                  style={{ fontSize: "50px" }}
                >
                  👨‍⚕️
                </div>

                <h5 className="mt-3">
                  No Doctors Found
                </h5>

                <p className="text-muted">
                  Try changing your search or
                  specialization.
                </p>

              </Card.Body>

            </Card>
          )}


        {/* Doctor Cards */}

        {!loading && filteredDoctors.length > 0 && (

          <Row className="g-4">

            {filteredDoctors.map((doctor) => (

              <Col
                key={doctor.id}
                xs={12}
                md={6}
                lg={4}
              >

                <Card className="h-100 border-0 shadow-sm">

                  <Card.Body className="p-4">

                    {/* Doctor Avatar */}

                    <div className="text-center mb-3">

                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
                        style={{
                          width: "80px",
                          height: "80px",
                          fontSize: "30px",
                        }}
                      >
                        👨‍⚕️
                      </div>

                    </div>


                    {/* Doctor Name */}

                    <div className="text-center">

                      <h5 className="fw-bold mb-1">

                        Dr.{" "}
                        {doctor.full_name ||
                          "Doctor"}

                      </h5>

                      <Badge bg="info">
                        {doctor.specialization ||
                          "General Physician"}
                      </Badge>

                    </div>


                    {/* Doctor Information */}

                    <div className="mt-4">

                      <p className="mb-2">

                        <strong>
                          Qualification:
                        </strong>{" "}

                        {doctor.qualification ||
                          "Not specified"}

                      </p>


                      <p className="mb-2">

                        <strong>
                          Experience:
                        </strong>{" "}

                        {doctor.experience
                          ? `${doctor.experience} years`
                          : "Not specified"}

                      </p>


                      <p className="mb-2">

                        <strong>
                          Consultation Fee:
                        </strong>{" "}

                        ₹
                        {doctor.consultation_fee ||
                          "Not specified"}

                      </p>

                    </div>


                    {/* Button */}

                    <div className="d-grid mt-4">

                      <Button
                        variant="primary"
                        onClick={() =>
                          Swal.fire({
                            icon: "info",
                            title: "Coming Next",
                            text: "Doctor details and appointment booking will be added next.",
                          })
                        }
                      >
                        View Doctor
                      </Button>

                    </div>

                  </Card.Body>

                </Card>

              </Col>

            ))}

          </Row>

        )}

      </Container>

    </div>
  );
};

export default FindDoctor;