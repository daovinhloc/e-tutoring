const Tutor = require("../models/Tutor");
const Payment = require("../models/Payment");
const Student = require("../models/Student");
const Classroom = require("../models/Class");

class tutorController {
  static getTutor = async (req, res) => {
    try {
      const id = req.params.id;
      let data = await Tutor.getTutor(id);
      if (!data) {
        return res.status(404).json({
          message: "Cannot find tutor in database",
        });
      }
      const classes = await Student.findClassByTutorName(data.fullName);
      const uniqueSubjects = [
        ...new Set(classes.map((cls) => cls.subject)),
      ].join(", ");

      data.subjects = uniqueSubjects;
      res.status(200).json({
        message: "Get tutor success",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in get tutor in Server",
        error,
      });
    }
  };

  static checkTutorStatus = async (req, res) => {
    try {
      const userID = req.params.id;
      if (!userID) {
        return res.status(404).json({
          message: "Please provide user ID",
        });
      }

      const status = await Tutor.checkTutorStatus(userID);

      if (!status) {
        return res.status(404).json({
          message: "Tutor not found",
        });
      }

      if (status === 'Rejected') {
        return res.status(403).json({
          message: "Your tutor account has been rejected. You cannot create classes.",
          status: status
        });
      }

      if (status === 'Pending') {
        return res.status(403).json({
          message: "Your tutor account is pending approval. Please wait.",
          status: status
        });
      }

      if (status === 'Approved') {
        return res.status(200).json({
          message: "Tutor is approved to create classes",
          status: status
        });
      }

      return res.status(400).json({
        message: "Invalid tutor status",
        status: status
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error checking tutor status",
        error: error.message,
      });
    }
  };

  static createClasses = async (req, res) => {
    try {
      const classroom = req.body;

      // const paymentList = await Payment.getAllPayment();
      // const isPaymentValid = paymentList.some(
      //   (payment) => payment.paymentID == classroom.PaymentID
      // );
      // const paymentList = await Payment.getAllPayment();
      // const isPaymentValid = paymentList.some(
      //   (payment) => payment.paymentID == classroom.PaymentID
      // );

      // if (!isPaymentValid) {
      //   return res.status(400).json({
      //     message: "Invalid PaymentID",
      //   });
      // }

      if (
        !classroom.className ||
        !classroom.subject ||
        // !classroom.PaymentID ||
        !classroom.length ||
        !classroom.available ||
        !classroom.type ||
        !classroom.description ||
        !classroom.price ||
        !classroom.tutorID
      ) {
        return res.status(500).json({
          message: "Please provide all field",
        });
      }

      if (classroom.studentID) {
        const student = await Student.findStudentByID(classroom.studentID);
        if (!student) {
          return res.status(404).json({
            message: "Cannot found student!",
          });
        }
      }

      const data = await Tutor.createClass(classroom);
      if (!data) {
        return res.status(404).json({
          message: "Error in create class in Database",
        });
      }

      return res.status(201).json({
        //created
        message: "Create class success",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in create class in Server",
        error,
      });
    }
  };

  static updateClasses = async (req, res) => {
    try {
      const classID = req.params.id;
      if (!classID) {
        return res.status(404).json({
          message: "Invalid class id",
        });
      }
      const classes = await Classroom.getClassroom(classID);
      if (!classes) {
        return res.status(500).json({
          message: "Class does not exist",
        });
      }
      const classroom = req.body;

      if (classroom.PaymentID) {
        const paymentList = await Payment.getAllPayment();
        const isPaymentValid = paymentList.some(
          (payment) => payment.paymentID == classroom.PaymentID
        );
        if (!isPaymentValid) {
          return res.status(400).json({
            message: "Invalid PaymentID",
          });
        }
      }

      const data = await Tutor.updateClass(classroom, classID);
      if (!data) {
        return res.status(500).json({
          message: "Error in update Classroom",
        });
      }

      return res.status(200).json({
        message: "Classroom's detail updated",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in update class in Server",
        error,
      });
    }
  };

  static activeClasses = async (req, res) => {
    try {
      const classID = req.params.id;
      if (!classID) {
        return res.status(404).json({
          message: "Invalid class id",
        });
      }

      const data = await Tutor.activeClasses(classID);
      if (!data) {
        return res.status(500).json({
          message: "Error in active Classroom",
        });
      }

      return res.status(200).json({
        message: "Classroom actived",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in active class in Server",
        error,
      });
    }
  };

  static deleteClasses = async (req, res) => {
    try {
      const classID = req.params.id;
      if (!classID) {
        return res.status(404).json({
          message: "Invalid class id",
        });
      }

      const data = await Tutor.deleteClass(classID);
      if (!data) {
        return res.status(500).json({
          message: "Error in delete Classroom",
        });
      }

      return res.status(200).json({
        message: "Classroom deleted",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in delete class in Server",
        error,
      });
    }
  };

  static getRequest = async (req, res) => {
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

      const data = await Tutor.getRequest(tutorID);
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

  static confirmRequest = async (req, res) => {
    try {
      const { requestID, confirm, classroom } = req.body;
      const request = await Tutor.getRequestByID(requestID);
      if (!request.studentID || !request.tutorID) {
        return res.status(500).json({
          message: "Request not found",
        });
      }
      classroom.studentID = request.studentID;
      classroom.tutorID = request.tutorID;

      if (confirm) {
        const result = await Tutor.createClass(classroom);
        if (!result) {
          return res.status(500).json({
            message: "Cannot create class",
          });
        }
      }

      const data = await Tutor.deleteRequest(requestID);
      if (!data) {
        return res.status(404).json({
          message: "Cannot confirm request",
        });
      }

      res.status(200).json({
        message: "Request confirmed",
        confirm,
        request,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "error in confirm request by tutor",
        error,
      });
    }
  };
}

module.exports = tutorController;
