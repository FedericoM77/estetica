# Pepito multitenant auth y administracion dual

Arquitectura preparada para `pepito.com.ar/:tenant_slug`, login unificado y administracion dual:

- `SUPER_ADMIN`: dueno de Pepito, acceso global.
- `TENANT_ADMIN`: dueno de clinica/profesional, aislado a su `tenant_id`.
- `STAFF`: operador del tenant, aislado a su `tenant_id`.

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

## JWT claims

```json
{
  "sub": "user-id",
  "email": "admin@pepito.com.ar",
  "role": "TENANT_ADMIN",
  "tenant_id": "tenant-id"
}
```

`SUPER_ADMIN` puede no tener `tenant_id`. `TENANT_ADMIN` y `STAFF` deben tenerlo obligatoriamente.

## Endpoints

### `POST /api/v1/auth/login`

Body:

```json
{
  "email": "admin@pepito.com.ar",
  "password": "password-seguro"
}
```

Respuesta `200`:

```json
{
  "access_token": "jwt",
  "token_type": "Bearer",
  "redirect_to": "/admin/dashboard",
  "user": {
    "id": "user-id",
    "email": "admin@pepito.com.ar",
    "role": "TENANT_ADMIN",
    "tenantId": "tenant-id"
  }
}
```

Redirects:

- `SUPER_ADMIN` -> `/admin/super-dashboard`
- `TENANT_ADMIN` / `STAFF` -> `/admin/dashboard`

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
- `TENANT_ADMIN` / `STAFF`: toma `tenant_id` del JWT y pisa `request.query.tenantId`.
- Si falta token, rol o tenant: responde `401` / `403`.

Esto evita confiar en `tenantId` recibido por query/body/path desde el cliente.

## Rutas publicas por tenant slug

Para `pepito.com.ar/:tenant_slug`, resolver el tenant con un `TenantBySlugRepository` antes de mostrar catalogo/reserva publica. Esa ruta no debe aceptar `tenantId` arbitrario desde el cliente: el `tenant_id` se deriva exclusivamente del `tenant_slug` validado.

## OWASP / seguridad

- Password hashing por puerto `PasswordHasher`: usar Argon2id o bcrypt con costo alto.
- JWT por puerto `JwtSigner` / `JwtVerifier`: usar claves fuertes, expiracion corta y rotacion.
- No devolver detalles de login fallido: siempre `INVALID_CREDENTIALS`.
- Para roles tenant, nunca confiar en `tenantId` de la request; usar siempre el claim del JWT.
- Auditar acciones sensibles por `user.id`, `role` y `tenantId`.
