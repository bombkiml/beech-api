module.exports = {
  // allow using jwt
  jwt_allow: true,
  // custom authenticaiton endpoint, default `/authentication`
  auth_endpoint: "",
  // your jwt secret key
  secret: "your_jwt_secret",
  // token expiry time (second), default expired in 1 day
  token_expired: 86400,
  model: {
    // mysql connection name inside `app.config.js` file
    name: "default_db",
    // table name store your authenticate, default table `users`
    table: "",
    // secret field for authenticate, default field `username` and `password`
    username_field: "",
    password_field: "",
    // show fields, default show fields ["id", "name", "email"]
    fields: []
  },
  // allow using with app_secret requset
  app_secret_allow: false
}