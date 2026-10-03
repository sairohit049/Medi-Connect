import dayjs from "dayjs";
import { supabase } from "./supabase";
import { fetchProfilesMap } from "./userService";
import { notifyPatientById, notifyDoctorById } from "./notificationService";

export const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

const unique = (list) => [...new Set(list.filter(Boolean))];

// Appointments with patient_name, doctor_name, specialization added.
export const fetchAppointmentsDetailed = async (filters = {}) => {
  const { doctorId, patientId, date, from, to, limit } = filters;

  let query = supabase
    .from("appointments")
    .select("*")
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false });

  if (doctorId) query = query.eq("doctor_id", doctorId);
  if (patientId) query = query.eq("patient_id", patientId);
  if (date) query = query.eq("appointment_date", date);
  if (from) query = query.gte("appointment_date", from);
  if (to) query = query.lte("appointment_date", to);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;

  const list = data || [];
  if (list.length === 0) return [];

  const [patientRes, doctorRes] = await Promise.all([
    supabase.from("patients").select("id, user_id").in("id", unique(list.map((a) => a.patient_id))),
    supabase
      .from("doctors")
      .select("id, user_id, specialization, consultation_fee")
      .in("id", unique(list.map((a) => a.doctor_id))),
  ]);

  if (patientRes.error) throw patientRes.error;
  if (doctorRes.error) throw doctorRes.error;

  const patients = {};
  (patientRes.data || []).forEach((p) => (patients[p.id] = p));
  const doctors = {};
  (doctorRes.data || []).forEach((d) => (doctors[d.id] = d));

  const profiles = await fetchProfilesMap([
    ...(patientRes.data || []).map((p) => p.user_id),
    ...(doctorRes.data || []).map((d) => d.user_id),
  ]);

  return list.map((appointment) => {
    const patient = patients[appointment.patient_id];
    const doctor = doctors[appointment.doctor_id];
    return {
      ...appointment,
      patient_name: profiles[patient?.user_id]?.full_name || "Unknown patient",
      patient_phone: profiles[patient?.user_id]?.phone || "",
      doctor_name: profiles[doctor?.user_id]?.full_name || "Unknown doctor",
      specialization: doctor?.specialization || "",
      consultation_fee: doctor?.consultation_fee ?? null,
    };
  });
};

export const createAppointment = async ({
  patient_id,
  doctor_id,
  appointment_date,
  appointment_time,
  reason,
  status = "pending",
}) => {
  // Prevent double booking of the same doctor / date / time
  const { data: clash, error: clashError } = await supabase
    .from("appointments")
    .select("id")
    .eq("doctor_id", doctor_id)
    .eq("appointment_date", appointment_date)
    .eq("appointment_time", appointment_time)
    .neq("status", "cancelled")
    .limit(1);

  if (clashError) throw clashError;
  if ((clash || []).length > 0) {
    throw new Error("That doctor already has an appointment at this date and time.");
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert([{ patient_id, doctor_id, appointment_date, appointment_time, reason, status }])
    .select()
    .single();

  if (error) throw error;

  const when = `${dayjs(appointment_date).format("DD MMM YYYY")} at ${appointment_time}`;
  await notifyDoctorById(doctor_id, "New appointment", `A new appointment is booked for ${when}.`);
  await notifyPatientById(patient_id, "Appointment booked", `Your appointment is booked for ${when}.`);

  return data;
};

export const setAppointmentStatus = async (appointment, status) => {
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointment.id);

  if (error) throw error;

  await notifyPatientById(
    appointment.patient_id,
    "Appointment update",
    `Your appointment on ${dayjs(appointment.appointment_date).format("DD MMM YYYY")} is now ${status.replace("_", " ")}.`
  );
};
