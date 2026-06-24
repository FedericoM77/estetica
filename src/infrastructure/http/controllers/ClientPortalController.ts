import { ApplicationError } from '../../../use-cases/auth/AuthTypes'
import type { GetClientPortalUseCase } from '../../../use-cases/client-portal/GetClientPortalUseCase'
import type { HttpRequest, HttpResponse } from '../HttpTypes'

export interface ViewResponse<TModel = unknown> {
  view: string
  model: TModel
}

export class ClientPortalController {
  private readonly useCase: GetClientPortalUseCase

  constructor(useCase: GetClientPortalUseCase) {
    this.useCase = useCase
  }

  async show(request: HttpRequest): Promise<HttpResponse<ViewResponse | { error: string }>> {
    try {
      const tenantSlug = request.params.tenant_slug
      if (!tenantSlug) return { status: 404, body: { error: 'TENANT_NOT_FOUND' } }

      const model = await this.useCase.execute({ tenantSlug })

      return {
        status: 200,
        body: {
          view: 'client-portal',
          model,
        },
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        return {
          status: error.statusCode,
          body: {
            error: error.code,
          },
        }
      }

      return { status: 500, body: { error: 'INTERNAL_SERVER_ERROR' } }
    }
  }
}
