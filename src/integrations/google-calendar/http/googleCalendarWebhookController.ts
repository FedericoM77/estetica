import type { HandleGoogleCalendarWebhookUseCase } from '../application/HandleGoogleCalendarWebhookUseCase'
import type {
  GoogleCalendarWebhookHeaders,
  GoogleResourceState,
} from '../domain/GoogleCalendarSyncTypes'

export interface HttpWebhookRequest {
  headers: Record<string, string | string[] | undefined>
}

export interface HttpWebhookResponse {
  status: number
  body: { ok: boolean; reason?: string }
}

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function header(headers: HttpWebhookRequest['headers'], name: string): string | undefined {
  const lowerName = name.toLowerCase()
  const foundKey = Object.keys(headers).find((key) => key.toLowerCase() === lowerName)
  return foundKey ? firstHeader(headers[foundKey]) : undefined
}

function parseResourceState(value: string | undefined): GoogleResourceState | null {
  if (value === 'sync' || value === 'exists' || value === 'not_exists') return value
  return null
}

export function parseGoogleWebhookHeaders(
  request: HttpWebhookRequest,
): GoogleCalendarWebhookHeaders | null {
  const channelId = header(request.headers, 'x-goog-channel-id')
  const resourceId = header(request.headers, 'x-goog-resource-id')
  const messageNumber = header(request.headers, 'x-goog-message-number')
  const resourceState = parseResourceState(header(request.headers, 'x-goog-resource-state'))

  if (!channelId || !resourceId || !messageNumber || !resourceState) return null

  return {
    channelId,
    resourceId,
    messageNumber,
    resourceState,
    channelToken: header(request.headers, 'x-goog-channel-token'),
    resourceUri: header(request.headers, 'x-goog-resource-uri'),
    changed: header(request.headers, 'x-goog-changed'),
  }
}

export async function handleGoogleCalendarWebhookHttp(
  request: HttpWebhookRequest,
  useCase: HandleGoogleCalendarWebhookUseCase,
): Promise<HttpWebhookResponse> {
  const headers = parseGoogleWebhookHeaders(request)
  if (!headers) return { status: 400, body: { ok: false, reason: 'INVALID_GOOGLE_HEADERS' } }

  const result = await useCase.execute({ headers })
  if (!result.accepted) return { status: 403, body: { ok: false, reason: result.reason } }

  return { status: 204, body: { ok: true } }
}
