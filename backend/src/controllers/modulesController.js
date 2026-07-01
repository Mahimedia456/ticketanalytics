import { supabaseAdmin } from "../config/supabase.js";

export async function getModules(req, res) {
  const { data, error } = await supabaseAdmin
    .from("dashboard_modules")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return res.status(500).json({ message: error.message });
  return res.json({ modules: data });
}
