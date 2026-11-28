import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import {
  CakeSlice,
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  UserRound,
} from "lucide-react";
import { getUsuario, logout } from "../services/api";

export default function Layout() {
  const navigate = useNavigate();
  const usuario = getUsuario();
  const [menuAbierto, setMenuAbierto] = useState(false);

  function cerrarSesion() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-layout">
      {menuAbierto && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <aside
        className={`sidebar ${menuAbierto ? "sidebar-open" : ""}`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <CakeSlice size={30} />
          </div>

          <div>
            <h2>Edu’s Café</h2>
            <p>Sistema CRM</p>
          </div>

          <button
            className="sidebar-close"
            aria-label="Cerrar menú"
            onClick={() => setMenuAbierto(false)}
          >
            <X size={23} />
          </button>
        </div>

        <div className="sidebar-menu">
          <span className="menu-label">
            MENÚ PRINCIPAL
          </span>

          <nav className="sidebar-nav">
            <NavLink
              to="/leads"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              onClick={() => setMenuAbierto(false)}
            >
              <Users size={21} />
              <span>Clientes potenciales</span>
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              onClick={() => setMenuAbierto(false)}
            >
              <LayoutDashboard size={21} />
              <span>Panel de métricas</span>
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">
              <UserRound size={23} />
            </div>

            <div className="user-info">
              <strong>{usuario?.nombre}</strong>

              <small className="capitalize">
                {usuario?.rol}
              </small>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={cerrarSesion}
          >
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>

          <p className="sidebar-footer">
            Edu’s Café © 2026
          </p>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-toggle"
              aria-label="Abrir menú"
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              <Menu size={25} />
            </button>

            <div>
              <h3>Gestión comercial</h3>
              <p>Edu’s Café · Repostería artesanal</p>
            </div>
          </div>

          <div className="topbar-user">
            <div className="topbar-user-info">
              <strong>{usuario?.nombre}</strong>

              <small className="capitalize">
                {usuario?.rol}
              </small>
            </div>

            <div className="user-avatar">
              <UserRound size={21} />
            </div>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}