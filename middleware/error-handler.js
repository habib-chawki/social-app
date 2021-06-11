const logger = require('../utils/logger');

// error handling middleware
function errorHandler(err, req, res, next) {
   // create error object
   const error = {
      status: err.status || 500,
      message: err.message || 'Something went wrong',
      path: req.originalUrl,
      timestamp: Date.now(),
   };

   //send back error along with status code
   logger.error('Http error ' + JSON.stringify(error));
   res.status(err.statusCode).send(error);

   next();
}

module.exports = errorHandler;
