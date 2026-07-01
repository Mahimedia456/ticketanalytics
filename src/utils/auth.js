export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("atomos_auth_user"));
  } catch {
    return null;
  }
}

export function hasRole(...roles) {
  const user = getCurrentUser();

  if (!user) return false;

  return roles.includes(user.role);
}

export function isAdmin() {
  return hasRole("owner", "admin");
}