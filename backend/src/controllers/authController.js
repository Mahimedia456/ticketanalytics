import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../config/supabase.js";
import { signToken } from "../config/jwt.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabaseAdmin
      .from("app_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "User is disabled" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function me(req, res) {
  return res.json({ user: req.user });
}
