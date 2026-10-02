import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./DoctorDashboard.css";

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // These pages are not built yet
  const comingSoon = () =>
    Swal.fire({
      icon: "info",
      title: "Coming soon",
      text: "This section has not been built yet.",
    });

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/doctor/login");
  };

  return (
    <div className="doctor-layout">

      {/* Sidebar */}
      <aside className="doctor-sidebar">

        <div className="doctor-sidebar-logo">
          <div className="doctor-logo-icon">🏥</div>

          <div>
            <h2>MEDICONNECT</h2>
            <span>Doctor Portal</span>
          </div>
        </div>

        <nav className="doctor-sidebar-nav">

          <button
            className="doctor-nav-item active"
            onClick={() => navigate("/doctor/dashboard")}
          >
            <span>📊</span>
            Dashboard
          </button>

          <button
            className="doctor-nav-item"
            onClick={() => navigate("/doctor/appointments")}
          >
            <span>📅</span>
            Appointments
          </button>

          <button
            className="doctor-nav-item"
            onClick={() => navigate("/doctor/patients")}
          >
            <span>👥</span>
            Patients
          </button>

          <button
            className="doctor-nav-item"
            onClick={() => comingSoon()}
          >
            <span>💊</span>
            Prescriptions
          </button>

          <button
            className="doctor-nav-item"
            onClick={() => comingSoon()}
          >
            <span>👤</span>
            My Profile
          </button>

        </nav>

        <button
          className="doctor-logout-btn"
          onClick={handleLogout}
        >
          <span>🚪</span>
          Logout
        </button>

      </aside>


      {/* Main Area */}
      <div className="doctor-main">

        {/* Header */}
        <header className="doctor-header">

          <div>
            <h3>Doctor Dashboard</h3>
            <p>Manage your patients and appointments</p>
          </div>

          <div className="doctor-header-user">

            <div
              className="doctor-notification-icon"
              onClick={() => comingSoon()}
            >
              🔔
              <span className="doctor-notification-dot"></span>
            </div>

            <div className="doctor-avatar">
              {user?.full_name?.charAt(0)?.toUpperCase() || "D"}
            </div>

            <div className="doctor-header-user-info">
              <strong>
                Dr. {user?.full_name || "Doctor"}
              </strong>

              <span>
                Doctor
              </span>
            </div>

          </div>

        </header>


        {/* Dashboard Content */}
        <main className="doctor-dashboard-content">

          {/* Welcome */}
          <section className="doctor-welcome-section">

            <div>
              <h1>
                Good Morning, Dr. {user?.full_name || "Doctor"} 👋
              </h1>

              <p>
                Welcome back! Here's an overview of your practice.
              </p>
            </div>

          </section>


          {/* Statistics */}
          <section className="doctor-stats-grid">

            <div className="doctor-stat-card">

              <div className="doctor-stat-icon blue">
                📅
              </div>

              <div>
                <h2>0</h2>
                <p>Today's Appointments</p>
              </div>

            </div>


            <div className="doctor-stat-card">

              <div className="doctor-stat-icon orange">
                ⏳
              </div>

              <div>
                <h2>0</h2>
                <p>Pending Appointments</p>
              </div>

            </div>


            <div className="doctor-stat-card">

              <div className="doctor-stat-icon green">
                👥
              </div>

              <div>
                <h2>0</h2>
                <p>Total Patients</p>
              </div>

            </div>


            <div className="doctor-stat-card">

              <div className="doctor-stat-icon purple">
                💊
              </div>

              <div>
                <h2>0</h2>
                <p>Prescriptions</p>
              </div>

            </div>

          </section>


          {/* Two Column Area */}
          <section className="doctor-dashboard-grid">

            {/* Today's Appointments */}
            <div className="doctor-dashboard-card">

              <div className="doctor-card-header">

                <div>
                  <h2>Today's Appointments</h2>
                  <p>Your scheduled patient visits</p>
                </div>

                <span className="doctor-card-icon">
                  📅
                </span>

              </div>


              <div className="doctor-appointment-box">

                <div className="doctor-patient-avatar">
                  👤
                </div>

                <div className="doctor-appointment-info">

                  <h3>
                    No Appointments
                  </h3>

                  <p>
                    Your upcoming patient appointments
                    will appear here.
                  </p>

                </div>

              </div>


              <button
                className="doctor-primary-btn"
                onClick={() =>
                  navigate("/doctor/appointments")
                }
              >
                View Appointments →
              </button>

            </div>


            {/* Quick Actions */}
            <div className="doctor-dashboard-card">

              <div className="doctor-card-header">

                <div>
                  <h2>Quick Actions</h2>
                  <p>Access important features</p>
                </div>

                <span className="doctor-card-icon">
                  ⚡
                </span>

              </div>


              <div className="doctor-quick-actions">

                <button
                  onClick={() =>
                    navigate("/doctor/appointments")
                  }
                >
                  <span>📅</span>

                  <div>
                    <strong>
                      View Appointments
                    </strong>

                    <small>
                      Manage patient visits
                    </small>
                  </div>
                </button>


                <button
                  onClick={() =>
                    navigate("/doctor/patients")
                  }
                >
                  <span>👥</span>

                  <div>
                    <strong>
                      Patient Details
                    </strong>

                    <small>
                      View patient information
                    </small>
                  </div>
                </button>


                <button
                  onClick={() =>
                    comingSoon()
                  }
                >
                  <span>💊</span>

                  <div>
                    <strong>
                      Prescriptions
                    </strong>

                    <small>
                      Manage prescriptions
                    </small>
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

export default DoctorDashboard;