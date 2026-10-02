import { supabase } from "./supabase";
import { fetchProfilesMap } from "./userService";

export const getDoctorByUserId = async (userId) => {
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const getPatientByUserId = async (userId) => {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

// patients rows + name/email/phone from profiles
export const fetchPatientsWithProfiles = async () => {
  const { data: patients, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const profiles = await fetchProfilesMap((patients || []).map((p) => p.user_id));

  return (patients || []).map((patient) => ({
    ...patient,
    full_name: profiles[patient.user_id]?.full_name || "Unknown",
    email: profiles[patient.user_id]?.email || "",
    phone: profiles[patient.user_id]?.phone || "",
  }));
};

// { patients.id: "Full Name" }
export const fetchPatientNames = async (patientIds) => {
  const unique = [...new Set((patientIds || []).filter(Boolean))];
  if (unique.length === 0) return {};

  const { data, error } = await supabase
    .from("patients")
    .select("id, user_id")
    .in("id", unique);
  if (error) throw error;

  const profiles = await fetchProfilesMap((data || []).map((p) => p.user_id));
  const names = {};
  (data || []).forEach((patient) => {
    names[patient.id] = profiles[patient.user_id]?.full_name || "Patient";
  });
  return names;
};
