import { mockApi } from './mockApi'
import { supabaseApi } from './supabaseApi'
import type { DataApi } from './types'

const hayCredenciales = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

/**
 * Modo demo: sin credenciales de Supabase (o forzado con VITE_USE_MOCKS=true)
 * la app usa datos mockeados en localStorage. Cada navegador ve su propia
 * "base" — no hay agenda compartida.
 */
export const usingMocks = import.meta.env.VITE_USE_MOCKS === 'true' || !hayCredenciales

export const api: DataApi = usingMocks ? mockApi : supabaseApi

export { SlotOcupadoError } from './types'
export type { CrearTurnoInput, CrearTurnoResult, FiltrosTurnos, TurnoOcupado } from './types'
