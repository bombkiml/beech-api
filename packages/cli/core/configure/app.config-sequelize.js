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
   * The Database configuration (mutiple connection) currenty support for MySQL, SQLite, MariaDB, PostgreSQL and Microsoft SQL Server
   * 
   * Basic parameter following:
   * @exports dialect The engine SQL connection one of 'mysql' | 'sqlite' | 'mariadb' | 'postgres' | 'mssql'
   * The Dialect need of the following:
   * - $ npm install --save  pg pg-hstore # Postgres
   * - $ npm install --save  mysql2 (MySQL suppport version ^5.7, Learn more : https://sequelize.org/releases/#mysql-support-table)
   * - $ npm install --save  mariadb
   * - $ npm install --save  sqlite3 (Need NodeJS ^12.x)
   * - $ npm install --save  tedious # Microsoft SQL Server (Need NodeJS v14.x)
   * @exports name The Connection name
   * @exports host The Host address
   * @exports username The Host username connection (Hash needed)
   * @exports password Host The password connection (Hash needed)
   * @exports database  The database name
   * @exports port The sql port (default port by dialect mysql:3306, marialdb:3306, postgres:5432 and mssql:1433)
   * @exports define The character encoding and optional. See more: https://sequelize.org/docs/v6/other-topics/dialect-specific-things/
   * @exports is_connect The sql connection flag (boolean)
   * 
   * learn more of parameter: 
   * 
   */
  database_config: [
    {
      dialect: "mysql",
      name: "default_db",
      host: "localhost",
      username: "DB_USERNAME_HASH",
      password: "DB_PASSWORD_HASH",
      database: "example1_db",
      port: "3306",
      define: {
        charset: "utf8",
        dialectOptions: {
          collate: "utf8_general_ci"
        },
      },
      is_connect: false,
    },
    {
      dialect: "sqlite",
      name: "second_db",
      storage: "usr/sqliteDB/mydatabase.sqlite", // or ":memory:"
      is_connect: false,
    },
    {
      dialect: "mssql",
      name: "thirdth_db",
      host: "localhost",
      username: "DB_USERNAME_HASH",
      password: "DB_PASSWORD_HASH",
      database: "example3_db",
      port: "1433",
      define: {
        charset: "utf8",
        dialectOptions: {
          collate: "utf8_general_ci"
        },
      },
      dialectOptions: { // ssl
        options: {
          encrypt: false,
        }
      },
      is_connect: false,
    },
  ]
};