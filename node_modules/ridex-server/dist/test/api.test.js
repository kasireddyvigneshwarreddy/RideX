"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const index_js_1 = require("../index.js");
(0, vitest_1.describe)('RideX Core API Integration Tests', () => {
    (0, vitest_1.it)('GET /api/health should return 200 and healthy status', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app).get('/api/health');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.status).toBe('healthy');
        (0, vitest_1.expect)(res.body.service).toBe('RideX Mobility Core API');
    });
    (0, vitest_1.it)('POST /api/v1/auth/login should authenticate seeded customer', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app)
            .post('/api/v1/auth/login')
            .send({
            email: 'customer@ridex.in',
            password: 'Password123!',
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.token).toBeDefined();
        (0, vitest_1.expect)(res.body.user.role).toBe('CUSTOMER');
        (0, vitest_1.expect)(res.body.user.email).toBe('customer@ridex.in');
    });
    (0, vitest_1.it)('POST /api/v1/rides/estimate should return fare calculations for 4 categories', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app)
            .post('/api/v1/rides/estimate')
            .send({
            pickupLat: 12.9716, // Bangalore MG Road
            pickupLng: 77.5946,
            destLat: 12.9352, // Koramangala
            destLng: 77.6245,
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.route.distanceKm).toBeGreaterThan(0);
        (0, vitest_1.expect)(res.body.fares).toBeDefined();
        (0, vitest_1.expect)(res.body.fares.length).toBe(4);
        const bikeFare = res.body.fares.find((f) => f.category === 'BIKE');
        (0, vitest_1.expect)(bikeFare).toBeDefined();
        (0, vitest_1.expect)(bikeFare.totalFareRupees).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('GET /api/v1/coupons should return active coupons', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app).get('/api/v1/coupons');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.coupons.length).toBeGreaterThanOrEqual(1);
        (0, vitest_1.expect)(res.body.coupons.some((c) => c.code === 'RIDEX50')).toBe(true);
    });
    (0, vitest_1.it)('GET /api/v1/geocode/popular should return Indian transit hubs', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app).get('/api/v1/geocode/popular');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.locations.length).toBeGreaterThan(0);
    });
});
