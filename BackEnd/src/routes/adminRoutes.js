const express = require("express");
const adminController = require("../controllers/adminController");
const classController = require("../controllers/classController");
const router = express.Router();
const multer = require("multer");
const authController = require("../controllers/authController");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const authenticateToken = require('../middleware/auth');
router.use(authenticateToken('Admin'));

//Get
router.put("/updateUsers/:id", adminController.updateUser);
router.put("/banUsers/:id", adminController.banUsers);
router.put("/unbanUsers/:id", adminController.unbanUsers);
router.get("/complainList", adminController.getComplainList);
router.get("/classList", classController.getAllClass);
router.get("/classListExisted", classController.getAllClassExisted);
router.get("/getRequest", adminController.getTutorRequest);
router.get("/getUser", adminController.getAllUser);
router.get("/getUserActiveByMonthAndYear", adminController.getActiveUserByMonthAndYear);
router.get("/getActiveUser", adminController.getActiveUser);
router.get("/getPaymentInfoThisMonth", adminController.getPaymentInfoThisMonth);

router.post("/handleAssignStudent", adminController.handleAssignStudent);
router.post("/handleAssignTutor", adminController.handleAssignTutor);
//Post
router.post("/handleTutor/:id", adminController.handleTutor);
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

router.post("/assignStudents/:classID", adminController.assignStudentsToClass);

// Delete
router.delete("/deleteClass/:id", adminController.deleteClass);
router.delete("/deleteUser/:id", adminController.deleteUser);
router.delete("/deleteStudent/:id", adminController.deleteStudent);
router.delete('/deleteComplains/:id', adminController.deleteComplain);

router.get('/enrollmentRequests', adminController.getEnrollmentRequests);
router.post('/handleEnrollment/:requestID', adminController.handleEnrollmentRequest);


module.exports = router;
