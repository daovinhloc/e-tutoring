const dotenv = require("dotenv");
const connectDB = require("../config/db");
const sql = require("mysql2/promise");

dotenv.config();

class Payment {
  // Get all payment records from the Payments table
  static async getPaymentInfo() {
    const connection = await connectDB();
    const [rows] = await connection.execute(`SELECT * FROM Payments`);
    return rows;
  }

  // Get all payment records from the Payment table
  static async getAllPayment() {
    const connection = await connectDB();
    const [rows] = await connection.execute(`SELECT * FROM Payments`);
    return rows;
  }

  // Create a new payment record and associate it with a tutor
  static async createPayment(paymentInfo, tutorID) {
    const connection = await connectDB();
    const { id, orderCode, amount, status, createdAt } = paymentInfo;
    const [check] = await connection.execute(
      "SELECT COUNT(*) AS count FROM Payments WHERE id = ?",
      [id]
    );
    if (check[0].count === 0) {
      const [result] = await connection.execute(
        `INSERT INTO Payments (id, tutorID, orderCode, amount, status, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, tutorID, orderCode, amount, status, new Date(createdAt)]
      );
      return {
        id,
        tutorID,
        orderCode,
        amount,
        status,
        createdAt,
      };
    }
    return check[0];
  }

  // Get all transaction records with payment details
  static async getTransaction() {
    const connection = await connectDB();
    const [rows] = await connection.execute(`SELECT 
                tutorID,
                orderCode,
                amount,
                status,
                createdAt
              FROM 
                Payments`);
    return rows;
  }

  static async getPaymentInfoThisMonth() {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT COUNT(*) AS total_payments, SUM(amount) AS total_amount, MONTH(createdAt) AS month, YEAR(createdAt) AS year
       FROM Payments
       WHERE MONTH(createdAt) = MONTH(CURRENT_DATE())
       AND YEAR(createdAt) = YEAR(CURRENT_DATE())
       AND status = 'Completed'
       GROUP BY MONTH(createdAt), YEAR(createdAt)`);
    return rows;
  }
}

module.exports = Payment;
