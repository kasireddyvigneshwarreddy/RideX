import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { supportTicketSchema } from '../validators/schemas.js';

export async function createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const data = supportTicketSchema.parse(req.body);

    const ticket = await prisma.supportTickets.create({
      data: {
        userId: req.user.id,
        rideId: data.rideId,
        category: data.category,
        subject: data.subject,
        message: data.message,
        priority: data.priority,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully. Our team will review it shortly.',
      ticket,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const tickets = await prisma.supportTickets.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        ride: { select: { bookingCode: true, category: true, createdAt: true } },
      },
    });

    res.json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
}
