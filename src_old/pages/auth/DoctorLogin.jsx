import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../../services/supabase";

const DoctorLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter email and password.",
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email.trim())
        .eq("password", password)
        .eq("role", "doctor")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Invalid doctor email or password.",
        });
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Welcome Dr. ${data.full_name}`,
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/doctor/dashboard");

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Login Error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">

      <div
        className="card shadow p-4"
        style={{ width: "100%", maxWidth: "450px" }}
      >

        <div className="text-center mb-4">

          <div style={{ fontSize: "50px" }}>
            👨‍⚕️
          </div>

          <h2 className="fw-bold">
            MEDICONNECT
          </h2>

          <p className="text-muted">
            Doctor Login
          </p>

        </div>

        <form onSubmit={handleLogin}>

          <div className="mb-3">

            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="Enter doctor email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>

          <div className="mb-3">

            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login as Doctor"}
          </button>

        </form>

        <div className="text-center mt-4">

          <button
            type="button"
            className="btn btn-link"
            onClick={() => navigate("/login")}
          >
            ← Back to Patient Login
          </button>

        </div>

      </div>

    </div>
  );
};

export default DoctorLogin;