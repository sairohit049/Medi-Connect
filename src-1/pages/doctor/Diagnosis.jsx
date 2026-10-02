import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../../services/supabase";

const Diagnosis = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);

  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [recordDate, setRecordDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        navigate("/doctor/login");
        return;
      }

      // patientId in the URL is patients.id
      const { data: patientRow, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .maybeSingle();

      if (patientError) {
        throw patientError;
      }

      let data = null;

      if (patientRow) {
        // patients.user_id -> profiles.id (for name and email)
        const { data: profileRow, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone")
          .eq("id", patientRow.user_id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        data = profileRow;
      }

      if (!data) {
        Swal.fire({
          icon: "error",
          title: "Patient Not Found",
          text: "The patient profile could not be found.",
        });

        navigate("/doctor/patients");
        return;
      }

      setPatient(data);

      // Set today's date
      // Local date (toISOString() is UTC and can show yesterday in India)
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      setRecordDate(today);
    } catch (error) {
      console.error("Error loading patient:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!diagnosis.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Diagnosis Required",
        text: "Please enter the diagnosis.",
      });
      return;
    }

    if (!recordDate) {
      Swal.fire({
        icon: "warning",
        title: "Date Required",
        text: "Please select the record date.",
      });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("medical_records")
        .insert([
          {
            patient_id: patientId,
            diagnosis: diagnosis.trim(),
            treatment: treatment.trim(),
            notes: notes.trim(),
            record_date: recordDate,
          },
        ]);

      if (error) {
        throw error;
      }

      await Swal.fire({
        icon: "success",
        title: "Diagnosis Saved",
        text: "Medical record has been saved successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      navigate(`/doctor/patients/${patientId}`);
    } catch (error) {
      console.error("Error saving diagnosis:", error);

      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3 text-muted">
          Loading patient...
        </p>
      </div>
    );
  }

  return (
    <div className="container py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Diagnosis & Medical Record
          </h2>

          <p className="text-muted mb-0">
            Create a medical record for the patient
          </p>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={() =>
            navigate(`/doctor/patients/${patientId}`)
          }
        >
          ← Back to Patient
        </button>
      </div>

      {/* Patient Information */}
      {patient && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">

            <div className="d-flex align-items-center">

              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                style={{
                  width: "60px",
                  height: "60px",
                  fontSize: "24px",
                }}
              >
                {patient.full_name
                  ? patient.full_name.charAt(0).toUpperCase()
                  : "P"}
              </div>

              <div className="ms-3">
                <h5 className="mb-1">
                  {patient.full_name}
                </h5>

                <p className="text-muted mb-0">
                  {patient.email}
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Diagnosis Form */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">

          <h5 className="fw-bold mb-4">
            Medical Information
          </h5>

          <form onSubmit={handleSubmit}>

            {/* Diagnosis */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Diagnosis <span className="text-danger">*</span>
              </label>

              <textarea
                className="form-control"
                rows="3"
                placeholder="Enter diagnosis..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>

            {/* Treatment */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Treatment
              </label>

              <textarea
                className="form-control"
                rows="3"
                placeholder="Enter recommended treatment..."
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Doctor's Notes
              </label>

              <textarea
                className="form-control"
                rows="4"
                placeholder="Enter additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Record Date */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Record Date <span className="text-danger">*</span>
              </label>

              <input
                type="date"
                className="form-control"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="d-flex gap-2">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  navigate(`/doctor/patients/${patientId}`)
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  "Save Medical Record"
                )}
              </button>

            </div>

          </form>

        </div>
      </div>

    </div>
  );
};

export default Diagnosis;