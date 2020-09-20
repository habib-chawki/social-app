// error handling middleware
function errorHandler(err, req, res, next) {
   // create error object
   const error = {
      status: err.status,
      message: err.message,
      path: req.originalUrl,
      timestamp: Date.now(),
   };

   //send back error along with status code
   res.status(err.statusCode).send(error);

   next();
}

module.exports = errorHandler;
