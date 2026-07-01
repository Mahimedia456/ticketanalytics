import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import TicketDashboardPage from "./pages/TicketDashboardPage";
import RmaEmeaPage from "./pages/RmaEmeaPage";
import RmaUsPage from "./pages/RmaUsPage";
import GoodSatisfactionPage from "./pages/GoodSatisfactionPage";
import BadSatisfactionPage from "./pages/BadSatisfactionPage";
import SatisfactionComparisonPage from "./pages/SatisfactionComparisonPage";
import ReportsPage from "./pages/ReportsPage";
import AdminUsersPage from "./pages/AdminUsersPage";

const pages = [
  { path: "/", title: "Home" },
  { path: "/ticket-dashboard", title: "Tickets" },
  { path: "/rma-emea-dashboard", title: "RMA EMEA" },
  { path: "/rma-us-dashboard", title: "RMA US" },
  { path: "/good-satisfaction", title: "Good" },
  { path: "/bad-satisfaction", title: "Bad" },
  { path: "/comparison", title: "Comparison" },
  { path: "/reports", title: "Reports" },
  { path: "/admin-users", title: "Users" },
];

function ProtectedRoute() {
  const user = localStorage.getItem("atomos_auth_user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout pages={pages} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/ticket-dashboard" element={<TicketDashboardPage />} />
          <Route path="/rma-emea-dashboard" element={<RmaEmeaPage />} />
          <Route path="/rma-us-dashboard" element={<RmaUsPage />} />
          <Route path="/good-satisfaction" element={<GoodSatisfactionPage />} />
          <Route path="/bad-satisfaction" element={<BadSatisfactionPage />} />
          <Route path="/comparison" element={<SatisfactionComparisonPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/admin-users" element={<AdminUsersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}