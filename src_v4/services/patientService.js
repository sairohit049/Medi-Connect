import { supabase } from "./supabase";

/**
 * Makes sure a `patients` row exists for a profile (profiles.id -> patients.user_id).
 * Safe to call repeatedly: it only inserts when no row exists yet.
 * Returns the patients row.
 */
export const ensurePatientRecord = async (profileId) => {
  const { data: existing, error: findError } = await supabase
    .from("patients")
    .select("*")
    .eq("user_id", profileId)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing;

  const { data: created, error: insertError } = await supabase
    .from("patients")
    .insert([{ user_id: profileId }])
    .select()
    .single();

  if (insertError) throw insertError;
  return created;
};
