import { Router } from 'express';
import {
  searchLocations,
  getPopularLocations,
  reverseGeocode,
} from '../controllers/geocodeController.js';

const router = Router();

router.get('/search', searchLocations);
router.get('/popular', getPopularLocations);
router.get('/reverse', reverseGeocode);

export default router;
