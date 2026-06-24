import { ApplicationError, type TenantBusinessType } from '../auth/AuthTypes'

export interface ClientPortalTenant {
  id: string
  slug: string
  commercialName: string
  businessType: TenantBusinessType
  active: boolean
}

export interface ClientPortalService {
  id: string
  title: string
  priceLabel: string
  durationLabel: string
  description?: string
}

export interface ClientPortalViewModel {
  tenant: ClientPortalTenant
  services: ClientPortalService[]
}

export interface TenantRepository {
  findBySlug(slug: string): Promise<ClientPortalTenant | null>
}

export interface TenantServiceCatalogRepository {
  findActiveServicesByTenantId(tenantId: string): Promise<ClientPortalService[]>
}

export interface GetClientPortalInput {
  tenantSlug: string
}

const TENANT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function normalizeTenantSlug(slug: string): string {
  return slug.trim().toLowerCase()
}

function assertValidTenantSlug(slug: string): void {
  if (!TENANT_SLUG_PATTERN.test(slug)) {
    throw new ApplicationError(404, 'TENANT_NOT_FOUND', 'Tenant no encontrado.')
  }
}

export class GetClientPortalUseCase {
  private readonly tenants: TenantRepository
  private readonly serviceCatalog: TenantServiceCatalogRepository

  constructor(tenants: TenantRepository, serviceCatalog: TenantServiceCatalogRepository) {
    this.tenants = tenants
    this.serviceCatalog = serviceCatalog
  }

  async execute(input: GetClientPortalInput): Promise<ClientPortalViewModel> {
    const tenantSlug = normalizeTenantSlug(input.tenantSlug)
    assertValidTenantSlug(tenantSlug)

    const tenant = await this.tenants.findBySlug(tenantSlug)

    if (!tenant || !tenant.active) {
      throw new ApplicationError(404, 'TENANT_NOT_FOUND', 'Tenant no encontrado.')
    }

    const services = await this.serviceCatalog.findActiveServicesByTenantId(tenant.id)

    return {
      tenant,
      services,
    }
  }
}
