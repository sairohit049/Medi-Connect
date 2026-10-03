import { supabase } from "./supabase";

export const emailExists = async (email) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .limit(1);

  if (error) throw error;
  return (data || []).length > 0;
};

// Creates a row in profiles (same demo password system the app already uses).
export const createAccount = async ({ full_name, email, phone, password, role }) => {
  const cleanEmail = email.trim().toLowerCase();

  if (await emailExists(cleanEmail)) {
    throw new Error("An account with this email already exists.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        full_name: full_name.trim(),
        email: cleanEmail,
        phone: phone ? String(phone).trim() : null,
        password,
        role,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchProfilesMap = async (ids) => {
  const unique = [...new Set((ids || []).filter(Boolean))];
  if (unique.length === 0) return {};

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone")
    .in("id", unique);

  if (error) throw error;

  const map = {};
  (data || []).forEach((profile) => {
    map[profile.id] = profile;
  });
  return map;
};
