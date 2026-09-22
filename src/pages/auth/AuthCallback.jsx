
import React, { useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../../services/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const completeGoogleLogin = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session?.user) {
          throw new Error("Google session was not found.");
        }

        const authUser = session.user;
        const email = authUser.email;

        if (!email) {
          throw new Error("Google did not provide an email.");
        }

        // Check whether a profile already exists for this email.
        const { data: existingProfile, error: profileError } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("email", email)
            .maybeSingle();

        if (profileError) throw profileError;

        let profile = existingProfile;

        // Create a profile for a new Google user.
        if (!profile) {
          const fullName =
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            email.split("@")[0];

          const { data: newProfile, error: insertError } =
            await supabase
              .from("profiles")
              .insert([
                {
                  id: authUser.id,
                  full_name: fullName,
                  email: email,
                  role: "patient",
                },
              ])
              .select()
              .single();

          if (insertError) throw insertError;

          profile = newProfile;
        }

        if (profile.role !== "patient") {
          await supabase.auth.signOut();

          throw new Error(
            "This Google login is only available for patients."
          );
        }

        // Store the app profile for the existing dashboard.
        localStorage.setItem("user", JSON.stringify(profile));

        navigate("/patient/dashboard", { replace: true });
      } catch (error) {
        console.error("Google callback error:", error);

        await Swal.fire({
          icon: "error",
          title: "Google Sign-In Failed",
          text: error.message || "Please try again.",
        });

        navigate("/login", { replace: true });
      }
    };

    completeGoogleLogin();
  }, [navigate]);

  return (
    <Container className="min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <Spinner animation="border" />
      <h5 className="mt-3">Completing Google Sign-In...</h5>
      <p className="text-muted">
        Please wait while we prepare your account.
      </p>
    </Container>
  );
};

export default AuthCallback;