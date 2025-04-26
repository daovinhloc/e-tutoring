const jwt = require('jsonwebtoken');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Truy cập bị từ chối.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded.user; // Gắn user đã giải mã vào request

      if (decoded.user.role === 'Admin') {
        return next();
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' });
      }

      next();
    } catch (err) {
      res.status(401).json({ message: 'Đã có lỗi xảy ra hoặc token hết hạn' });
    }
  };
}

module.exports = authorize;
