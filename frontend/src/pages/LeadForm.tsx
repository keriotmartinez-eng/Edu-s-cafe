import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import {
  createLead,
  updateLead,
  getLead,
  getUsuario,
} from "../services/api";
import type { LeadInput, FuenteLead } from "../types";

export default function LeadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editando = Boolean(id);

  const [datos, setDatos] = useState<LeadInput>({
    nombre: "",
    correo: "",
    telefono: "",
    interes: "",
    mensaje: "",
    fuente: "instagram",
    estado: "nuevo",
    asignado_a: getUsuario()?.username || null,
  });

  const [cargando, setCargando] = useState(editando);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [errorCarga, setErrorCarga] = useState(false);

  useEffect(() => {
    if (!id) return;

    let activo = true;

    async function cargarCliente() {
      setCargando(true);
      setErrorCarga(false);
      setError("");

      try {
        const lead = await getLead(Number(id));

        if (!activo) return;

        setDatos({
          nombre: lead.nombre,
          correo: lead.correo,
          telefono: lead.telefono,
          interes: lead.interes,
          mensaje: lead.mensaje,
          fuente: lead.fuente,
          estado: lead.estado,
          asignado_a: lead.asignado_a,
        });
      } catch (err) {
        if (activo) {
          setErrorCarga(true);
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el cliente"
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarCliente();

    return () => {
      activo = false;
    };
  }, [id]);

  function cambiarCampo<K extends keyof LeadInput>(
    campo: K,
    valor: LeadInput[K]
  ) {
    setDatos((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      const datosLimpios = {
        ...datos,
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim(),
        telefono: datos.telefono.trim(),
        interes: datos.interes.trim(),
        mensaje: datos.mensaje.trim(),
      };

      const lead = editando
        ? await updateLead(Number(id), datosLimpios)
        : await createLead(datosLimpios);

      navigate(`/leads/${lead.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el cliente"
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="loading">
        Cargando información...
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
        <Link to="/leads" className="btn-secondary">
          Volver al listado
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
          <h1>
            {editando
              ? "Editar cliente"
              : "Registrar cliente"}
          </h1>

          <p>
            {editando
              ? "Actualiza la información del cliente potencial."
              : "Registra una nueva oportunidad de venta."}
          </p>
        </div>
      </header>

      <section className="content-card form-card">
        <div className="section-heading">
          <UserPlus size={24} />
          <h2>Información del cliente</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre">
                Nombre completo *
              </label>

              <input
                id="nombre"
                type="text"
                placeholder="Ej. Ana López"
                value={datos.nombre}
                onChange={(e) =>
                  cambiarCampo("nombre", e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="correo">
                Correo electrónico *
              </label>

              <input
                id="correo"
                type="email"
                placeholder="cliente@correo.com"
                value={datos.correo}
                onChange={(e) =>
                  cambiarCampo("correo", e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>

              <input
                id="telefono"
                type="tel"
                placeholder="8888-8888"
                value={datos.telefono}
                onChange={(e) =>
                  cambiarCampo("telefono", e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="interes">
                Producto de interés *
              </label>

              <input
                id="interes"
                type="text"
                placeholder="Ej. Pastel de cumpleaños"
                value={datos.interes}
                onChange={(e) =>
                  cambiarCampo("interes", e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fuente">
                Fuente de contacto *
              </label>

              <select
                id="fuente"
                value={datos.fuente}
                onChange={(e) =>
                  cambiarCampo(
                    "fuente",
                    e.target.value as FuenteLead
                  )
                }
                required
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sitio_web">Sitio web</option>
                <option value="referido">Referido</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="asignado">
                Responsable
              </label>

              <input
                id="asignado"
                type="text"
                value={datos.asignado_a || "Sin asignar"}
                readOnly
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="mensaje">
                Mensaje u observaciones
              </label>

              <textarea
                id="mensaje"
                rows={5}
                placeholder="Escribe los detalles de la solicitud..."
                value={datos.mensaje}
                onChange={(e) =>
                  cambiarCampo("mensaje", e.target.value)
                }
              />
            </div>
          </div>

          <p className="form-note">
            Los campos marcados con * son obligatorios.
          </p>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="form-actions">
            <Link to="/leads" className="btn-secondary">
              Cancelar
            </Link>

            <button
              type="submit"
              className="btn-primary"
              disabled={guardando}
            >
              <Save size={18} />

              {guardando
                ? "Guardando..."
                : editando
                  ? "Guardar cambios"
                  : "Registrar cliente"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}