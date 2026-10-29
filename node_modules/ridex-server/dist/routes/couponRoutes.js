"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const couponController_js_1 = require("../controllers/couponController.js");
const router = (0, express_1.Router)();
router.get('/', couponController_js_1.getCoupons);
router.post('/validate', couponController_js_1.validateCoupon);
exports.default = router;
