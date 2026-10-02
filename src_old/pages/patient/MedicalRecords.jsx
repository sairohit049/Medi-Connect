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

const MedicalRecords = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicalRecords();
  }, []);

  const loadMedicalRecords = async () => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user")
      );

      if (!storedUser) {
        navigate("/login");
        return;
      }

      // Find the patient's record
      const { data: patient, error: patientError } =
        await supabase
          .from("patients")
          .select("id")
          .eq("id", storedUser.id)
          .maybeSingle();

      if (patientError) {
        throw patientError;
      }

      if (!patient) {
        setRecords([]);
        return;
      }

      // Get medical records for this patient
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .eq("patient_id", patient.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setRecords(data || []);
    } catch (error) {
      console.error(
        "Medical Records Error:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Unable to Load Medical Records",
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
            Medical Records
          </h2>

          <p className="text-muted">
            View your medical history and records.
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="text-center py-5">

            <Spinner animation="border" />

            <p className="mt-3 text-muted">
              Loading medical records...
            </p>

          </div>
        )}

        {/* No records */}

        {!loading && records.length === 0 && (
          <Card className="border-0 shadow-sm">

            <Card.Body className="text-center py-5">

              <div
                style={{
                  fontSize: "60px",
                }}
              >
                📋
              </div>

              <h4 className="fw-bold mt-3">
                No Medical Records
              </h4>

              <p className="text-muted mb-0">
                Your medical records will appear here
                when they are added by your doctor.
              </p>

            </Card.Body>

          </Card>
        )}

        {/* Records */}

        {!loading && records.length > 0 && (
          <Row className="g-4">

            {records.map((record) => (
              <Col
                xs={12}
                md={6}
                lg={6}
                key={record.id}
              >

                <Card className="h-100 border-0 shadow-sm">

                  <Card.Body className="p-4">

                    <div className="d-flex justify-content-between align-items-start mb-3">

                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "55px",
                          height: "55px",
                          fontSize: "25px",
                        }}
                      >
                        📋
                      </div>

                      <Badge bg="primary">
                        Medical Record
                      </Badge>

                    </div>

                    <h5 className="fw-bold mb-3">
                      Medical Record
                    </h5>

                    <hr />

                    {/* Diagnosis */}

                    <div className="mb-3">
                      <strong>
                        Diagnosis
                      </strong>

                      <p className="text-muted mb-0 mt-1">
                        {record.diagnosis ||
                          "Not available"}
                      </p>
                    </div>

                    {/* Treatment */}

                    <div className="mb-3">
                      <strong>
                        Treatment
                      </strong>

                      <p className="text-muted mb-0 mt-1">
                        {record.treatment ||
                          "Not available"}
                      </p>
                    </div>

                    {/* Notes */}

                    <div className="mb-3">
                      <strong>
                        Doctor's Notes
                      </strong>

                      <p className="text-muted mb-0 mt-1">
                        {record.notes ||
                          "No notes available"}
                      </p>
                    </div>

                    {/* Record Date */}

                    <div className="mb-0">
                      <strong>
                        Date
                      </strong>

                      <p className="text-muted mb-0 mt-1">
                        {record.record_date ||
                          record.created_at ||
                          "Not available"}
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

export default MedicalRecords;