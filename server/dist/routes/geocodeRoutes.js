"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const geocodeController_js_1 = require("../controllers/geocodeController.js");
const router = (0, express_1.Router)();
router.get('/search', geocodeController_js_1.searchLocations);
router.get('/popular', geocodeController_js_1.getPopularLocations);
router.get('/reverse', geocodeController_js_1.reverseGeocode);
exports.default = router;
