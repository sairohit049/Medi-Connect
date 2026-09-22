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
      </Routes>
    </BrowserRouter>
  );
}

export default App;