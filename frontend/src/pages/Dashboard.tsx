import { useEffect, useState } from "react";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getMetricas } from "../services/api";
import type { Metricas } from "../types";

const colores = [
  "#8B6355",
  "#E5B4B4",
  "#A6B39E",
  "#D7B98E",
  "#C98D8D",
  "#B6A3C7",
];

export default function Dashboard() {
  const [metricas, setMetricas] =
    useState<Metricas | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarMetricas() {
      try {
        const datos = await getMetricas();

        if (activo) setMetricas(datos);
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las métricas"
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarMetricas();

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return (
      <div className="loading">
        Cargando estadísticas...
      </div>
    );
  }

  if (!metricas) {
    return (
      <div className="page-container">
        <div className="error-message">
          {error || "No hay métricas disponibles"}
        </div>
      </div>
    );
  }

  const datosEstado = Object.entries(
    metricas.leads_por_estado
  ).map(([nombre, cantidad]) => ({
    nombre:
      nombre.charAt(0).toUpperCase() + nombre.slice(1),
    cantidad,
  }));

  const datosFuente = Object.entries(
    metricas.leads_por_fuente
  ).map(([nombre, cantidad]) => ({
    nombre:
      nombre === "whatsapp"
        ? "WhatsApp"
        : nombre.charAt(0).toUpperCase() +
          nombre.slice(1).replace("_", " "),
    cantidad,
  }));

  const tarjetas = [
    {
      titulo: "Total de clientes",
      valor: metricas.total_leads,
      icono: Users,
      clase: "metric-brown",
    },
    {
      titulo: "Clientes nuevos",
      valor: metricas.leads_por_estado.nuevo,
      icono: Clock,
      clase: "metric-pink",
    },
    {
      titulo: "Ventas ganadas",
      valor: metricas.leads_por_estado.ganado,
      icono: CheckCircle2,
      clase: "metric-green",
    },
    {
      titulo: "Tasa de conversión",
      valor: `${metricas.tasa_conversion}%`,
      icono: TrendingUp,
      clase: "metric-gold",
    },
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Panel de métricas</h1>
          <p>
            Conoce el rendimiento comercial de Edu’s Café.
          </p>
        </div>
      </header>

      <div className="metrics-grid">
        {tarjetas.map((tarjeta) => {
          const Icono = tarjeta.icono;

          return (
            <article
              key={tarjeta.titulo}
              className={`metric-card ${tarjeta.clase}`}
            >
              <div className="metric-icon">
                <Icono size={25} />
              </div>

              <div className="metric-content">
                <p>{tarjeta.titulo}</p>
                <h2>{tarjeta.valor}</h2>
              </div>
            </article>
          );
        })}
      </div>

      <div className="charts-grid">
        <section className="content-card chart-card">
          <h2>Clientes por estado</h2>

          <p>
            Distribución de las oportunidades de venta.
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={datosEstado}
              margin={{
                top: 20,
                right: 10,
                left: -20,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="nombre"
                tick={{ fontSize: 11 }}
                interval={0}
              />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="cantidad"
                name="Clientes"
                radius={[7, 7, 0, 0]}
              >
                {datosEstado.map((item, index) => (
                  <Cell
                    key={item.nombre}
                    fill={colores[index % colores.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="content-card chart-card">
          <h2>Clientes por fuente</h2>

          <p>
            Canales por los que llegan nuestros clientes.
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datosFuente}
                dataKey="cantidad"
                nameKey="nombre"
                cx="50%"
                cy="45%"
                innerRadius={45}
                outerRadius={85}
                paddingAngle={3}
              >
                {datosFuente.map((item, index) => (
                  <Cell
                    key={item.nombre}
                    fill={colores[index % colores.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="content-card">
        <div className="section-heading">
          <TrendingUp size={24} />
          <h2>Resumen de oportunidades</h2>
        </div>

        <div className="progress-list">
          {datosEstado.map((item, index) => {
            const porcentaje =
              metricas.total_leads > 0
                ? (item.cantidad /
                    metricas.total_leads) *
                  100
                : 0;

            return (
              <div
                className="progress-item"
                key={item.nombre}
              >
                <div className="progress-label">
                  <span>{item.nombre}</span>

                  <strong>
                    {item.cantidad} clientes ·{" "}
                    {porcentaje.toFixed(1)}%
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${porcentaje}%`,
                      backgroundColor:
                        colores[index % colores.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="form-note">
          La tasa de conversión representa el porcentaje
          de clientes ganados respecto al total de clientes
          registrados.
        </p>
      </section>
    </div>
  );
}