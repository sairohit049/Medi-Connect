import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { supabase } from "../../services/supabase";

const DoctorAppointments = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      if (!user) {
        navigate("/doctor/login");
        return;
      }

      // Find doctor record belonging to logged-in profile
     const { data: doctor, error: doctorError } = await supabase
  .from("doctors")
  .select("*")
  .eq("user_id", user.id)
  .maybeSingle();

      if (doctorError) {
        throw doctorError;
      }

      if (!doctor) {
        setAppointments([]);
        return;
      }

      // Get appointments for this doctor
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", doctor.id)
        .order("appointment_date", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Unable to load appointments",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", appointmentId);

      if (error) {
        throw error;
      }

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Appointment marked as ${status}.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message,
      });
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "confirmed":
        return "success";

      case "completed":
        return "primary";

      case "cancelled":
        return "danger";

      case "pending":
      default:
        return "warning";
    }
  };

  return (
    <Container className="py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Doctor Appointments
          </h2>

          <p className="text-muted mb-0">
            View and manage your patient appointments.
          </p>
        </div>

        <Button
          variant="outline-primary"
          onClick={() => navigate("/doctor/dashboard")}
        >
          ← Dashboard
        </Button>

      </div>


      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />

          <p className="text-muted mt-3">
            Loading appointments...
          </p>
        </div>
      )}


      {/* Empty */}
      {!loading && appointments.length === 0 && (
        <Alert variant="info" className="text-center">
          You don't have any appointments yet.
        </Alert>
      )}


      {/* Appointments */}
      {!loading && appointments.length > 0 && (
        <div>

          {appointments.map((appointment) => (

            <Card
              key={appointment.id}
              className="mb-3 shadow-sm border-0"
            >

              <Card.Body>

                <div className="d-flex justify-content-between align-items-start">

                  {/* Appointment information */}
                  <div>

                    <h5 className="fw-bold">
                      Patient Appointment
                    </h5>

                    <p className="mb-1">
                      <strong>Date:</strong>{" "}
                      {appointment.appointment_date || "Not available"}
                    </p>

                    <p className="mb-1">
                      <strong>Time:</strong>{" "}
                      {appointment.appointment_time || "Not available"}
                    </p>

                    <p className="mb-1">
                      <strong>Reason:</strong>{" "}
                      {appointment.reason || "Not provided"}
                    </p>

                    <p className="mb-0">
                      <strong>Status:</strong>{" "}

                      <Badge
                        bg={getStatusVariant(
                          appointment.status
                        )}
                      >
                        {appointment.status || "pending"}
                      </Badge>
                    </p>

                  </div>


                  {/* Actions */}
                  <div className="d-flex flex-column gap-2">

                    {appointment.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() =>
                            updateStatus(
                              appointment.id,
                              "confirmed"
                            )
                          }
                        >
                          Confirm
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            updateStatus(
                              appointment.id,
                              "cancelled"
                            )
                          }
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {appointment.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          updateStatus(
                            appointment.id,
                            "completed"
                          )
                        }
                      >
                        Mark Completed
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() =>
                        navigate(
                          `/doctor/patients/${appointment.patient_id}`
                        )
                      }
                    >
                      Patient Details
                    </Button>

                  </div>

                </div>

              </Card.Body>

            </Card>

          ))}

        </div>
      )}

    </Container>
  );
};

export default DoctorAppointments;