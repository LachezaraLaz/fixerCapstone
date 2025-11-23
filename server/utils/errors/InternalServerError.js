const BaseError = require('../BaseError');

class InternalServerError extends BaseError {
    constructor(name, message, statusCode) {
        super('InternalServerError' + name, message, statusCode);
    }
}

module.exports = InternalServerError;
