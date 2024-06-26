module.exports = {
  /**
   * Service configuration
   * 
   * @exports app_port : Listening for start service
   * @exports app_host : Server http localhost
   * @exports client_host : Production http client host
   * @exports app_key : App key for request with endpoints
   * 
   */
  main_config: {
    app_port: 9000,
    app_host: "localhost",
    client_host: "http://0.0.0.0:9000",
    app_key: [ "2cc118cd91b52ff99e3c005ddced76fb" ]
  },

  // Job Scheduler it's work when enabled. You can enable scheduler by run CMD `$ beech skd init`.
  scheduler: true,

  /**
   * Database configuration (mutiple connection) currenty support for MySQL
   * 
   * @exports name : The Connection name
   * @exports host : The Host address
   * @exports username : The Host username connection (Hash needed)
   * @exports password : Host The password connection (Hash needed)
   * @exports database  : The database name
   * @exports port : The sql port (default 3306)
   * @exports charset : The character encoding
   * @exports is_connect : The sql connection flag (boolean)
   * 
   */
  database_config: [
    {
      name: "default_db",
      host: "localhost",
      username: "DB_USERNAME_HASH",
      password: "DB_PASSWORD_HASH",
      database: "example1_db",
      port: "3306",
      charset: "utf8",
      is_connect: false,
    },
    {
      name: "second_db",
      host: "localhost",
      username: "DB_USERNAME_HASH",
      password: "DB_PASSWORD_HASH",
      database: "example2_db",
      port: "3306",
      charset: "utf8",
      is_connect: false,
    }
  ]
};