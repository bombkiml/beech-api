module.exports = {
  /**
   * Service configuration
   * 
   * @exports app_port : Listening for start service
   * @exports app_host : Server http localhost
   * @exports client_host : Production http client host
   * @exports app_secret : App secret key for request with endpoints
   * 
   */
  main_config: {
    app_port: 9000,
    app_host: "localhost",
    client_host: "http://0.0.0.0:9000",
    app_secret: ["2cc118cd91b52ff99e3c005ddced76fb"]
  },

  // Add-on it's work when enabled. You can enable add-on by run CMD `$ beech add-on init`.
  addOn: true,

  /**
   * Database configuration (mutiple connection) currenty support for MySQL
   * 
   * @exports name : The Connection name
   * @exports host : The Host address
   * @exports username : The Host username connection
   * @exports password : Host The password connection
   * @exports database  : The database name
   * @exports port : The sql port (default 3306)
   * @exports charset : The character encoding
   * @exports is_connect : The sql connection flag (boolean)
   * 
   */
  mysql_config: [
    {
      name: "default_db",
      host: "127.0.0.1",
      username: "root",
      password: "",
      database: "example1_db",
      port: "3306",
      charset: "utf8",
      is_connect: false
    },
    {
      name: "second_db",
      host: "127.0.0.1",
      username: "root",
      password: "",
      database: "example2_db",
      port: "3306",
      charset: "utf8",
      is_connect: false
    }
  ]
};