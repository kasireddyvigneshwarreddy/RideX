import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { savedAddressSchema } from '../validators/schemas.js';

export async function getAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const addresses = await prisma.savedAddress.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
}

export async function addAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const data = savedAddressSchema.parse(req.body);

    const address = await prisma.savedAddress.create({
      data: {
        userId: req.user.id,
        label: data.label,
        title: data.title,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        isFavorite: data.isFavorite,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Address saved successfully',
      address,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const address = await prisma.savedAddress.findUnique({
      where: { id },
    });

    if (!address || address.userId !== req.user.id) {
      res.status(404).json({ success: false, message: 'Address not found or unauthorized' });
      return;
    }

    await prisma.savedAddress.delete({ where: { id } });

    res.json({ success: true, message: 'Address removed successfully' });
  } catch (error) {
    next(error);
  }
}
