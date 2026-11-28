import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  CalendarDays,
  UserRound,
  ShoppingBag,
  MessageCircle,
  Plus,
  Clock,
  Users,
} from "lucide-react";
import {
  getLead,
  updateEstado,
  getInteracciones,
  createInteraccion,
} from "../services/api";
import type {
  Lead,
  EstadoLead,
  Interaccion,
  TipoInteraccion,
} from "../types";

const estados: EstadoLead[] = [
  "nuevo",
  "contactado",
  "cotizado",
  "ganado",
  "perdido",
];

const iconosInteraccion = {
  llamada: Phone,
  whatsapp: MessageCircle,
  correo: Mail,
  reunion: Users,
};

const nombresInteraccion = {
  llamada: "Llamada",
  whatsapp: "WhatsApp",
  correo: "Correo",
  reunion: "Reunión",
};

function fechaLocal() {
  const ahora = new Date();

  return new Date(
    ahora.getTime() - ahora.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);
}

export default function LeadDetail() {
  const { id } = useParams();

  const [lead, setLead] = useState<Lead | null>(null);
  const [interacciones, setInteracciones] = useState<
    Interaccion[]
  >([]);
  const [estado, setEstado] = useState<EstadoLead>("nuevo");
  const [tipo, setTipo] =
    useState<TipoInteraccion>("llamada");
  const [nota, setNota] = useState("");
  const [fecha, setFecha] = useState(fechaLocal);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      setCargando(true);
      setError("");
      setExito("");
      setLead(null);

      try {
        const [cliente, historial] = await Promise.all([
          getLead(Number(id)),
          getInteracciones(Number(id)),
        ]);

        if (!activo) return;

        setLead(cliente);
        setEstado(cliente.estado);
        setInteracciones(historial);
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar la información"
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, [id]);

  async function cambiarEstado() {
    if (!lead) return;

    setError("");
    setExito("");
    setActualizando(true);

    try {
      const actualizado = await updateEstado(
        lead.id,
        estado
      );

      setLead(actualizado);
      setEstado(actualizado.estado);
      setExito("Estado actualizado correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado"
      );
    } finally {
      setActualizando(false);
    }
  }

  async function registrarInteraccion(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!lead) return;

    setError("");
    setExito("");
    setGuardando(true);

    try {
      const nueva = await createInteraccion(
        lead.id,
        tipo,
        nota.trim(),
        new Date(fecha).toISOString()
      );

      setInteracciones((anteriores) =>
        [nueva, ...anteriores].sort(
          (a, b) =>
            new Date(b.fecha).getTime() -
            new Date(a.fecha).getTime()
        )
      );

      setNota("");
      setFecha(fechaLocal());
      setExito("Interacción registrada correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar la interacción"
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="loading">
        Cargando cliente...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="page-container">
        <div className="error-message">
          {error || "Cliente no encontrado"}
        </div>

        <Link to="/leads" className="btn-secondary">
          Volver a clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to="/leads" className="back-link">
        <ArrowLeft size={18} />
        Volver a clientes
      </Link>

      <header className="page-header">
        <div>
          <h1>{lead.nombre}</h1>
          <p>Detalle del cliente potencial</p>
        </div>

        <Link
          to={`/leads/${lead.id}/editar`}
          className="btn-primary"
        >
          <Pencil size={18} />
          Editar cliente
        </Link>
      </header>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {exito && (
        <div className="success-message" role="status">
          {exito}
        </div>
      )}

      <div className="detail-grid">
        <section className="content-card">
          <div className="section-heading">
            <UserRound size={24} />
            <h2>Información del cliente</h2>
          </div>

          <div className="detail-info">
            <div className="detail-item">
              <Mail size={20} />

              <div>
                <small>Correo electrónico</small>
                <p>{lead.correo}</p>
              </div>
            </div>

            <div className="detail-item">
              <Phone size={20} />

              <div>
                <small>Teléfono</small>
                <p>{lead.telefono}</p>
              </div>
            </div>

            <div className="detail-item">
              <ShoppingBag size={20} />

              <div>
                <small>Producto de interés</small>
                <p>{lead.interes}</p>
              </div>
            </div>

            <div className="detail-item">
              <MessageCircle size={20} />

              <div>
                <small>Fuente de contacto</small>
                <p className="capitalize">
                  {lead.fuente.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="detail-item">
              <UserRound size={20} />

              <div>
                <small>Responsable</small>
                <p>{lead.asignado_a || "Sin asignar"}</p>
              </div>
            </div>

            <div className="detail-item">
              <CalendarDays size={20} />

              <div>
                <small>Fecha de registro</small>
                <p>
                  {new Date(
                    lead.creado_en
                  ).toLocaleDateString("es-NI")}
                </p>
              </div>
            </div>
          </div>

          <div className="client-message">
            <h3>Mensaje u observaciones</h3>
            <p>{lead.mensaje || "Sin observaciones."}</p>
          </div>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <ShoppingBag size={24} />
            <h2>Estado de la oportunidad</h2>
          </div>

          <div className="current-status">
            <p>Estado actual</p>

            <span
              className={`status-badge ${lead.estado}`}
            >
              {lead.estado}
            </span>
          </div>

          <div className="pipeline">
            {estados.map((item) => (
              <div
                key={item}
                className={`pipeline-step ${
                  lead.estado === item ? "active" : ""
                }`}
              >
                <span className="pipeline-dot" />
                <span className="capitalize">{item}</span>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="estado">Cambiar estado</label>

            <select
              id="estado"
              value={estado}
              onChange={(e) =>
                setEstado(e.target.value as EstadoLead)
              }
            >
              {estados.map((item) => (
                <option key={item} value={item}>
                  {item.charAt(0).toUpperCase() +
                    item.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn-primary"
            onClick={cambiarEstado}
            disabled={
              actualizando || estado === lead.estado
            }
          >
            {actualizando
              ? "Actualizando..."
              : "Actualizar estado"}
          </button>
        </section>
      </div>

      <div className="detail-grid">
        <section className="content-card">
          <div className="section-heading">
            <Clock size={24} />
            <h2>Historial de interacciones</h2>
          </div>

          {interacciones.length === 0 ? (
            <div className="empty-state">
              <MessageCircle size={40} />
              <p>No hay interacciones registradas.</p>
            </div>
          ) : (
            <div className="interaction-list">
              {interacciones.map((item) => {
                const Icono = iconosInteraccion[item.tipo];

                return (
                  <article
                    className="interaction-item"
                    key={item.id}
                  >
                    <div className="interaction-icon">
                      <Icono size={21} />
                    </div>

                    <div className="interaction-content">
                      <h3>
                        {nombresInteraccion[item.tipo]}
                      </h3>

                      <small>
                        {new Date(
                          item.fecha
                        ).toLocaleString("es-NI")}
                      </small>

                      <p>{item.nota}</p>

                      <small>
                        Registrado por:{" "}
                        {item.registrado_por}
                      </small>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="content-card">
          <div className="section-heading">
            <Plus size={24} />
            <h2>Nueva interacción</h2>
          </div>

          <form onSubmit={registrarInteraccion}>
            <div className="form-group">
              <label htmlFor="tipo">
                Tipo de interacción
              </label>

              <select
                id="tipo"
                value={tipo}
                onChange={(e) =>
                  setTipo(
                    e.target.value as TipoInteraccion
                  )
                }
              >
                <option value="llamada">Llamada</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="correo">Correo</option>
                <option value="reunion">Reunión</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fecha">Fecha y hora</label>

              <input
                id="fecha"
                type="datetime-local"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="nota">Nota</label>

              <textarea
                id="nota"
                rows={4}
                placeholder="Describe la interacción..."
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={guardando}
            >
              <Plus size={18} />

              {guardando
                ? "Registrando..."
                : "Registrar interacción"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}