import { Router } from 'express';
import { createTicket, getMyTickets } from '../controllers/supportController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.post('/', createTicket);
router.get('/', getMyTickets);

export default router;
