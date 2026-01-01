import { Property, IProperty } from './property.model';
import { CreatePropertyInput, UpdatePropertyInput, PropertyQuery } from './property.schema';
import { AuthenticatedRequest } from '../../shared/types';
import { applyOrgScope } from '../../shared/scoping.util';

export class PropertyService {
  /**
   * Create a new property - scoped by orgId
   */
  static async create(input: CreatePropertyInput, req: AuthenticatedRequest): Promise<IProperty> {
    const propertyData = {
      ...input,
      orgId: req.user.orgId,
    };

    return Property.create(propertyData);
  }

  /**
   * Get all properties with optional filters - scoped by orgId
   */
  static async findAll(
    query: PropertyQuery,
    req: AuthenticatedRequest
  ): Promise<{ properties: IProperty[]; total: number }> {
    const { city, state, page = 1, limit = 10 } = query;

    // Build query with org scoping
    const filter: any = applyOrgScope({}, req);

    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }

    if (state) {
      filter['address.state'] = state.toUpperCase();
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean() as any,
      Property.countDocuments(filter),
    ]);

    return { properties, total };
  }

  /**
   * Get property by ID - scoped by orgId
   */
  static async findById(id: string, req: AuthenticatedRequest): Promise<IProperty | null> {
    const query = applyOrgScope({ _id: id }, req);
    return Property.findOne(query);
  }

  /**
   * Update property - scoped by orgId
   */
  static async update(
    id: string,
    input: UpdatePropertyInput,
    req: AuthenticatedRequest
  ): Promise<IProperty | null> {
    const query = applyOrgScope({ _id: id }, req);
    return Property.findOneAndUpdate(query, input, { new: true });
  }

  /**
   * Delete property - scoped by orgId
   */
  static async delete(id: string, req: AuthenticatedRequest): Promise<IProperty | null> {
    const query = applyOrgScope({ _id: id }, req);
    return Property.findOneAndDelete(query);
  }
}
