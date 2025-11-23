const BaseError = require('../BaseError');

class UnauthorizedError extends BaseError {
    constructor(name, message, statusCode) {
        super('UnauthorizedError' + name, message, statusCode);
    }
}

module.exports = UnauthorizedError;
