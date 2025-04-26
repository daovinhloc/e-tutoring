
const express = require("express");
const studentController = require("../controllers/studentController");
const classroomController = require("../controllers/classController");
const classController = require("../controllers/classController");

const router = express.Router();
router.get("/students/getTutor/:search?", studentController.getTutor);
router.get("/students/searchClassByTutorName/:search", studentController.findClassByTutorNameController);
router.get("/students/searchTutorByTutorName/:search", studentController.findTutorByTutorNameController);
router.get("/students/searchClassByClassName/:search", studentController.findClassByClassName);
router.get("/students/searchClassBySubject/:id", classroomController.findClassroomBySubject);
router.get("/tutors/class/:classID", classController.getClass);
router.get("/users/getAllClass", classController.getAllClass);

module.exports = router; 