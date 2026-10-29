import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/schemas.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ridex_super_secret_jwt_key_2026_production_grade_token';
const JWT_EXPIRES_IN: any = process.env.JWT_EXPIRES_IN || '7d';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
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

    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
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

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        driverProfileId: user.driverProfile?.id,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Activity log
    await prisma.activityLog.create({
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
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
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

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Password does not match.' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        driverProfileId: user.driverProfile?.id,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await prisma.activityLog.create({
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
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const updates = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
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
  } catch (error) {
    next(error);
  }
}
