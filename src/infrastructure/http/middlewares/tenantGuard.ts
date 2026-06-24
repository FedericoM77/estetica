import type { JwtVerifier } from '../../../use-cases/auth/AuthTypes'
import type { HttpMiddleware, HttpRequest, HttpResponse } from '../HttpTypes'
import { json, readHeader } from '../HttpTypes'

function extractBearerToken(request: HttpRequest): string | null {
  const authorization = readHeader(request.headers, 'authorization')
  if (!authorization) return null

  const [scheme, token] = authorization.split(' ')
  if (scheme !== 'Bearer' || !token) return null

  return token
}

export function createTenantGuard(jwtVerifier: JwtVerifier): HttpMiddleware {
  return async (request, next): Promise<HttpResponse | void> => {
    try {
      const token = extractBearerToken(request)
      if (!token) return json(401, { error: 'UNAUTHORIZED' })

      const claims = await jwtVerifier.verify(token)

      if (claims.role === 'SUPER_ADMIN') {
        request.auth = {
          id: claims.sub,
          email: claims.email,
          role: claims.role,
        }
        return next()
      }

      if (claims.role !== 'TENANT_ADMIN' && claims.role !== 'STAFF') {
        return json(403, { error: 'FORBIDDEN_ROLE' })
      }

      if (!claims.tenant_id) {
        return json(403, { error: 'TENANT_REQUIRED' })
      }

      request.auth = {
        id: claims.sub,
        email: claims.email,
        role: claims.role,
        tenantId: claims.tenant_id,
      }

      request.query = {
        ...request.query,
        tenantId: claims.tenant_id,
      }

      return next()
    } catch {
      return json(401, { error: 'INVALID_TOKEN' })
    }
  }
}
