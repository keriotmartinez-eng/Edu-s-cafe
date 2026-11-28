import type {
  Lead,
  LeadInput,
  EstadoLead,
  FuenteLead,
  Interaccion,
  TipoInteraccion,
  Metricas,
  LoginResponse,
  Usuario,
} from "../types";

import {
  mockLeads,
  mockInteracciones,
  usuarios,
} from "../data/mockData";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const USE_MOCK =
  import.meta.env.VITE_USE_MOCK !== "false";

let leads: Lead[] = JSON.parse(
  localStorage.getItem("edus_leads") ||
    JSON.stringify(mockLeads)
);

let interacciones: Interaccion[] = JSON.parse(
  localStorage.getItem("edus_interacciones") ||
    JSON.stringify(mockInteracciones)
);

const esperar = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 300));

function guardarDatos() {
  localStorage.setItem("edus_leads", JSON.stringify(leads));

  localStorage.setItem(
    "edus_interacciones",
    JSON.stringify(interacciones)
  );
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("access_token");

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || JSON.stringify(error) ||
        "Error en la solicitud"
    );
  }

  return response.json() as Promise<T>;
}


export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  let respuesta: LoginResponse;

  if (USE_MOCK) {
    await esperar();

    const usuario = usuarios.find(
      (u) => u.username === username
    );

    if (!usuario || password !== "demo123") {
      throw new Error("Usuario o contraseña incorrectos");
    }

    respuesta = {
      access: `mock-access-${usuario.id}`,
      refresh: `mock-refresh-${usuario.id}`,
      usuario,
    };
  } else {
    respuesta = await request<LoginResponse>(
      "/auth/token/",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }
    );
  }

  localStorage.setItem("access_token", respuesta.access);
  localStorage.setItem("refresh_token", respuesta.refresh);

  localStorage.setItem(
    "usuario",
    JSON.stringify(respuesta.usuario)
  );

  return respuesta;
}


export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("usuario");
}


export function getUsuario(): Usuario | null {
  const usuario = localStorage.getItem("usuario");

  return usuario ? JSON.parse(usuario) : null;
}

export function isAuthenticated(): boolean {
  return Boolean(
    localStorage.getItem("access_token") && getUsuario()
  );
}

function verificarSesion() {
  if (!isAuthenticated()) {
    throw new Error("Debes iniciar sesión");
  }
}


export async function getLeads(
  estado = "",
  fuente = "",
  q = ""
): Promise<Lead[]> {
  verificarSesion();

  if (!USE_MOCK) {
    const params = new URLSearchParams({
      estado,
      fuente,
      q,
    });

    return request<Lead[]>(`/leads/?${params}`);
  }

  await esperar();

  return leads.filter((lead) => {
    const coincideEstado =
      !estado || lead.estado === estado;

    const coincideFuente =
      !fuente || lead.fuente === fuente;

    const busqueda = q.trim().toLowerCase();

    const coincideBusqueda =
      !busqueda ||
      lead.nombre.toLowerCase().includes(busqueda) ||
      lead.correo.toLowerCase().includes(busqueda) ||
      lead.interes.toLowerCase().includes(busqueda) ||
      lead.telefono.includes(busqueda);

    return (
      coincideEstado &&
      coincideFuente &&
      coincideBusqueda
    );
  });
}

export async function getLead(id: number): Promise<Lead> {
  verificarSesion();

  if (!USE_MOCK) {
    return request<Lead>(`/leads/${id}/`);
  }

  await esperar();

  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    throw new Error("Cliente potencial no encontrado");
  }

  return lead;
}


function validarLead(datos: LeadInput) {
  if (
    !datos.nombre.trim() ||
    !datos.correo.trim() ||
    !datos.telefono.trim() ||
    !datos.interes.trim() ||
    !datos.fuente
  ) {
    throw new Error("Completa los campos obligatorios");
  }

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!correoValido.test(datos.correo)) {
    throw new Error("Ingresa un correo electrónico válido");
  }
}


