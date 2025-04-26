
const express = require('express');
const blogController = require('../controllers/blogController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
// Middleware to check if the user is an admin
router.use(authenticateToken('Student', 'Tutor'));

// Blog
router.get('/', blogController.getAll);
router.get("/getMostRecentBlogs", blogController.getMostRecentBlogs);
router.get('/:id', blogController.getOne);
router.get("/author/:authorId", blogController.getBlogsByAuthorId);
router.post('/', blogController.create);
router.put('/:id', blogController.update);
router.delete('/:id', blogController.remove);
router.post('/comment/', blogController.addComment);

module.exports = router;