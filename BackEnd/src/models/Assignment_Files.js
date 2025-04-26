const connectDB = require('../config/db');

const Assignment_Files = {
    getByPostId: async (postId) => {
        const db = await connectDB();
        
        const query = `
            SELECT * FROM Assignment_Files
            WHERE post_id = ?
        `;
        
        const [rows] = await db.execute(query, [postId]);
        return rows;
    },
    
    create: async (file) => {
        const db = await connectDB();
        const [result] = await db.execute(
            `INSERT INTO Assignment_Files (post_id, file_name, file_path, uploaded_at)
            VALUES (?, ?, ?, NOW())`,
            [file.post_id, file.file_name, file.file_path]
        );
        return result.insertId;
    },
    
    delete: async (fileId) => {
        const db = await connectDB();
        const [result] = await db.execute(
            `DELETE FROM Assignment_Files WHERE id = ?`,
            [fileId]
        );
        return result.affectedRows > 0;
    },
    
    deleteByPostId: async (postId) => {
        const db = await connectDB();
        const [result] = await db.execute(
            `DELETE FROM Assignment_Files WHERE post_id = ?`,
            [postId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Assignment_Files;