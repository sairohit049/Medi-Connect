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

const MyAppointments = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (!storedUser) {
        navigate("/login");
        return;
      }

      /*
       * Find the patient's record using the logged-in profile ID.
       */
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
        setAppointments([]);
        return;
      }

      /*
       * Load appointments belonging to this patient.
       */
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", patient.id)
        .order("appointment_date", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error("Appointment Error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Load Appointments",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";

      case "confirmed":
        return "success";

      case "completed":
        return "primary";

      case "cancelled":
        return "danger";

      case "rejected":
        return "danger";

      case "pending":
        return "warning";

      default:
        return "secondary";
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

        {/* Page Header */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h2 className="fw-bold mb-1">
              My Appointments
            </h2>

            <p className="text-muted mb-0">
              View and manage your appointments
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() =>
              navigate("/patient/book-appointment")
            }
          >
            + Book Appointment
          </Button>

        </div>

        {/* Loading */}

        {loading && (
          <div className="text-center py-5">

            <Spinner animation="border" />

            <p className="mt-3 text-muted">
              Loading appointments...
            </p>

          </div>
        )}

        {/* No appointments */}

        {!loading && appointments.length === 0 && (
          <Card className="border-0 shadow-sm">

            <Card.Body className="text-center py-5">

              <div
                style={{
                  fontSize: "55px",
                }}
              >
                📅
              </div>

              <h4 className="fw-bold mt-3">
                No Appointments
              </h4>

              <p className="text-muted">
                You don't have any appointments yet.
              </p>

              <Button
                variant="primary"
                onClick={() =>
                  navigate(
                    "/patient/book-appointment"
                  )
                }
              >
                Book Your First Appointment
              </Button>

            </Card.Body>

          </Card>
        )}

        {/* Appointment List */}

        {!loading && appointments.length > 0 && (
          <Row className="g-4">

            {appointments.map((appointment) => (
              <Col
                xs={12}
                md={6}
                lg={4}
                key={appointment.id}
              >

                <Card className="h-100 border-0 shadow-sm">

                  <Card.Body className="p-4">

                    <div className="d-flex justify-content-between align-items-start mb-3">

                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "55px",
                          height: "55px",
                          fontSize: "24px",
                        }}
                      >
                        👨‍⚕️
                      </div>

                      <Badge
                        bg={getStatusVariant(
                          appointment.status
                        )}
                      >
                        {appointment.status ||
                          "Pending"}
                      </Badge>

                    </div>

                    <h5 className="fw-bold">
                      Doctor Appointment
                    </h5>

                    <hr />

                    <p className="mb-2">
                      <strong>Date:</strong>{" "}
                      {appointment.appointment_date ||
                        "Not scheduled"}
                    </p>

                    <p className="mb-2">
                      <strong>Time:</strong>{" "}
                      {appointment.appointment_time ||
                        "Not scheduled"}
                    </p>

                    <p className="mb-2">
                      <strong>Reason:</strong>{" "}
                      {appointment.reason ||
                        "Not specified"}
                    </p>

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

export default MyAppointments;