const validator = require('validator');

// validate input
// name consists of letters and spaces with length between 5 and 30 chars
// valid email, password length between 6 and 15 chars
function isInputValid({ name, email, password }) {
   name = name.trim();
   email = email.trim();
   return (
      validator.matches(name, /^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/i) &&
      validator.isLength(name, { min: 5, max: 30 }) &&
      validator.isEmail(email) &&
      validator.isLength(password, { min: 6, max: 15 })
   );
}

module.exports = { isInputValid };
