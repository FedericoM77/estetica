import type { AuthenticatedPrincipal, TenantBusinessType } from '../auth/AuthTypes'
import { ApplicationError } from '../auth/AuthTypes'

export interface SuperAdminDashboardMetrics {
  total_tenants: number
  tenants_by_type: Record<TenantBusinessType, number>
  financials: {
    gross_revenue_ars: number
    currency: 'ARS'
  }
}

export interface SuperAdminDashboardRepository {
  countTenants(): Promise<number>
  countTenantsByType(): Promise<Record<TenantBusinessType, number>>
  sumGrossRevenueARS(): Promise<number>
}

export class GetSuperAdminDashboardUseCase {
  private readonly dashboardRepository: SuperAdminDashboardRepository

  constructor(dashboardRepository: SuperAdminDashboardRepository) {
    this.dashboardRepository = dashboardRepository
  }

  async execute(principal: AuthenticatedPrincipal | undefined): Promise<SuperAdminDashboardMetrics> {
    if (!principal) {
      throw new ApplicationError(401, 'UNAUTHORIZED', 'Sesion requerida.')
    }

    if (principal.role !== 'SUPER_ADMIN') {
      throw new ApplicationError(403, 'SUPER_ADMIN_REQUIRED', 'Requiere rol SUPER_ADMIN.')
    }

    const [totalTenants, tenantsByType, grossRevenueARS] = await Promise.all([
      this.dashboardRepository.countTenants(),
      this.dashboardRepository.countTenantsByType(),
      this.dashboardRepository.sumGrossRevenueARS(),
    ])

    return {
      total_tenants: totalTenants,
      tenants_by_type: {
        CLINIC: tenantsByType.CLINIC ?? 0,
        INDEPENDENT: tenantsByType.INDEPENDENT ?? 0,
      },
      financials: {
        gross_revenue_ars: grossRevenueARS,
        currency: 'ARS',
      },
    }
  }
}
