const Blog = require('../models/Blog');


exports.getAll = async (req, res) => {
    try {
        const blogs = await Blog.findByClassId(req.query.class_id || null);
        return res.status(200).json({ message: "List Blogs", data: blogs });

    } catch (error) {
        console.error('Error in getAll:', error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.getOne = async (req, res) => {
    if (req.user.role === 'Tutor') {
        // chỉ đc xem bài viết của học sinh của mình
        return res.status(404).json({ message: "Tutor" });

    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        return res.status(404).json({ message: "Không tìm thấy" });
    }

    res.json({ message: "Chi tiết bài viết", data: blog });
};

exports.create = async (req, res) => {
    const { title, content, status, class_id, description } = req.body;

    if (!title || !content || !status || !class_id || !description) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const blog_id = await Blog.create({
        student_id: req.user.userID,
        class_id,
        title,
        content,
        description,
        status,
    });
    res.status(201).json({ message: "Tạo bài viết mới thành công", data: { blog_id } });
};

exports.update = async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        return res.status(404).json({ message: "Không tìm thấy" });
    }
    if (blog.student_id !== req.user.userID) {
        return res.status(403).json({ message: "Bạn không có quyền này" });
    }
    console.log(req.body);

    await Blog.update(req.params.id, req.body);
    res.json({ message: "Cập nhật bài viết thành công" });
};

exports.remove = async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        return res.status(404).json({ message: "Không tìm thấy" });
    }
    if (blog.student_id !== req.user.userID) {
        return res.status(403).json({ message: "Bạn không có quyền này" });
    }
    await Blog.remove(req.params.id);
    res.json({ message: "Xoá bài viết thành công" });
};

exports.addComment = async (req, res) => {
    const { blog_id, content } = req.body;
    const user_id = req.user.userID;

    if (!blog_id || !content) {
        return res.status(400).json({ message: "Blog ID and content are required" });
    }

    try {
        const comment_id = await Blog.addComment({ blog_id, user_id, content });
        res.status(200).json({ message: "Comment added successfully", data: { comment_id } });
    } catch (error) {
        console.error('Error in addComment:', error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.getBlogsByAuthorId = async (req, res) => {
    try {
        const authorId = req.params.authorId;
        const blogs = await Blog.findByStudentId(authorId, req.query.class_id || null); // Assuming classID is not needed for this query
        return res.json({ message: "List Blogs by Author ID", data: blogs });
    } catch (error) {
        console.error('Error in getBlogsByAuthorId:', error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.getMostRecentBlogs = async (req, res) => {
    try {

        const blogs = await Blog.findByClassId(req.query.class_id || null, limit = true);
        return res.status(200).json({ message: "List Most Recent Blogs", data: blogs });

    } catch (error) {
        console.error('Error in getListBlogsByTime:', error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}