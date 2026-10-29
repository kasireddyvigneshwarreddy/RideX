"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.markNotificationsAsRead = markNotificationsAsRead;
const prisma_js_1 = require("../prisma.js");
async function getNotifications(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const notifications = await prisma_js_1.prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 30,
        });
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        res.json({ success: true, notifications, unreadCount });
    }
    catch (error) {
        next(error);
    }
}
async function markNotificationsAsRead(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const { id } = req.params;
        if (id === 'all') {
            await prisma_js_1.prisma.notification.updateMany({
                where: { userId: req.user.id, isRead: false },
                data: { isRead: true },
            });
        }
        else {
            await prisma_js_1.prisma.notification.updateMany({
                where: { id, userId: req.user.id },
                data: { isRead: true },
            });
        }
        res.json({ success: true, message: 'Notifications marked as read' });
    }
    catch (error) {
        next(error);
    }
}
