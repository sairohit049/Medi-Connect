import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientProfile from "./pages/patient/PatientProfile";
import FindDoctor from "./pages/patient/FindDoctor";
import BookAppointment from "./pages/patient/BookAppointment";
import AuthCallback from "./pages/auth/AuthCallback";
import MyAppointments from "./pages/patient/MyAppointments";
import MedicalRecords from "./pages/patient/MedicalRecords";
import Prescriptions from "./pages/patient/Prescriptions";
import Notifications from "./pages/patient/Notifications";
import DoctorLogin from "./pages/auth/DoctorLogin";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import PatientDetails from "./pages/doctor/PatientDetails";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import Diagnosis from "./pages/doctor/Diagnosis";
import MyPatients from "./pages/doctor/MyPatients";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/patient/dashboard"
          element={<PatientDashboard />}
        />
        <Route
          path="/patient/profile"
          element={<PatientProfile />}
        />
        <Route
          path="/patient/doctors"
          element={<FindDoctor />}
        />
        <Route
          path="/patient/book-appointment"
          element={<BookAppointment />}
        />
        <Route
          path="/auth/callback"
          element={<AuthCallback />}
        />
        <Route
          path="/patient/appointments"
          element={<MyAppointments />}
        />
        <Route
          path="/patient/records"
          element={<MedicalRecords />}
        />
        <Route
          path="/patient/prescriptions"
          element={<Prescriptions />}
        />
        <Route
          path="/patient/notifications"
          element={<Notifications />}
        />
        <Route
          path="/doctor/login"
          element={<DoctorLogin />}
        />
        <Route
          path="/doctor/dashboard"
          element={<DoctorDashboard />}
        />
        <Route
          path="/doctor/appointments"
          element={<DoctorAppointments />}
        />
        <Route
  path="/doctor/patients"
  element={<DoctorPatients />}
/>
        <Route
          path="/doctor/patients/:patientId"
          element={<PatientDetails />}
        />
        <Route
  path="/doctor/patients/:patientId/diagnosis"
  element={<Diagnosis />}
/>
<Route
  path="/doctor/patients"
  element={<MyPatients />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;