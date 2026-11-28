import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  CakeSlice,
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";
import { login } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await login(username.trim(), password);
      navigate("/leads", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión"
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-content">
          <CakeSlice size={70} strokeWidth={1.5} />
          <h1>Edu’s Café</h1>
          <p>Repostería artesanal</p>
          <span className="brand-divider" />
          <h2>Conectamos con nuestros clientes</h2>
          <p>
            Gestiona tus clientes potenciales, oportunidades
            y ventas desde un solo lugar.
          </p>
          <span className="brand-location">
            León, Nicaragua
          </span>
        </div>
      </section>

      <section className="login-section">
        <div className="login-card">
          <div className="login-logo">
            <CakeSlice size={32} />
          </div>

          <h2>¡Bienvenido!</h2>

          <p className="login-subtitle">
            Inicia sesión en el CRM de Edu’s Café.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Usuario</label>

              <div className="input-icon">
                <UserRound size={19} />

                <input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>

              <div className="input-icon">
                <LockKeyhole size={19} />

                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  onClick={() =>
                    setMostrarPassword(!mostrarPassword)
                  }
                >
                  {mostrarPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={cargando}
            >
              <LogIn size={20} />
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <footer className="login-footer">
            © 2026 Edu’s Café · Sistema CRM
          </footer>
        </div>
      </section>
    </main>
  );
}