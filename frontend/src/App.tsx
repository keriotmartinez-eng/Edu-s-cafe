import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Leads from "./pages/Leads";
import LeadForm from "./pages/LeadForm";
import LeadDetail from "./pages/LeadDetail";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated } from "./services/api";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/leads" replace />}
        />

        <Route
          path="/login"
          element={
            isAuthenticated()
              ? <Navigate to="/leads" replace />
              : <Login />
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/leads" element={<Leads />} />

            <Route
              path="/leads/nuevo"
              element={<LeadForm key="nuevo" />}
            />

            <Route
              path="/leads/:id"
              element={<LeadDetail />}
            />

            <Route
              path="/leads/:id/editar"
              element={<LeadForm key="editar" />}
            />

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}