// This class will replace the built-in Error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        // Maintains stack trace
        Error.captureStackTrace(this, this.constructor);

        this.statusCode = statusCode || 500;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    }
}

module.exports = AppError;
