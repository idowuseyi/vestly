import { Tenant, ITenant } from './tenant.model';
import { Unit } from '../units/unit.model';
import { CreateTenantInput } from './tenant.schema';
import { AuthenticatedRequest } from '../../shared/types';
import { applyOrgScope } from '../../shared/scoping.util';

export class TenantService {
  /**
   * Create a new tenant - validates unit exists and belongs to orgId
   */
  static async create(
    unitId: string,
    input: CreateTenantInput,
    req: AuthenticatedRequest
  ): Promise<ITenant> {
    // Validate that unit exists and belongs to the user's org
    const unitQuery = applyOrgScope({ _id: unitId }, req);
    const unit = await Unit.findOne(unitQuery);

    if (!unit) {
      throw new Error('Unit not found');
    }

    const tenantData = {
      ...input,
      unitId,
      orgId: req.user.orgId,
    };

    return Tenant.create(tenantData);
  }

  /**
   * Get tenant profile with unit and property details
   */
  static async getProfile(req: AuthenticatedRequest): Promise<ITenant | null> {
    const query = applyOrgScope({ userId: req.user.userId }, req);
    return Tenant.findOne(query)
      .populate({
        path: 'unitId',
        populate: {
          path: 'propertyId',
        },
      })
      .lean() as any;
  }

  /**
   * Get tenant by ID - scoped by orgId
   */
  static async findById(id: string, req: AuthenticatedRequest): Promise<ITenant | null> {
    const query = applyOrgScope({ _id: id }, req);
    return Tenant.findOne(query)
      .populate('unitId')
      .populate('userId', '-password');
  }

  /**
   * Get all tenants - scoped by orgId
   */
  static async findAll(req: AuthenticatedRequest): Promise<ITenant[]> {
    const query = applyOrgScope({}, req);
    return Tenant.find(query)
      .populate('unitId')
      .populate('userId', '-password')
      .sort({ createdAt: -1 })
      .lean() as any;
  }
}
