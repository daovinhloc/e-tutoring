const Classroom = require("../models/Class");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const connectDB = require("../config/db");

class studentController {
  static getAllStudents = async (req, res) => {
    try {
      const students = await Student.getAllStudents();
      if (!students) {
        return res.status(404).json({
          message: "No students found",
        });
      }
      res.status(200).json({
        message: "Get all students success",
        data: students,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "error in get all students",
        error,
      });
    }
  }

  static requestClass = async (req, res) => {
    try {
      const tutorID = req.params.tutorID;
      if (!tutorID) {
        return res.status(404).json({
          message: "Please provide tutor id",
        });
      }
      const tutor = Tutor.findTutorByTutorID(tutorID);
      if (!tutor) {
        return res.status(404).json({
          message: "Cannot find Tutor",
        });
      }

      const { studentID, message } = req.body;

      const data = await Student.sendRequestToTutor(
        tutorID,
        studentID,
        message
      );
      if (!data) {
        return res.status(404).json({
          message: "Cannot send request",
        });
      }

      res.status(200).json({
        message: "Request sent",
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "error in send request class to tutor",
        error,
      });
    }
  };

  static viewRequest = async (req, res) => {
    try {
      const studentID = req.params.studentID;
      if (!studentID) {
        return res.status(404).json({
          message: "Please provide student id",
        });
      }
      const student = Student.findStudentByID(studentID);
      if (!student) {
        return res.status(404).json({
          message: "Cannot find Student",
        });
      }

      const data = await Student.getRequest(studentID);
      if (!data) {
        return res.status(404).json({
          message: "Cannot get request",
        });
      }

      res.status(200).json({
        message: "Request get success",
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "error in get request by tutor",
        error,
      });
    }
  };

