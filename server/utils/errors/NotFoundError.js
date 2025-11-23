const BaseError = require('../BaseError');

class NotFoundError extends BaseError {
    constructor(name, message, statusCode) {
        super('NotFoundError' + name, message, statusCode);
    }
}

module.exports = NotFoundError;
