import { usingMocks } from '../api'
import { mockAuth } from './mockAuth'
import { supabaseAuth } from './supabaseAuth'
import type { AuthApi } from './types'

/** Misma decisión que la capa de datos: demo (mock) vs Supabase real. */
export const auth: AuthApi = usingMocks ? mockAuth : supabaseAuth

export { AuthError } from './types'
export type { CredencialesLogin, DatosRegistro } from './types'
