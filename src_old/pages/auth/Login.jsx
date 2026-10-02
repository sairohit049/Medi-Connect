// import React, { useState } from "react";
// import { supabase } from "../../services/supabase";

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     setMessage("");

//     if (!formData.email || !formData.password) {
//       setMessage("Please enter your email and password.");
//       return;
//     }

//     try {
//       setLoading(true);

//       // Step 1: Login through Supabase Authentication
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: formData.email,
//         password: formData.password,
//       });

//       if (error) {
//         throw error;
//       }

//       // Step 2: Get the logged-in user's profile
//       const { data: profile, error: profileError } = await supabase
//         .from("profiles")
//         .select("*")
//         .eq("id", data.user.id)
//         .single();

//       if (profileError) {
//         throw profileError;
//       }

//       // Step 3: Check the user's role
//       if (profile.role !== "patient") {
//         await supabase.auth.signOut();
//         setMessage("This login is only for patients.");
//         return;
//       }

//       // Step 4: Save user information
//       localStorage.setItem("user", JSON.stringify(profile));

//       setMessage("Login successful!");

//       // Temporary dashboard message
//       console.log("Logged-in patient:", profile);

//     } catch (error) {
//       setMessage(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h1>MEDICONNECT</h1>

//       <h2>Patient Login</h2>

//       <form onSubmit={handleLogin}>
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
//           <label>Password</label>

//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             placeholder="Enter your password"
//           />
//         </div>

//         <button type="submit" disabled={loading}>
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>

//       {message && <p>{message}</p>}
//     </div>
//   );
// };

// export default Login;


import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../../services/supabase";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Check empty fields
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter email and password.",
        confirmButtonText: "OK",
      });

      return;
    }

    try {
      setLoading(true);

      // Find user in profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .maybeSingle();

      if (error) {
        console.error("Supabase Error:", error);

        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: error.message,
          confirmButtonText: "OK",
        });

        return;
      }

      // Invalid email or password
      if (!data) {
        Swal.fire({
          icon: "error",
          title: "Invalid Credentials",
          text: "Invalid email or password.",
          confirmButtonText: "Try Again",
        });

        return;
      }

      // Only allow patients on this login page
      if (data.role !== "patient") {
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "This login page is only for patients.",
          confirmButtonText: "OK",
        });

        return;
      }

      console.log("Patient Login Successful:", data);

      // Store logged-in user
      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      // Success popup
      // await Swal.fire({
      //   icon: "success",
      //   title: "Login Successful! 🏥",
      //   text: `Welcome back, ${data.full_name}!`,
      //   confirmButtonText: "Continue",
      //   timer: 2000,
      //   timerProgressBar: true,
      // });
await Swal.fire({
  icon: "success",
  title: "Login Successful! 🏥",
  text: `Welcome back, ${data.full_name}!`,
  confirmButtonText: "Continue",
  timer: 2000,
  timerProgressBar: true,
});
      // Go to patient dashboard
      navigate("/patient/dashboard");
// navigate("/login");
    } catch (error) {
      console.error("Login Error:", error);

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

const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Google Sign-In Failed",
      text: error.message,
    });
  }
};
  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          🏥
        </div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to your MEDICONNECT account
        </p>

        <form onSubmit={handleLogin}>

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

          {/* PASSWORD */}
          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Google Sign-In Button */}
        <div className="text-center my-3">
          <span className="text-muted">OR</span>
        </div>

        <button
          type="button"
          className="btn btn-outline-dark w-100"
          onClick={handleGoogleLogin}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt=""
            width="20"
            className="me-2"
          />
          Continue with Google
        </button>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Create Account</Link>
        </p>

      </div>

    </div>
  );
};

export default Login;