const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


//Get
router.get("/profile", auth('Student', 'Tutor'), authController.fetchUserProfile);

//Post
router.post(
  "/registerStudent",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  authController.registerStudent
);
router.post(
  "/registerTutor",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "degreeFile", maxCount: 1 },
    { name: "credentialFile", maxCount: 1 },
  ]),
  authController.registerTutor
);
router.post("/login", authController.loginUser);

router.put("/update-password", userController.updateUserPassword);

module.exports = router;
