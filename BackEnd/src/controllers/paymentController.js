const PayOS = require("@payos/node");
const Payment = require("../models/Payment");
const payos = new PayOS(
  "20aad468-aaa1-4e74-ac05-6a56d669e909",
  "9f4d1792-eb88-4fb3-9184-6b4d61e9736f",
  "d585d408f91635fb51c818d68bc00834c8f54c3b1b417cb1f5ed64e6ac87eca8"
); // client_id, api_key, checksum_key

class PaymentController {
  static createPayment = async (req, res) => {
    try {
      const order = req.body;
      if (!order.classes) {
        return res.status(404).json({
          message: "Class info not found!",
        });
      }
      order.amount = order.items[0].price;
      order.orderCode = Math.floor(Math.random() * 10000000);
      order.cancelUrl = "http://localhost:5173/manage-classes";
      order.returnUrl = "http://localhost:5173/manage-classes";

      const paymentLink = await payos.createPaymentLink(order);
      if (!paymentLink.checkoutUrl) {
        res.status(500).json({
          message: "Cannot create payment",
        });
      }
      res.status(200).json({
        orderID: order.orderCode,
        checkoutUrl: paymentLink.checkoutUrl,
        classes: order.classes,
      });
    } catch (error) {
      res.status(500).json({ error: "Error creating payment link" });
    }
  };

  static checkPayment = async (req, res) => {
    try {
      const paymentID = req.params.id;
      const tutorID = req.body.tutorID;
      const paymentInfo = await payos.getPaymentLinkInformation(paymentID);

      if (!tutorID) {
        return res.status(404).json({
          message: "No tutorID found",
        });
      }
      //status: PENDING || PAID || CANCELLED
      if (paymentInfo.status == "PAID") {
        const data = await Payment.createPayment(paymentInfo, tutorID);
        if (!data) {
          return res.status(500).json({
            message: "Cannot insert payment info in the database",
          });
        }
        res.status(200).json({ paymentInfo, success: true });
      } else {
        res.status(200).json({ paymentInfo, success: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error get payment info", error });
    }
  };

  static getPaymentInfo = async (req, res) => {
    try {
      const data = await Payment.getPaymentInfo();
      if (!data) {
        return res.status(404).json({
          message: "Cannot find payment info",
        });
      }

      res.status(200).json({
        message: "Get payment info success",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error get payment info", error });
    }
  };
}

module.exports = PaymentController;
