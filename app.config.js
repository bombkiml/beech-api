/**
 * Server configuration
 * 
 * @exports app_port  Listening start server
 * @exports app_host  Server http host
 * @exports client_host Production host
 * @exports local_php  PHP base URL (using with PHP)
 * @exports app_secret  App secret using the API
 * 
 */
exports.main_config = {
  app_port: 9000,
  app_host: '127.0.0.1',
  client_host: 'https://example.com',
  local_nodejs: 'http://127.0.0.1:9000',
  local_php: 'http://127.0.0.1:8000',
  app_secret: ['2cc118cd91b52ff99e3c005ddced76fb']
}

/**
 * MySQL database configuration (mutiple connection)
 * 
 * @exports name  Connection name
 * @exports host  Host address
 * @exports username  Host Username
 * @exports password  Host Password
 * @exports database  Database name
 * @exports port  sql port default 3306
 * @exports isConnect  sql connect flag (boolean)
 * 
 */
exports.mySqlConfig = [
  {
    name : 'default_db',
    host : '127.0.0.1',
    username : 'root',
    password : '',
    database : 'example1_db',
    port : '3306',
    charset : 'utf8',
    isConnect : false
  },
  {
    name: 'second_db',
    host: '127.0.0.1',
    username: 'root',
    password: '',
    database: 'example2_db',
    port: '3306',
    charset: 'utf8',
    isConnect: false
  }
]