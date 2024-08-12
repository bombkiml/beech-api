const { Schema, Guard, Store, Update, specificExpress } = require("./packages/lib/index");
module.exports = { Schema, Guard, Store, Update, Express: specificExpress() };
