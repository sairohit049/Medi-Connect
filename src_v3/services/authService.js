import { supabase } from "./supabase";

export const loginWithRoles = async (email, password, roles) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .eq("password", password)
    .in("role", roles)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Demo-level reset: the email and phone must both match the account.
export const resetPassword = async (email, phone, newPassword) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, phone")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("No account found with this email.");

  if (!data.phone || data.phone.trim() !== phone.trim()) {
    throw new Error("The phone number does not match our records.");
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ password: newPassword })
    .eq("id", data.id);

  if (updateError) throw updateError;
};
