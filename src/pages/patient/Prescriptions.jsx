import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../../services/supabase";

const Prescriptions = () => {
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (!storedUser) {
        navigate("/login");
        return;
      }

      // Find patient record
      const { data: patient, error: patientError } =
        await supabase
          .from("patients")
          .select("id")
          .eq("user_id", storedUser.id)
          .maybeSingle();

      if (patientError) {
        throw patientError;
      }

      if (!patient) {
        setPrescriptions([]);
        return;
      }

      // Load prescriptions
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", patient.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setPrescriptions(data || []);
    } catch (error) {
      console.error("Prescription Error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Load Prescriptions",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">

      {/* Navbar */}

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

      <Container className="py-5">

        {/* Header */}

        <div className="mb-4">
          <h2 className="fw-bold mb-1">
            My Prescriptions
          </h2>

          <p className="text-muted">
            View prescriptions provided by your doctors.
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="text-center py-5">

            <Spinner animation="border" />

            <p className="mt-3 text-muted">
              Loading prescriptions...
            </p>

          </div>
        )}

        {/* No prescriptions */}

        {!loading && prescriptions.length === 0 && (
          <Card className="border-0 shadow-sm">

            <Card.Body className="text-center py-5">

              <div style={{ fontSize: "60px" }}>
                💊
              </div>

              <h4 className="fw-bold mt-3">
                No Prescriptions
              </h4>

              <p className="text-muted mb-0">
                Your prescriptions will appear here
                when your doctor adds them.
              </p>

            </Card.Body>

          </Card>
        )}

        {/* Prescription cards */}

        {!loading && prescriptions.length > 0 && (
          <Row className="g-4">

            {prescriptions.map((prescription) => (
              <Col
                xs={12}
                md={6}
                lg={6}
                key={prescription.id}
              >

                <Card className="h-100 border-0 shadow-sm">

                  <Card.Body className="p-4">

                    <div className="d-flex justify-content-between align-items-start mb-3">

                      <div
                        className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "55px",
                          height: "55px",
                          fontSize: "25px",
                        }}
                      >
                        💊
                      </div>

                      <Badge bg="success">
                        Prescription
                      </Badge>

                    </div>

                    <h5 className="fw-bold">
                      Prescription
                    </h5>

                    <hr />

                    <div className="mb-3">
                      <strong>Medicine</strong>

                      <p className="text-muted mb-0 mt-1">
                        {prescription.medicine ||
                          prescription.medication ||
                          "Not specified"}
                      </p>
                    </div>

                    <div className="mb-3">
                      <strong>Dosage</strong>

                      <p className="text-muted mb-0 mt-1">
                        {prescription.dosage ||
                          "Not specified"}
                      </p>
                    </div>

                    <div className="mb-3">
                      <strong>Frequency</strong>

                      <p className="text-muted mb-0 mt-1">
                        {prescription.frequency ||
                          "Not specified"}
                      </p>
                    </div>

                    <div className="mb-3">
                      <strong>Duration</strong>

                      <p className="text-muted mb-0 mt-1">
                        {prescription.duration ||
                          "Not specified"}
                      </p>
                    </div>

                    <div>
                      <strong>Instructions</strong>

                      <p className="text-muted mb-0 mt-1">
                        {prescription.instructions ||
                          "No instructions"}
                      </p>
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

export default Prescriptions;