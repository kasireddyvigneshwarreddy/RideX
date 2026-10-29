"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddresses = getAddresses;
exports.addAddress = addAddress;
exports.deleteAddress = deleteAddress;
const prisma_js_1 = require("../prisma.js");
const schemas_js_1 = require("../validators/schemas.js");
async function getAddresses(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const addresses = await prisma_js_1.prisma.savedAddress.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, addresses });
    }
    catch (error) {
        next(error);
    }
}
async function addAddress(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const data = schemas_js_1.savedAddressSchema.parse(req.body);
        const address = await prisma_js_1.prisma.savedAddress.create({
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
    }
    catch (error) {
        next(error);
    }
}
async function deleteAddress(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const { id } = req.params;
        const address = await prisma_js_1.prisma.savedAddress.findUnique({
            where: { id },
        });
        if (!address || address.userId !== req.user.id) {
            res.status(404).json({ success: false, message: 'Address not found or unauthorized' });
            return;
        }
        await prisma_js_1.prisma.savedAddress.delete({ where: { id } });
        res.json({ success: true, message: 'Address removed successfully' });
    }
    catch (error) {
        next(error);
    }
}
