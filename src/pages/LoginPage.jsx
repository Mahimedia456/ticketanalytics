import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Loader2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import AtomosLogo from "../components/AtomosLogo";
import { loginApi } from "../services/authApi";

const accounts = [
  { label: "Admin", email: "shahid@mahimediasolutions.com" },
  { label: "Manager", email: "aamir@mahimediasolutions.com" },
  { label: "Viewer", email: "atomos@mahimediasolutions.com" },
];

const defaultPassword = "Mahimediasolutions@786";

export default function LoginPage() {
  const navigate = useNavigate();
  const savedUser = localStorage.getItem("atomos_auth_user");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(defaultPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (savedUser) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await loginApi({
        email: email.trim(),
        password,
      });

      localStorage.setItem("atomos_auth_token", result.token);
      localStorage.setItem("atomos_auth_user", JSON.stringify(result.user));

      navigate("/", { replace: true });
    } catch (error) {
      setError(error.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-y-auto bg-black px-4 py-5 text-white sm:py-6">
      <div className="pointer-events-none absolute inset-0 atomos-grid-bg opacity-20" />
      <div className="pointer-events-none absolute inset-0 atomos-glow" />

      <div className="relative z-10 flex min-h-[calc(100vh-40px)] items-center justify-center">
        <section className="w-full max-w-[520px] rounded-[28px] border border-zinc-800 bg-[#050505]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.72)] sm:p-6 lg:p-7">
          <div className="flex justify-center">
            <AtomosLogo className="h-9 w-[185px] text-white" />
          </div>

          <div className="mt-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#00dcc5]">
              Analytics Workspace
            </p>

            <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white sm:text-[28px]">
              Sign in to continue
            </h1>

            <p className="mt-1.5 text-sm leading-6 text-zinc-500">
              Ticket, RMA and satisfaction dashboards.
            </p>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-bold text-red-200">
              {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-500"
                  size={19}
                />

                <input
                  className="h-[56px] w-full rounded-[20px] border border-zinc-800 bg-black pl-12 pr-5 text-sm font-medium text-white outline-none transition placeholder:text-zinc-600 focus:border-[#00dcc5] focus:ring-4 focus:ring-[#00dcc5]/10"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="name@mahimediasolutions.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-500"
                  size={19}
                />

                <input
                  className="h-[56px] w-full rounded-[20px] border border-zinc-800 bg-black pl-12 pr-13 text-sm font-medium text-white outline-none transition placeholder:text-zinc-600 focus:border-[#00dcc5] focus:ring-4 focus:ring-[#00dcc5]/10"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <button
              disabled={submitting}
              className="flex h-[58px] w-full items-center justify-center gap-2 rounded-[24px] bg-[#00dcc5] text-sm font-black text-black transition hover:shadow-[0_0_35px_rgba(0,220,197,0.28)] disabled:opacity-60"
              type="submit"
            >
              {submitting ? <Loader2 size={19} className="animate-spin" /> : null}
              {submitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {accounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(defaultPassword);
                  setError("");
                }}
                className="min-w-0 rounded-[18px] border border-zinc-800 bg-black p-3 text-left transition hover:border-[#00dcc5]/70 hover:bg-[#00dcc5]/10"
              >
                <p className="text-sm font-black text-white">{account.label}</p>
                <p
                  className="mt-1.5 truncate text-[11px] text-zinc-500"
                  title={account.email}
                >
                  {account.email}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}