const connectDB = require('../config/db');

const Assignment_Comments = {
    getByPostId: async (postId) => {
        const db = await connectDB();
        
        // Thêm thông tin role từ bảng Users
        const query = `
            SELECT c.*, u.fullName as authorName, u.role as user_role
            FROM Assignment_Comments c
            LEFT JOIN Users u ON c.user_id = u.userID
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        `;
        
        const [rows] = await db.execute(query, [postId]);
        return rows;
    },
    
    create: async (comment) => {
        const db = await connectDB();
        // Bỏ user_role ra khỏi query
        const [result] = await db.execute(
            `INSERT INTO Assignment_Comments (post_id, user_id, content, created_at)
            VALUES (?, ?, ?, NOW())`,
            [comment.post_id, comment.user_id, comment.content]
        );
        return result.insertId;
    },
    
    getById: async (commentId) => {
        const db = await connectDB();
        
        // Thêm thông tin role từ bảng Users
        const query = `
            SELECT c.*, u.fullName as authorName, u.role as user_role
            FROM Assignment_Comments c
            LEFT JOIN Users u ON c.user_id = u.userID
            WHERE c.comment_id = ?
        `;
        
        const [rows] = await db.execute(query, [commentId]);
        return rows[0];
    },
    
    delete: async (commentId) => {
        const db = await connectDB();
        const [result] = await db.execute(
            `DELETE FROM Assignment_Comments WHERE comment_id = ?`,
            [commentId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Assignment_Comments;