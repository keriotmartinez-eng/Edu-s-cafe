import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Users,
  Filter,
} from "lucide-react";
import { getLeads } from "../services/api";
import type { Lead } from "../types";

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [fuente, setFuente] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarLeads() {
      setCargando(true);
      setError("");

      try {
        const datos = await getLeads(
          estado,
          fuente,
          busqueda
        );

        if (activo) setLeads(datos);
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar los clientes"
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarLeads();

    return () => {
      activo = false;
    };
  }, [estado, fuente, busqueda]);

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Clientes potenciales</h1>
          <p>
            Gestiona las oportunidades de venta de Edu’s Café.
          </p>
        </div>

        <Link to="/leads/nuevo" className="btn-primary">
          <Plus size={20} />
          Nuevo cliente
        </Link>
      </header>

      <section className="content-card">
        <div className="filters">
          <div className="search-box">
            <Search size={20} />

            <input
              type="search"
              placeholder="Buscar cliente..."
              aria-label="Buscar cliente"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <Filter size={18} />

            <select
              aria-label="Filtrar por estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="nuevo">Nuevo</option>
              <option value="contactado">Contactado</option>
              <option value="cotizado">Cotizado</option>
              <option value="ganado">Ganado</option>
              <option value="perdido">Perdido</option>
            </select>

            <select
              aria-label="Filtrar por fuente"
              value={fuente}
              onChange={(e) => setFuente(e.target.value)}
            >
              <option value="">Todas las fuentes</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sitio_web">Sitio web</option>
              <option value="referido">Referido</option>
              <option value="otro">Otro</option>
            </select>

            <button
              className="btn-secondary"
              onClick={() => {
                setBusqueda("");
                setEstado("");
                setFuente("");
              }}
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="table-summary">
          <Users size={18} />
          {leads.length} clientes encontrados
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="loading">
            Cargando clientes...
          </div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <Users size={45} />
            <h3>No se encontraron clientes</h3>
            <p>Intenta cambiar los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Interés</th>
                  <th>Fuente</th>
                  <th>Estado</th>
                  <th>Fecha de registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="client-cell">
                        <div className="client-avatar">
                          {lead.nombre.charAt(0)}
                        </div>

                        <div>
                          <strong>{lead.nombre}</strong>
                          <small>{lead.correo}</small>
                        </div>
                      </div>
                    </td>

                    <td>{lead.interes}</td>

                    <td className="capitalize">
                      {lead.fuente.replace("_", " ")}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${lead.estado}`}
                      >
                        {lead.estado}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        lead.creado_en
                      ).toLocaleDateString("es-NI")}
                    </td>

                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="icon-button"
                          title="Ver detalle"
                          aria-label={`Ver detalle de ${lead.nombre}`}
                        >
                          <Eye size={18} />
                        </Link>

                        <Link
                          to={`/leads/${lead.id}/editar`}
                          className="icon-button"
                          title="Editar cliente"
                          aria-label={`Editar a ${lead.nombre}`}
                        >
                          <Pencil size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}