// This class will replace the built-in Error class
class BaseError extends Error {
    constructor(name, message, statusCode) {
        super(message);

        this.name = name;
        this.message = message;
        this.statusCode = statusCode || 500;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = BaseError;
