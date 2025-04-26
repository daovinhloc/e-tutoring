const express = require("express");
const auth = require("../middleware/auth");
const Student = require("../models/Student");

const studentController = require("../controllers/studentController");
const blogController = require('../controllers/blogController');
const classroomController = require("../controllers/classController");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth('Student'));

// Get
router.get("/getAllStudents", studentController.getAllStudents);

router.get("/classes", studentController.getStudentClasses);
router.get("/getTutor/:search?", studentController.getTutor);


// Search functions
router.get("/searchClassByTutorName/:search", studentController.findClassByTutorNameController);
router.get("/searchTutorByTutorName/:search", studentController.findTutorByTutorNameController);
router.get("/searchClassByClassName/:search", studentController.findClassByClassName);
router.get("/searchClassBySubject/:id", classroomController.findClassroomBySubject);

// Enrollment functions
router.get("/checkEnroll/:id", studentController.checkEnrollStatus);
router.post("/enrollClass/:id", studentController.enrollClass);
router.post("/unEnrollClass/:id", studentController.unEnrollClass);
router.get("/checkActiveEnrollment/:classID/:studentID", studentController.checkActiveEnrollment);

// Feedback functions
router.get("/checkFeedback/:classID/:studentID", studentController.checkExistingFeedback);
router.get("/getFeedbackByClass/:classID", studentController.getFeedbackByClass);
router.post("/feedback/:classID", studentController.feedbackClass);
router.post("/updateFeedback/:classID", studentController.updateFeedback);
router.get("/getDocuments/:classID", classroomController.getDocumentsByClassID);
// Blog functions
// router.get('/blogs/', blogController.getAll);
// router.get("/blogs/getMostRecentBlogs", blogController.getMostRecentBlogs);
// router.get('/blogs/:id', blogController.getOne);
// router.post('/blogs/', blogController.create);
// router.put('/blogs/:id', blogController.update);
// router.delete('/blogs/:id', blogController.remove);
// router.post('/comment/', blogController.addComment);
// router.get("/blogs/author/:authorId", blogController.getBlogsByAuthorId);

// Request class functions
router.get("/viewRequest/:studentID", studentController.viewRequest);
router.post("/requestClass/:tutorID", studentController.requestClass);

module.exports = router;

