const express = require("express");
const router = express.Router();
const multer = require('multer');
const postsAssignment = require("../controllers/postAssignment");
const authorize = require("../middleware/auth");

// Cấu hình multer cho upload file
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware xác thực
router.use(authorize("Student", "Tutor"));

// Routes cho bài đăng
router.get("/getAll", postsAssignment.getAllPostsAssignment);
router.get("/:id", postsAssignment.getPostById);
router.post("/create", upload.array('files', 5), postsAssignment.createPostsAssignment);
router.put("/:id", authorize("Tutor"), postsAssignment.updatePost);
router.delete("/:id", authorize("Tutor"), postsAssignment.deletePost);

// Routes cho comments
router.get("/:id/comments", postsAssignment.getComments);
router.post("/:id/comments", postsAssignment.addComment);
router.delete("/:id/comments/:commentId", postsAssignment.deleteComment);

module.exports = router;