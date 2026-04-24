import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";

const pages = [
  { path: "/ticket-analysis", title: "Ticket Analysis" },
  { path: "/rma", title: "RMA" },
  { path: "/returns-emea-jan", title: "Returns EMEA Jan" },
  { path: "/returns-usa-jan", title: "Returns USA Jan" },
  { path: "/good-satisfaction", title: "Good Satisfaction" },
  { path: "/bad-satisfaction", title: "Bad Satisfaction" },
];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout pages={pages} />}>
          <Route path="/" element={<Navigate to="/ticket-analysis" replace />} />

          {pages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={<DashboardPage pageTitle={page.title} storageKey={page.path} />}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}