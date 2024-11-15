const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',  // Set the default log level to 'info'
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [
        // Transport for general application logs (info, warn, error)
        new winston.transports.File({ filename: 'logs/app.log', level: 'info' }),

        // Transport for error-specific logs
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),

        // Optionally log to the console for development purposes
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

module.exports = logger;

