import type { AuthenticatedPrincipal } from '../../use-cases/auth/AuthTypes'

export interface HttpRequest<TBody = unknown> {
  headers: Record<string, string | string[] | undefined>
  body?: TBody
  query: Record<string, unknown>
  params: Record<string, string | undefined>
  auth?: AuthenticatedPrincipal
}

export interface HttpResponse<TBody = unknown> {
  status: number
  body: TBody
}

export type NextFunction = () => Promise<void> | void

export type HttpMiddleware = (
  request: HttpRequest,
  next: NextFunction,
) => Promise<HttpResponse | void>

export function readHeader(
  headers: HttpRequest['headers'],
  name: string,
): string | undefined {
  const lowerName = name.toLowerCase()
  const key = Object.keys(headers).find((candidate) => candidate.toLowerCase() === lowerName)
  const value = key ? headers[key] : undefined
  return Array.isArray(value) ? value[0] : value
}

export function json<TBody>(status: number, body: TBody): HttpResponse<TBody> {
  return { status, body }
}
