const Classroom = require("../models/Class");
const User = require("../models/User");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Payment = require("../models/Payment");
const { sendApprovalEmail, sendDenialEmail } = require("../email/EmailApproved");

class adminController {
  static getAllUser = async (req, res) => {
    try {
      const data = await User.getAllUser();
      if (!data) {
        return res.status(404).json({
          message: "Cannot find user list",
        });
      }

      return res.status(200).json({
        message: "User list",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in get user in Server",
        error,
      });
    }
  };

  static getEnrollmentRequests = async (req, res) => {
    try {
      const requests = await Student.getAllEnrollmentRequests();
      res.status(200).json({
        message: "Enrollment requests retrieved successfully",
        data: requests
      });
    } catch (error) {
      console.error("Error getting enrollment requests:", error);
      res.status(500).json({
        message: "Error retrieving enrollment requests",
        error: error.message
      });
    }
  };

  static handleAssignStudent = async (req, res) => {
    try {
      const { studentIDs, classID } = req.body;

      if (!studentIDs || !classID) {
        return res.status(400).json({
          message: "Student IDs and Class ID are required"
        });
      }

      if (!Array.isArray(studentIDs) || studentIDs.length === 0) {
        return res.status(400).json({
          message: "Student IDs must be a non-empty array"
        });
      }

      // Get class details
      const classData = await Classroom.findClassByID(classID);
      if (!classData) {
        return res.status(404).json({
          message: "Class not found"
        });
      }

      // Get instructor details

      const tutor = await Tutor.findTutorByTutorID(classData.tutorID);
      if (!tutor) {
        return res.status(404).json({
          message: "Instructor not found"
        });
      }


      const tutorUser = await User.findUserByID(tutor[0].userID);
      if (!tutorUser) {
        return res.status(404).json({
          message: "Instructor user not found"
        });
      }

      const results = [];
      const { sendClassEnrollmentEmail, sendInstructorAssignmentEmail } = require("../email/EmailAssign");

      try {
        const Students = await Student.getListStudentByIds(studentIDs);
        await sendInstructorAssignmentEmail(tutorUser.email, classData.className, Students);
        results.push({
          message: "Tutor assigned to class successfully",
          data: {
            tutorID: classData.tutorID,
            classID: classData.classID,
            className: classData.className,
            studentCount: Students.length
          }
        });
      } catch (error) {
        console.log('error', error);
      }


      // Process each student ID
      for (const studentID of studentIDs) {
        try {
          // Get student email
          const student = await Student.findStudentByID(studentID);
          if (!student) {
            results.push({ studentID, status: 'failed', message: 'Student not found' });
            continue;
          }

          // Get user email
          const userData = await User.findUserByID(student.userID);
          if (!userData || !userData.email) {
            results.push({ studentID, status: 'failed', message: 'Student email not found' });
            continue;
          }

          // Send email to student (enrollment already done by frontend)
          await sendClassEnrollmentEmail(userData.email, classData.className, tutorUser.fullName);

          results.push({
            studentID,
            status: 'success',
            message: 'Enrolled and email sent',
            studentName: userData.fullName,
            email: userData.email
          });
        } catch (error) {
          console.error(`Error processing student ${studentID}:`, error);
          results.push({
            studentID,
            status: 'failed',
            message: error.message
          });
        }
      }

      res.status(200).json({
        message: "Student assignment process completed",
        className: classData.className,
        instructorName: tutorUser.fullName,
        results
      });
    } catch (error) {
      console.error("Error assigning students to class:", error);
      res.status(500).json({
        message: "Error assigning students to class",
        error: error.message
      });
    }
  };

  static handleEnrollmentRequest = async (req, res) => {
    try {
      const { requestID } = req.params;
      const { status, adminComment } = req.body;

      if (!requestID || !status) {
        return res.status(400).json({
          message: "Request ID and status are required"
        });
      }

      if (status !== 'Accept' && status !== 'Deny') {
        return res.status(400).json({
          message: "Status must be either 'Accept' or 'Deny'"
        });
      }

      const result = await Student.handleEnrollmentRequest(requestID, status, adminComment);

      res.status(200).json({
        message: `Enrollment request ${status === 'Accept' ? 'approved' : 'denied'} successfully`,
        data: result
      });
    } catch (error) {
      console.error("Error handling enrollment request:", error);
      res.status(500).json({
        message: "Error handling enrollment request",
        error: error.message
      });
    }
  };



  static getActiveUserByMonthAndYear = async (req, res) => {
    try {
      const data = await User.getAllUserActiveGroupByMonthAndYear();
      if (!data) {
        return res.status(404).json({
          message: "Cannot find user list",
        });
      }

      return res.status(200).json({
        message: "User list",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in get user in Server",
        error,
      });
    }
  };

