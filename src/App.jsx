import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";

const pages = [
  { path: "/ticket-dashboard", title: "Ticket Dashboard", type: "ticket" },
  { path: "/rma-emea-dashboard", title: "RMA EMEA Dashboard", type: "rma-emea" },
  { path: "/rma-us-dashboard", title: "RMA US Dashboard", type: "rma-us" },
  { path: "/good-satisfaction", title: "Good Satisfaction", type: "ticket" },
  { path: "/bad-satisfaction", title: "Bad Satisfaction", type: "ticket" },
  { path: "/comparison", title: "Both Comparison", type: "ticket" },
];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout pages={pages} />}>
          <Route path="/" element={<Navigate to="/ticket-dashboard" replace />} />

          {pages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={
                <DashboardPage
                  pageTitle={page.title}
                  storageKey={page.path}
                  pageType={page.type}
                />
              }
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}