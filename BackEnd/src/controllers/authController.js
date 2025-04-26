const Tutor = require("../models/Tutor");
const User = require("../models/User");
const Student = require("../models/Student");
const multer = require("multer");
const Classroom = require("../models/Class");
const bcrypt = require("bcrypt");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class authController {
  static registerStudent = async (req, res) => {
    const {
      email,
      userName,
      password,
      fullName,
      dateOfBirth,
      phone,
      address,
      grade,
      school,
    } = req.body;

    const { avatar } = req.body;
    const connection = await require("../config/db")();

    try {
      // Start transaction
      await connection.beginTransaction();

      // Check if user already exists with the same email
      let existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Check if user already exists with the same username
      existingUser = await User.findUserByUsername(userName);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [userResult] = await connection.execute(
        `INSERT INTO Users (userName, email, password, role, fullName, avatar, dateOfBirth, phone, address, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userName,
          email,
          hashedPassword,
          "Student",
          fullName,
          avatar,
          dateOfBirth,
          phone,
          address,
          1,
        ]
      );

      // Verify user was created successfully
      if (!userResult || !userResult.insertId) {
        throw new Error("Failed to create user");
      }

      const userID = userResult.insertId;
      const userRole = userResult.role;


      // Verify the user exists before creating student
      const user = await User.findUserByID(userID);

      if (!user) {
        throw new Error("User not found after creation");
      }

      const [lastStudent] = await connection.execute(
        `SELECT * FROM Students ORDER BY CAST(SUBSTRING(studentID, 2) AS UNSIGNED) DESC LIMIT 1`
      );
      const studentID = !lastStudent[0]
        ? "S1"
        : "S" + (parseInt(lastStudent[0].studentID.match(/\d+/)[0]) + 1);

      // Create student
      await connection.execute(
        `INSERT INTO Students (studentID, userID, grade, school) VALUES (?, ?, ?, ?)`,
        [studentID, userID, grade, school]
      );

      // Fetch the complete student data
      const [[student]] = await connection.execute(
        "SELECT * FROM Students WHERE userID = ?",
        [userID]
      );
      await connection.commit();

      // Combine user and student data
      const userData = { ...user, ...student };

      // Generate authentication token
      const token = User.generateAuthToken(userData);

      res.status(201).json({ token, user: userData });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      console.error("Error registering student:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  static registerTutor = async (req, res) => {
    const {
      email,
      userName,
      password,
      fullName,
      dateOfBirth,
      phone,
      address,
      workplace,
      description,
      degrees,
      identityCard,
      avatar
    } = req.body;

    const connection = await require("../config/db")();

    try {
      // Start transaction
      await connection.beginTransaction();

      // Check if user already exists with the same email
      let existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Check if user already exists with the same username
      existingUser = await User.findUserByUsername(userName);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [userResult] = await connection.execute(
        `INSERT INTO Users (userName, email, password, role, fullName, avatar, dateOfBirth, phone, address, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userName, email, hashedPassword, "Tutor", fullName, avatar, dateOfBirth,
          phone || "0866722601", address || "Ha Noi", 0] // Set isActive to 0 for pending approval
      );

      // Verify user was created successfully
      if (!userResult || !userResult.insertId) {
        throw new Error("Failed to create user");
      }

      const userID = userResult.insertId;

      // Verify the user exists before creating tutor
      const user = await User.findUserByID(userID);

      if (!user) {
        throw new Error("User not found after creation");
      }

      // Generate tutor ID
      const [lastTutor] = await connection.execute(
        `SELECT * FROM Tutors ORDER BY CAST(SUBSTRING(tutorID, 2) AS UNSIGNED) DESC LIMIT 1`
      );
      const tutorID = !lastTutor[0] ? "T1" :
        "T" + (parseInt(lastTutor[0].tutorID.match(/\d+/)[0]) + 1);

      // Create tutor
      await connection.execute(
        `INSERT INTO Tutors (tutorID, userID, degrees, identityCard, workplace, description, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [tutorID, userID, degrees, identityCard, workplace, description, "Pending"]
      );

      // Create tutor request
      await connection.execute(
        `INSERT INTO TutorRequests (userID, tutorID, status) VALUES (?, ?, ?)`,
        [userID, tutorID, "Pending"]
      );

      // Fetch the complete tutor data
      const [[tutor]] = await connection.execute(
        "SELECT * FROM Tutors WHERE userID = ?",
        [userID]
      );

      // Commit transaction
      await connection.commit();

      // Combine user and tutor data
      const userData = { ...user, ...tutor };

      // Generate authentication token
      const token = User.generateAuthToken(userData);

      res.status(201).json({
        message: "Tutor request sent, please wait for approval",
        token,
        user: userData
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      console.error("Error registering tutor:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  static loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
      let user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await User.comparePassword(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Wrong Password" });
      }

      if (!user.isActive) {
        return res.status(403).json({
          message: "User banned!",
        });
      }

      if (user.role == "Student") {
        const student = await Student.findStudentByUserID(user.userID);
        user = { ...user, ...student };
      } else if (user.role == "Tutor") {
        const tutor = await Tutor.findTutorByTutorUserID(user.userID);
        user = { ...user, ...tutor };
      }

      const token = User.generateAuthToken(user);
      res.status(200).json({ token, user });
    } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  static fetchUserProfile = async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = authController;