  static getActiveUser = async (req, res) => {
    try {
      const data = await User.getActiveUser();
      if (!data) {
        return res.status(404).json({
          message: "Cannot find active user list",
        });
      }

      return res.status(200).json({
        message: "Active user list",
        count: data.length,
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in get active user in Server",
        error,
      });
    }
  };

  static getTutorRequest = async (req, res) => {
    try {
      const data = await User.getRequest();
      if (!data) {
        return res.status(404).json({
          message: "Cannot find request",
        });
      }

      return res.status(200).json({
        message: "Request Tutor list",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in search tutor request in Server",
        error,
      });
    }
  };

  static handleTutor = async (req, res) => {
    try {
      const userID = req.params.id;
      if (!userID) {
        return res.status(404).json({
          message: "Please provide user id",
        });
      }
      const check = await User.searchRequest(userID);
      if (!check) {
        return res.status(404).json({
          message: "Cannot find request of this user",
        });
      }

      const { status } = req.body;

      if (status == "Accept") {
        // Update TutorRequests status
        const statusUpdated = await User.updateRequestStatus(userID, "Accept");

        // Update Tutor status and unban user
        const tutorStatusUpdated = await Tutor.updateTutorStatus(userID, "Accept");
        const userUnbanned = await User.unbanUser(userID);

        if (!statusUpdated || !tutorStatusUpdated || !userUnbanned) {
          return res.status(500).json({
            message: "Error in confirming tutor",
          });
        }

        // Send approval email
        const user = await User.findUserByID(userID);


        if (user && user.email) {
          try {
            await sendApprovalEmail(user.email);

          } catch (emailError) {
            console.error("Error sending email:", emailError);
          }
        }

        return res.status(200).json({
          message: "Tutor Confirmed",
          user: user
        });
      } else if (status == "Deny") {
        // Update both TutorRequests and Tutor status
        const statusUpdated = await User.updateRequestStatus(userID, "Deny");
        const tutorStatusUpdated = await Tutor.updateTutorStatus(userID, "Deny");

        if (!statusUpdated || !tutorStatusUpdated) {
          return res.status(500).json({
            message: "Error in rejecting tutor",
          });
        }

        const user = await User.findUserByID(userID);

        if (user && user.email) {
          try {
            await sendDenialEmail(user.email);
            console.log("Denial email sent to:", user.email);
          } catch (emailError) {
            console.error("Error sending email:", emailError);
          }
        }

        return res.status(200).json({
          message: "Tutor Rejected",
          user: user
        });
      }

      return res.status(500).json({
        message: "Status not correct",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in confirming tutor on server",
        error,
      });
    }
  };

