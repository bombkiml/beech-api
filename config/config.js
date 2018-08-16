/**
 * Server config
 * 
 */
exports.main_config = {
    app_port     : 7777,
    app_host     : '127.0.0.1',
    local_nodejs : 'http://127.0.0.1:7777/',
    local_php    : 'http://127.0.0.1:8000/',
    app_secret   : ['2cc118cd91b52ff99e3c005ddced76fb']
};

/**
 * MySQL database config
 * 
 */
exports.default_mysql_config = {
    host      : '127.0.0.1',
    user      : 'dbuser',
    password  : 'password', 
    database  : 'db_nodejsapi',
    port      : '3308',
    isConnect : true
};

exports.report_mysql_config = {
    host      : '127.0.0.1',
    user      : 'dbuser',
    password  : 'password',
    database  : 'db_nodejsreport',
    port      : '3308',
    isConnect : true
};

/**
 * Other config
 * 
 */