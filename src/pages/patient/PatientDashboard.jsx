import React from "react";
import { useNavigate } from "react-router-dom";
import "./PatientDashboard.css";

const PatientDashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="patient-layout">

      {/* Sidebar */}
      <aside className="patient-sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">🏥</div>

          <div>
            <h2>MEDICONNECT</h2>
            <span>Healthcare Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item active"
            onClick={() => navigate("/patient/dashboard")}
          >
            <span>📊</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/patient/doctors")}
          >
            <span>👨‍⚕️</span>
            Find Doctor
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/patient/appointments")}
          >
            <span>📅</span>
            My Appointments
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/patient/records")}
          >
            <span>📋</span>
            Medical Records
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/patient/prescriptions")}
          >
            <span>💊</span>
            Prescriptions
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/patient/profile")}
          >
            <span>👤</span>
            My Profile
          </button>

        </nav>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <span>🚪</span>
          Logout
        </button>

      </aside>


      {/* Main Area */}
      <div className="patient-main">

        {/* Header */}
        <header className="patient-header">

          <div>
            <h3>Patient Dashboard</h3>
            <p>Manage your healthcare easily</p>
          </div>

          <div className="header-user">

            <div className="notification-icon">
              🔔
              <span className="notification-dot"></span>
            </div>

            <div className="user-avatar">
              {user?.full_name?.charAt(0)?.toUpperCase() || "P"}
            </div>

            <div className="header-user-info">
              <strong>{user?.full_name || "Patient"}</strong>
              <span>Patient</span>
            </div>

          </div>

        </header>


        {/* Dashboard Content */}
        <main className="dashboard-content">

          {/* Welcome */}
          <section className="welcome-section">

            <div>
              <h1>
                Good Morning, {user?.full_name || "Patient"} 👋
              </h1>

              <p>
                Welcome back! Here's an overview of your healthcare.
              </p>
            </div>

          </section>


          {/* Statistics */}
          <section className="stats-grid">

            <div className="stat-card">
              <div className="stat-icon blue">
                📅
              </div>

              <div>
                <h2>2</h2>
                <p>Upcoming Appointments</p>
              </div>
            </div>


            <div className="stat-card">
              <div className="stat-icon orange">
                ⏳
              </div>

              <div>
                <h2>1</h2>
                <p>Pending Requests</p>
              </div>
            </div>


            <div className="stat-card">
              <div className="stat-icon green">
                📋
              </div>

              <div>
                <h2>3</h2>
                <p>Medical Records</p>
              </div>
            </div>


            <div className="stat-card">
              <div className="stat-icon purple">
                💊
              </div>

              <div>
                <h2>2</h2>
                <p>Prescriptions</p>
              </div>
            </div>

          </section>


          {/* Two Column Area */}
          <section className="dashboard-grid">

            {/* Upcoming Appointment */}
            <div className="dashboard-card">

              <div className="card-header">
                <div>
                  <h2>Upcoming Appointment</h2>
                  <p>Your next scheduled visit</p>
                </div>

                <span className="card-icon">📅</span>
              </div>

              <div className="appointment-box">

                <div className="doctor-avatar">
                  👨‍⚕️
                </div>

                <div className="appointment-info">

                  <h3>Doctor Appointment</h3>

                  <p>
                    <strong>Doctor:</strong> Dr. Available Soon
                  </p>

                  <p>
                    <strong>Date:</strong> To be scheduled
                  </p>

                  <p>
                    <strong>Time:</strong> To be scheduled
                  </p>

                </div>

              </div>

              <button
                className="primary-btn"
                onClick={() =>
                  navigate("/patient/appointments")
                }
              >
                View Appointments →
              </button>

            </div>


            {/* Quick Actions */}
            <div className="dashboard-card">

              <div className="card-header">

                <div>
                  <h2>Quick Actions</h2>
                  <p>Access important features</p>
                </div>

                <span className="card-icon">⚡</span>

              </div>


              <div className="quick-actions">

                <button
                  onClick={() =>
                    navigate("/patient/doctors")
                  }
                >
                  <span>👨‍⚕️</span>
                  <div>
                    <strong>Find a Doctor</strong>
                    <small>Search specialists</small>
                  </div>
                </button>


                <button
                 onClick={() => navigate("/patient/book-appointment")}
                >
                  <span>📅</span>
                  <div>
                    <strong>Book Appointment</strong>
                    <small>Schedule a visit</small>
                  </div>
                </button>


                <button
                  onClick={() =>
                    navigate("/patient/records")
                  }
                >
                  <span>📋</span>
                  <div>
                    <strong>Medical Records</strong>
                    <small>View your records</small>
                  </div>
                </button>

              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
};

export default PatientDashboard;