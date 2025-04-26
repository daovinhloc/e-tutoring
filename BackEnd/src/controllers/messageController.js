const sql = require("mysql2/promise");
const connectDB = require("../config/db");

class Message {
  static async sendMessage(req) {
    try {
      const { senderID, receiverID } = req.params;
      const { messageText, senderType, receiverType } = req.body;
      
      const connection = await connectDB();
      const [result] = await connection.execute(
        `INSERT INTO Messages (senderID, receiverID, messageText, senderType, receiverType)
         VALUES (?, ?, ?, ?, ?)`,
        [senderID, receiverID, messageText, senderType, receiverType]
      );
      return {
        messageID: result.insertId,
        senderID,
        receiverID,
        messageText,
        senderType,
        receiverType,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error sending message:", error.message);
      throw error;
    }
  }

  static async getMessage(req) {
    try {
      const { senderID, receiverID } = req.params;
      const connection = await connectDB();
      const [rows] = await connection.execute(
        `SELECT messageID, senderID, receiverID, messageText, timestamp, senderType, receiverType
         FROM Messages
         WHERE (senderID = ? AND receiverID = ?)
            OR (senderID = ? AND receiverID = ?)
         ORDER BY timestamp ASC`,
        [senderID, receiverID, receiverID, senderID]
      ); 
      return rows;
    } catch (error) {
      console.error("Error getting messages:", error.message);
      throw error;
    }
  }
}

module.exports = Message;
