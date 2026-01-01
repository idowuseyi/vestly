import supertest from 'supertest';
import app from '../src/app';
import { User } from '../src/modules/auth/auth.model';

const request = supertest(app);

describe('Auth Scoping Test', () => {
  let org1Token: string;
  let org2Token: string;
  let org1PropertyId: string;

  beforeAll(async () => {
    // Create users in different organizations
    await User.create({
      email: 'landlord1@org1.com',
      password: 'password123',
      name: 'Landlord Org 1',
      role: 'landlord',
      orgId: 'org-1',
    });

    await User.create({
      email: 'landlord2@org2.com',
      password: 'password123',
      name: 'Landlord Org 2',
      role: 'landlord',
      orgId: 'org-2',
    });

    // Login to get tokens
    const org1Login = await request
      .post('/api/v1/auth/login')
      .send({ email: 'landlord1@org1.com', password: 'password123' });
    org1Token = org1Login.body.data.token;

    const org2Login = await request
      .post('/api/v1/auth/login')
      .send({ email: 'landlord2@org2.com', password: 'password123' });
    org2Token = org2Login.body.data.token;

    // Create a property in org-1
    const propertyResponse = await request
      .post('/api/v1/properties')
      .set('Authorization', `Bearer ${org1Token}`)
      .send({
        nickname: 'Org 1 Property',
        address: {
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zip: '02101',
        },
      });

    org1PropertyId = propertyResponse.body.data._id;
  });

  test('should return 404 when trying to access property from different org', async () => {
    // Attempt to get org-1 property using org-2 token
    const response = await request
      .get(`/api/v1/properties/${org1PropertyId}`)
      .set('Authorization', `Bearer ${org2Token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('not found');
  });

  test('should successfully access property with same org token', async () => {
    // Access org-1 property with org-1 token
    const response = await request
      .get(`/api/v1/properties/${org1PropertyId}`)
      .set('Authorization', `Bearer ${org1Token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(org1PropertyId);
  });

  test('should not list properties from other organizations', async () => {
    // Get all properties with org-2 token
    const response = await request
      .get('/api/v1/properties')
      .set('Authorization', `Bearer ${org2Token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(0); // Should be empty
  });
});
