"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
exports.updateProfile = updateProfile;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_js_1 = require("../prisma.js");
const schemas_js_1 = require("../validators/schemas.js");
const JWT_SECRET = process.env.JWT_SECRET || 'ridex_super_secret_jwt_key_2026_production_grade_token';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
async function register(req, res, next) {
    try {
        const validatedData = schemas_js_1.registerSchema.parse(req.body);
        const existingUser = await prisma_js_1.prisma.user.findFirst({
            where: {
                OR: [{ email: validatedData.email }, { phone: validatedData.phone }],
            },
        });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: existingUser.email === validatedData.email
                    ? 'An account with this email address already exists.'
                    : 'An account with this phone number already exists.',
            });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(validatedData.password, 10);
        const user = await prisma_js_1.prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                phone: validatedData.phone,
                passwordHash,
                role: validatedData.role,
                referralCode: {
                    create: {
                        code: validatedData.name.replace(/\s+/g, '').toUpperCase().slice(0, 5) + Math.floor(100 + Math.random() * 900),
                    },
                },
                ...(validatedData.role === 'DRIVER'
                    ? {
                        driverProfile: {
                            create: {
                                licenseNumber: validatedData.licenseNumber || `DL-${Date.now().toString().slice(-6)}`,
                                vehicle: {
                                    create: {
                                        category: validatedData.vehicleCategory || 'BIKE',
                                        make: validatedData.vehicleMake || 'Hero',
                                        model: validatedData.vehicleModel || 'Splendor Plus',
                                        color: validatedData.vehicleColor || 'Yellow & Black',
                                        plateNumber: validatedData.vehiclePlateNumber || `KA-${Math.floor(10 + Math.random() * 89)}-${Math.floor(1000 + Math.random() * 9000)}`,
                                    },
                                },
                            },
                        },
                    }
                    : {}),
            },
            include: {
                driverProfile: {
                    include: { vehicle: true },
                },
                referralCode: true,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            driverProfileId: user.driverProfile?.id,
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // Activity log
        await prisma_js_1.prisma.activityLog.create({
            data: {
                userId: user.id,
                action: 'USER_REGISTERED',
                entityType: 'USER',
                entityId: user.id,
                ipAddress: req.ip || '127.0.0.1',
            },
        });
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                referralCode: user.referralCode?.code,
                driverProfile: user.driverProfile,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = schemas_js_1.loginSchema.parse(req.body);
        const user = await prisma_js_1.prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone: email }],
            },
            include: {
                driverProfile: {
                    include: { vehicle: true },
                },
                referralCode: true,
            },
        });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email/phone.' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials. Password does not match.' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            driverProfileId: user.driverProfile?.id,
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        await prisma_js_1.prisma.activityLog.create({
            data: {
                userId: user.id,
                action: 'USER_LOGIN',
                entityType: 'USER',
                entityId: user.id,
                ipAddress: req.ip || '127.0.0.1',
            },
        });
        res.json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                referralCode: user.referralCode?.code,
                driverProfile: user.driverProfile,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getMe(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                driverProfile: {
                    include: {
                        vehicle: true,
                        documents: true,
                    },
                },
                referralCode: true,
                savedAddresses: true,
            },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                referralCode: user.referralCode?.code,
                savedAddresses: user.savedAddresses,
                driverProfile: user.driverProfile,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function updateProfile(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        const updates = schemas_js_1.updateProfileSchema.parse(req.body);
        const updatedUser = await prisma_js_1.prisma.user.update({
            where: { id: req.user.id },
            data: updates,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                avatar: true,
            },
        });
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
}
