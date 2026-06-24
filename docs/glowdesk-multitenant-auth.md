# GlowDesk multitenant auth y administracion dual

Arquitectura preparada para `glowdesk.com.ar/:tenant_slug`, login unificado y administracion dual.

- `SUPER_ADMIN`: dueno de GlowDesk, acceso global.
- `TENANT_ADMIN`: dueno de clinica/profesional, aislado a su `tenantId`.
- `STAFF`: operador del tenant, aislado a su `tenantId`.

## Estructura sugerida

```text
src/use-cases/
  auth/
    AuthTypes.ts
    LoginUseCase.ts
  superadmin/
    GetSuperAdminDashboardUseCase.ts

src/infrastructure/
  http/
    HttpTypes.ts
    controllers/
      AuthController.ts
      SuperAdminDashboardController.ts
    middlewares/
      tenantGuard.ts
```

## Payload canonico del token

```ts
export interface GlowDeskTokenPayload {
  userId: string
  email: string
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF'
  tenantId?: string
  tenantSlug?: string
}
```

Ejemplo tenant:

```json
{
  "userId": "user-id",
  "email": "admin@clinica-aura.com",
  "role": "TENANT_ADMIN",
  "tenantId": "tenant-id",
  "tenantSlug": "clinica-aura"
}
```

`SUPER_ADMIN` puede no tener `tenantId`. `TENANT_ADMIN` y `STAFF` deben tenerlo obligatoriamente.

## Endpoints

### `POST /api/v1/auth/login`

Body:

```json
{
  "email": "admin@glowdesk.com.ar",
  "password": "password-seguro"
}
```

Respuesta `200`:

```json
{
  "access_token": "jwt",
  "token_type": "Bearer",
  "redirect_to": "/clinica-aura/admin/dashboard",
  "user": {
    "id": "user-id",
    "email": "admin@clinica-aura.com",
    "role": "TENANT_ADMIN",
    "tenantId": "tenant-id",
    "tenantSlug": "clinica-aura"
  }
}
```

Redirects:

- `SUPER_ADMIN` -> `/admin/super-dashboard`
- `TENANT_ADMIN` / `STAFF` -> `/:tenantSlug/admin/dashboard`

### `GET /api/v1/superadmin/dashboard`

Requiere `SUPER_ADMIN`.

Respuesta `200`:

```json
{
  "total_tenants": 120,
  "tenants_by_type": {
    "CLINIC": 80,
    "INDEPENDENT": 40
  },
  "financials": {
    "gross_revenue_ars": 123456789,
    "currency": "ARS"
  }
}
```

## Tenant Guard

`createTenantGuard(jwtVerifier)`:

- Valida `Authorization: Bearer <jwt>`.
- `SUPER_ADMIN`: permite acceso global.
- `TENANT_ADMIN` / `STAFF`: toma `tenantId` del JWT y pisa `request.query.tenantId`.
- Si falta token, rol o tenant: responde `401` / `403`.

Esto evita confiar en `tenantId` recibido por query/body/path desde el cliente.

## Rutas publicas por tenant slug

Para `glowdesk.com.ar/:tenant_slug`, resolver el tenant con un `TenantBySlugRepository` antes de mostrar catalogo/reserva publica. Esa ruta no debe aceptar `tenantId` arbitrario desde el cliente: el `tenantId` se deriva exclusivamente del `tenantSlug` validado.

## OWASP / seguridad

- Password hashing por puerto `PasswordHasher`: usar Argon2id o bcrypt con costo alto.
- JWT por puerto `JwtSigner` / `JwtVerifier`: usar claves fuertes, expiracion corta y rotacion.
- No devolver detalles de login fallido: siempre `INVALID_CREDENTIALS`.
- Para roles tenant, nunca confiar en `tenantId` de la request; usar siempre el claim del JWT.
- Auditar acciones sensibles por `userId`, `role`, `tenantId` y `tenantSlug`.