  static checkEnrollStatus = async (req, res) => {
    try {
      const classID = req.params.id;
      const classroom = await Classroom.getClassroom(classID);
      if (classroom.studentID) {
        return res.status(200).json({
          message: "The class already have a student",
          studentID: classroom.studentID,
          status: true,
        });
      } else {
        return res.status(200).json({
          message: "The class is not have student",
          status: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Cannot check enroll status",
      });
    }
  };

  static findTutorByTutorNameController = async (req, res) => {
    try {
      const search = req.params.search;
      const data = await Tutor.findTutorByName(search);
      if (!data) {
        return res.status(404).json({
          message: "Cannot search for tutor",
        });
      }

      return res.status(200).json({
        message: "Search successfully",
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "error in search class by tutor name",
        error,
      });
    }
  };

  static findClassByTutorNameController = async (req, res) => {
    try {
      const search = req.params.search;
      const data = await Student.findClassByTutorName(search);
      if (!data) {
        return res.status(404).json({
          message: "Cannot search for class",
        });
      }

      return res.status(200).json({
        message: "Search successfully",
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "error in search class by tutor name",
        error,
      });
    }
  };

  static findClassByClassName = async (req, res) => {
    try {
      const search = req.params.search;
      const data = await Student.findClassByName(search);
      if (!data) {
        return res.status(404).json({
          message: "Cannot search for class",
        });
      }

      return res.status(200).json({
        message: "Search successfully",
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "error in search class by class name",
        error,
      });
    }
  };

  static getTutor = async (req, res) => {
    try {
      const search = req.params.search;
      const data = await Tutor.findTutorByName(search);
      if (!data) {
        return res.status(404).json({
          message: "Cannot found tutor",
        });
      }
      return res.status(200).json({
        message: "Searched tutor",
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "error in get tutor",
        error,
      });
    }
  };

  static enrollClass = async (req, res) => {
    try {
      const classID = req.params.id;
      const { studentID, message } = req.body;

      const student = await Student.findStudentByID(studentID);
      if (!student) {
        return res.status(404).json({
          message: "Cannot found student",
        });
      }

      const classroom = await Student.findClassByID(classID);
      if (!classroom) {
        return res.status(404).json({
          message: "Cannot found class",
        });
      }

      if (!classroom.isActive) {
        return res.status(409).json({
          message: "Cannot enroll because the class is deleted",
        });
      }

      // Kiểm tra xem sinh viên đã có yêu cầu đang chờ xử lý cho lớp học này chưa
      const existingRequest = await Student.checkExistingEnrollRequest(classID, studentID);
      if (existingRequest) {
        return res.status(409).json({
          message: "You already have a pending enrollment request for this class",
        });
      }

      // Gửi yêu cầu đăng ký thay vì đăng ký trực tiếp
      const data = await Student.createEnrollmentRequest(classID, studentID, message || "");

      res.status(200).json({
        message: "Enrollment request sent successfully, awaiting admin approval",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in enrollment request",
        error,
      });
    }
  };

  static unEnrollClass = async (req, res) => {
    try {
      const classID = req.params.id;
      const { studentID } = req.body;
      if (!studentID) {
        return res.status(404).json({
          message: "Please provide student id",
        });
      }

      const student = await Student.findStudentByID(studentID);
      if (!student) {
        return res.status(404).json({
          message: "Cannot found student",
        });
      }

      const classroom = await Student.findClassByID(classID);
      if (classroom.studentID != studentID) {
        return res.status(409).json({
          message:
            "Cannot unenroll because you are not the student in that class",
        });
      }

      let data = await Student.unEnrollClasses(classID);
      if (!data) {
        return res.status(404).json({
          message: "Cannot unenroll!",
        });
      }
      res.status(200).json({
        message: "Unenroll class success",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "error in unenroll classes",
        error,
      });
    }
  };

  // Trong studentController.js
  static checkActiveEnrollment = async (req, res) => {
    try {
      const classID = req.params.classID;
      const studentID = req.params.studentID;

      if (!classID || !studentID) {
        return res.status(400).json({
          message: "Class ID and Student ID are required"
        });
      }

      const isActive = await Classroom.isStudentEnrolled(classID, studentID);

      return res.status(200).json({
        isActive: isActive
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Cannot check active enrollment status",
        error
      });
    }
  };

  // Kiểm tra feedback đã tồn tại
  static checkExistingFeedback = async (req, res) => {
    try {
      const classID = req.params.classID;
      const studentID = req.params.studentID;

      if (!classID || !studentID) {
        return res.status(400).json({
          message: "Class ID and Student ID are required"
        });
      }

      const connection = await connectDB();
      const [rows] = await connection.execute(
        `SELECT * FROM Feedbacks WHERE classID = ? AND studentID = ?`,
        [classID, studentID]
      );

      return res.status(200).json({
        exists: rows.length > 0,
        data: rows.length > 0 ? rows[0] : null
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error checking feedback existence",
        error
      });
    }
  };

  // Cập nhật feedback hiện có
  static updateFeedback = async (req, res) => {
    try {
      const classID = req.params.classID;
      const { studentID, message, rating } = req.body;
      const date = new Date().toISOString();

      const classroom = await Student.findClassByID(classID);

      // Cập nhật feedback
      const data = await Student.updateExistingFeedback(
        classroom.tutorID,
        studentID,
        classID,
        message,
        rating,
        date
      );

      if (!data) {
        return res.status(404).json({
          message: "Cannot update feedback!",
        });
      }

      res.status(200).json({
        message: "Feedback updated!",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error updating feedback",
        error,
      });
    }
  };

  static getFeedbackByClass = async (req, res) => {
    try {
      const classID = req.params.classID;

      if (!classID) {
        return res.status(400).json({
          message: "Class ID is required"
        });
      }

      const feedbacks = await Student.getFeedbackByClass(classID);

      return res.status(200).json({
        message: "Feedbacks retrieved successfully",
        data: feedbacks
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error retrieving feedbacks",
        error
      });
    }
  };

  static feedbackClass = async (req, res) => {
    try {
      const classID = req.params.classID;
      const { studentID, message, rating } = req.body;
      let { date } = req.body;

      if (!date) {
        date = new Date().toISOString();
      }

      const classroom = await Student.findClassByID(classID);
      if (!classroom) {
        return res.status(404).json({
          message: "Class not found",
        });
      }

      // Kiểm tra xem học sinh có đăng ký lớp này không (đã tách sang model)
      const isEnrolled = await Student.checkStudentEnrolled(classID, studentID);
      if (!isEnrolled) {
        return res.status(403).json({
          message: "You must be enrolled in this class to provide feedback",
        });
      }

      let data = await Student.sendFeedback(classroom, studentID, message, rating);
      if (!data) {
        return res.status(404).json({
          message: "Cannot send feedback!",
        });
      }

      res.status(200).json({
        message: "Feedback sent!",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "error in sending feedback",
        error,
      });
    }
  };

  static deleteStudent = async (req, res) => {
    try {
      const userID = req.params.id;
      if (!userID) {
        return res.status(404).json({
          message: "Please provide user ID",
        });
      }

      const result = await Student.deleteStudent(userID);
      if (!result) {
        return res.status(404).json({
          message: "Student not found or could not be deleted",
        });
      }

      res.status(200).json({
        message: "Student deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error deleting student",
        error: error.message,
      });
    }
  };

  static getStudentClasses = async (req, res) => {
    try {
      const studentID = req.user.studentID;
      if (!studentID) {
        return res.status(404).json({
          message: "Please provide student ID",
        });
      }

      const classes = await Student.getClassesByStudentID(studentID);
      if (!classes) {
        return res.status(404).json({
          message: "No classes found for this student",
        });
      }

      res.status(200).json({
        message: "Student classes retrieved successfully",
        data: classes
      });
    } catch (error) {
      console.error("Error getting student classes:", error);
      res.status(500).json({
        message: "Error getting student classes",
        error: error.message
      });
    }
  };
}

module.exports = studentController;
