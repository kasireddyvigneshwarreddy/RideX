import { Router } from 'express';
import {
  estimateFare,
  createRide,
  getRides,
  getRideById,
  cancelRide,
  rateRide,
  getRideReceipt,
} from '../controllers/rideController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/estimate', optionalAuth, estimateFare);
router.post('/', requireAuth, createRide);
router.get('/', requireAuth, getRides);
router.get('/:id', optionalAuth, getRideById);
router.patch('/:id/cancel', requireAuth, cancelRide);
router.post('/:id/rating', requireAuth, rateRide);
router.get('/:id/receipt', optionalAuth, getRideReceipt);

export default router;
