import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute, { GuestRoute, RootRedirect } from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AuthCallback from "../pages/auth/AuthCallback";
import DoctorLogin from "../pages/auth/DoctorLogin";
import StaffLogin from "../pages/auth/StaffLogin";
import ForgotPassword from "../pages/auth/ForgotPassword";

import NotificationsPage from "../pages/common/NotificationsPage";

import PatientDashboard from "../pages/patient/PatientDashboard";
import PatientProfile from "../pages/patient/PatientProfile";
import FindDoctor from "../pages/patient/FindDoctor";
import BookAppointment from "../pages/patient/BookAppointment";
import MyAppointments from "../pages/patient/MyAppointments";
import MedicalRecords from "../pages/patient/MedicalRecords";
import Prescriptions from "../pages/patient/Prescriptions";

import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorAppointments from "../pages/doctor/DoctorAppointments";
import DoctorPatients from "../pages/doctor/DoctorPatients";
import PatientDetails from "../pages/doctor/PatientDetails";
import Diagnosis from "../pages/doctor/Diagnosis";
import Prescription from "../pages/doctor/Prescription";
import DoctorProfile from "../pages/doctor/DoctorProfile";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageDoctors from "../pages/admin/ManageDoctors";
import ManagePatients from "../pages/admin/ManagePatients";
import ManageReceptionists from "../pages/admin/ManageReceptionists";
import Reports from "../pages/admin/Reports";

import ReceptionistDashboard from "../pages/receptionist/ReceptionistDashboard";
import Appointments from "../pages/receptionist/Appointments";
import CheckIn from "../pages/receptionist/CheckIn";
import PatientRegistration from "../pages/receptionist/PatientRegistration";

// Every signed-in page lives inside the same sidebar + header layout.
const withLayout = (role) => (
  <ProtectedRoute role={role}>
    <DashboardLayout />
  </ProtectedRoute>
);

const guest = (element) => <GuestRoute>{element}</GuestRoute>;

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />

    {/* Auth */}
    <Route path="/login" element={guest(<Login />)} />
    <Route path="/register" element={guest(<Register />)} />
    <Route path="/doctor/login" element={guest(<DoctorLogin />)} />
    <Route path="/staff/login" element={guest(<StaffLogin />)} />
    <Route path="/forgot-password" element={guest(<ForgotPassword />)} />
    <Route path="/auth/callback" element={<AuthCallback />} />

    {/* Patient */}
    <Route element={withLayout("patient")}>
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/patient/doctors" element={<FindDoctor />} />
      <Route path="/patient/book-appointment" element={<BookAppointment />} />
      <Route path="/patient/appointments" element={<MyAppointments />} />
      <Route path="/patient/records" element={<MedicalRecords />} />
      <Route path="/patient/prescriptions" element={<Prescriptions />} />
      <Route path="/patient/notifications" element={<NotificationsPage />} />
      <Route path="/patient/profile" element={<PatientProfile />} />
    </Route>

    {/* Doctor */}
    <Route element={withLayout("doctor")}>
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/doctor/appointments" element={<DoctorAppointments />} />
      <Route path="/doctor/patients" element={<DoctorPatients />} />
      <Route path="/doctor/patients/:patientId" element={<PatientDetails />} />
      <Route path="/doctor/patients/:patientId/diagnosis" element={<Diagnosis />} />
      <Route path="/doctor/prescriptions" element={<Prescription />} />
      <Route path="/doctor/notifications" element={<NotificationsPage />} />
      <Route path="/doctor/profile" element={<DoctorProfile />} />
    </Route>

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

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
