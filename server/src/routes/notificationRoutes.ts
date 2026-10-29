import { Router } from 'express';
import { getNotifications, markNotificationsAsRead } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getNotifications);
router.patch('/:id/read', markNotificationsAsRead);

export default router;
