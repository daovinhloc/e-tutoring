const sql = require("mssql");
const connectDB = require("../config/db");

class Message {
  // Send a new message between users with sender and receiver types
  static async sendMessage(message) {
    try {
      const connection = await connectDB();
      const result = await connection
        .request()
        .input("senderID", sql.Int, message.senderID)
        .input("receiverID", sql.Int, message.receiverID)
        .input("messageText", sql.NVarChar, message.messageText)
        .input("senderType", sql.NVarChar, message.senderType)
        .input("receiverType", sql.NVarChar, message.receiverType).query(`
          INSERT INTO Messages (senderID, receiverID, messageText, senderType, receiverType)
          OUTPUT inserted.*
          VALUES (@senderID, @receiverID, @messageText, @senderType, @receiverType)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error("Error sending message:", error.message);
      throw error;
    }
  }

  // Get all messages between two users ordered by timestamp
  static async getMessage(senderID, receiverID) {
    const connection = await connectDB();
    const result = await connection
      .request()
      .input("userID1", sql.Int, senderID)
      .input("userID2", sql.Int, receiverID)
      .query(
        `SELECT messageID, senderID, receiverID, messageText, timestamp, senderType, receiverType
        FROM Messages
        WHERE (senderID = @userID1 AND receiverID = @userID2)
        OR (senderID = @userID2 AND receiverID = @userID1)
        ORDER BY timestamp ASC;`
      );
    return result.recordset;
  }
}

module.exports = Message;
