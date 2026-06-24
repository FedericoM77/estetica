import type {
  AgendaRepository,
  CalendarSyncAccount,
  CalendarSyncAccountRepository,
  GoogleCalendarEvent,
  GoogleCalendarGateway,
  GoogleCalendarWebhookHeaders,
  LoggerPort,
} from '../domain/GoogleCalendarSyncTypes'

export interface HandleGoogleCalendarWebhookInput {
  headers: GoogleCalendarWebhookHeaders
}

export interface HandleGoogleCalendarWebhookResult {
  accepted: boolean
  ignored: boolean
  reason?: string
  processedEvents: number
}

const TOKEN_EXPIRY_SKEW_MS = 60_000

function hasExpired(account: CalendarSyncAccount, now: Date): boolean {
  return account.tokenExpiryDate.getTime() - now.getTime() <= TOKEN_EXPIRY_SKEW_MS
}

function isExternalBusyEvent(event: GoogleCalendarEvent): boolean {
  return Boolean(event.startIso && event.endIso && event.status !== 'cancelled')
}

export class HandleGoogleCalendarWebhookUseCase {
  private readonly accounts: CalendarSyncAccountRepository
  private readonly agenda: AgendaRepository
  private readonly googleCalendar: GoogleCalendarGateway
  private readonly logger: LoggerPort
  private readonly now: () => Date

  constructor(
    accounts: CalendarSyncAccountRepository,
    agenda: AgendaRepository,
    googleCalendar: GoogleCalendarGateway,
    logger: LoggerPort,
    now: () => Date = () => new Date(),
  ) {
    this.accounts = accounts
    this.agenda = agenda
    this.googleCalendar = googleCalendar
    this.logger = logger
    this.now = now
  }

  async execute(
    input: HandleGoogleCalendarWebhookInput,
  ): Promise<HandleGoogleCalendarWebhookResult> {
    const { headers } = input
    const account = await this.accounts.findByChannel({
      channelId: headers.channelId,
      resourceId: headers.resourceId,
    })

    if (!account) {
      this.logger.warn('google_calendar_webhook_unknown_channel', {
        channelId: headers.channelId,
        resourceId: headers.resourceId,
      })
      return { accepted: false, ignored: true, reason: 'UNKNOWN_CHANNEL', processedEvents: 0 }
    }

    if (headers.channelToken !== account.webhookChannelToken) {
      this.logger.warn('google_calendar_webhook_invalid_token', { accountId: account.id })
      return { accepted: false, ignored: true, reason: 'INVALID_CHANNEL_TOKEN', processedEvents: 0 }
    }

    if (headers.resourceState === 'sync') {
      this.logger.info('google_calendar_webhook_sync_message', { accountId: account.id })
      return { accepted: true, ignored: true, reason: 'SYNC_MESSAGE', processedEvents: 0 }
    }

    if (headers.resourceState === 'not_exists') {
      await this.accounts.clearSyncToken(account.id)
      this.logger.warn('google_calendar_webhook_resource_not_exists', { accountId: account.id })
      return { accepted: true, ignored: true, reason: 'RESOURCE_NOT_EXISTS', processedEvents: 0 }
    }

    const accessToken = await this.resolveAccessToken(account)
    const changes = await this.googleCalendar.listChangedEvents({
      calendarId: account.googleCalendarId,
      accessToken,
      syncToken: account.syncToken,
    })

    let processedEvents = 0
    for (const event of changes.events) {
      const didProcess = await this.syncEvent(account, event)
      if (didProcess) processedEvents += 1
    }

    if (changes.nextSyncToken) {
      await this.accounts.saveSyncToken({
        accountId: account.id,
        syncToken: changes.nextSyncToken,
      })
    }

    return { accepted: true, ignored: false, processedEvents }
  }

  private async resolveAccessToken(account: CalendarSyncAccount): Promise<string> {
    if (!hasExpired(account, this.now())) return account.accessToken

    const refreshed = await this.googleCalendar.refreshAccessToken(account.refreshToken)
    await this.accounts.saveTokens({
      accountId: account.id,
      accessToken: refreshed.accessToken,
      tokenExpiryDate: refreshed.tokenExpiryDate,
    })

    return refreshed.accessToken
  }

  private async syncEvent(
    account: CalendarSyncAccount,
    event: GoogleCalendarEvent,
  ): Promise<boolean> {
    if (event.glowdeskOrigin === 'GLOWDESK') {
      this.logger.info('google_calendar_webhook_skip_glowdesk_origin', {
        accountId: account.id,
        googleEventId: event.id,
      })
      return false
    }

    const appointment = await this.agenda.findAppointmentByGoogleEventId(event.id)

    if (event.status === 'cancelled') {
      if (appointment) {
        await this.agenda.cancelAppointmentByGoogleEventId({
          googleEventId: event.id,
          syncOrigin: 'GOOGLE',
        })
      } else {
        await this.agenda.deleteExternalBlockByGoogleEventId(event.id)
      }
      return true
    }

    if (!isExternalBusyEvent(event)) {
      this.logger.warn('google_calendar_webhook_event_without_time', {
        accountId: account.id,
        googleEventId: event.id,
      })
      return false
    }

    const startIso = event.startIso as string
    const endIso = event.endIso as string

    if (appointment) {
      await this.agenda.moveAppointment({
        appointmentId: appointment.id,
        startIso,
        endIso,
        syncOrigin: 'GOOGLE',
      })
      return true
    }

    const slotFree = await this.agenda.isSlotFree({
      professionalId: account.professionalId,
      startIso,
      endIso,
      excludingGoogleEventId: event.id,
    })

    if (!slotFree) {
      this.logger.warn('google_calendar_webhook_external_event_conflict', {
        accountId: account.id,
        googleEventId: event.id,
      })
      return false
    }

    await this.agenda.upsertExternalBlock({
      professionalId: account.professionalId,
      googleEventId: event.id,
      startIso,
      endIso,
      title: event.summary || 'Bloqueo Google Calendar',
      source: 'GOOGLE_CALENDAR',
    })

    return true
  }
}
