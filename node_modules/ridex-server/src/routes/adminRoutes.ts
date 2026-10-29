import { Router } from 'express';
import {
  getAnalytics,
  getUsers,
  getDrivers,
  verifyDriver,
  getFareRules,
  updateFareRule,
  createCoupon,
  getSupportTickets,
  updateSupportTicket,
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.get('/drivers', getDrivers);
router.patch('/drivers/:id/verification', verifyDriver);
router.get('/fare-rules', getFareRules);
router.patch('/fare-rules/:id', updateFareRule);
router.post('/coupons', createCoupon);
router.get('/support-tickets', getSupportTickets);
router.patch('/support-tickets/:id', updateSupportTicket);

export default router;
