const connectDB = require('../config/db');

const Posts_Assignment = {
    getAll: async (classID) => {
        const db = await connectDB();
        
        // Sửa đổi query để lấy thêm thông tin người tạo (tutorName)
        const query = `
            SELECT p.*, u.fullName as tutorName
            FROM Posts_Assignment p
            LEFT JOIN Tutors t ON p.tutorID = t.tutorID
            LEFT JOIN Users u ON t.userID = u.userID  
            WHERE p.class_id = ?
            ORDER BY p.created_at DESC
        `;
        
        const [rows] = await db.execute(query, [classID]);
        return rows;
    },
    
    getById: async (postId) => {
        const db = await connectDB();
        
        const query = `
            SELECT p.*, u.fullName as tutorName
            FROM Posts_Assignment p
            LEFT JOIN Tutors t ON p.tutorID = t.tutorID
            LEFT JOIN Users u ON t.userID = u.userID
            WHERE p.post_id = ?
        `;
        
        const [rows] = await db.execute(query, [postId]);
        return rows[0];
    },
    
    create: async (post) => {
        const db = await connectDB();
        const [result] = await db.execute(
            `INSERT INTO Posts_Assignment (class_id, tutorID, title, description, created_at)
            VALUES (?, ?, ?, ?, NOW())`,
            [post.class_id, post.tutorID, post.title, post.description]
        );
        return result.insertId;
    },
    
    update: async (postId, post) => {
        const db = await connectDB();
        const [result] = await db.execute(
            `UPDATE Posts_Assignment 
            SET title = ?, description = ?
            WHERE post_id = ?`,
            [post.title, post.description, postId]
        );
        return result.affectedRows > 0;
    },
    
    delete: async (postId) => {
        const db = await connectDB();
        const [result] = await db.execute(
            `DELETE FROM Posts_Assignment WHERE post_id = ?`,
            [postId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Posts_Assignment;