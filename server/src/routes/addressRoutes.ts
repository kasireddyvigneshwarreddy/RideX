import { Router } from 'express';
import { getAddresses, addAddress, deleteAddress } from '../controllers/addressController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getAddresses);
router.post('/', addAddress);
router.delete('/:id', deleteAddress);

export default router;
