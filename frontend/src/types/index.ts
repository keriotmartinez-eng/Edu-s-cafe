export type EstadoLead =
  | "nuevo"
  | "contactado"
  | "cotizado"
  | "ganado"
  | "perdido";

export type FuenteLead =
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "sitio_web"
  | "referido"
  | "otro";

export type Rol = "vendedor" | "administrador";

export type TipoInteraccion =
  | "llamada"
  | "whatsapp"
  | "correo"
  | "reunion";

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: Rol;
}

export interface Lead {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  interes: string;
  mensaje: string;
  fuente: FuenteLead;
  estado: EstadoLead;
  asignado_a: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface Interaccion {
  id: number;
  lead: number;
  tipo: TipoInteraccion;
  nota: string;
  fecha: string;
  registrado_por: string;
}

export interface Metricas {
  total_leads: number;
  leads_por_estado: Record<EstadoLead, number>;
  leads_por_fuente: Record<FuenteLead, number>;
  tasa_conversion: number;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  usuario: Usuario;
}

export type LeadInput = Omit<
  Lead,
  "id" | "creado_en" | "actualizado_en"
>;