// import React, { useState } from "react";
// import { supabase } from "../../services/supabase";

// const Register = () => {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     phone: "",
//   });

//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     setMessage("");

//     if (!formData.fullName || !formData.email || !formData.password) {
//       setMessage("Please fill in all required fields.");
//       return;
//     }

//     try {
//       setLoading(true);

//       // Create user in Supabase Authentication
//       const { data, error } = await supabase.auth.signUp({
//         email: formData.email,
//         password: formData.password,
//       });

//       if (error) {
//         throw error;
//       }

//       // Create profile after successful signup
//       if (data.user) {
//         const { error: profileError } = await supabase
//           .from("profiles")
//           .insert([
//             {
//               id: data.user.id,
//               full_name: formData.fullName,
//               email: formData.email,
//               phone: formData.phone,
//               role: "patient",
//             },
//           ]);

//         if (profileError) {
//           throw profileError;
//         }
//       }

//       setMessage(
//         "Registration successful! Please check your email to verify your account."
//       );

//       setFormData({
//         fullName: "",
//         email: "",
//         password: "",
//         phone: "",
//       });
//     } catch (error) {
//       setMessage(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h1>MEDICONNECT</h1>

//       <h2>Patient Registration</h2>

//       <form onSubmit={handleRegister}>
//         <div>
//           <label>Full Name</label>
//           <input
//             type="text"
//             name="fullName"
//             value={formData.fullName}
//             onChange={handleChange}
//             placeholder="Enter your full name"
//           />
//         </div>

//         <div>
//           <label>Email</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="Enter your email"
//           />
//         </div>

//         <div>
//           <label>Phone</label>
//           <input
//             type="tel"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             placeholder="Enter your phone number"
//           />
//         </div>

//         <div>
//           <label>Password</label>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             placeholder="Create a password"
//           />
//         </div>

//         <button type="submit" disabled={loading}>
//           {loading ? "Creating Account..." : "Register"}
//         </button>
//       </form>

//       {message && <p>{message}</p>}
//     </div>
//   );
// };

// export default Register;



import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../../services/supabase";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check empty fields
    if (!fullName || !email || !phone || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all fields.",
        confirmButtonText: "OK",
      });

      return;
    }

    // Password validation
    if (password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Password",
        text: "Password must be at least 6 characters.",
        confirmButtonText: "OK",
      });

      return;
    }

    try {
      setLoading(true);

      // Check whether email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (checkError) {
        console.error("Supabase Error:", checkError);

        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: checkError.message,
          confirmButtonText: "Try Again",
        });

        return;
      }

      if (existingUser) {
        Swal.fire({
          icon: "error",
          title: "Email Already Registered",
          text: "An account with this email already exists.",
          confirmButtonText: "Go to Login",
        });

        navigate("/login");
        return;
      }

      // Create patient data
      const userData = {
        full_name: fullName,
        email: email,
        phone: phone,
        password: password,
        role: "patient",
      };

      console.log("Patient Data:", userData);

      // Insert patient into profiles table
      const { error } = await supabase
        .from("profiles")
        .insert([userData]);

      if (error) {
        console.error("Supabase Error:", error);

        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: error.message,
          confirmButtonText: "Try Again",
        });

        return;
      }

      console.log("Patient created successfully");

      // Success popup
      await Swal.fire({
        icon: "success",
        title: "Account Created! 🏥",
        text: "Your MEDICONNECT patient account has been created successfully.",
        confirmButtonText: "Login Now",
      });

      // Clear fields
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");

      // Go to Login
      navigate("/login");

    } catch (error) {
      console.error("Registration Error:", error);

      Swal.fire({
        icon: "error",
        title: "Something Went Wrong",
        text: "Please try again later.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          🏥
        </div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Register as a MEDICONNECT patient
        </p>

        <form onSubmit={handleRegister}>

          {/* FULL NAME */}
          <div className="input-group">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              autoComplete="name"
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* EMAIL */}
          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PHONE */}
          <div className="input-group">
            <label>Phone</label>

            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              autoComplete="tel"
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {/* LOGIN LINK */}
        <p className="auth-footer">
          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
};

export default Register;