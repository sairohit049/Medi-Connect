import { supabase } from "./supabase";

/**
 * The doctors table has no full_name column - the name lives in
 * profiles (doctors.user_id -> profiles.id). This loads doctors and
 * adds full_name (and phone) from their profile.
 */
export const fetchDoctorsWithNames = async () => {
  const { data: doctors, error } = await supabase
    .from("doctors")
    .select("*");

  if (error) throw error;
  if (!doctors || doctors.length === 0) return [];

  const userIds = doctors.map((d) => d.user_id).filter(Boolean);

  let profiles = [];
  if (userIds.length > 0) {
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", userIds);

    if (profileError) throw profileError;
    profiles = data || [];
  }

  return doctors.map((doctor) => {
    const profile = profiles.find((p) => p.id === doctor.user_id);
    return {
      ...doctor,
      full_name: profile?.full_name || doctor.full_name || "Doctor",
      phone: profile?.phone || null,
    };
  });
};
