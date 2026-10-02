import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const PatientDetails = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);

      // ==========================================
      // STEP 1: CHECK DOCTOR LOGIN
      // ==========================================

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        navigate("/doctor/login");
        return;
      }

      // ==========================================
      // STEP 2: GET PATIENT FROM patients TABLE
      // ==========================================
      // patientId comes from:
      //
      // navigate(`/doctor/patients/${patient.id}`)
      //
      // in DoctorPatients.jsx
      //
      // Therefore patientId = patients.id

      const {
        data: patientData,
        error: patientError,
      } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .maybeSingle();

      if (patientError) {
        throw patientError;
      }

      if (!patientData) {
        setPatient(null);
        return;
      }

      setPatient(patientData);

      // ==========================================
      // STEP 3: GET PATIENT PROFILE
      // ==========================================
      // patients.user_id = profiles.id

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", patientData.user_id)
        .eq("role", "patient")
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      setProfile(profileData);

      // ==========================================
      // STEP 4: GET MEDICAL RECORDS
      // ==========================================
      // medical_records.patient_id = patients.id

      const {
        data: recordsData,
        error: recordsError,
      } = await supabase
        .from("medical_records")
        .select("*")
        .eq("patient_id", patientData.id)
        .order("created_at", {
          ascending: false,
        });

      if (recordsError) {
        throw recordsError;
      }

      setRecords(recordsData || []);
    } catch (error) {
      console.error("Error loading patient:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Load Patient",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />

        <p className="text-muted mt-3">
          Loading patient details...
        </p>
      </Container>
    );
  }

  // ==========================================
  // PATIENT NOT FOUND
  // ==========================================

  if (!patient) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Patient information was not found.
        </Alert>

        <Button
          variant="primary"
          onClick={() => navigate("/doctor/patients")}
        >
          ← Back to Patients
        </Button>
      </Container>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <Container className="py-4">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Patient Details
          </h2>

          <p className="text-muted mb-0">
            View patient information and medical history.
          </p>
        </div>

        <div className="d-flex gap-2">

          {/* ADD DIAGNOSIS */}

          <Button
            variant="primary"
            onClick={() =>
              navigate(
                `/doctor/patients/${patient.id}/diagnosis`
              )
            }
          >
            + Add Diagnosis
          </Button>

          {/* BACK TO PATIENTS */}

          <Button
            variant="outline-primary"
            onClick={() =>
              navigate("/doctor/patients")
            }
          >
            ← My Patients
          </Button>

        </div>
      </div>

      {/* ======================================
          PATIENT PROFILE
      ====================================== */}

      <Card className="shadow-sm border-0 mb-4">

        <Card.Body>

          {/* PATIENT NAME */}

          <div className="d-flex align-items-center gap-3 mb-4">

            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
              style={{
                width: "70px",
                height: "70px",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              {profile?.full_name
                ?.charAt(0)
                ?.toUpperCase() || "P"}
            </div>

            <div>

              <h3 className="fw-bold mb-1">
                {profile?.full_name || "Patient"}
              </h3>

              <Badge bg="primary">
                Patient
              </Badge>

            </div>

          </div>

          <Row>

            {/* EMAIL */}

            <Col md={6} className="mb-3">

              <strong>Email</strong>

              <div className="text-muted">
                {profile?.email || "Not available"}
              </div>

            </Col>

            {/* PHONE */}

            <Col md={6} className="mb-3">

              <strong>Phone</strong>

              <div className="text-muted">
                {profile?.phone || "Not available"}
              </div>

            </Col>

            {/* PATIENT ID */}

            <Col md={6} className="mb-3">

              <strong>Patient ID</strong>

              <div className="text-muted text-break">
                {patient.id}
              </div>

            </Col>

            {/* DATE OF BIRTH */}

            <Col md={6} className="mb-3">

              <strong>Date of Birth</strong>

              <div className="text-muted">
                {patient.date_of_birth
                  ? new Date(
                      patient.date_of_birth
                    ).toLocaleDateString()
                  : "Not available"}
              </div>

            </Col>

            {/* GENDER */}

            <Col md={6} className="mb-3">

              <strong>Gender</strong>

              <div className="text-muted">
                {patient.gender || "Not available"}
              </div>

            </Col>

            {/* BLOOD GROUP */}

            <Col md={6} className="mb-3">

              <strong>Blood Group</strong>

              <div className="text-muted">
                {patient.blood_group || "Not available"}
              </div>

            </Col>

            {/* ADDRESS */}

            <Col md={6} className="mb-3">

              <strong>Address</strong>

              <div className="text-muted">
                {patient.address || "Not available"}
              </div>

            </Col>

            {/* EMERGENCY CONTACT */}

            <Col md={6} className="mb-3">

              <strong>Emergency Contact</strong>

              <div className="text-muted">
                {patient.emergency_contact ||
                  "Not available"}
              </div>

            </Col>

            {/* EMERGENCY PHONE */}

            <Col md={6} className="mb-3">

              <strong>Emergency Phone</strong>

              <div className="text-muted">
                {patient.emergency_phone ||
                  "Not available"}
              </div>

            </Col>

            {/* REGISTERED DATE */}

            <Col md={6} className="mb-3">

              <strong>Registered On</strong>

              <div className="text-muted">

                {patient.created_at
                  ? new Date(
                      patient.created_at
                    ).toLocaleDateString()
                  : "Not available"}

              </div>

            </Col>

          </Row>

        </Card.Body>

      </Card>

      {/* ======================================
          MEDICAL RECORDS
      ====================================== */}

      <Card className="shadow-sm border-0">

        <Card.Body>

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h4 className="fw-bold mb-1">
                Medical Records
              </h4>

              <p className="text-muted mb-0">
                Patient's previous medical records.
              </p>

            </div>

            <span style={{ fontSize: "28px" }}>
              📋
            </span>

          </div>

          {/* NO MEDICAL RECORDS */}

          {records.length === 0 ? (

            <Alert
              variant="info"
              className="text-center"
            >
              No medical records found for this patient.
            </Alert>

          ) : (

            records.map((record) => (

              <Card
                key={record.id}
                className="mb-3 border"
              >

                <Card.Body>

                  <Row>

                    {/* DIAGNOSIS */}

                    <Col md={6} className="mb-3">

                      <strong>
                        Diagnosis
                      </strong>

                      <div className="text-muted">
                        {record.diagnosis ||
                          "Not provided"}
                      </div>

                    </Col>

                    {/* RECORD DATE */}

                    <Col md={6} className="mb-3">

                      <strong>
                        Record Date
                      </strong>

                      <div className="text-muted">

                        {record.record_date
                          ? new Date(
                              record.record_date
                            ).toLocaleDateString()
                          : record.created_at
                          ? new Date(
                              record.created_at
                            ).toLocaleDateString()
                          : "Not available"}

                      </div>

                    </Col>

                    {/* TREATMENT */}

                    <Col md={12} className="mb-3">

                      <strong>
                        Treatment
                      </strong>

                      <div className="text-muted">
                        {record.treatment ||
                          "Not provided"}
                      </div>

                    </Col>

                    {/* NOTES */}

                    <Col md={12}>

                      <strong>
                        Notes
                      </strong>

                      <div className="text-muted">
                        {record.notes ||
                          "No additional notes"}
                      </div>

                    </Col>

                  </Row>

                </Card.Body>

              </Card>

            ))

          )}

        </Card.Body>

      </Card>

    </Container>
  );
};

export default PatientDetails;