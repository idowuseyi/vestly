import supertest from 'supertest';
import app from '../src/app';
import { User } from '../src/modules/auth/auth.model';
import { TransactionType } from '../src/shared/types';

const request = supertest(app);

describe('Redemption Rule Test', () => {
  let landlordToken: string;
  let tenantId: string;
  const orgId = 'test-org';

  beforeAll(async () => {
    // Create landlord user
    await User.create({
      email: 'landlord@test.com',
      password: 'password123',
      name: 'Test Landlord',
      role: 'landlord',
      orgId,
    });

    // Login
    const loginResponse = await request
      .post('/api/v1/auth/login')
      .send({ email: 'landlord@test.com', password: 'password123' });
    landlordToken = loginResponse.body.data.token;

    // Create property
    const propertyResponse = await request
      .post('/api/v1/properties')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        nickname: 'Test Property',
        address: {
          street: '456 Test St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
        },
      });
    const propertyId = propertyResponse.body.data._id;

    // Create unit
    const unitResponse = await request
      .post(`/api/v1/properties/${propertyId}/units`)
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        unitNumber: '101',
        rent: 2000,
      });
    const unitId = unitResponse.body.data._id;

    // Create tenant user
    const tenantUser = await User.create({
      email: 'tenant@test.com',
      password: 'password123',
      name: 'Test Tenant',
      role: 'tenant',
      orgId,
    });

    // Create tenant profile
    const tenantResponse = await request
      .post(`/api/v1/units/${unitId}/tenants`)
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        userId: tenantUser._id.toString(),
        name: 'Test Tenant',
        email: 'tenant@test.com',
      });

    tenantId = tenantResponse.body.data._id;
  });

  test('should successfully earn 100 credits', async () => {
    const response = await request
      .post(`/api/v1/tenants/${tenantId}/credits/earn`)
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        amount: 100,
        memo: 'Initial credits',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.amount).toBe(100);
    expect(response.body.data.type).toBe(TransactionType.EARN);
  });

  test('should return current balance of 100', async () => {
    const response = await request
      .get(`/api/v1/tenants/${tenantId}/credits/balance`)
      .set('Authorization', `Bearer ${landlordToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.balance).toBe(100);
  });

  test('should fail when attempting to redeem 150 credits (insufficient balance)', async () => {
    const response = await request
      .post(`/api/v1/tenants/${tenantId}/credits/redeem`)
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        amount: 150,
        memo: 'Attempting over-redemption',
      });

    expect(response.status).toBe(500); // Error will be caught by error handler
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Insufficient balance');
  });

  test('should successfully redeem 50 credits (within balance)', async () => {
    const response = await request
      .post(`/api/v1/tenants/${tenantId}/credits/redeem`)
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        amount: 50,
        memo: 'Valid redemption',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.amount).toBe(50);
    expect(response.body.data.type).toBe(TransactionType.REDEEM);
  });

  test('should return updated balance of 50 after redemption', async () => {
    const response = await request
      .get(`/api/v1/tenants/${tenantId}/credits/balance`)
      .set('Authorization', `Bearer ${landlordToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.balance).toBe(50);
  });
});
