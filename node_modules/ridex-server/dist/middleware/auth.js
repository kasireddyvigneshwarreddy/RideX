"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.optionalAuth = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_js_1 = require("../prisma.js");
const JWT_SECRET = process.env.JWT_SECRET || 'ridex_super_secret_jwt_key_2026_production_grade_token';
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Authentication required. Please provide a valid Bearer token.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Verify user still exists in database
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: decoded.id },
            include: { driverProfile: true },
        });
        if (!user) {
            res.status(401).json({ success: false, message: 'User account not found or has been revoked.' });
            return;
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            driverProfileId: user.driverProfile?.id,
        };
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
    }
};
exports.requireAuth = requireAuth;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const user = await prisma_js_1.prisma.user.findUnique({
                where: { id: decoded.id },
                include: { driverProfile: true },
            });
            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    driverProfileId: user.driverProfile?.id,
                };
            }
        }
        next();
    }
    catch {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required.' });
            return;
        }
        const allowed = Array.isArray(roles) ? roles.includes(req.user.role) : req.user.role === roles;
        if (!allowed) {
            res.status(403).json({
                success: false,
                message: `Forbidden: Access requires ${Array.isArray(roles) ? roles.join(' or ') : roles} role.`,
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
