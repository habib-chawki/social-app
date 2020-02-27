const mongoose = require('mongoose');

// set up database connection
async function setDatabaseConnection() {
   const url = process.env.URL;
   const dbPort = process.env.DB_PORT;
   const dbName = process.env.DB_NAME;

   try {
      await mongoose.connect(`${url}:${dbPort}/${dbName}`, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
         useCreateIndex: true
      });
   } catch (e) {
      throw new Error(`Unable to connect to database ${e.message}`);
   }
}

module.exports = setDatabaseConnection;
