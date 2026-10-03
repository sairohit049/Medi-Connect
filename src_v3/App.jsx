import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthCallback from "./pages/auth/AuthCallback";
import DoctorLogin from "./pages/auth/DoctorLogin";
import StaffLogin from "./pages/auth/StaffLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";

import NotificationsPage from "./pages/common/NotificationsPage";

import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientProfile from "./pages/patient/PatientProfile";
import FindDoctor from "./pages/patient/FindDoctor";
import BookAppointment from "./pages/patient/BookAppointment";
import MyAppointments from "./pages/patient/MyAppointments";
import MedicalRecords from "./pages/patient/MedicalRecords";
import Prescriptions from "./pages/patient/Prescriptions";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import PatientDetails from "./pages/doctor/PatientDetails";
import Diagnosis from "./pages/doctor/Diagnosis";
import Prescription from "./pages/doctor/Prescription";
import DoctorProfile from "./pages/doctor/DoctorProfile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageDoctors from "./pages/admin/ManageDoctors";
import ManagePatients from "./pages/admin/ManagePatients";
import ManageReceptionists from "./pages/admin/ManageReceptionists";
import Reports from "./pages/admin/Reports";

import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import Appointments from "./pages/receptionist/Appointments";
import CheckIn from "./pages/receptionist/CheckIn";
import PatientRegistration from "./pages/receptionist/PatientRegistration";

const theme = {
  token: {
    colorPrimary: "#0d9488",
    borderRadius: 10,
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  components: {
    Layout: { siderBg: "#0f2a2e", headerBg: "#ffffff", bodyBg: "#f4f7f9" },
    Menu: { darkItemBg: "#0f2a2e", darkItemSelectedBg: "#0d9488" },
  },
};

// Pages that keep their original Bootstrap layout (they have their own sidebar)
const guard = (role, element) => <ProtectedRoute role={role}>{element}</ProtectedRoute>;

// Pages that render inside the shared Ant Design layout
const withLayout = (role) => (
  <ProtectedRoute role={role}>
    <DashboardLayout />
  </ProtectedRoute>
);

function App() {
  return (
    <ConfigProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Patient - new layout */}
          <Route element={withLayout("patient")}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/notifications" element={<NotificationsPage />} />
          </Route>
          {/* Patient - original pages */}
          <Route path="/patient/profile" element={guard("patient", <PatientProfile />)} />
          <Route path="/patient/doctors" element={guard("patient", <FindDoctor />)} />
          <Route path="/patient/book-appointment" element={guard("patient", <BookAppointment />)} />
          <Route path="/patient/appointments" element={guard("patient", <MyAppointments />)} />
          <Route path="/patient/records" element={guard("patient", <MedicalRecords />)} />
          <Route path="/patient/prescriptions" element={guard("patient", <Prescriptions />)} />

          {/* Doctor - new layout */}
          <Route element={withLayout("doctor")}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/prescriptions" element={<Prescription />} />
            <Route path="/doctor/notifications" element={<NotificationsPage />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
          </Route>
          {/* Doctor - original pages */}
          <Route path="/doctor/appointments" element={guard("doctor", <DoctorAppointments />)} />
          <Route path="/doctor/patients" element={guard("doctor", <DoctorPatients />)} />
          <Route path="/doctor/patients/:patientId" element={guard("doctor", <PatientDetails />)} />
          <Route path="/doctor/patients/:patientId/diagnosis" element={guard("doctor", <Diagnosis />)} />

          {/* Admin */}
          <Route element={withLayout("admin")}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<ManageDoctors />} />
            <Route path="/admin/patients" element={<ManagePatients />} />
            <Route path="/admin/receptionists" element={<ManageReceptionists />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

          {/* Receptionist */}
          <Route element={withLayout("receptionist")}>
            <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
            <Route path="/receptionist/appointments" element={<Appointments />} />
            <Route path="/receptionist/check-in" element={<CheckIn />} />
            <Route path="/receptionist/register-patient" element={<PatientRegistration />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
