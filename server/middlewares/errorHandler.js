const NotFoundError = require("../utils/errors/NotFoundError");
const BadRequestError = require("../utils/errors/BadRequestError");
const ForbiddenError = require("../utils/errors/ForbiddenError");
const UnauthorizedError = require("../utils/errors/UnauthorizedError");
const InternalServerError = require("../utils/errors/InternalServerError");

function errorHandler(err, req, res, next) {
    console.log("-- Middleware Error Handling --");
    const name = err.name;
    const message = err.message;
    const statusCode = err.statusCode || 500;

    if (err instanceof NotFoundError) {
        return res.status(statusCode).json({
            error: name,
            message: message,
            statusCode: statusCode,
            hint: "Verify the requested endpoint or the resource."
    });
    } else if (err instanceof BadRequestError) {
        return res.status(statusCode).json({
            error: name,
            message: message,
            statusCode: statusCode,
            hint: "Make sure the parameters are valid."
        });
    } else if (err instanceof ForbiddenError) {
        return res.status(statusCode).json({
            error: name,
            message: message,
            statusCode: statusCode,
            hint: "Verify your credentials/permissions."
        });
    } else if (err instanceof UnauthorizedError) {
        return res.status(statusCode).json({
            error: name,
            message: message,
            statusCode: statusCode,
            hint: "Provide necessary authentication."
        });
    } else if (err instanceof InternalServerError) {
        return res.status(statusCode).json({
            error: name,
            message: message,
            statusCode: statusCode,
            hint: "Try again or contact support."
        });
    } else {
        // Unexpected Errors
        return res.status(500).json({
            error: 'UnknownError',
            message: 'Unexpected Error: Something went wrong',
            statusCode: 500,
        });
    }

    // Logging error stack for debugging
    // Keep commented since it can expose directory structure (security risk)
    // console.error('Error stack:', err.stack);
}

module.exports = { errorHandler };