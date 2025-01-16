const pino = require('pino');
const transport = pino.transport({
    target: '@logtail/pino',
    options: {sourceToken: process.env.BETTER_STACK_TOKEN }
})
const logger = pino({
    customLevels: {emergency:0}, // emergency is activated when we have an issue to fix
    level: process.env.PINO_LOG_LEVEL || 'info',
    redact:{paths: ['email', 'password', 'token', process.env.JWT_SECRET],remove: true}, // disallow these to be logged
    formatters: {
        level: (label) => {
            return{level: label.toUpperCase()};
        }
    }
},transport);

module.exports = {logger};