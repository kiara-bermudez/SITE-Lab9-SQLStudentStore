const express = require("express");
const Order = require("../models/order");
const security = require("../middleware/security");
const router = express.Router();

// Create a new order entry
router.post("/", security.requireAuthenticatedUser, async (req, res, next) => {
    try {
        const {user} = res.locals;
        const order = await Order.createOrder({ user, order: req.body});
        return res.status(200).json({order});
    }catch(err) {
        next(err);
    }
})

// Get all user owned order entries
router.get("/", security.requireAuthenticatedUser, async (req,res,next) => {
    try {
        const {user} = res.locals;
        const orders = await Order.listOrdersForUser({ user });        
        return res.status(200).json({ orders})
    } catch(err) {
        next(err);
    }
})


module.exports = router;