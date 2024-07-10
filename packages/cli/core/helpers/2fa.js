const { FindOne } = require("../../../lib/src/user");

function TwoFactor(user, reqBody, guard_field, cb) {
  try {
    // filter without base user, pass
    let without_base = Object.keys(reqBody).map((k) => {
      return guard_field.filter((e) => e == k)[0];
    });
    // filter without undefined
    let x = without_base.filter((x) => {
      return x !== undefined;
    });
    // check length match ?
    if(x.length == guard_field.length) {
      let z = user;
      x.map((guard) => {
        z[guard] = reqBody[guard];
      });
      // FindUser
      FindOne([], z, (err, result) => {
        if(err) {
          cb(true, { code: 500, status: "INTERNAL_SERVER_ERR", error: err });
        } else {
          if(result.length) {
            cb(null, result);
          } else {
            cb(null, []);
          }
        }
      });
    } else {
      cb(true, { code: 422, message: "Unprocessable Entity." });
    }
  } catch (error) {
    cb(error, null);
  }
}

module.exports = { TwoFactor }
