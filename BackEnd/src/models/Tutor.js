const sql = require("mysql2/promise");
const dotenv = require("dotenv");
const connectDB = require("../config/db");


dotenv.config();

class Tutor {
  constructor({ userID, tutorID, degrees, identityCard, workplace, description }) {
    this.userID = userID;
    this.tutorID = tutorID;
    this.degrees = degrees;
    this.identityCard = identityCard;
    this.workplace = workplace;
    this.description = description;
  }

  // Create a new tutor profile
  static async createTutor(userID, tutorData) {
    const connection = await connectDB();
    const tutorID = await this.createTutorID();
    await connection.execute(
      `INSERT INTO Tutors (userID, tutorID, degrees, identityCard, workplace, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userID, tutorID, tutorData.degrees, tutorData.identityCard, tutorData.workplace, tutorData.description]
    );
    return new Tutor({ userID, tutorID, ...tutorData });
  }

  // Update tutor information
  static async updateTutor(userID, tutorData) {
    const connection = await connectDB();
    await connection.execute(
      `UPDATE Tutors SET degrees = ?, identityCard = ?, workplace = ?, description = ? WHERE userID = ?`,
      [tutorData.degrees, tutorData.identityCard, tutorData.workplace, tutorData.description, userID]
    );
    return this.findTutorByTutorUserID(userID);
  }

  // Get tutor information by userID
  static async getTutor(userID) {
    const connection = await connectDB();
    const [[user]] = await connection.execute(`SELECT * FROM Users WHERE userID = ?`, [userID]);
    const [[tutor]] = await connection.execute(`SELECT * FROM Tutors WHERE userID = ?`, [userID]);
    return { ...user, ...tutor };
  }

  // Find classroom by classroomID
  static async findClassroom(classroomID) {
    const connection = await connectDB();
    const [[result]] = await connection.execute(`SELECT * FROM Classes WHERE classID = ?`, [classroomID]);
    return result;
  }

  // Find all classes taught by a tutor
  static async findClassByTutorID(tutorID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(`SELECT * FROM Classes WHERE tutorID = ?`, [tutorID]);
    return rows;
  }

  // Find tutor by tutorID
  static async findTutorByTutorID(tutorID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(`SELECT * FROM Tutors WHERE tutorID = ?`, [tutorID]);
    return rows;
  }

  // Find tutor by userID
  static async findTutorByTutorUserID(userID) {
    const connection = await connectDB();
    const [[result]] = await connection.execute(`SELECT * FROM Tutors WHERE userID = ?`, [userID]);
    return result;
  }

  // Generate a new class ID
  // static async createClassID() {
  //   const connection = await connectDB();
  //   const [rows] = await connection.execute(
  //     `SELECT * FROM Classes ORDER BY CAST(SUBSTRING(classID, 2) AS UNSIGNED) DESC`
  //   );
  //   if (!rows.length) return "C1";
  //   const id = rows[0].classID;
  //   console.log('abcc',rows)
  //   const prefix = id.match(/[A-Za-z]+/)[0];
  //   const number = parseInt(id.match(/\d+/)[0]) + 1;
  //   return prefix + number;
  // }

  // Create a new class
  static async createClass(classroom) {
    const connection = await connectDB();
    // const classID = await this.createClassID();
    const [result] = await connection.execute(
      `INSERT INTO Classes (subject, length, available, type, description, price, tutorID, className, videoLink)
       VALUES (?,  ?, ?, ?, ?, ?, ?, ?, ?)`,
      [classroom.subject, classroom.length,
      classroom.available, classroom.type, classroom.description, classroom.price,
      classroom.tutorID, classroom.className, classroom.videoLink]
    );
    return { ...classroom, ...{ classID: result.insertId } };
  }

  // Update class information
  static async updateClass(classroom, classID) {
    const connection = await connectDB();
    await connection.execute(
      `UPDATE Classes SET subject = ?, length = ?, available = ?, type = ?,
       description = ?, price = ?, tutorID = ?, className = ?, videoLink = ? WHERE classID = ?`,
      [classroom.subject, classroom.length, classroom.available,
      classroom.type, classroom.description, classroom.price, classroom.tutorID,
      classroom.className, classroom.videoLink, classID]
    );
    return this.findClassroom(classID);
  }

  // Delete a class by setting isActive to 0
  static async deleteClass(classID) {
    const connection = await connectDB();
    await connection.execute(`UPDATE Classes SET isActive = 0 WHERE classID = ?`, [classID]);
    return this.findClassroom(classID);
  }

  // Activate a class by setting isActive to 1
  static async activeClasses(classID) {
    const connection = await connectDB();
    await connection.execute(`UPDATE Classes SET isActive = 1 WHERE classID = ?`, [classID]);
    return this.findClassroom(classID);
  }

  // Find tutors by name
  static async findTutorByName(search = "") {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT Tutors.*, Users.fullName
       FROM Tutors
       JOIN Users ON Tutors.userID = Users.userID
       WHERE Users.fullName LIKE ? AND Users.isActive = 1`,
      ["%" + search + "%"]
    );
    return rows;
  }

