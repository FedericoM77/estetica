import { ApplicationError } from '../../../use-cases/auth/AuthTypes'
import type { GetSuperAdminDashboardUseCase } from '../../../use-cases/superadmin/GetSuperAdminDashboardUseCase'
import type { HttpRequest, HttpResponse } from '../HttpTypes'
import { json } from '../HttpTypes'

export class SuperAdminDashboardController {
  private readonly useCase: GetSuperAdminDashboardUseCase

  constructor(useCase: GetSuperAdminDashboardUseCase) {
    this.useCase = useCase
  }

  async show(request: HttpRequest): Promise<HttpResponse> {
    try {
      const result = await this.useCase.execute(request.auth)
      return json(200, result)
    } catch (error) {
      if (error instanceof ApplicationError) {
        return json(error.statusCode, { error: error.code })
      }

      return json(500, { error: 'INTERNAL_SERVER_ERROR' })
    }
  }
}
