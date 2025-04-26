const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sql = require("mysql2/promise");
const dotenv = require("dotenv");
const connectDB = require("../config/db");

dotenv.config();

class Student {
  constructor({ userID, studentID, grade, school }) {
    this.userID = userID;
    this.studentID = studentID;
    this.grade = grade;
    this.school = school;
  }
  static async getListStudentByIds(StudentIDs) {
    const connection = await connectDB();
    const placeholders = StudentIDs.map(() => "?").join(",");
    const [rows] = await connection.execute(
      `SELECT s.*, u.fullName, u.email, u.avatar, u.phone, u.address 
       FROM Students s
       JOIN Users u ON s.userID = u.userID 
       WHERE s.studentID IN (${placeholders})`,
      StudentIDs
    );
    return rows;
  }

  static async getAllStudents() {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Students s
       JOIN Users u ON s.userID = u.userID
       ORDER BY s.studentID ASC`
    );
    return rows;
  }
  // Kiểm tra yêu cầu đăng ký tồn tại
  static async checkExistingEnrollRequest(classID, studentID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM StudentEnrollmentRequests 
     WHERE classID = ? AND studentID = ? AND status = 'Pending'`,
      [classID, studentID]
    );
    return rows.length > 0;
  }

  // Tạo yêu cầu đăng ký mới
  static async createEnrollmentRequest(classID, studentID, message) {
    const connection = await connectDB();
    await connection.execute(
      `INSERT INTO StudentEnrollmentRequests (classID, studentID, message, status) 
     VALUES (?, ?, ?, 'Pending')`,
      [classID, studentID, message]
    );

    // Lấy thông tin chi tiết về yêu cầu đăng ký vừa tạo
    const [rows] = await connection.execute(
      `SELECT r.*, c.className, u.fullName as studentName, 
            t.tutorID, tu.fullName as tutorName
     FROM StudentEnrollmentRequests r
     JOIN Classes c ON r.classID = c.classID
     JOIN Students s ON r.studentID = s.studentID
     JOIN Users u ON s.userID = u.userID
     JOIN Tutors t ON c.tutorID = t.tutorID
     JOIN Users tu ON t.userID = tu.userID
     WHERE r.classID = ? AND r.studentID = ? 
     ORDER BY r.requestDate DESC LIMIT 1`,
      [classID, studentID]
    );

    return rows[0];
  }

  // Lấy danh sách tất cả các yêu cầu đăng ký
  static async getAllEnrollmentRequests() {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT r.*, c.className, u.fullName as studentName, 
            t.tutorID, tu.fullName as tutorName
     FROM StudentEnrollmentRequests r
     JOIN Classes c ON r.classID = c.classID
     JOIN Students s ON r.studentID = s.studentID
     JOIN Users u ON s.userID = u.userID
     JOIN Tutors t ON c.tutorID = t.tutorID
     JOIN Users tu ON t.userID = tu.userID
     ORDER BY r.requestDate DESC`
    );
    return rows;
  }

  // Xử lý yêu cầu đăng ký
  static async handleEnrollmentRequest(requestID, status, adminComment) {
    const connection = await connectDB();

    // Cập nhật trạng thái yêu cầu
    await connection.execute(
      `UPDATE StudentEnrollmentRequests 
     SET status = ?, adminComment = ? 
     WHERE requestID = ?`,
      [status, adminComment || null, requestID]
    );

    // Nếu được chấp nhận, thực hiện đăng ký cho học sinh
    if (status === 'Accept') {
      const [requestData] = await connection.execute(
        `SELECT classID, studentID FROM StudentEnrollmentRequests WHERE requestID = ?`,
        [requestID]
      );

      if (requestData.length > 0) {
        const { classID, studentID } = requestData[0];
        await this.enrollClasses(classID, studentID);
      }
    }

    return { requestID, status };
  }

  static async createStudentID() {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Students ORDER BY CAST(SUBSTRING(studentID, 2) AS UNSIGNED) DESC`
    );
    if (!rows[0]) {
      return "S1";
    } else {
      let lastID = rows[0].studentID.toString(); // Ensure lastID is a string
      const alphabet = lastID.match(/[A-Za-z]+/)[0];
      const number = parseInt(lastID.match(/\d+/)[0]) + 1;
      return alphabet + number;
    }
  }

  static async createStudent(userId, studentData) {
    const connection = await connectDB();
    try {
      await connection.beginTransaction();

      // Verify that the user exists
      const [userRows] = await connection.execute(
        "SELECT * FROM Users WHERE userID = ?",
        [userId]
      );

      if (!userRows[0]) {
        throw new Error("User not found");
      }

      const studentID = await this.createStudentID();

      await connection.execute(
        `INSERT INTO Students (userID, studentID, grade, school) VALUES (?, ?, ?, ?)`,
        [userId, studentID, studentData.grade, studentData.school]
      );

      // Verify the student was created
      const [studentRows] = await connection.execute(
        "SELECT * FROM Students WHERE userID = ?",
        [userId]
      );

      if (!studentRows[0]) {
        throw new Error("Failed to create student record");
      }

      await connection.commit();
      return new Student({ userID: userId, studentID, ...studentData });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  static async updateStudent(userID, studentData) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `UPDATE Students SET grade = ?, school = ? WHERE userID = ?`,
      [studentData.grade, studentData.school, userID]
    );
    return rows.affectedRows > 0
      ? await this.findStudentByUserID(userID)
      : null;
  }

  static async sendRequestToTutor(tutorID, studentID, message) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `INSERT INTO Requests (tutorID, studentID, message) VALUES (?, ?, ?)`,
      [tutorID, studentID, message]
    );
    return { tutorID, studentID, message };
  }

  static async getRequest(studentID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Requests WHERE studentID = ?`,
      [studentID]
    );
    return rows;
  }

  static async findStudentByID(studentID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Students WHERE studentID = ?`,
      [studentID]
    );
    return rows[0];
  }

  static async findStudentByUserID(userID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Students WHERE userID = ?`,
      [userID]
    );
    return rows[0];
  }

  static async findClassByTutorName(search) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Classes WHERE tutorID IN (
         SELECT tutorID FROM Tutors WHERE userID IN (
           SELECT userID FROM Users WHERE fullName LIKE ?
         )
       )`,
      ["%" + search + "%"]
    );
    return rows;
  }

  static async findClassByName(name) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Classes WHERE className LIKE ?`,
      ["%" + name + "%"]
    );
    return rows;
  }

  static async findClassByID(classID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Classes WHERE classID = ?`,
      [classID]
    );
    return rows[0];
  }

  static async enrollClasses(classID, studentID) {
    const connection = await connectDB();

    try {
      // Kiểm tra xem bản ghi đã tồn tại chưa
      const [existingRows] = await connection.execute(
        `SELECT * FROM Class_Students WHERE classID = ? AND studentID = ?`,
        [classID, studentID]
      );

      if (existingRows.length > 0) {
        // Nếu bản ghi đã tồn tại, cập nhật trạng thái thành 'Active'
        await connection.execute(
          `UPDATE Class_Students SET status = 'Active' WHERE classID = ? AND studentID = ?`,
          [classID, studentID]
        );
      } else {
        // Nếu bản ghi chưa tồn tại, thêm mới
        await connection.execute(
          `INSERT INTO Class_Students (classID, studentID, status) VALUES (?, ?, 'Active')`,
          [classID, studentID]
        );
      }

      return await this.findClassByID(classID);
    } catch (error) {
      console.error("Error in enrollClasses:", error);
      throw error;
    }
  }

  static async unEnrollClasses(classID, studentID) {
    const connection = await connectDB();
    await connection.execute(
      `UPDATE Class_Students SET status = 'Dropped' WHERE classID = ? AND studentID = ?`,
      [classID, studentID]
    );
    return await this.findClassByID(classID);
  }

  // Kiểm tra xem học sinh có đăng ký vào lớp học không
  static async checkStudentEnrolled(classID, studentID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Class_Students WHERE classID = ? AND studentID = ? AND status = 'Active'`,
      [classID, studentID]
    );
    return rows.length > 0;
  }

  static async getFeedbackByClass(classID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT f.*, u.fullName as studentName, u.avatar as studentAvatar
       FROM Feedbacks f
       JOIN Students s ON f.studentID = s.studentID
       JOIN Users u ON s.userID = u.userID
       WHERE f.classID = ?
       ORDER BY f.feedbackDate DESC`,
      [classID]
    );
    return rows;
  }

  static async updateExistingFeedback(tutorID, studentID, classID, message, rating, date) {
    const connection = await connectDB();

    // Cập nhật feedback hiện có
    await connection.execute(
      `UPDATE Feedbacks 
       SET message = ?, rating = ?, feedbackDate = ? 
       WHERE tutorID = ? AND studentID = ? AND classID = ?`,
      [message, rating, date, tutorID, studentID, classID]
    );

    // Cập nhật rating trung bình của tutor
    const [avgRows] = await connection.execute(
      `SELECT ROUND(AVG(rating), 1) AS avg_rating FROM Feedbacks WHERE tutorID = ?`,
      [tutorID]
    );

    const avgRating = avgRows[0]?.avg_rating?.toString() || "0.0";
    await connection.execute(`UPDATE Tutors SET rating = ? WHERE tutorID = ?`, [
      avgRating,
      tutorID,
    ]);

    return { tutorID, studentID, classID, message, rating, date };
  }


  // Kiểm tra xem học sinh đã gửi feedback cho lớp học chưa
  static async checkExistingFeedback(classID, studentID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Feedbacks WHERE classID = ? AND studentID = ?`,
      [classID, studentID]
    );
    return {
      exists: rows.length > 0,
      data: rows.length > 0 ? rows[0] : null
    };
  }

  static async updateFeedback(tutorID, studentID, classID, message, rating) {
    const connection = await connectDB();

    await connection.execute(
      `UPDATE Feedbacks 
       SET message = ?, rating = ?
       WHERE classID = ? AND studentID = ?`,
      [message, rating, classID, studentID]
    );

    // Cập nhật rating trung bình của tutor
    await this.updateTutorRating(tutorID);

    return { tutorID, studentID, classID, message, rating };
  }

  // Cập nhật rating của tutor
  static async updateTutorRating(tutorID) {
    const connection = await connectDB();
    const [avgRows] = await connection.execute(
      `SELECT ROUND(AVG(rating), 1) AS avg_rating FROM Feedbacks WHERE tutorID = ?`,
      [tutorID]
    );
    const avgRating = avgRows[0]?.avg_rating?.toString() || "0.0";
    await connection.execute(
      `UPDATE Tutors SET rating = ? WHERE tutorID = ?`,
      [avgRating, tutorID]
    );
    return avgRating;
  }

  static async sendFeedback(classroom, studentID, message, rating) {
    const connection = await connectDB();
    // Kiểm tra feedback đã tồn tại chưa
    const feedbackCheck = await this.checkExistingFeedback(classroom.classID, studentID);

    if (feedbackCheck.exists) {
      // Nếu đã tồn tại, cập nhật feedback
      return await this.updateFeedback(
        classroom.tutorID,
        studentID,
        classroom.classID,
        message,
        rating
      );
    }

    await connection.execute(
      `INSERT INTO Feedbacks (tutorID, studentID, classID, message, rating) VALUES (?, ?, ?, ?, ?)`,
      [
        classroom.tutorID,
        studentID,
        classroom.classID,
        message,
        rating,
      ]
    );
    const [avgRows] = await connection.execute(
      `SELECT ROUND(AVG(rating), 1) AS avg_rating FROM Feedbacks WHERE tutorID = ?`,
      [classroom.tutorID]
    );
    const avgRating = avgRows[0]?.avg_rating?.toString() || "0.0";
    await connection.execute(`UPDATE Tutors SET rating = ? WHERE tutorID = ?`, [
      avgRating,
      classroom.tutorID,
    ]);
    return { classroom, studentID, message, rating };
  }

  // Delete a student and all associated data
  static async deleteStudent(userID) {
    const connection = await connectDB();
    try {
      await connection.beginTransaction();

      const [[student]] = await connection.execute(
        `SELECT studentID FROM Students WHERE userID = ?`,
        [userID]
      );

      if (!student) {
        throw new Error("Student not found");
      }

      const studentID = student.studentID;

      // Delete blogs first
      await connection.execute(`DELETE FROM Blogs WHERE student_id = ?`, [
        userID,
      ]);

      // Delete feedbacks
      await connection.execute(`DELETE FROM Feedbacks WHERE studentID = ?`, [
        studentID,
      ]);

      // Delete messages
      await connection.execute(
        `DELETE FROM Messages WHERE senderID = ? OR receiverID = ?`,
        [userID, userID]
      );

      // Delete requests
      await connection.execute(`DELETE FROM Requests WHERE studentID = ?`, [
        studentID
      ]);

      // Delete complains
      await connection.execute(`DELETE FROM Complains WHERE uID = ?`, [userID]);

      // Delete student record
      const [result] = await connection.execute(
        `DELETE FROM Students WHERE userID = ?`,
        [userID]
      );

      // Unenroll from classes
      await connection.execute(`DELETE FROM Class_Students WHERE studentID = ?`, [
        studentID
      ]);

      // Delete user record
      await connection.execute(`DELETE FROM Users WHERE userID = ?`, [userID]);

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  static async getClassesByStudentID(studentID) {
    try {
      const connection = await connectDB();
      const [classes] = await connection.execute(
        `
        SELECT 
          c.classID, c.className, c.videoLink, c.subject, c.tutorID,
          t.userID, u.fullName AS tutorFullName, c.paymentID,
          c.length, c.available, c.type, c.description, c.price,
          t.rating, c.isActive, cs.enrolledAt, cs.status
        FROM Classes c
        JOIN Tutors t ON c.tutorID = t.tutorID
        JOIN Users u ON t.userID = u.userID
        JOIN Class_Students cs ON c.classID = cs.classID
        WHERE cs.studentID = ? AND cs.status = 'Active'
      `,
        [studentID]
      );
      return classes;
    } catch (error) {
      console.error("Error getting classes by student ID:", error);
      throw error;
    }
  }
}



module.exports = Student;