  static deleteUser = async (req, res) => {
    try {
      const userID = req.params.id;
      if (!userID) {
        return res.status(404).json({
          message: "Please provide user ID",
        });
      }

      const result = await User.deleteUser(userID);
      if (!result) {
        return res.status(404).json({
          message: "User not found or could not be deleted",
        });
      }

      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error deleting user",
        error: error.message,
      });
    }
  };

  static deleteClass = async (req, res) => {
    try {
      const classId = req.params.id;
      if (!classId) {
        return res.status(404).json({
          message: "Please provide class id",
        });
      }

      const result = await Classroom.DeleteClass(classId);
      if (!result) {
        return res.status(404).json({
          message: "Error in deleting class",
        });
      }

      return res.status(200).json({
        message: "Class deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting class:', error);
      res.status(500).json({
        message: "Error in deleting class on server",
        error: error.message,
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

  static updateUser = async (req, res) => {
    try {
      const userID = req.params.id;
      if (!userID) {
        return res.status(404).json({
          message: "Missing user id",
        });
      }
      const user = req.body;
      if (!user) {
        return res.status(404).json({
          message: "Cannot found user",
        });
      }

      const data = await User.updateUserForAdmin(user, userID);
      if (!data) {
        return res.status(500).json({
          message: "Error in update user",
        });
      }

      return res.status(200).json({
        message: "User's detail updated",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in update user in Server",
        error,
      });
    }
  };

  static banUsers = async (req, res) => {
    try {
      const userID = req.params.id;
      if (!userID) {
        return res.status(404).json({
          message: "Please provide user id",
        });
      }

      const data = await User.banUser(userID);
      if (!data) {
        return res.status(500).json({
          message: "Error in ban user",
        });
      }

      return res.status(200).json({
        message: "User banned",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in ban user in Server",
        error,
      });
    }
  };

  static unbanUsers = async (req, res) => {
    try {
      const userID = req.params.id;
      if (!userID) {
        return res.status(404).json({
          message: "Please provide user id",
        });
      }

      const data = await User.unbanUser(userID);
      if (!data) {
        return res.status(500).json({
          message: "Error in unban user",
        });
      }

      return res.status(200).json({
        message: "User unbanned",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in unban user in Server",
        error,
      });
    }
  };

  static deleteTutor = async (req, res) => {
    try {
      const userID = req.params.id;
      if (!userID) {
        return res.status(404).json({
          message: "Please provide user ID",
        });
      }

      const result = await Tutor.deleteTutor(userID);
      if (!result) {
        return res.status(404).json({
          message: "Tutor not found or could not be deleted",
        });
      }

      res.status(200).json({
        message: "Tutor deleted successfully",
      });
    } catch (error) {
      console.log(error);
      if (error.message === 'Cannot delete tutor with active classes') {
        return res.status(400).json({
          message: "Cannot delete tutor with active classes. Please deactivate or delete the classes first.",
        });
      }
      res.status(500).json({
        message: "Error deleting tutor",
        error: error.message,
      });
    }
  };

  static getPaymentInfoThisMonth = async (req, res) => {
    try {
      const data = await Payment.getPaymentInfoThisMonth();
      if (!data) {
        return res.status(404).json({
          message: "Cannot find payment info",
        });
      }

      return res.status(200).json({
        message: "Payment info",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in getting payment info this month",
        error,
      });
    }
  }

  static getComplainList = async (req, res) => {
    try {
      const data = await User.getComplain();
      if (!data) {
        return res.status(500).json({
          message: "Error in getting complain list",
        });
      }

      return res.status(200).json({
        message: "Get complain list success",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in getting complain list in Server",
        error,
      });
    }
  };
  static deleteComplain = async (req, res) => {
    try {
      const complainID = parseInt(req.params.id);
      const deletedComplain = await User.deleteComplain(complainID);
      if (deletedComplain) {
        return res.status(200).json({
          message: 'Complaint deleted successfully',
          deletedComplain,
        });
      } else {
        return res.status(404).json({
          message: 'Complaint not found',
        });
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
      res.status(500).json({
        message: 'Internal server error',
        error,
      });
    }
  };

  static handleAssignTutor = async (req, res) => {
    try {
      const { tutorID, classID } = req.body;

      if (!tutorID || !classID) {
        return res.status(400).json({
          message: "Tutor ID and Class ID are required"
        });
      }

      // Get tutor details
      const tutor = await Tutor.findTutorByID(tutorID);
      if (!tutor) {
        return res.status(404).json({
          message: "Tutor not found"
        });
      }

      // Get tutor user data
      const tutorUser = await User.findUserByID(tutor.userID);
      if (!tutorUser || !tutorUser.email) {
        return res.status(404).json({
          message: "Tutor email not found"
        });
      }

      // Get class details
      const classData = await Classroom.findClassByID(classID);
      if (!classData) {
        return res.status(404).json({
          message: "Class not found"
        });
      }

      // Assign tutor to class
      await Classroom.assignTutor(classID, tutorID);

      // Get students enrolled in the class
      const [students] = await connectDB().execute(
        `SELECT s.*, u.fullName as name, u.email, s.grade 
         FROM Class_Students cs 
         JOIN Students s ON cs.studentID = s.studentID 
         JOIN Users u ON s.userID = u.userID 
         WHERE cs.classID = ? AND cs.status = 'Active'`,
        [classID]
      );

      // Send email to instructor with student list
      const { sendInstructorAssignmentEmail } = require("../email/EmailAssign");
      await sendInstructorAssignmentEmail(tutorUser.email, classData.className, students);

      res.status(200).json({
        message: "Tutor assigned to class successfully",
        data: {
          tutorID,
          classID,
          className: classData.className,
          studentCount: students.length
        }
      });
    } catch (error) {
      console.error("Error assigning tutor to class:", error);
      res.status(500).json({
        message: "Error assigning tutor to class",
        error: error.message
      });
    }
  };

  static assignStudentsToClass = async (req, res) => {
    try {
      const classID = req.params.classID;
      const studentIDs = req.body.studentIDs; // Expecting an array of student IDs

      if (!classID || !studentIDs || !Array.isArray(studentIDs)) {
        return res.status(400).json({
          message: "Invalid input",
        });
      }

      const result = await Classroom.assignStudentsToClass(classID, studentIDs);
      console.log("Assigning students to class result:", result);

      if (!result) {
        return res.status(500).json({
          message: "Error in assigning students to class",
        });
      }

      return res.status(200).json({
        message: "Students assigned to class successfully",
        data: result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in assigning students to class on server",
        error,
      });
    }
  };
}

module.exports = adminController;
