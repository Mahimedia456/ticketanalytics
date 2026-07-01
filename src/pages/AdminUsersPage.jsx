import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  AlertCircle,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { isAdmin } from "../utils/auth";
import {
  createUser,
  deleteUser,
  fetchUsers,
  resetUserPassword,
  updateUser,
} from "../services/usersApi";

const defaultPassword = "Mahimediasolutions@786";

const emptyForm = {
  name: "",
  email: "",
  password: defaultPassword,
  role: "viewer",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [passwordUserId, setPasswordUserId] = useState("");
  const [newPassword, setNewPassword] = useState(defaultPassword);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  const editingUser = useMemo(
    () => users.find((user) => user.id === editingId),
    [users, editingId]
  );

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function resetForm() {
    setEditingId("");
    setForm(emptyForm);
  }

  function startEdit(user) {
    setEditingId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: defaultPassword,
      role: user.role || "viewer",
      status: user.status || "active",
    });
    setMessage("");
    setError("");
  }

  async function submitForm(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await updateUser(editingId, {
          name: form.name,
          role: form.role,
          status: form.status || "active",
        });

        setMessage("User updated successfully.");
      } else {
        await createUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });

        setMessage("User created successfully.");
      }

      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err.message || "Unable to save user.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(user) {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await updateUser(user.id, {
        status: user.status === "active" ? "disabled" : "active",
      });

      setMessage("User status updated.");
      await loadUsers();
    } catch (err) {
      setError(err.message || "Unable to update status.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    if (!passwordUserId) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await resetUserPassword(passwordUserId, newPassword);

      setPasswordUserId("");
      setNewPassword(defaultPassword);
      setMessage("Password reset successfully.");
    } catch (err) {
      setError(err.message || "Unable to reset password.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    const ok = window.confirm(`Delete ${user.email}?`);
    if (!ok) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await deleteUser(user.id);
      setMessage("User deleted successfully.");
      await loadUsers();
    } catch (err) {
      setError(err.message || "Unable to delete user.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="dashboard-card p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
              Administration
            </p>

            <h1 className="mt-3 text-3xl font-black text-white">
              User Management
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
              Create users, update roles, disable accounts, reset passwords and
              delete user records.
            </p>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-800 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-zinc-300 hover:border-[#00dcc5]/70 hover:text-[#00dcc5] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </button>
        </div>
      </section>

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-6">{error}</p>
        </div>
      ) : null}

      {message ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[#00dcc5]/30 bg-[#00dcc5]/10 p-4 text-[#00dcc5]">
          <Shield size={19} className="mt-0.5 shrink-0" />
          <p className="text-sm font-bold leading-6">{message}</p>
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={submitForm} className="dashboard-card space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
                {editingId ? "Edit User" : "Create User"}
              </p>

              <h2 className="mt-2 text-xl font-black text-white">
                {editingId ? editingUser?.email : "New User"}
              </h2>
            </div>

            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-zinc-800 p-2 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-zinc-400">
              Name
            </label>
            <input
              className="input"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-zinc-400">
              Email
            </label>
            <input
              className="input disabled:opacity-50"
              type="email"
              value={form.email}
              disabled={Boolean(editingId)}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
          </div>

          {!editingId ? (
            <div>
              <label className="mb-2 block text-xs font-bold text-zinc-400">
                Password
              </label>
              <input
                className="input"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                required
              />
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-xs font-bold text-zinc-400">
              Role
            </label>
            <select
              className="input"
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({ ...current, role: event.target.value }))
              }
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          {editingId ? (
            <div>
              <label className="mb-2 block text-xs font-bold text-zinc-400">
                Status
              </label>
              <select
                className="input"
                value={form.status || "active"}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#00dcc5] px-5 py-3 text-sm font-black text-black disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : editingId ? (
              <Save size={17} />
            ) : (
              <Plus size={17} />
            )}
            {editingId ? "Save Changes" : "Create User"}
          </button>
        </form>

        <section className="dashboard-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <Users className="text-[#00dcc5]" size={20} />
              <h2 className="text-lg font-black text-white">Users</h2>
            </div>

            <p className="text-xs font-bold text-zinc-500">
              {users.length} user(s)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="soft-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.length ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="font-bold text-white">{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className="rounded-full border border-[#00dcc5]/30 bg-[#00dcc5]/10 px-3 py-1 text-xs font-black uppercase text-[#00dcc5]">
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                            user.status === "active"
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border border-red-500/30 bg-red-500/10 text-red-300"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(user)}
                            className="rounded-xl border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-300 hover:border-[#00dcc5]/60 hover:text-[#00dcc5]"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleStatus(user)}
                            className="rounded-xl border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-300 hover:border-[#00dcc5]/60 hover:text-[#00dcc5]"
                          >
                            {user.status === "active" ? "Disable" : "Enable"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPasswordUserId(user.id);
                              setNewPassword(defaultPassword);
                            }}
                            className="rounded-xl border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-300 hover:border-[#00dcc5]/60 hover:text-[#00dcc5]"
                          >
                            Reset
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            className="rounded-xl border border-red-500/30 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-zinc-500">
                      {loading ? "Loading users..." : "No users found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {passwordUserId ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-zinc-800 bg-[#080808] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
                  Password Reset
                </p>
                <h2 className="mt-2 text-xl font-black text-white">
                  Set New Password
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setPasswordUserId("")}
                className="rounded-full border border-zinc-800 p-2 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-bold text-zinc-400">
                New Password
              </label>
              <input
                className="input"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={saving}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#00dcc5] px-5 py-3 text-sm font-black text-black disabled:opacity-60"
            >
              {saving ? <Loader2 size={17} className="animate-spin" /> : null}
              Reset Password
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}