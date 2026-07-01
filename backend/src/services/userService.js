import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../config/supabase.js";

const ALLOWED_ROLES = ["admin", "manager", "viewer"];

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function sanitizeUser(user) {
  if (!user) return null;

  const { password_hash, ...safeUser } = user;
  return safeUser;
}

export async function listUsers() {
  const { data, error } = await supabaseAdmin
    .from("app_users")
    .select("id,name,email,role,status,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function createUser({ name, email, password, role }) {
  const cleanEmail = normalizeEmail(email);

  if (!name) throw new Error("Name is required");
  if (!cleanEmail) throw new Error("Email is required");
  if (!password) throw new Error("Password is required");
  if (!ALLOWED_ROLES.includes(role)) throw new Error("Invalid role");

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from("app_users")
    .insert({
      name,
      email: cleanEmail,
      password_hash,
      role,
      status: "active",
    })
    .select("*")
    .single();

  if (error) throw error;

  return sanitizeUser(data);
}

export async function updateUser({ id, name, role, status }) {
  if (!id) throw new Error("User id is required");

  const updates = {};

  if (name !== undefined) updates.name = name;

  if (role !== undefined) {
    if (!ALLOWED_ROLES.includes(role)) throw new Error("Invalid role");
    updates.role = role;
  }

  if (status !== undefined) {
    if (!["active", "disabled"].includes(status)) {
      throw new Error("Invalid status");
    }

    updates.status = status;
  }

  const { data, error } = await supabaseAdmin
    .from("app_users")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  return sanitizeUser(data);
}

export async function resetUserPassword({ id, password }) {
  if (!id) throw new Error("User id is required");
  if (!password) throw new Error("Password is required");

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from("app_users")
    .update({ password_hash })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  return sanitizeUser(data);
}

export async function deleteUser({ id }) {
  if (!id) throw new Error("User id is required");

  const { error } = await supabaseAdmin
    .from("app_users")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}