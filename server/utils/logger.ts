/**
 * @module server/utils
 */

import pino, { Level } from "pino";

const transport = pino.transport({
  target: "@logtail/pino",
  options: { sourceToken: process.env.BETTER_STACK_TOKEN },
});

let currentLogLevel = process.env.PINO_LOG_LEVEL || "info";

const redactPaths: string[] = ["email", "password", "token"].concat(
  process.env.JWT_SECRET ? [process.env.JWT_SECRET] : []
);

const logger = pino(
  {
    customLevels: { server: 80, emergency: 100 },
    level: currentLogLevel,
    redact: {
      paths: redactPaths,
      remove: true,
    },
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
  },
  transport
);

/**
 * Sets the log level for the logger.
 *
 * @param {string} level - The new log level to be set.
 */
const setLogLevel = (level: Level) => {
  logger.level = level;
  currentLogLevel = level;
  logger.info(`Log level changed to ${level}`);
};

export { logger, setLogLevel };
