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
    app_port     : 9000,
    app_host     : '127.0.0.1',
    client_host  : 'https://example.com',    
    local_nodejs : 'http://127.0.0.1:9000',
    local_php    : 'http://127.0.0.1:8000',
    app_secret   : ['2cc118cd91b52ff99e3c005ddced76fb']
}

/**
 * Default database configuration
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
exports.defaultSqlConfig = {
    name      : 'default_database',
    host      : '127.0.0.1',
    username  : 'root',
    password  : '', 
    database  : 'example_db',
    port      : '3306',
    charset   : 'utf8',
    isConnect : false
}

/**
 * Second database configuration
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
exports.secondSqlConfig = {
    name      : 'second_database',
    host      : '127.0.0.1',
    username  : 'root',
    password  : '',
    database  : 'example2_db',
    port      : '3306',
    charset   : 'utf8',
    isConnect : false
}
