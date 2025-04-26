const express = require("express");
const PaymentController = require("../controllers/paymentController");

const router = express.Router();

//Get
router.get("/getPaymentInfo", PaymentController.getPaymentInfo);

//Post
router.post("/createPayment", PaymentController.createPayment);
router.post("/checkPayment/:id", PaymentController.checkPayment);

module.exports = router;
