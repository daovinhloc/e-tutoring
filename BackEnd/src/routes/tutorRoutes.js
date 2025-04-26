const express = require("express");
const auth = require("../middleware/auth");
const classController = require("../controllers/classController");
const tutorController = require("../controllers/tutorController");
const authenticateToken = require('../middleware/auth');
const blogController = require('../controllers/blogController');

const router = express.Router();
router.use(authenticateToken('Tutor'));

// Get
router.get("/viewStudent/:classID", classController.viewStudentInClass);
router.get("/viewRequest/:tutorID", tutorController.getRequest);
router.get("/viewFeedback/:classID", classController.getFeedbackByClass);
router.get("/check-status/:id", tutorController.checkTutorStatus);
router.get('/blogs/', blogController.getAll);
router.get('/blogs/:id', blogController.getOne);
router.get("/getDocuments/:classID", classController.getDocumentsByClassID);
router.get("/updateDocument/:documentID", classController.updateDocument);
router.get("/getDocument/:documentID", classController.getDocumentByID);

router.post("/insertDocument/:classID", classController.insertDocument);

router.get("/getStudent/:classID", classController.getStudentByClassID);
// Post
router.put("/updateDocument/:documentID", classController.updateDocument);
// Post
router.post("/createClasses", tutorController.createClasses);
router.post("/updateClasses/:id", tutorController.updateClasses);
router.post("/findClasses/:search", classController.findClassroomByTutorID);

// Put      
router.put("/activeClasses/:id", tutorController.activeClasses);

// Delete
router.delete("/deleteClasses/:id", tutorController.deleteClasses);
router.delete("/confirmRequest", tutorController.confirmRequest);
router.delete("/deleteDocument/:documentID", classController.deleteDocument);

module.exports = router;
