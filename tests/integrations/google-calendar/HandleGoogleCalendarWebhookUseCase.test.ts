import { HandleGoogleCalendarWebhookUseCase } from '../../../src/integrations/google-calendar/application/HandleGoogleCalendarWebhookUseCase'
import type {
  AgendaRepository,
  CalendarSyncAccount,
  CalendarSyncAccountRepository,
  GoogleCalendarGateway,
  LoggerPort,
} from '../../../src/integrations/google-calendar/domain/GoogleCalendarSyncTypes'

describe('HandleGoogleCalendarWebhookUseCase', () => {
  it('registra un bloqueo cuando el profesional bloquea un horario libre en Google Calendar', async () => {
    const account: CalendarSyncAccount = {
      id: 'sync-1',
      professionalId: 'prof-1',
      businessMode: 'INDEPENDENT',
      googleCalendarId: 'primary',
      accessToken: 'valid-access-token',
      refreshToken: 'refresh-token',
      tokenExpiryDate: new Date('2026-06-22T12:00:00.000Z'),
      channelId: 'channel-1',
      webhookResourceId: 'resource-1',
      webhookChannelToken: 'signed-channel-token',
      syncToken: 'sync-token-1',
    }

    const accounts: CalendarSyncAccountRepository = {
      findByChannel: jest.fn().mockResolvedValue(account),
      saveTokens: jest.fn(),
      saveSyncToken: jest.fn(),
      clearSyncToken: jest.fn(),
    }

    const agenda: AgendaRepository = {
      findAppointmentByGoogleEventId: jest.fn().mockResolvedValue(null),
      moveAppointment: jest.fn(),
      cancelAppointmentByGoogleEventId: jest.fn(),
      upsertExternalBlock: jest.fn(),
      deleteExternalBlockByGoogleEventId: jest.fn(),
      isSlotFree: jest.fn().mockResolvedValue(true),
    }

    const googleCalendar: GoogleCalendarGateway = {
      refreshAccessToken: jest.fn(),
      listChangedEvents: jest.fn().mockResolvedValue({
        nextSyncToken: 'sync-token-2',
        events: [
          {
            id: 'google-event-1',
            status: 'confirmed',
            summary: 'Bloqueo personal',
            startIso: '2026-06-23T10:00:00.000-03:00',
            endIso: '2026-06-23T11:00:00.000-03:00',
            updatedIso: '2026-06-22T15:00:00.000Z',
          },
        ],
      }),
    }

    const logger: LoggerPort = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    const useCase = new HandleGoogleCalendarWebhookUseCase(
      accounts,
      agenda,
      googleCalendar,
      logger,
      () => new Date('2026-06-22T11:00:00.000Z'),
    )

    const result = await useCase.execute({
      headers: {
        channelId: 'channel-1',
        resourceId: 'resource-1',
        resourceState: 'exists',
        messageNumber: '2',
        channelToken: 'signed-channel-token',
      },
    })

    expect(result).toEqual({ accepted: true, ignored: false, processedEvents: 1 })
    expect(agenda.upsertExternalBlock).toHaveBeenCalledWith({
      professionalId: 'prof-1',
      googleEventId: 'google-event-1',
      startIso: '2026-06-23T10:00:00.000-03:00',
      endIso: '2026-06-23T11:00:00.000-03:00',
      title: 'Bloqueo personal',
      source: 'GOOGLE_CALENDAR',
    })
    expect(accounts.saveSyncToken).toHaveBeenCalledWith({
      accountId: 'sync-1',
      syncToken: 'sync-token-2',
    })
  })
})
