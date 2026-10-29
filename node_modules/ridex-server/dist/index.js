"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const socketService_js_1 = require("./services/socketService.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const rideRoutes_js_1 = __importDefault(require("./routes/rideRoutes.js"));
const driverRoutes_js_1 = __importDefault(require("./routes/driverRoutes.js"));
const adminRoutes_js_1 = __importDefault(require("./routes/adminRoutes.js"));
const couponRoutes_js_1 = __importDefault(require("./routes/couponRoutes.js"));
const addressRoutes_js_1 = __importDefault(require("./routes/addressRoutes.js"));
const notificationRoutes_js_1 = __importDefault(require("./routes/notificationRoutes.js"));
const supportRoutes_js_1 = __importDefault(require("./routes/supportRoutes.js"));
const geocodeRoutes_js_1 = __importDefault(require("./routes/geocodeRoutes.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
// 1. Security & Body Parsing
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: [CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 2. Initialize Socket.IO
(0, socketService_js_1.initializeSocket)(server, CORS_ORIGIN);
// 3. Health & System Status Endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'healthy',
        service: 'RideX Mobility Core API',
        version: '1.0.0',
        demoMode: process.env.ENABLE_DEMO_MODE === 'true',
        timestamp: new Date().toISOString(),
    });
});
// 4. API v1 Routes
app.use('/api/v1/auth', authRoutes_js_1.default);
app.use('/api/v1/rides', rideRoutes_js_1.default);
app.use('/api/v1/driver', driverRoutes_js_1.default);
app.use('/api/v1/admin', adminRoutes_js_1.default);
app.use('/api/v1/coupons', couponRoutes_js_1.default);
app.use('/api/v1/addresses', addressRoutes_js_1.default);
app.use('/api/v1/notifications', notificationRoutes_js_1.default);
app.use('/api/v1/support', supportRoutes_js_1.default);
app.use('/api/v1/geocode', geocodeRoutes_js_1.default);
// 5. 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Requested API endpoint not found on RideX server',
    });
});
// 6. Centralized Error Handler
app.use(errorHandler_js_1.errorHandler);
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`🚀 RideX Server running on port ${PORT}`);
        console.log(`📡 Socket.IO listening for real-time ride tracking`);
        console.log(`🚕 Demo Mode: ${process.env.ENABLE_DEMO_MODE === 'true' ? 'Active' : 'Disabled'}`);
    });
}