  // Get all requests for a tutor
  static async getRequest(tutorID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(`SELECT * FROM Requests WHERE tutorID = ?`, [tutorID]);
    return rows;
  }

  // Get a specific request by ID
  static async getRequestByID(requestID) {
    const connection = await connectDB();
    const [[result]] = await connection.execute(`SELECT * FROM Requests WHERE requestID = ?`, [requestID]);
    return result;
  }

  // Delete a request by ID
  static async deleteRequest(requestID) {
    const connection = await connectDB();
    const [result] = await connection.execute(`DELETE FROM Requests WHERE requestID = ?`, [requestID]);
    return result.affectedRows > 0;
  }

  // Update tutor status
  static async updateTutorStatus(userID, status) {
    const connection = await connectDB();
    const [result] = await connection.execute(
      `UPDATE Tutors SET status = ? WHERE userID = ?`,
      [status, userID]
    );
    return result.affectedRows > 0;
  }

  // Check tutor status
  static async checkTutorStatus(userID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT status FROM Tutors WHERE userID = ?`,
      [userID]
    );
    return rows[0]?.status;
  }

  static async deleteTutor(userID) {
    const connection = await connectDB();
    try {
      // Start a transaction
      await connection.beginTransaction();

      // Get tutorID first
      const [[tutor]] = await connection.execute(
        `SELECT tutorID FROM Tutors WHERE userID = ?`,
        [userID]
      );

      if (!tutor) {
        throw new Error('Tutor not found');
      }

      const tutorID = tutor.tutorID;

      // 1. Delete all feedbacks for tutor
      await connection.execute(
        `DELETE FROM Feedbacks WHERE tutorID = ?`,
        [tutorID]
      );

      // 2. Delete all messages related to tutor
      await connection.execute(
        `DELETE FROM Messages WHERE senderID = ? OR receiverID = ?`,
        [userID, userID]
      );

      // 4. Delete all classes of tutor
      await connection.execute(
        `DELETE FROM Classes WHERE tutorID = ?`,
        [tutorID]
      );

      // 5. Delete all requests to/from tutor
      await connection.execute(
        `DELETE FROM Requests WHERE tutorID = ?`,
        [tutorID]
      );

      // 6. Delete all tutor requests
      await connection.execute(
        `DELETE FROM TutorRequests WHERE tutorID = ?`,
        [tutorID]
      );

      // 7. Delete all complains from tutor
      await connection.execute(
        `DELETE FROM Complains WHERE uID = ?`,
        [userID]
      );

      // 8. Delete tutor record
      const [result] = await connection.execute(
        `DELETE FROM Tutors WHERE userID = ?`,
        [userID]
      );

      // 9. Delete user account
      await connection.execute(
        `DELETE FROM Users WHERE userID = ?`,
        [userID]
      );

      // Commit the transaction
      await connection.commit();

      return result.affectedRows > 0;
    } catch (error) {
      // Rollback the transaction in case of error
      await connection.rollback();
      throw error;
    }
  }
}

module.exports = Tutor;