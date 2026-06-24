export type PlatformRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF'

export type TenantBusinessType = 'CLINIC' | 'INDEPENDENT'

export interface AuthenticatedPrincipal {
  id: string
  email: string
  role: PlatformRole
  tenantId?: string
}

export interface JwtClaims {
  sub: string
  email: string
  role: PlatformRole
  tenant_id?: string
}

export interface UserAccount {
  id: string
  email: string
  role: PlatformRole
  tenantId?: string
  passwordHash: string
  active: boolean
}

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResult {
  access_token: string
  token_type: 'Bearer'
  redirect_to: '/admin/super-dashboard' | '/admin/dashboard'
  user: AuthenticatedPrincipal
}

export interface AuthUserRepository {
  findByEmail(email: string): Promise<UserAccount | null>
}

export interface PasswordHasher {
  verify(plainTextPassword: string, passwordHash: string): Promise<boolean>
}

export interface JwtSigner {
  sign(payload: JwtClaims): Promise<string>
}

export interface JwtVerifier {
  verify(token: string): Promise<JwtClaims>
}

export class ApplicationError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(statusCode: number, code: string, message: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}
