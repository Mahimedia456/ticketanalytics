import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../config/supabase.js";

const password = "Mahimediasolutions@786";

const users = [
  {
    name: "Shahid",
    email: "shahid@mahimediasolutions.com",
    role: "admin"
  },
  {
    name: "Aamir",
    email: "aamir@mahimediasolutions.com",
    role: "manager"
  },
  {
    name: "Atomos Viewer",
    email: "atomos@mahimediasolutions.com",
    role: "viewer"
  }
];

async function seed() {
  const password_hash = await bcrypt.hash(password, 10);

  for (const user of users) {
    const { error } = await supabaseAdmin
      .from("app_users")
      .upsert(
        {
          ...user,
          email: user.email.toLowerCase(),
          password_hash,
          status: "active"
        },
        { onConflict: "email" }
      );

    if (error) {
      console.error("Seed failed:", user.email, error.message);
      process.exit(1);
    }

    console.log("Seeded:", user.email);
  }

  console.log("Users seed completed.");
}

seed();
