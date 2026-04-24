import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";

const pages = [
  { path: "/ticket-analysis", title: "Ticket Analysis", type: "ticket" },
  { path: "/returns-emea-jan", title: "Returns EMEA Jan", type: "rma-emea" },
  { path: "/returns-usa-jan", title: "Returns USA Jan", type: "ticket" },
  { path: "/good-satisfaction", title: "Good Satisfaction", type: "ticket" },
  { path: "/bad-satisfaction", title: "Bad Satisfaction", type: "ticket" },
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