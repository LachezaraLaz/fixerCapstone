function errorHandler(err, req, res, next) {
    console.log("-- Middleware Error Handling --");
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Logging error stack for debugging
    // Keep commented since it can expose directory structure (security risk)
    // console.error('Error stack:', err.stack);

    // JSON response with the status code and message
    return res.status(statusCode).json({
        success: false,
        status: err.status || 'error',
        statusMessage: err.statusCode,
        message: message
    });
}

module.exports = { errorHandler };
