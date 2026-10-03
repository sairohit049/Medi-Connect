import { supabase } from "./supabase";

// Notifications must never break the main action, so errors are only logged.
export const notifyUser = async (userId, title, message) => {
  if (!userId) return;

  const { error } = await supabase
    .from("notifications")
    .insert([{ user_id: userId, title, message, is_read: false }]);

  if (error) console.warn("Notification failed:", error.message);
};

export const notifyPatientById = async (patientId, title, message) => {
  if (!patientId) return;
  const { data } = await supabase
    .from("patients")
    .select("user_id")
    .eq("id", patientId)
    .maybeSingle();
  await notifyUser(data?.user_id, title, message);
};

export const notifyDoctorById = async (doctorId, title, message) => {
  if (!doctorId) return;
  const { data } = await supabase
    .from("doctors")
    .select("user_id")
    .eq("id", doctorId)
    .maybeSingle();
  await notifyUser(data?.user_id, title, message);
};
