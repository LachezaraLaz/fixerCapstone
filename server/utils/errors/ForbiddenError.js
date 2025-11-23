const BaseError = require('../BaseError');

class ForbiddenError extends BaseError {
    constructor(name, message, statusCode) {
        super('ForbiddenError' + name, message, statusCode);
    }
}

module.exports = ForbiddenError;
