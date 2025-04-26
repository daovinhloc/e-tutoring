const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const User = require("../models/User");
const bcrypt = require("bcrypt");


class userController {

  static updateUserForUser = async (req, res) => {
    try {
      // Validate input
      const userID = req.params.id;
     
      if (!userID) {
        return res.status(404).json({ message: "Missing user id" });
      }

      const { updatedUserData } = req.body;
      if (!updatedUserData) {
        return res.status(404).json({ message: "Cannot found user" });
      }

      // Get existing user
      const realUser = await User.findUserByID(userID);
      if (!realUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Separate user fields from role-specific fields
      const userFields = ['userName', 'fullName', 'email', 'avatar', 'dateOfBirth', 'phone', 'address'];
      const userUpdates = {};
      const roleSpecificUpdates = {};

      // Process update data
      Object.keys(updatedUserData).forEach(key => {
        if (userFields.includes(key)) {
          if (key === 'dateOfBirth' && updatedUserData[key]) {
            userUpdates[key] = new Date(updatedUserData[key]).toISOString().split('T')[0];
          } else {
            userUpdates[key] = updatedUserData[key];
          }
        } else {
          roleSpecificUpdates[key] = updatedUserData[key];
        }
      });

      // Update role-specific data
      let updated;
      if (realUser.role === "Student") {
        const student = await Student.findStudentByUserID(userID);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        student.grade = roleSpecificUpdates.grade || student.grade;
        student.school = roleSpecificUpdates.school || student.school;
        updated = await Student.updateStudent(userID, student);
        if (!updated) {
          return res.status(500).json({ message: "Student update fail" });
        }
      } else if (realUser.role === "Tutor") {
        const tutor = await Tutor.findTutorByTutorUserID(userID);
        if (!tutor) {
          return res.status(404).json({ message: "Tutor not found" });
        }

        tutor.degrees = roleSpecificUpdates.degrees || tutor.degrees;
        tutor.identityCard = roleSpecificUpdates.identityCard || tutor.identityCard;
        tutor.workplace = roleSpecificUpdates.workplace || tutor.workplace;
        tutor.description = roleSpecificUpdates.description || tutor.description;
        updated = await Tutor.updateTutor(userID, tutor);
        if (!updated) {
          return res.status(500).json({ message: "Tutor update fail" });
        }
      }

      // Update user data
      const data = await User.updateUser(userID, userUpdates);
      if (!data) {
        return res.status(500).json({ message: "Error in update user" });
      }

      // Get final updated data
      const updatedUser = await User.findUserByID(userID);
      if (!updatedUser) {
        return res.status(500).json({ message: "Error fetching updated user data" });
      }

      // Prepare response
      const finalUserData = { ...updatedUser, ...updated };
      const token = User.generateAuthToken(finalUserData);

      const response = {
        message: "User's detail updated",
        token,
        user: finalUserData
      };

      return res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        message: "Error in update user in Server",
        error: error.message
      });
    }
  };

  static sendComplains = async (req, res) => {
    try {
      const { userID, message } = req.body;
      if (!userID) {
        return res.status(404).json({
          message: "Cannot find user id",
        });
      }
      if (!message) {
        return res.status(404).json({
          message: "Complain message cannot be blank",
        });
      }

      const data = await User.sendComplain(userID, message);
      res.status(200).json({
        message: "Complain sent!",
        data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error in sending complain api",
      });
    }
  };

  static updateUserPassword = async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      if (!email) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      if (!newPassword) {
        return res.status(400).json({
          message: "New password is required",
        });
      }

      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updated = await User.updateUserPasswordByEmail(email, hashedPassword);

      if (!updated) {
        return res.status(500).json({
          message: "Error updating password",
        });
      }

      res.status(200).json({
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
        error,
      });
    }
  };

}

module.exports = userController;
