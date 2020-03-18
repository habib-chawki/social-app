const app = require('./app');

const port = process.env.PORT;

// set up server connection
app.listen(port, () => {
   console.log(`Server up and running on port ${port}`);
});
