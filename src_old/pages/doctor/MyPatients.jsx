import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Alert, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../../services/supabase";

const DoctorPatients = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        navigate("/doctor/login");
        return;
      }

      // =====================================
      // STEP 1: FIND DOCTOR USING user_id
      // =====================================

      const { data: doctor, error: doctorError } = await supabase
        .from("doctors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (doctorError) {
        throw doctorError;
      }

      if (!doctor) {
        Swal.fire({
          icon: "error",
          title: "Doctor not found",
          text: "Doctor profile could not be found.",
        });

        return;
      }

      // =====================================
      // STEP 2: GET APPOINTMENTS
      // =====================================

      const { data: appointments, error: appointmentError } =
        await supabase
          .from("appointments")
          .select("*")
          .eq("doctor_id", doctor.id)
          .order("appointment_date", {
            ascending: true,
          });

      if (appointmentError) {
        throw appointmentError;
      }

      // =====================================
      // STEP 3: GET UNIQUE PATIENT IDS
      // =====================================

      const patientIds = [
        ...new Set(
          (appointments || []).map(
            (appointment) => appointment.patient_id
          )
        ),
      ];

      if (patientIds.length === 0) {
        setPatients([]);
        return;
      }

      // =====================================
      // STEP 4: GET PATIENT TABLE RECORDS
      // =====================================

      const { data: patientRows, error: patientError } =
        await supabase
          .from("patients")
          .select("*")
          .in("id", patientIds);

      if (patientError) {
        throw patientError;
      }

      // =====================================
      // STEP 5: GET PROFILE INFORMATION
      // =====================================

      const userIds = [
        ...new Set(
          (patientRows || [])
            .map((patient) => patient.user_id)
            .filter(Boolean)
        ),
      ];

      let profiles = [];

      if (userIds.length > 0) {
        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select("*")
            .in("id", userIds)
            .eq("role", "patient");

        if (profileError) {
          throw profileError;
        }

        profiles = profileData || [];
      }

      // =====================================
      // STEP 6: COMBINE PATIENT + PROFILE
      // =====================================

      const finalPatients = (patientRows || []).map((patient) => {
        const profile = profiles.find(
          (profile) => profile.id === patient.user_id
        );

        return {
          ...patient,
          profile: profile || null,
        };
      });

      setPatients(finalPatients);
    } catch (error) {
      console.error("Error loading patients:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Load Patients",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // LOADING
  // =====================================

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

  // =====================================
  // UI
  // =====================================

  return (
    <Container className="py-4">

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
          variant="outline-primary"
          onClick={() => navigate("/doctor/dashboard")}
        >
          ← Dashboard
        </Button>

      </div>

      {patients.length === 0 ? (

        <Card className="shadow-sm border-0">

          <Card.Body className="text-center py-5">

            <div style={{ fontSize: "50px" }}>
              👨‍⚕️
            </div>

            <h4 className="fw-bold mt-3">
              No Patients Yet
            </h4>

            <p className="text-muted">
              Patients with appointments will appear here.
            </p>

          </Card.Body>

        </Card>

      ) : (

        <Row>

          {patients.map((patient) => {

            const profile = patient.profile;

            return (
              <Col
                md={6}
                lg={4}
                key={patient.id}
                className="mb-4"
              >

                <Card className="shadow-sm border-0 h-100">

                  <Card.Body>

                    <div className="d-flex align-items-center gap-3 mb-3">

                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                        style={{
                          width: "55px",
                          height: "55px",
                          fontSize: "22px",
                          fontWeight: "bold",
                        }}
                      >
                        {profile?.full_name
                          ?.charAt(0)
                          ?.toUpperCase() || "P"}
                      </div>

                      <div>

                        <h5 className="fw-bold mb-1">
                          {profile?.full_name || "Patient"}
                        </h5>

                        <small className="text-muted">
                          Patient
                        </small>

                      </div>

                    </div>

                    <hr />

                    <p className="mb-2">
                      <strong>Email:</strong>
                      <br />
                      <span className="text-muted">
                        {profile?.email || "Not available"}
                      </span>
                    </p>

                    <p className="mb-3">
                      <strong>Phone:</strong>
                      <br />
                      <span className="text-muted">
                        {profile?.phone || "Not available"}
                      </span>
                    </p>

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
            );
          })}

        </Row>

      )}

    </Container>
  );
};

export default DoctorPatients;