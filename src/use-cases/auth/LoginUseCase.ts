import type {
  AuthenticatedPrincipal,
  AuthUserRepository,
  JwtClaims,
  JwtSigner,
  LoginInput,
  LoginResult,
  PasswordHasher,
  UserAccount,
} from './AuthTypes'
import { ApplicationError } from './AuthTypes'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function assertValidInput(input: LoginInput): void {
  if (!EMAIL_PATTERN.test(input.email.trim())) {
    throw new ApplicationError(401, 'INVALID_CREDENTIALS', 'Email o contrasena invalidos.')
  }

  if (input.password.length < 8 || input.password.length > 128) {
    throw new ApplicationError(401, 'INVALID_CREDENTIALS', 'Email o contrasena invalidos.')
  }
}

function assertTenantConsistency(user: UserAccount): void {
  if ((user.role === 'TENANT_ADMIN' || user.role === 'STAFF') && !user.tenantId) {
    throw new ApplicationError(403, 'TENANT_REQUIRED', 'El usuario no tiene tenant asignado.')
  }
}

function toPrincipal(user: UserAccount): AuthenticatedPrincipal {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenantSlug: user.tenantSlug,
  }
}

function toJwtClaims(user: UserAccount): JwtClaims {
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenantSlug: user.tenantSlug,
  }
}

export class LoginUseCase {
  private readonly users: AuthUserRepository
  private readonly passwordHasher: PasswordHasher
  private readonly jwtSigner: JwtSigner

  constructor(
    users: AuthUserRepository,
    passwordHasher: PasswordHasher,
    jwtSigner: JwtSigner,
  ) {
    this.users = users
    this.passwordHasher = passwordHasher
    this.jwtSigner = jwtSigner
  }

  async execute(input: LoginInput): Promise<LoginResult> {
    assertValidInput(input)

    const email = normalizeEmail(input.email)
    const user = await this.users.findByEmail(email)

    if (!user || !user.active) {
      throw new ApplicationError(401, 'INVALID_CREDENTIALS', 'Email o contrasena invalidos.')
    }

    const validPassword = await this.passwordHasher.verify(input.password, user.passwordHash)
    if (!validPassword) {
      throw new ApplicationError(401, 'INVALID_CREDENTIALS', 'Email o contrasena invalidos.')
    }

    assertTenantConsistency(user)

    const token = await this.jwtSigner.sign(toJwtClaims(user))

    return {
      access_token: token,
      token_type: 'Bearer',
      redirect_to:
        user.role === 'SUPER_ADMIN'
          ? '/admin/super-dashboard'
          : `/${user.tenantSlug ?? 'admin'}/admin/dashboard`,
      user: toPrincipal(user),
    }
  }
}
