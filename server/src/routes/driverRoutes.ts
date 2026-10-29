import { Router } from 'express';
import {
  getPendingRequests,
  acceptRide,
  updateRideStatus,
  toggleAvailability,
  getEarnings,
} from '../controllers/driverController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('DRIVER'));

router.get('/requests', getPendingRequests);
router.post('/rides/:id/accept', acceptRide);
router.patch('/rides/:id/status', updateRideStatus);
router.patch('/availability', toggleAvailability);
router.get('/earnings', getEarnings);

export default router;
