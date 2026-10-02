import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { supabase } from "../../services/supabase";

const DoctorPatients = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      if (!user) {
        navigate("/doctor/login");
        return;
      }

      // --------------------------------
      // 1. Find doctor using profiles.id
      // --------------------------------
      const { data: doctor, error: doctorError } = await supabase
        .from("doctors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (doctorError) {
        throw doctorError;
      }

      if (!doctor) {
        await Swal.fire({
          icon: "error",
          title: "Doctor not found",
          text: "Doctor profile could not be found.",
        });

        return;
      }

      // --------------------------------
      // 2. Get appointments for doctor
      // --------------------------------
      const { data: appointments, error: appointmentError } =
        await supabase
          .from("appointments")
          .select("*")
          .eq("doctor_id", doctor.id)
          .order("appointment_date", {
            ascending: false,
          });

      if (appointmentError) {
        throw appointmentError;
      }

      if (!appointments || appointments.length === 0) {
        setPatients([]);
        return;
      }

      // --------------------------------
      // 3. Get unique patient IDs
      // --------------------------------
      const patientIds = [
        ...new Set(
          appointments.map((appointment) => appointment.patient_id)
        ),
      ];

      // --------------------------------
      // 4. Get patient records
      // --------------------------------
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .in("id", patientIds);

      if (patientError) {
        throw patientError;
      }

      if (!patientData || patientData.length === 0) {
        setPatients([]);
        return;
      }

      // --------------------------------
      // 5. Get profile information
      // --------------------------------
      const userIds = patientData.map((patient) => patient.user_id);

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (profileError) {
        throw profileError;
      }

      // --------------------------------
      // 6. Combine patient + profile data
      // --------------------------------
      const combinedPatients = patientData.map((patient) => {
        const profile = profiles?.find(
          (profile) => profile.id === patient.user_id
        );

        const patientAppointments = appointments.filter(
          (appointment) =>
            appointment.patient_id === patient.id
        );

        return {
          ...patient,
          full_name: profile?.full_name || "Patient",
          email: profile?.email || "Not available",
          phone: profile?.phone || "Not available",
          role: profile?.role || "patient",
          appointmentCount: patientAppointments.length,
          lastAppointment:
            patientAppointments.length > 0
              ? patientAppointments[0]
              : null,
        };
      });

      setPatients(combinedPatients);
    } catch (error) {
      console.error("Error loading patients:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to load patients",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Loading
  // --------------------------------
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />

        <p className="text-muted mt-3">
          Loading patients...
        </p>
      </Container>
    );
  }

  // --------------------------------
  // Page
  // --------------------------------
  return (
    <Container className="py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            My Patients
          </h2>

          <p className="text-muted mb-0">
            Patients who have appointments with you
          </p>
        </div>

        <Button
          variant="outline-secondary"
          onClick={() =>
            navigate("/doctor/dashboard")
          }
        >
          ← Dashboard
        </Button>

      </div>

      {/* No patients */}
      {patients.length === 0 ? (
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center py-5">

            <div
              style={{
                fontSize: "48px",
                marginBottom: "15px",
              }}
            >
              👨‍⚕️
            </div>

            <h4 className="fw-bold">
              No Patients Yet
            </h4>

            <p className="text-muted mb-0">
              Patients with appointments will appear here.
            </p>

          </Card.Body>
        </Card>
      ) : (

        <Row>
          {patients.map((patient) => (

            <Col
              md={6}
              lg={4}
              key={patient.id}
              className="mb-4"
            >

              <Card className="shadow-sm border-0 h-100">

                <Card.Body>

                  {/* Patient Avatar */}
                  <div className="d-flex align-items-center mb-3">

                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "55px",
                        height: "55px",
                        fontSize: "22px",
                        fontWeight: "bold",
                      }}
                    >
                      {patient.full_name
                        ?.charAt(0)
                        ?.toUpperCase() || "P"}
                    </div>

                    <div>
                      <h5 className="fw-bold mb-1">
                        {patient.full_name}
                      </h5>

                      <Badge bg="primary">
                        Patient
                      </Badge>
                    </div>

                  </div>

                  {/* Patient Information */}
                  <div className="mb-2">

                    <strong>Email:</strong>

                    <div className="text-muted">
                      {patient.email}
                    </div>

                  </div>

                  <div className="mb-2">

                    <strong>Phone:</strong>

                    <div className="text-muted">
                      {patient.phone}
                    </div>

                  </div>

                  <div className="mb-3">

                    <strong>Appointments:</strong>

                    <div className="text-muted">
                      {patient.appointmentCount}
                    </div>

                  </div>

                  {/* Button */}
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={() =>
                      navigate(
                        `/doctor/patients/${patient.id}`
                      )
                    }
                  >
                    View Patient
                  </Button>

                </Card.Body>

              </Card>

            </Col>

          ))}
        </Row>

      )}

    </Container>
  );
};

export default DoctorPatients;