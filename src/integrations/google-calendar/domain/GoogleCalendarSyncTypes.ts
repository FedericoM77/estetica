export type BusinessMode = 'INDEPENDENT'

export type GoogleResourceState = 'sync' | 'exists' | 'not_exists'

export type SyncOrigin = 'GLOWDESK' | 'GOOGLE'

export interface GoogleCalendarWebhookHeaders {
  channelId: string
  resourceId: string
  resourceState: GoogleResourceState
  messageNumber: string
  channelToken?: string
  resourceUri?: string
  changed?: string
}

export interface CalendarSyncAccount {
  id: string
  professionalId: string
  businessMode: BusinessMode
  googleCalendarId: string
  accessToken: string
  refreshToken: string
  tokenExpiryDate: Date
  channelId: string
  webhookResourceId: string
  webhookChannelToken: string
  webhookExpiration?: Date
  syncToken?: string
}

export interface GoogleCalendarEvent {
  id: string
  status: 'confirmed' | 'cancelled'
  summary?: string
  description?: string
  startIso?: string
  endIso?: string
  updatedIso: string
  glowdeskAppointmentId?: string
  glowdeskOrigin?: SyncOrigin
}

export interface GoogleCalendarEventsPage {
  events: GoogleCalendarEvent[]
  nextSyncToken?: string
}

export interface AgendaBlock {
  id: string
  professionalId: string
  googleEventId: string
  startIso: string
  endIso: string
  title: string
  source: 'GOOGLE_CALENDAR'
}

export interface LocalAppointment {
  id: string
  professionalId: string
  googleEventId?: string
  startIso: string
  endIso: string
  syncOrigin: SyncOrigin
}

export interface CalendarSyncAccountRepository {
  findByChannel(params: {
    channelId: string
    resourceId: string
  }): Promise<CalendarSyncAccount | null>
  saveTokens(params: {
    accountId: string
    accessToken: string
    tokenExpiryDate: Date
  }): Promise<void>
  saveSyncToken(params: { accountId: string; syncToken: string }): Promise<void>
  clearSyncToken(accountId: string): Promise<void>
}

export interface AgendaRepository {
  findAppointmentByGoogleEventId(googleEventId: string): Promise<LocalAppointment | null>
  moveAppointment(params: {
    appointmentId: string
    startIso: string
    endIso: string
    syncOrigin: SyncOrigin
  }): Promise<void>
  cancelAppointmentByGoogleEventId(params: {
    googleEventId: string
    syncOrigin: SyncOrigin
  }): Promise<void>
  upsertExternalBlock(params: Omit<AgendaBlock, 'id'>): Promise<void>
  deleteExternalBlockByGoogleEventId(googleEventId: string): Promise<void>
  isSlotFree(params: {
    professionalId: string
    startIso: string
    endIso: string
    excludingGoogleEventId?: string
  }): Promise<boolean>
}

export interface GoogleCalendarGateway {
  refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string
    tokenExpiryDate: Date
  }>
  listChangedEvents(params: {
    calendarId: string
    accessToken: string
    syncToken?: string
  }): Promise<GoogleCalendarEventsPage>
}

export interface LoggerPort {
  info(message: string, context?: Record<string, unknown>): void
  warn(message: string, context?: Record<string, unknown>): void
  error(message: string, context?: Record<string, unknown>): void
}
