import { Router } from 'express';
import { getCoupons, validateCoupon } from '../controllers/couponController.js';

const router = Router();

router.get('/', getCoupons);
router.post('/validate', validateCoupon);

export default router;
