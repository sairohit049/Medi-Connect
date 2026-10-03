import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, message } from "antd";
import { supabase } from "../../services/supabase";
import { ensurePatientRecord } from "../../services/patientService";
import { useAuth } from "../../context/AuthContext";
import { AuthShell } from "../../components/ui";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const completeGoogleLogin = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session?.user) throw new Error("Google session was not found.");

        const authUser = session.user;
        const email = authUser.email?.toLowerCase();
        if (!email) throw new Error("Google did not provide an email.");

        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", email)
          .maybeSingle();
        if (profileError) throw profileError;

        let profile = existingProfile;

        if (!profile) {
          const fullName =
            authUser.user_metadata?.full_name || authUser.user_metadata?.name || email.split("@")[0];

          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([{ full_name: fullName, email, role: "patient" }])
            .select()
            .single();
          if (insertError) throw insertError;

          profile = newProfile;
        }

        if (profile.role !== "patient") {
          await supabase.auth.signOut();
          throw new Error("This Google login is only available for patients.");
        }

        await ensurePatientRecord(profile.id);
        login(profile);
        navigate("/patient/dashboard", { replace: true });
      } catch (error) {
        console.error("Google callback error:", error);
        message.error(error.message || "Google sign-in failed. Please try again.");
        navigate("/login", { replace: true });
      }
    };

    completeGoogleLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthShell variant="patient" title="Completing sign-in" subtitle="Please wait while we prepare your account">
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <Spin size="large" />
      </div>
    </AuthShell>
  );
};

export default AuthCallback;
