import { Unit, IUnit } from './unit.model';
import { Property } from '../properties/property.model';
import { CreateUnitInput, UpdateUnitInput } from './unit.schema';
import { AuthenticatedRequest } from '../../shared/types';
import { applyOrgScope } from '../../shared/scoping.util';

export class UnitService {
  /**
   * Create a new unit - validates property exists and belongs to orgId
   */
  static async create(
    propertyId: string,
    input: CreateUnitInput,
    req: AuthenticatedRequest
  ): Promise<IUnit> {
    // Validate that property exists and belongs to the user's org
    const propertyQuery = applyOrgScope({ _id: propertyId }, req);
    const property = await Property.findOne(propertyQuery);

    if (!property) {
      throw new Error('Property not found');
    }

    const unitData = {
      ...input,
      propertyId,
      orgId: req.user.orgId,
    };

    return Unit.create(unitData);
  }

  /**
   * Get all units for a property - scoped by orgId
   */
  static async findByProperty(
    propertyId: string,
    req: AuthenticatedRequest
  ): Promise<IUnit[]> {
    const query = applyOrgScope({ propertyId }, req);
    return Unit.find(query).sort({ unitNumber: 1 }).lean() as any;
  }

  /**
   * Get unit by ID - scoped by orgId
   */
  static async findById(id: string, req: AuthenticatedRequest): Promise<IUnit | null> {
    const query = applyOrgScope({ _id: id }, req);
    return Unit.findOne(query).populate('propertyId');
  }

  /**
   * Update unit - scoped by orgId
   */
  static async update(
    id: string,
    input: UpdateUnitInput,
    req: AuthenticatedRequest
  ): Promise<IUnit | null> {
    const query = applyOrgScope({ _id: id }, req);
    return Unit.findOneAndUpdate(query, input, { new: true });
  }

  /**
   * Delete unit - scoped by orgId
   */
  static async delete(id: string, req: AuthenticatedRequest): Promise<IUnit | null> {
    const query = applyOrgScope({ _id: id }, req);
    return Unit.findOneAndDelete(query);
  }
}
