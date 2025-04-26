const Posts_Assignment = require("../models/Posts_Assignment");
const Assignment_Comments = require("../models/Assignment_Comments");
const Assignment_Files = require("../models/Assignment_Files");
const Tutor = require("../models/Tutor");
const User = require("../models/User");
const path = require('path');
const fs = require('fs');
const uploadDir = path.join(__dirname, '../../public/uploads/assignments');

// Kiểm tra và tạo thư mục nếu không tồn tại
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

exports.getAllPostsAssignment = async (req, res) => {
    try {
        const { class_id } = req.query; // Thay đổi từ req.body sang req.query
        
        if (!class_id) {
            return res.status(400).json({ message: "Class ID is required" });
        }
        
        const posts = await Posts_Assignment.getAll(class_id);
        
        // Lấy files cho mỗi bài đăng
        for (const post of posts) {
            post.files = await Assignment_Files.getByPostId(post.post_id);
        }
        
        return res.status(200).json({ message: "List Posts", data: posts });
    } catch (error) {
        console.error("Error in getAll:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Posts_Assignment.getById(id);
        
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        // Lấy files cho bài đăng
        post.files = await Assignment_Files.getByPostId(id);
        
        return res.status(200).json({ message: "Post retrieved", data: post });
    } catch (error) {
        console.error("Error getting post:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

exports.createPostsAssignment = async (req, res) => {
    try {
        const { title, description, class_id } = req.body;
        const files = req.files; // Multer middleware sẽ xử lý files
        const user_id = req.user.userID;
        
        if (!title || !description || !class_id) {
            return res.status(400).json({ message: "Title, description, and class_id are required" });
        }
        
        // Lấy tutorID từ userID
        const tutor = await Tutor.findTutorByTutorUserID(user_id);
        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }
        
        // Tạo bài đăng mới
        const post_id = await Posts_Assignment.create({
            tutorID: tutor.tutorID,
            class_id,
            title,
            description
        });
        
        // Xử lý file uploads nếu có
        if (files && files.length > 0) {
            for (const file of files) {
                const fileName = `${Date.now()}-${file.originalname}`;
                const filePath = path.join(uploadDir, fileName);
                
                // Lưu file vào thư mục upload
                fs.writeFileSync(filePath, file.buffer);
                
                // Lưu thông tin file vào database
                await Assignment_Files.create({
                    post_id,
                    file_name: file.originalname,
                    file_path: `/uploads/assignments/${fileName}`
                });
            }
        }
        
        const newPost = await Posts_Assignment.getById(post_id);
        newPost.files = await Assignment_Files.getByPostId(post_id);
        
        return res.status(201).json({ 
            message: "Post created successfully", 
            data: newPost 
        });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const user_id = req.user.userID;
        
        // Kiểm tra bài đăng tồn tại
        const post = await Posts_Assignment.getById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        // Kiểm tra quyền (chỉ tutor tạo bài đăng mới được sửa)
        const tutor = await Tutor.findTutorByTutorUserID(user_id);
        if (!tutor || tutor.tutorID !== post.tutorID) {
            return res.status(403).json({ message: "You don't have permission to update this post" });
        }
        
        // Cập nhật bài đăng
        const updated = await Posts_Assignment.update(id, { title, description });
        if (!updated) {
            return res.status(400).json({ message: "Failed to update post" });
        }
        
        const updatedPost = await Posts_Assignment.getById(id);
        updatedPost.files = await Assignment_Files.getByPostId(id);
        
        return res.status(200).json({ 
            message: "Post updated successfully", 
            data: updatedPost 
        });
    } catch (error) {
        console.error("Error updating post:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.userID;
        
        // Kiểm tra bài đăng tồn tại
        const post = await Posts_Assignment.getById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        // Kiểm tra quyền (chỉ tutor tạo bài đăng mới được xóa)
        const tutor = await Tutor.findTutorByTutorUserID(user_id);
        if (!tutor || tutor.tutorID !== post.tutorID) {
            return res.status(403).json({ message: "You don't have permission to delete this post" });
        }
        
        // Xóa các file đính kèm
        const files = await Assignment_Files.getByPostId(id);
        for (const file of files) {
            const filePath = path.join(__dirname, '../../public', file.file_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        await Assignment_Files.deleteByPostId(id);
        
        // Xóa các comment
        // (Giả sử có phương thức deleteByPostId trong Assignment_Comments)
        // await Assignment_Comments.deleteByPostId(id);
        
        // Xóa bài đăng
        const deleted = await Posts_Assignment.delete(id);
        if (!deleted) {
            return res.status(400).json({ message: "Failed to delete post" });
        }
        
        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// API cho comments
exports.getComments = async (req, res) => {
    try {
        const { id } = req.params;
        const comments = await Assignment_Comments.getByPostId(id);
        return res.status(200).json({ message: "Comments retrieved", data: comments });
    } catch (error) {
        console.error("Error getting comments:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const user_id = req.user.userID;
        
        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }
        
        // Kiểm tra bài đăng tồn tại
        const post = await Posts_Assignment.getById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        // Tạo comment mới - không cần truyền user_role nữa
        const comment_id = await Assignment_Comments.create({
            post_id: id,
            user_id,
            content
        });
        
        const newComment = await Assignment_Comments.getById(comment_id);
        
        return res.status(201).json({ 
            message: "Comment added successfully", 
            data: newComment 
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const user_id = req.user.userID;
        
        // Lấy thông tin comment
        const comment = await Assignment_Comments.getById(commentId);
        if (!comment || comment.post_id !== parseInt(id)) {
            return res.status(404).json({ message: "Comment not found" });
        }
        
        // Kiểm tra quyền (chỉ người tạo comment hoặc tutor của bài đăng mới được xóa)
        if (comment.user_id !== user_id) {
            // Kiểm tra xem người dùng có phải là tutor của bài đăng không
            const post = await Posts_Assignment.getById(id);
            const tutor = await Tutor.findTutorByTutorUserID(user_id);
            
            if (!tutor || !post || tutor.tutorID !== post.tutorID) {
                return res.status(403).json({ message: "You don't have permission to delete this comment" });
            }
        }
        
        // Xóa comment
        const deleted = await Assignment_Comments.delete(commentId);
        if (!deleted) {
            return res.status(400).json({ message: "Failed to delete comment" });
        }
        
        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};