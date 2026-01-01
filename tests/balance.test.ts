import supertest from 'supertest';
import app from '../src/app';
import { User } from '../src/modules/auth/auth.model';
import { Property } from '../src/modules/properties/property.model';
import { Unit } from '../src/modules/units/unit.model';
import { Tenant } from '../src/modules/tenants/tenant.model';
import { LedgerService } from '../src/modules/ledger/ledger.service';
import { TransactionType } from '../src/shared/types';
import { OwnershipCreditTransaction } from '../src/modules/ledger/ledger.model';

const request = supertest(app);

describe('Balance Derivation Test', () => {
  let landlordToken: string;
  let tenantId: string;
  let unitId: string;
  const orgId = 'balance-test-org';

  beforeAll(async () => {
    // Create landlord
    await User.create({
      email: 'landlord@balance.com',
      password: 'password123',
      name: 'Balance Landlord',
      role: 'landlord',
      orgId,
    });

    // Login
    const loginResponse = await request
      .post('/api/v1/auth/login')
      .send({ email: 'landlord@balance.com', password: 'password123' });
    landlordToken = loginResponse.body.data.token;

    // Create property
    const property = await Property.create({
      orgId,
      nickname: 'Balance Test Property',
      address: {
        street: '789 Balance St',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
      },
    });

    // Create unit
    const unit = await Unit.create({
      propertyId: property._id,
      orgId,
      unitNumber: '201',
      rent: 3000,
    });
    unitId = unit._id.toString();

    // Create tenant user
    const tenantUser = await User.create({
      email: 'tenant@balance.com',
      password: 'password123',
      name: 'Balance Tenant',
      role: 'tenant',
      orgId,
    });

    // Create tenant profile
    const tenant = await Tenant.create({
      unitId: unit._id,
      orgId,
      userId: tenantUser._id,
      name: 'Balance Tenant',
      email: 'tenant@balance.com',
    });
    tenantId = tenant._id.toString();
  });

  test('should correctly calculate balance from 3 EARN and 1 REDEEM transactions', async () => {
    // Create 3 EARN transactions
    await OwnershipCreditTransaction.create({
      orgId,
      tenantId,
      unitId,
      type: TransactionType.EARN,
      amount: 100,
      memo: 'First earn',
    });

    await OwnershipCreditTransaction.create({
      orgId,
      tenantId,
      unitId,
      type: TransactionType.EARN,
      amount: 200,
      memo: 'Second earn',
    });

    await OwnershipCreditTransaction.create({
      orgId,
      tenantId,
      unitId,
      type: TransactionType.EARN,
      amount: 150,
      memo: 'Third earn',
    });

    // Create 1 REDEEM transaction
    await OwnershipCreditTransaction.create({
      orgId,
      tenantId,
      unitId,
      type: TransactionType.REDEEM,
      amount: 80,
      memo: 'Redemption',
    });

    // Expected balance: 100 + 200 + 150 - 80 = 370

    // Test via API endpoint
    const response = await request
      .get(`/api/v1/tenants/${tenantId}/credits/balance`)
      .set('Authorization', `Bearer ${landlordToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.balance).toBe(370);
  });

  test('should calculate same balance using aggregation and in-memory methods', async () => {
    const mockReq: any = {
      user: {
        userId: 'test-user',
        orgId,
        role: 'landlord',
      },
    };

    // Test aggregation method
    const aggregationBalance = await LedgerService.calculateBalanceAggregation(
      tenantId,
      mockReq
    );

    // Test in-memory method
    const inMemoryBalance = await LedgerService.calculateBalanceInMemory(tenantId, mockReq);

    // Both should return same result
    expect(aggregationBalance).toBe(370);
    expect(inMemoryBalance).toBe(370);
    expect(aggregationBalance).toBe(inMemoryBalance);
  });

  test('should correctly handle ADJUST transactions (positive and negative)', async () => {
    // Add positive adjustment
    await OwnershipCreditTransaction.create({
      orgId,
      tenantId,
      unitId,
      type: TransactionType.ADJUST,
      amount: 50,
      memo: 'Positive adjustment',
    });

    // Add negative adjustment
    await OwnershipCreditTransaction.create({
      orgId,
      tenantId,
      unitId,
      type: TransactionType.ADJUST,
      amount: -20,
      memo: 'Negative adjustment',
    });

    // Expected balance: 370 + 50 - 20 = 400

    const response = await request
      .get(`/api/v1/tenants/${tenantId}/credits/balance`)
      .set('Authorization', `Bearer ${landlordToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.balance).toBe(400);
  });

  test('should return ledger history in correct order', async () => {
    const response = await request
      .get(`/api/v1/tenants/${tenantId}/credits/ledger`)
      .set('Authorization', `Bearer ${landlordToken}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBe(6); // 3 EARN + 1 REDEEM + 2 ADJUST

    // Should be sorted by createdAt descending (newest first)
    const dates = response.body.data.map((tx: any) => new Date(tx.createdAt).getTime());
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
    }
  });
});
