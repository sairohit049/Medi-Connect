
import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../../services/supabase";

const BookAppointment = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      navigate("/login");
      return;
    }

    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*");

      if (error) throw error;

      setDoctors(data || []);
    } catch (error) {
      console.error("Error loading doctors:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Load Doctors",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      navigate("/login");
      return;
    }

    if (
      !doctorId ||
      !appointmentDate ||
      !appointmentTime ||
      !reason.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please complete all fields.",
      });
      return;
    }

    // Check that the appointment date is not in the past.
    const selectedDateTime = new Date(
      `${appointmentDate}T${appointmentTime}`
    );

    if (selectedDateTime <= new Date()) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Date or Time",
        text: "Please select a future appointment date and time.",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Find the patient's record.
      // This assumes patients.id matches profiles.id.
      const { data: patient, error: patientError } =
        await supabase
          .from("patients")
          .select("id")
          .eq("id", storedUser.id)
          .maybeSingle();

      if (patientError) throw patientError;

      if (!patient) {
        Swal.fire({
          icon: "warning",
          title: "Patient Record Not Found",
          text:
            "Your patient record has not been created yet. " +
            "Please create the patient record before booking.",
        });
        return;
      }

      // Create appointment request.
      const { error: appointmentError } = await supabase
        .from("appointments")
        .insert([
          {
            patient_id: patient.id,
            doctor_id: doctorId,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            reason: reason.trim(),
            status: "pending",
          },
        ]);

      if (appointmentError) throw appointmentError;

      await Swal.fire({
        icon: "success",
        title: "Appointment Requested!",
        text:
          "Your appointment request has been submitted.",
        confirmButtonText: "View Appointments",
      });

      setDoctorId("");
      setAppointmentDate("");
      setAppointmentTime("");
      setReason("");

      navigate("/patient/appointments");
    } catch (error) {
      console.error("Appointment Error:", error);

      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent selecting past dates.
  const today = new Date();
  const minDate =
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-dark bg-primary px-4">
        <span className="navbar-brand fw-bold">
          🏥 MEDICONNECT
        </span>

        <Button
          variant="light"
          size="sm"
          onClick={() => navigate("/patient/dashboard")}
        >
          ← Dashboard
        </Button>
      </nav>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={9} lg={7}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4 p-md-5">
                <h2 className="fw-bold mb-2">
                  Book an Appointment
                </h2>

                <p className="text-muted mb-4">
                  Select a doctor and request a visit.
                </p>

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" />
                    <p className="mt-3">
                      Loading doctors...
                    </p>
                  </div>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Select Doctor
                      </Form.Label>

                      <Form.Select
                        value={doctorId}
                        onChange={(e) =>
                          setDoctorId(e.target.value)
                        }
                        required
                      >
                        <option value="">
                          Choose a doctor
                        </option>

                        {doctors.map((doctor) => (
                          <option
                            key={doctor.id}
                            value={doctor.id}
                          >
                            {doctor.full_name ||
                              "Doctor"}{" "}
                            {doctor.specialization
                              ? `— ${doctor.specialization}`
                              : ""}
                          </option>
                        ))}
                      </Form.Select>

                      {doctors.length === 0 && (
                        <Form.Text className="text-danger">
                          No doctors are currently listed.
                        </Form.Text>
                      )}
                    </Form.Group>

                    <Row>
                      <Col sm={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Appointment Date
                          </Form.Label>

                          <Form.Control
                            type="date"
                            min={minDate}
                            value={appointmentDate}
                            onChange={(e) =>
                              setAppointmentDate(
                                e.target.value
                              )
                            }
                            required
                          />
                        </Form.Group>
                      </Col>

                      <Col sm={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Appointment Time
                          </Form.Label>

                          <Form.Control
                            type="time"
                            value={appointmentTime}
                            onChange={(e) =>
                              setAppointmentTime(
                                e.target.value
                              )
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label>
                        Reason for Visit
                      </Form.Label>

                      <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Briefly describe the reason for your visit"
                        value={reason}
                        onChange={(e) =>
                          setReason(e.target.value)
                        }
                        required
                      />
                    </Form.Group>

                    <div className="d-grid">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={
                          submitting || doctors.length === 0
                        }
                      >
                        {submitting
                          ? "Submitting Request..."
                          : "Request Appointment"}
                      </Button>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BookAppointment;