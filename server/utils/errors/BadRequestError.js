const BaseError = require('../BaseError');

class BadRequestError extends BaseError {
    constructor(name, message, statusCode) {
        super('BadRequestError: ' + name, message, statusCode);
    }
}

module.exports = BadRequestError;
