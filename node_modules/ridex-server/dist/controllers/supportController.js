"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTicket = createTicket;
exports.getMyTickets = getMyTickets;
const prisma_js_1 = require("../prisma.js");
const schemas_js_1 = require("../validators/schemas.js");
async function createTicket(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const data = schemas_js_1.supportTicketSchema.parse(req.body);
        const ticket = await prisma_js_1.prisma.supportTickets.create({
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
    }
    catch (error) {
        next(error);
    }
}
async function getMyTickets(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const tickets = await prisma_js_1.prisma.supportTickets.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                ride: { select: { bookingCode: true, category: true, createdAt: true } },
            },
        });
        res.json({ success: true, tickets });
    }
    catch (error) {
        next(error);
    }
}