export async function createLead(
  datos: LeadInput
): Promise<Lead> {
  verificarSesion();
  validarLead(datos);

  if (!USE_MOCK) {
    return request<Lead>("/leads/", {
      method: "POST",
      body: JSON.stringify({
        ...datos,
        estado: "nuevo",
      }),
    });
  }

  await esperar();

  const fecha = new Date().toISOString();

  const nuevoLead: Lead = {
    ...datos,
    id: Math.max(0, ...leads.map((l) => l.id)) + 1,
    estado: "nuevo",
    creado_en: fecha,
    actualizado_en: fecha,
  };

  leads = [...leads, nuevoLead];

  guardarDatos();

  return nuevoLead;
}

export async function updateLead(
  id: number,
  datos: LeadInput
): Promise<Lead> {
  verificarSesion();
  validarLead(datos);

  if (!USE_MOCK) {
    return request<Lead>(`/leads/${id}/`, {
      method: "PUT",
      body: JSON.stringify(datos),
    });
  }

  const lead = await getLead(id);

  const actualizado: Lead = {
    ...lead,
    ...datos,
    id,
    estado: lead.estado,
    actualizado_en: new Date().toISOString(),
  };

  leads = leads.map((l) =>
    l.id === id ? actualizado : l
  );

  guardarDatos();

  return actualizado;
}


export async function updateEstado(
  id: number,
  estado: EstadoLead
): Promise<Lead> {
  verificarSesion();

  if (!USE_MOCK) {
    return request<Lead>(`/leads/${id}/estado/`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    });
  }

  const lead = await getLead(id);

  const actualizado: Lead = {
    ...lead,
    estado,
    actualizado_en: new Date().toISOString(),
  };

  leads = leads.map((l) =>
    l.id === id ? actualizado : l
  );

  guardarDatos();

  return actualizado;
}


export async function getInteracciones(
  leadId: number
): Promise<Interaccion[]> {
  verificarSesion();

  if (!USE_MOCK) {
    return request<Interaccion[]>(
      `/leads/${leadId}/interacciones/`
    );
  }

  await getLead(leadId);

  return interacciones
    .filter((i) => i.lead === leadId)
    .sort(
      (a, b) =>
        new Date(b.fecha).getTime() -
        new Date(a.fecha).getTime()
    );
}


export async function createInteraccion(
  leadId: number,
  tipo: TipoInteraccion,
  nota: string,
  fecha = new Date().toISOString()
): Promise<Interaccion> {
  verificarSesion();

  if (!nota.trim()) {
    throw new Error("Debes escribir una nota");
  }

  if (!USE_MOCK) {
    return request<Interaccion>(
      `/leads/${leadId}/interacciones/`,
      {
        method: "POST",
        body: JSON.stringify({ tipo, nota, fecha }),
      }
    );
  }

  await getLead(leadId);

  const nueva: Interaccion = {
    id: Math.max(
      0,
      ...interacciones.map((i) => i.id)
    ) + 1,
    lead: leadId,
    tipo,
    nota,
    fecha,
    registrado_por: getUsuario()?.username || "",
  };

  interacciones = [...interacciones, nueva];

  guardarDatos();

  return nueva;
}

export async function getMetricas(): Promise<Metricas> {
  verificarSesion();

  if (!USE_MOCK) {
    return request<Metricas>("/metricas/");
  }

  await esperar();

  const leads_por_estado: Record<EstadoLead, number> = {
    nuevo: 0,
    contactado: 0,
    cotizado: 0,
    ganado: 0,
    perdido: 0,
  };

  const leads_por_fuente: Record<FuenteLead, number> = {
    instagram: 0,
    facebook: 0,
    whatsapp: 0,
    sitio_web: 0,
    referido: 0,
    otro: 0,
  };

  leads.forEach((lead) => {
    leads_por_estado[lead.estado]++;
    leads_por_fuente[lead.fuente]++;
  });

  const tasa_conversion =
    leads.length > 0
      ? Number(
          (
            (leads_por_estado.ganado / leads.length) *
            100
          ).toFixed(2)
        )
      : 0;

  return {
    total_leads: leads.length,
    leads_por_estado,
    leads_por_fuente,
    tasa_conversion,
  };
}

export async function getHealth() {
  if (USE_MOCK) {
    return { status: "ok" };
  }

  return request<{ status: string }>("/health/");
}