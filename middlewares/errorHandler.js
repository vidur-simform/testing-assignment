const { deleteFile } = require('../utils/file');

exports.errorHandler = (error, req, res, next) => {
    deleteFile(req.file?.path);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
};
