const winston = require('winston');

const logConfig = {
   format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(
         (info) => `${info.timestamp} - ${info.level}: ${info.message}`
      )
   ),
   transports: [new winston.transports.Console()],
};

module.exports = winston.createLogger(logConfig);
