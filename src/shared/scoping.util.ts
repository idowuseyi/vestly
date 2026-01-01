import { AuthenticatedRequest } from './types';

/**
 * Applies organization scoping to MongoDB queries.
 * This ensures all database operations are scoped to the authenticated user's organization,
 * preventing cross-tenant data leaks.
 * 
 * @param query - The MongoDB query object
 * @param req - The authenticated request containing user context
 * @returns Query object with orgId filter applied
 */
export const applyOrgScope = <T extends Record<string, any>>(
  query: T,
  req: AuthenticatedRequest
): T & { orgId: string } => {
  return {
    ...query,
    orgId: req.user.orgId,
  };
};

/**
 * Validates that a resource belongs to the user's organization.
 * Throws an error if the resource's orgId doesn't match.
 * 
 * @param resource - The resource to validate
 * @param req - The authenticated request
 * @throws Error if orgId mismatch
 */
export const validateOrgOwnership = (
  resource: { orgId: string } | null,
  req: AuthenticatedRequest
): void => {
  if (!resource) {
    throw new Error('Resource not found');
  }
  if (resource.orgId !== req.user.orgId) {
    throw new Error('Access denied: Resource belongs to different organization');
  }
};
