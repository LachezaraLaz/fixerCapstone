
/**
 * @module server/utils
 */

const pino = require('pino');
const transport = pino.transport({
    target: '@logtail/pino',
    options: { sourceToken: process.env.BETTER_STACK_TOKEN }
});

let currentLogLevel = process.env.PINO_LOG_LEVEL || 'info';

const logger = pino(
    {
        customLevels: { server: 80, emergency: 100 },
        level: currentLogLevel,
        redact: { paths: ['email', 'password', 'token', process.env.JWT_SECRET], remove: true },
        formatters: {
            level: (label) => ({ level: label.toUpperCase() })
        }
    },
    transport
);

/**
 * Sets the log level for the logger.
 *
 * @param {string} level - The new log level to be set.
 */
const setLogLevel = (level) => {
    logger.level = level;
    currentLogLevel = level;
    logger.info(`Log level changed to ${level}`);
};

module.exports = { logger, setLogLevel };
