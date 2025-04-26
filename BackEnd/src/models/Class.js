const sql = require("mysql2/promise");
const connectDB = require("../config/db");

class Classroom {
  // Get all feedbacks for a specific class including student information
  static async getFeedback(classID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `
      SELECT
        f.feedbackID,
        f.tutorID,
        f.classID,
        u.fullName AS studentName,
        u.avatar as studentAvatar,
        f.feedbackDate as date,
        f.message,
        f.rating
      FROM Feedbacks f
      JOIN Students s ON f.studentID = s.studentID
      JOIN Users u ON s.userID = u.userID
      WHERE f.classID = ?`,
      [classID]
    );
    return rows;
  }

  static async getDocumentsByClassID(classID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Class_Documents WHERE classID = ?`,
      [classID]
    );
    return rows;
  }

  static async insertDocument(classID, documentTitle, documentLink, description) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `INSERT INTO Class_Documents (classID, documentTitle, documentLink, description) VALUES (?, ?, ?, ?)`,
      [classID, documentTitle, documentLink, description]
    );
    return rows;
  }

  static async deleteDocument(documentID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `DELETE FROM Class_Documents WHERE documentID = ?`,
      [documentID]
    );
    return rows;
  }

  static async updateDocument(documentID, documentTitle, documentLink, description) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `UPDATE Class_Documents SET documentTitle = ?, documentLink = ?, description = ?  WHERE documentID = ?`,
      [documentTitle, documentLink, description, documentID]
    );
    return rows;
  }

  static async getDocumentByID(documentID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Class_Documents WHERE documentID = ?`,
      [documentID]
    );
    return rows[0];
  }


  static async getStudentByClassID(classID) {
    const connection = await connectDB();
    const [studentRows] = await connection.execute(
      `SELECT studentID FROM Class_Students WHERE classID = ?`,
      [classID]
    );

    if (studentRows.length === 0) {
      return []; // Return empty array if no students found
    }

    const studentIDs = studentRows.map((row) => row.studentID);

    // Use parameterized query to avoid SQL injection and syntax errors
    const placeholders = studentIDs.map(() => '?').join(',');
    const [rows] = await connection.execute(
      `SELECT * FROM Students WHERE studentID IN (${placeholders})`,
      [...studentIDs]
    );

    return rows;
  }

  // Get all active classes with tutor information
  static async getAllClass() {
    const connection = await connectDB();
    const [rows] = await connection.execute(`
      SELECT 
        c.classID, c.className, c.videoLink, c.subject, c.tutorID,
        t.userID, u.fullName AS tutorFullName, c.paymentID,
        c.length, c.available, c.type, c.description, c.price,
        t.rating, c.isActive,
        GROUP_CONCAT(DISTINCT cs.studentID) as studentIDs,
        COUNT(DISTINCT cs.studentID) as studentCount
      FROM Classes c
      JOIN Tutors t ON c.tutorID = t.tutorID
      JOIN Users u ON t.userID = u.userID
      LEFT JOIN Class_Students cs ON c.classID = cs.classID
      WHERE c.isActive = 1
      GROUP BY c.classID;
    `);
    return rows;
  }

  // Get all classes including inactive ones with tutor information
  static async getAllClassExisted() {
    const connection = await connectDB();
    const [rows] = await connection.execute(`
      SELECT 
        c.classID, c.className, c.videoLink, c.subject, c.tutorID,
        t.userID, u.fullName AS tutorFullName, c.paymentID,
        c.length, c.available, c.type, c.description, c.price,
        t.rating, c.isActive,
        GROUP_CONCAT(DISTINCT cs.studentID) as studentIDs
      FROM Classes c
      JOIN Tutors t ON c.tutorID = t.tutorID
      JOIN Users u ON t.userID = u.userID
      LEFT JOIN Class_Students cs ON c.classID = cs.classID
      GROUP BY c.classID;
    `);
    return rows;
  }

  static async getClassByUserID(userID) {
    const connection = await connectDB();
    const [user] = await connection.execute(
      `
      SELECT * FROM Users WHERE userID = ?
    `,
      [userID]
    );
    if (user[0].role === "Student") {
      const [student] = await connection.execute(
        `
        SELECT * FROM Students WHERE userID = ?
      `,
        [userID]
      );
      const [classRowsID] = await connection.execute(
        `
        SELECT classID FROM Class_Students WHERE studentID = ?
      `,
        [student[0].studentID]
      );
      const classIDs = classRowsID.map((row) => row.classID).join(",");
      const [classRows] = await connection.execute(
        `
        SELECT * FROM Classes WHERE classID IN (${classIDs})
      `
      );
      return classRows;
    } else if (user[0].role === "Tutor") {
      const [tutor] = await connection.execute(
        `
        SELECT * FROM Tutors WHERE userID = ?
      `,
        [userID]
      );

      const [classRows] = await connection.execute(
        `
        SELECT * FROM Classes WHERE tutorID = ?
      `,
        [tutor[0].tutorID]
      );
      return classRows;
    }
  }

  // Get detailed information of a specific class by classID
  static async getClassroom(classID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `
      SELECT 
        c.classID, c.className, c.videoLink, c.subject, c.tutorID,
        t.userID, u.fullName AS tutorFullName, c.paymentID,
        c.length, c.available, c.type, c.description, c.price,
        t.rating, c.isActive,
        GROUP_CONCAT(DISTINCT cs.studentID) as studentIDs
      FROM Classes c
      JOIN Tutors t ON c.tutorID = t.tutorID
      JOIN Users u ON t.userID = u.userID
      LEFT JOIN Class_Students cs ON c.classID = cs.classID
      WHERE c.classID = ?
      GROUP BY c.classID;
    `,
      [classID]
    );
    return rows[0];
  }

  // Search for classes by subject name
  static async findClassroomBySubject(subject) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `
      SELECT 
        c.classID, c.className, c.videoLink, c.subject, c.tutorID,
        t.userID, u.fullName AS tutorFullName, c.paymentID,
        c.length, c.available, c.type, c.description, c.price,
        t.rating, c.isActive
      FROM Classes c
      JOIN Tutors t ON c.tutorID = t.tutorID
      JOIN Users u ON t.userID = u.userID
      WHERE c.subject LIKE ?;
    `,
      [`%${subject}%`]
    );
    return rows;
  }

  // Get student information enrolled in a specific class
  static async viewStudent(classID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `
      SELECT Students.studentID, fullName, Students.grade, Students.school
      FROM Users
      JOIN Students ON Users.userID = Students.userID
      WHERE Students.studentID = (
        SELECT studentID FROM Classes WHERE classID = ?
      );
    `,
      [classID]
    );
    return rows[0];
  }

  // Delete a class by classID and return the deleted class information
  static async DeleteClass(classID) {
    const connection = await connectDB();
    const existing = await this.getClassroom(classID);

    // Start a transaction
    await connection.beginTransaction();

    try {
      // First delete related feedbacks
      await connection.execute(`DELETE FROM Feedbacks WHERE classID = ?`, [
        classID,
      ]);

      // Then delete related blog entries
      await connection.execute(`DELETE FROM Blogs WHERE class_id = ?`, [
        classID,
      ]);

      // Finally delete the class
      const [result] = await connection.execute(
        `DELETE FROM Classes WHERE classID = ?`,
        [classID]
      );

      // Commit the transaction
      await connection.commit();

      return result.affectedRows > 0 ? existing : null;
    } catch (error) {
      // If anything fails, rollback the transaction
      await connection.rollback();
      throw error;
    }
  }

  // Create a new class and validate tutor status
  static async CreateClass(classroom) {
    const connection = await connectDB();

    // Check tutor status first
    const [tutorStatus] = await connection.execute(
      `SELECT status FROM Tutors WHERE userID = ?`,
      [classroom.tutorID]
    );

    if (!tutorStatus[0] || tutorStatus[0].status !== "Approved") {
      throw new Error("Tutor account is not approved for creating classes");
    }

    const [result] = await connection.execute(
      `INSERT INTO Classes (className, tutorID, subject, grade, description, maxStudent, price, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        classroom.className,
        classroom.tutorID,
        classroom.subject,
        classroom.grade,
        classroom.description,
        classroom.maxStudent,
        classroom.price,
        classroom.schedule,
      ]
    );
    return { classID: result.insertId, ...classroom };
  }

  static async GetClassByStudentId(studentID) {
    const connection = await connectDB();

    if (!studentID) {
      throw new Error("Student ID is required");
    }

    try {
      const [classes] = await connection.execute(
        `
        SELECT c.*, t.userID, u.fullName AS tutorFullName, t.rating
        FROM Classes c
        JOIN Class_Students cs ON c.classID = cs.classID
        JOIN Tutors t ON c.tutorID = t.tutorID
        JOIN Users u ON t.userID = u.userID
        WHERE cs.studentID = ? AND cs.status = 'Active'
        `,
        [studentID]
      );
      return classes;
    } catch (error) {
      throw new Error(`Failed to retrieve classes: ${error.message}`);
    }
  }

  static async GetClassByTutor(tutorID) {
    const connection = await connectDB();

    if (!tutorID) {
      throw new Error("Tutor ID is required");
    }

    try {
      const [classes] = await connection.execute(
        `
        SELECT c.*, t.userID, u.fullName AS tutorFullName, t.rating
        FROM Classes c
        JOIN Tutors t ON c.tutorID = t.tutorID
        JOIN Users u ON t.userID = u.userID
        WHERE c.tutorID = ? AND c.isActive = 1
        `,
        [tutorID]
      );
      return classes;
    } catch (error) {
      throw new Error(`Failed to retrieve classes: ${error.message}`);
    }
  }

  static async findStudentsInClass(classID) {
    const connection = await connectDB();
    try {
      const [rows] = await connection.execute(
        `SELECT s.*, u.fullName, u.email, u.avatar, cs.enrolledAt, cs.status
         FROM Students s
         JOIN Users u ON s.userID = u.userID
         JOIN Class_Students cs ON s.studentID = cs.studentID
         WHERE cs.classID = ? AND cs.status = 'Active'`,
        [classID]
      );
      return rows;
    } catch (error) {
      console.error("Error finding students in class:", error);
      throw error;
    }
  }

  static async findClassByID(classID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Classes WHERE classID = ?`,
      [classID]
    );
    return rows[0];
  }

  static async enrollStudent(classID, studentID) {
    const connection = await connectDB();
    try {
      await connection.execute(
        `INSERT INTO Class_Students (classID, studentID, status) 
         VALUES (?, ?, 'Active')`,
        [classID, studentID]
      );
      return true;
    } catch (error) {
      console.error("Error enrolling student:", error);
      throw error;
    }
  }

  static async unenrollStudent(classID, studentID) {
    const connection = await connectDB();
    try {
      await connection.execute(
        `UPDATE Class_Students 
         SET status = 'Dropped' 
         WHERE classID = ? AND studentID = ?`,
        [classID, studentID]
      );
      return true;
    } catch (error) {
      console.error("Error unenrolling student:", error);
      throw error;
    }
  }

  static async isStudentEnrolled(classID, studentID) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM Class_Students 
       WHERE classID = ? AND studentID = ? AND status = 'Active'`,
      [classID, studentID]
    );
    return rows.length > 0;
  }

  static async assignStudentsToClass(classID, studentIDs) {
    const connection = await connectDB();
    try {
      // Start a transaction
      await connection.beginTransaction();

      for (const studentID of studentIDs) {
        // Check if student is already enrolled
        const [existing] = await connection.execute(
          `SELECT * FROM Class_Students WHERE classID = ? AND studentID = ?`,
          [classID, studentID]
        );

        if (existing.length === 0) {
          await connection.execute(
            `INSERT INTO Class_Students (classID, studentID, status) 
             VALUES (?, ?, 'Active')`,
            [classID, studentID]
          );
        }
      }

      // Commit the transaction
      await connection.commit();
      return true;
    } catch (error) {
      // Rollback the transaction in case of error
      await connection.rollback();
      console.error("Error assigning students to class:", error);
      return false;
    }
  }
}

module.exports = Classroom;
