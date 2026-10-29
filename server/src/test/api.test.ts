import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

describe('RideX Core API Integration Tests', () => {
  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('RideX Mobility Core API');
  });

  it('POST /api/v1/auth/login should authenticate seeded customer', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'customer@ridex.in',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('CUSTOMER');
    expect(res.body.user.email).toBe('customer@ridex.in');
  });

  it('POST /api/v1/rides/estimate should return fare calculations for 4 categories', async () => {
    const res = await request(app)
      .post('/api/v1/rides/estimate')
      .send({
        pickupLat: 12.9716, // Bangalore MG Road
        pickupLng: 77.5946,
        destLat: 12.9352,   // Koramangala
        destLng: 77.6245,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.route.distanceKm).toBeGreaterThan(0);
    expect(res.body.fares).toBeDefined();
    expect(res.body.fares.length).toBe(4);

    const bikeFare = res.body.fares.find((f: any) => f.category === 'BIKE');
    expect(bikeFare).toBeDefined();
    expect(bikeFare.totalFareRupees).toBeGreaterThan(0);
  });

  it('GET /api/v1/coupons should return active coupons', async () => {
    const res = await request(app).get('/api/v1/coupons');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.coupons.length).toBeGreaterThanOrEqual(1);
    expect(res.body.coupons.some((c: any) => c.code === 'RIDEX50')).toBe(true);
  });

  it('GET /api/v1/geocode/popular should return Indian transit hubs', async () => {
    const res = await request(app).get('/api/v1/geocode/popular');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.locations.length).toBeGreaterThan(0);
  });
});
