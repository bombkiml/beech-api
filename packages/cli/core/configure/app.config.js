/**
 * Server configuration
 * 
 * @exports app_port  Listening start server
 * @exports app_host  Server http host
 * @exports client_host Production host
 * @exports app_secret  App secret using the API
 * 
 */
exports.main_config = {
  app_port: 9000,
  app_host: "localhost",
  client_host: "https://example.com",
  app_secret: ["2cc118cd91b52ff99e3c005ddced76fb"]
}

/**
 * Database configuration (mutiple connection) currenty support for MySQL
 * 
 * @exports name meaning The Connection name
 * @exports host meaning The Host address
 * @exports username meaning The Host username connection
 * @exports password meaning Host The password connection
 * @exports database  meaning The database name
 * @exports port meaning The sql port (default 3306)
 * @exports charset meaning The character encoding
 * @exports isConnect meaning The sql connection flag (boolean)
 * 
 */
exports.mySqlConfig = [
  {
    name: "default_db",
    host: "127.0.0.1",
    username: "root",
    password: "",
    database: "example1_db",
    port: "3306",
    charset: "utf8",
    isConnect: false
  },
  {
    name: "second_db",
    host: "127.0.0.1",
    username: "root",
    password: "",
    database: "example2_db",
    port: "3306",
    charset: "utf8",
    isConnect: false
  }
]